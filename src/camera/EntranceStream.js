import React, { useEffect, useRef } from 'react';
import { KinesisVideoClient,
  GetDataEndpointCommand,
  GetSignalingChannelEndpointCommand,
  DescribeSignalingChannelCommand
} from "@aws-sdk/client-kinesis-video";
import AWS from 'aws-sdk';
import {
  KinesisVideoSignalingClient,
  GetIceServerConfigCommand
} from "@aws-sdk/client-kinesis-video-signaling";
import * as KVSWebRTC from 'amazon-kinesis-video-streams-webrtc';
import ViewerStream from './ViewerStream';

const EntranceStream = () => {
  const videoRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const pendingIceCandidatesRef = useRef([]);

  useEffect(() => {
    const channelName = 'license-channel';
    const region = 'us-east-1';
    const accessKeyId = 'AKIATCKAOKOGMEQ2ZOGX';
    const secretAccessKey = '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';

    const config = {
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    };

    const startStreaming = async () => {
      try {
        console.log('Starting the streaming process...');

        const kinesisVideoClient = new KinesisVideoClient(config);

        // Describe the signaling channel to get the ARN
        console.log('Describing signaling channel...');
        const describeSignalingChannelCommand = new DescribeSignalingChannelCommand({
          ChannelName: channelName
        });
        const describeResponse = await kinesisVideoClient.send(describeSignalingChannelCommand);
        const channelARN = describeResponse.ChannelInfo.ChannelARN;
        console.log('Channel ARN:', channelARN);

        // Get Signaling Channel Endpoint
        const getSignalingChannelEndpointCommand = new GetSignalingChannelEndpointCommand({
          ChannelARN: channelARN,
          SingleMasterChannelEndpointConfiguration: {
            Protocols: ['WSS'],
            Role: 'MASTER',
          },
        });

        console.log('Sending GetSignalingChannelEndpointCommand...');
        const signalingEndpointResponse = await kinesisVideoClient.send(getSignalingChannelEndpointCommand);
        const signalingEndpoint = signalingEndpointResponse.ResourceEndpointList.find(endpoint => endpoint.Protocol === 'WSS');
        console.log('Signaling endpoint received:', signalingEndpoint.ResourceEndpoint);

        // Get ICE server configuration
        const kinesisVideoSignalingClient = new KinesisVideoSignalingClient(config);
        const getIceServerConfigCommand = new GetIceServerConfigCommand({
          ChannelARN: channelARN,
        });

        console.log('Sending GetIceServerConfigCommand...');
        const iceServerConfigResponse = await kinesisVideoSignalingClient.send(getIceServerConfigCommand);

        let iceServers = [];
        if (iceServerConfigResponse.IceServerList) {
          iceServers = iceServerConfigResponse.IceServerList.map(server => ({
            urls: server.Uris,
            username: server.Username,
            credential: server.Password,
          }));
          console.log('ICE server configuration received:', iceServers);
        } else {
          console.warn('No ICE server configuration found, proceeding without TURN servers.');
        }

        if (navigator.mediaDevices.getUserMedia) {
          console.log('Requesting access to webcam...');
          navigator.mediaDevices.getUserMedia({ video: true })
            .then(async (stream) => {
              console.log('Webcam access granted, stream received.');

              if (videoRef.current) {
                videoRef.current.srcObject = stream;
                console.log('Video stream set to video element.');
              }

              // WebRTC configuration
              const peerConnection = new RTCPeerConnection({ iceServers });
              peerConnectionRef.current = peerConnection;
              stream.getTracks().forEach(track => peerConnection.addTrack(track, stream));

              // Handle ICE candidates
              peerConnection.onicecandidate = event => {
                if (event.candidate) {
                  console.log('Sending ICE candidate:', event.candidate);
                  // Send the candidate to the Kinesis Video Signaling Channel
                }
              };

              // Create offer
              const offer = await peerConnection.createOffer();
              await peerConnection.setLocalDescription(offer);

              console.log('Offer created:', offer);

              // Connect to the Kinesis Video Signaling Channel WebSocket
              const signalingClient = new KVSWebRTC.SignalingClient({
                channelARN: channelARN,
                channelEndpoint: signalingEndpoint.ResourceEndpoint,
                role: KVSWebRTC.Role.MASTER,
                region,
                credentials: {
                  accessKeyId,
                  secretAccessKey,
                },
              });

              signalingClient.on('open', async () => {
                console.log('Connected to signaling channel');
                signalingClient.sendSdpOffer(offer);
              });

              signalingClient.on('sdpAnswer', async answer => {
                console.log('Received SDP answer:', answer);
                await peerConnection.setRemoteDescription(answer);
                // Add any ICE candidates received before the remote description was set
                while (pendingIceCandidatesRef.current.length > 0) {
                  const candidate = pendingIceCandidatesRef.current.shift();
                  peerConnection.addIceCandidate(candidate);
                }
              });

              signalingClient.on('iceCandidate', candidate => {
                console.log('Received ICE candidate:', candidate);
                if (peerConnection.remoteDescription) {
                  peerConnection.addIceCandidate(candidate);
                } else {
                  pendingIceCandidatesRef.current.push(candidate);
                }
              });

              signalingClient.open();
            })
            .catch((err) => {
              console.error('Error accessing webcam:', err);
            });
        } else {
          console.error('getUserMedia not supported in this browser.');
        }
      } catch (error) {
        console.error('Error streaming to Kinesis:', error);
      }
    };

    startStreaming();
  }, []);

  return (
    <div>
      <h1>Entrance Stream</h1>
      <video ref={videoRef} autoPlay playsInline />
      <ViewerStream />
    </div>
  );
};

export default EntranceStream;