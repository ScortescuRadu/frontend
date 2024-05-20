import React, { useEffect, useRef } from 'react';
import { KinesisVideoClient, GetSignalingChannelEndpointCommand, DescribeSignalingChannelCommand } from "@aws-sdk/client-kinesis-video";
import {
  KinesisVideoSignalingClient,
  GetIceServerConfigCommand
} from "@aws-sdk/client-kinesis-video-signaling";
import * as KVSWebRTC from 'amazon-kinesis-video-streams-webrtc';

const ViewerStream = () => {
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

    const startViewing = async () => {
        try {
          console.log('Starting the viewing process...');
  
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
              Role: 'VIEWER',
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
  
          // WebRTC configuration
          const peerConnection = new RTCPeerConnection({ iceServers });
          peerConnectionRef.current = peerConnection;
  
          peerConnection.onicecandidate = event => {
            if (event.candidate) {
              console.log('Sending ICE candidate:', event.candidate);
              // Send the candidate to the Kinesis Video Signaling Channel
            }
          };
  
          peerConnection.ontrack = event => {
            console.log('Received remote track:', event.streams[0]);
            if (videoRef.current) {
              videoRef.current.srcObject = event.streams[0];
            }
          };
  
          // Connect to the Kinesis Video Signaling Channel WebSocket
          const signalingClient = new KVSWebRTC.SignalingClient({
            channelARN: channelARN,
            channelEndpoint: signalingEndpoint.ResourceEndpoint,
            role: KVSWebRTC.Role.VIEWER,
            region,
            clientId: 'viewerClient',
            credentials: {
              accessKeyId,
              secretAccessKey,
            },
          });
  
          signalingClient.on('open', async () => {
            console.log('Connected to signaling channel');
            const offer = await peerConnection.createOffer();
            await peerConnection.setLocalDescription(offer);
            signalingClient.sendSdpOffer(offer);
          });
  
          signalingClient.on('sdpAnswer', async answer => {
            console.log('Received SDP answer:', answer);
            await peerConnection.setRemoteDescription(answer);
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
        } catch (error) {
          console.error('Error viewing stream:', error);
        }
      };
  
      startViewing();
    }, []);
  
    return (
      <div>
        <h1>Viewer Stream</h1>
        <video ref={videoRef} autoPlay playsInline controls />
      </div>
    );
  };
  
  export default ViewerStream;