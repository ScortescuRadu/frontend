import React, { useEffect, useRef, useState } from 'react';
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
  const [isMasterReady, setIsMasterReady] = useState(false);
  const signalingClientRef = useRef(null);
  const mediaRecorderRef = useRef(null);

  useEffect(() => {
    const channelName = 'license-channel';
    const region = 'us-east-1';
    const accessKeyId = 'AKIATCKAOKOGMEQ2ZOGX';
    const secretAccessKey = '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';
    const kinesisVideoStreamName = 'license-stream';

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
        const describeSignalingChannelCommand = new DescribeSignalingChannelCommand({ ChannelName: channelName });
        const describeResponse = await kinesisVideoClient.send(describeSignalingChannelCommand);
        const channelARN = describeResponse.ChannelInfo.ChannelARN;
        console.log('Channel ARN:', channelARN);

        // Get Signaling Channel Endpoint
        console.log('Sending GetSignalingChannelEndpointCommand...');
        const getSignalingChannelEndpointCommand = new GetSignalingChannelEndpointCommand({
          ChannelARN: channelARN,
          SingleMasterChannelEndpointConfiguration: { Protocols: ['WSS'], Role: 'MASTER' },
        });
        const signalingEndpointResponse = await kinesisVideoClient.send(getSignalingChannelEndpointCommand);
        const signalingEndpoint = signalingEndpointResponse.ResourceEndpointList.find(endpoint => endpoint.Protocol === 'WSS');
        console.log('Signaling endpoint received:', signalingEndpoint.ResourceEndpoint);

        // Get ICE server configuration
        const kinesisVideoSignalingClient = new KinesisVideoSignalingClient(config);
        console.log('Sending GetIceServerConfigCommand...');
        const getIceServerConfigCommand = new GetIceServerConfigCommand({ ChannelARN: channelARN });
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

        // Request webcam access
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
                  console.log('Queueing ICE candidate:', event.candidate);
                  pendingIceCandidatesRef.current.push(event.candidate);
                  if (signalingClientRef.current && signalingClientRef.current.connectionState === 'connected') {
                    signalingClientRef.current.sendIceCandidate(event.candidate);
                  }
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
                clientId: null, // No clientId for MASTER role
                credentials: { accessKeyId, secretAccessKey },
              });

              signalingClientRef.current = signalingClient;

              signalingClient.on('open', async () => {
                console.log('Connected to signaling channel');
                signalingClient.sendSdpOffer(offer);
                setIsMasterReady(true); // Set master ready

                // Send any queued ICE candidates
                while (pendingIceCandidatesRef.current.length > 0) {
                  const candidate = pendingIceCandidatesRef.current.shift();
                  console.log('Sending queued ICE candidate:', candidate);
                  signalingClient.sendIceCandidate(candidate);
                }
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

              // Kinesis Video Streams integration
              const kinesisVideo = new AWS.KinesisVideo({
                region,
                accessKeyId,
                secretAccessKey,
              });

              const getEndpointParams = { APIName: 'PUT_MEDIA', StreamName: kinesisVideoStreamName };
              kinesisVideo.getDataEndpoint(getEndpointParams, (err, data) => {
                if (err) {
                  console.log(err, err.stack);
                } else {
                  const endpoint = data.DataEndpoint;
                  const mediaRecorder = new MediaRecorder(stream, {
                    mimeType: 'video/webm;codecs=vp8',
                  });

                  mediaRecorder.ondataavailable = async event => {
                    if (event.data.size > 0) {
                      console.log('Sending chunk to Kinesis Video Streams...');
                      try {
                        await fetch(endpoint + '/putMedia', {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                            'X-Amz-Date': new Date().toISOString(),
                            'Authorization': `AWS4-HMAC-SHA256 Credential=${accessKeyId}/${region}/kinesisvideo/aws4_request, SignedHeaders=host;x-amz-date, Signature=${secretAccessKey}`,
                          },
                          body: event.data,
                        });
                      } catch (error) {
                        console.error('Error sending chunk to Kinesis Video Streams:', error);
                      }
                    }
                  };

                  mediaRecorder.start(1000); // Record in chunks of 1 second
                  mediaRecorderRef.current = mediaRecorder;
                }
              });
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
      {isMasterReady && <ViewerStream />}
    </div>
  );
};

export default EntranceStream;