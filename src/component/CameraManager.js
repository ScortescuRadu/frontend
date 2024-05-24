import React, { useEffect, useState, useRef } from 'react';
import Webcam from 'react-webcam';

const CameraManager = () => {
    const [webcams, setWebcams] = useState([]);
    const webcamRefs = useRef({});

    useEffect(() => {
        const logConnectedCameras = async () => {
            try {
                const devices = await navigator.mediaDevices.enumerateDevices();
                const cameras = devices.filter(device => device.kind === 'videoinput');
                setWebcams(cameras);
                console.log('Connected Cameras:', cameras);
            } catch (error) {
                console.error('Error fetching connected cameras:', error);
            }
        };

        logConnectedCameras();
    }, []);

    const captureFrame = async (deviceId) => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { deviceId: { exact: deviceId } } });
            const videoElement = document.createElement('video');
            videoElement.srcObject = stream;
            await videoElement.play();
    
            const canvas = document.createElement('canvas');
            canvas.width = videoElement.videoWidth;
            canvas.height = videoElement.videoHeight;
            canvas.getContext('2d').drawImage(videoElement, 0, 0);
            const imageSrc = canvas.toDataURL('image/jpeg');
            console.log('Image Source:', imageSrc);
    
            const response = await fetch(imageSrc);
            const imageBlob = await response.blob();
    
            stream.getTracks().forEach(track => track.stop()); // Stop the stream to release resources
    
            return { device_id: deviceId, image: imageBlob };
        } catch (error) {
            console.error('Error capturing frame:', error);
            return null;
        }
    };

    const sendFramesToBackend = async (frames) => {
        const formData = new FormData();
        frames.forEach((frame, index) => {
            formData.append(`image_${index}`, frame.image, `${frame.device_id}.jpg`);
            formData.append(`device_id_${index}`, frame.device_id);
        });

        try {
            console.log('Sending frames to backend...');
            const response = await fetch('http://127.0.0.1:8000/process-frames/', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                console.error('Error sending frames:', response.statusText);
            } else {
                console.log('Frames successfully sent to backend');
            }
        } catch (error) {
            console.error('Error sending frames:', error);
        }
    };

    const captureAndSendFrames = async () => {
        console.log('Capturing and sending frames...');
        const frames = await Promise.all(
            webcams.map(async (camera) => {
                return captureFrame(camera.deviceId);
            })
        );

        const validFrames = frames.filter(frame => frame !== null);
        if (validFrames.length > 0) {
            console.log('Valid frames:', validFrames);
            sendFramesToBackend(validFrames);
        } else {
            console.log('No valid frames to send');
        }
    };

    useEffect(() => {
        const interval = setInterval(() => {
            captureAndSendFrames();
        }, 60000); // 60 seconds

        return () => clearInterval(interval);
    }, [webcams]);

    return (
        <div style={{ display: 'none' }}>
            {webcams.map((camera) => (
                <Webcam
                    key={camera.deviceId}
                    audio={false}
                    ref={(ref) => (webcamRefs.current[camera.deviceId] = ref)}
                    screenshotFormat="image/jpeg"
                    videoConstraints={{ deviceId: camera.deviceId }}
                />
            ))}
        </div>
    );
};

export default CameraManager;
