import '../homepage/index.css';
import React, { useState, useEffect, useRef } from 'react';
import ReactPlayer from 'react-player';
import AWS from 'aws-sdk';

const EntranceStream = ({ videoRef, localVideo }) => {
    const [videoReady, setVideoReady] = useState(false);
    let kinesisVideoProducer; // Declare kinesisVideoProducer in the outer scope

  useEffect(() => {
    // Set up AWS credentials
    AWS.config.update({
      accessKeyId: 'AKIATCKAOKOGMEQ2ZOGX',
      secretAccessKey: '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',
      region: 'eu-central-1',
      correctClockSkew: true,
    });

    // Create a Kinesis Video instance
    const kinesisVideo = new AWS.KinesisVideo({ region: 'eu-central-1' });

    // Specify the Kinesis Video Stream name
    const streamName = 'real-time-anpr';

     // Get the Kinesis Video Stream data
     const streamARN = 'arn:aws:kinesisvideo:eu-central-1:211125425036:stream/real-time-anpr/1710163284368';

    // Get the Kinesis Video Stream endpoint
    kinesisVideo.getDataEndpoint(
      {
        // StreamName: streamName,
        StreamARN: streamARN,
        APIName: 'PUT_MEDIA',
      },
      (err, data) => {
        if (err) {
          console.error('Error getting Kinesis Video Stream endpoint:', err);
        } else {
          console.log('Kinesis Video Stream endpoint:', data.DataEndpoint);

          // Set up the Kinesis Video Streams Media client
          const kinesisVideoMedia = new AWS.KinesisVideoMedia({
            endpoint: data.DataEndpoint,
            region: 'eu-central-1',
          });
        }
      }
    );

    // Cleanup when the component is unmounted
    return () => {
      // Close the Kinesis Video Streams Producer connection
      if (kinesisVideoProducer) {
        kinesisVideoProducer.close();
      }
    };
  }, [videoRef, localVideo]);
  
    return (
      <div>
        <h1>Kinesis Video Stream</h1>
        <ReactPlayer
            ref={videoRef}
            url={URL.createObjectURL(localVideo)}
            width="100%"
            height="100%"
            controls={true}
            onReady={() => {
            setVideoReady(true);
            }}
        />
      </div>
    );
}

export default EntranceStream;