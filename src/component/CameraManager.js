import React, { useEffect, useState, useRef } from 'react';
import Webcam from 'react-webcam';
import ReactPlayer from 'react-player';
import test_video from '../camera/tests/camera_test.mp4';

const CameraManager = () => {
    const [webcams, setWebcams] = useState([]);
    const [remoteIpCameras, setRemoteIpCameras] = useState([]);
    const [liveStreamCameras, setLiveStreamCameras] = useState([]);
    const [localVideoCameras, setLocalVideoCameras] = useState([]);
    const [cameraTasks, setCameraTasks] = useState([]);
    const webcamRefs = useRef({});
    const playerRefs = useRef({});

    useEffect(() => {
        const fetchImageTasks = async () => {
            try {
                const response = await fetch('http://127.0.0.1:8000/image-task/by-user/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Token ${localStorage.getItem('access_token')}`,
                    },
                    body: JSON.stringify({ token: localStorage.getItem('access_token') }),
                });
                const data = await response.json();
                setCameraTasks(data);
            } catch (error) {
                console.error('Error fetching image tasks:', error);
            }
        };

        fetchImageTasks();
    }, []);

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

    useEffect(() => {
        const remoteIpTasks = cameraTasks.filter(task => task.camera_type === 'remoteIP');
        const liveStreamTasks = cameraTasks.filter(task => task.camera_type === 'liveStream');
        const localVideoTasks = cameraTasks.filter(task => task.camera_type === 'localVideo');

        setRemoteIpCameras(remoteIpTasks);
        setLiveStreamCameras(liveStreamTasks);
        setLocalVideoCameras(localVideoTasks);

        console.log('Remote IP Cameras:', remoteIpTasks.map(task => task.camera_address));
        console.log('Live Stream Cameras:', liveStreamTasks.map(task => task.camera_address));
        console.log('Local Video Cameras:', localVideoTasks.map(task => task.camera_address));
    }, [cameraTasks]);

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
            console.log('Webcam Image Source:', imageSrc);
    
            const response = await fetch(imageSrc);
            const imageBlob = await response.blob();
    
            stream.getTracks().forEach(track => track.stop()); // Stop the stream to release resources
    
            return { device_id: deviceId, image: imageBlob };
        } catch (error) {
            console.error('Error capturing frame:', error);
            return null;
        }
    };

    const captureFrameFromUrl = async (url, type) => {
        try {
            let videoSrc = url;
            if (type === 'localVideo') {
                videoSrc = test_video;
            }
    
            console.log(`Capturing frame from ${type} with URL: ${videoSrc}`);
    
            return new Promise((resolve, reject) => {
                const videoElement = document.createElement('video');
                videoElement.src = videoSrc;
                videoElement.crossOrigin = 'anonymous'; // Required for capturing frames from different origins
    
                videoElement.addEventListener('loadeddata', async () => {
                    // Create a canvas element
                    const canvas = document.createElement('canvas');
                    canvas.width = videoElement.videoWidth;
                    canvas.height = videoElement.videoHeight;
    
                    // Draw the video frame to the canvas
                    canvas.getContext('2d').drawImage(videoElement, 0, 0);
                    const imageSrc = canvas.toDataURL('image/jpeg');
                    console.log(`${type} Image Source:`, imageSrc);
    
                    try {
                        const response = await fetch(imageSrc);
                        const imageBlob = await response.blob();
                        resolve({ device_id: url, image: imageBlob, type: type });
                    } catch (err) {
                        console.error(`Error capturing frame from ${type}:`, err);
                        reject(err);
                    }
                });
    
                videoElement.addEventListener('error', (err) => {
                    console.error(`Error loading video from ${type}:`, err);
                    reject(err);
                });
    
                videoElement.load(); // Load the video
            });
        } catch (error) {
            console.error(`Error capturing frame from ${type}:`, error);
            return null;
        }
    };

    const sendFramesToBackend = async (frames) => {
        const formData = new FormData();
        frames.forEach((frame, index) => {
            formData.append(`image_${index}`, frame.image, `${frame.device_id}.jpg`);
            formData.append(`device_id_${index}`, frame.device_id);
            formData.append(`type_${index}`, frame.type);
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
        const webcamFrames = await Promise.all(
            webcams.map(async (camera) => {
                return captureFrame(camera.deviceId);
            })
        );
        console.log(webcamFrames)
        if (webcamFrames.length > 0) {
            console.log('Valid frames from webcams:', webcamFrames);
            sendFramesToBackend(webcamFrames);
        } else {
            console.log('No valid frames to send from webcams');
        }

        const remoteIpFrames = await Promise.all(
            remoteIpCameras.map(async (camera) => {
                return captureFrameFromUrl(camera.camera_address, 'remoteIP');
            })
        );

        const liveStreamFrames = await Promise.all(
            liveStreamCameras.map(async (camera) => {
                return captureFrameFromUrl(camera.camera_address, 'liveStream');
            })
        );

        const localVideoFrames = await Promise.all(
            localVideoCameras.map(async (camera) => {
                return captureFrameFromUrl(test_video, 'localVideo');
            })
        );
        console.log(localVideoFrames)
        if (localVideoFrames.length > 0) {
            console.log('Valid frames from localVideo:', localVideoFrames);
            sendFramesToBackend(localVideoFrames);
        } else {
            console.log('No valid frames to send from localVideo');
        }
    };

    useEffect(() => {
        const interval = setInterval(() => {
            captureAndSendFrames();
        }, 60000); // 60 seconds

        return () => clearInterval(interval);
    }, [webcams, remoteIpCameras, liveStreamCameras, localVideoCameras]);

    return (
        <div>
            {webcams.map((camera) => (
                <Webcam
                    key={camera.deviceId}
                    audio={false}
                    ref={(ref) => (webcamRefs.current[camera.deviceId] = ref)}
                    screenshotFormat="image/jpeg"
                    videoConstraints={{ deviceId: camera.deviceId }}
                    style={{ display: 'none' }}
                />
            ))}
            {remoteIpCameras.map((camera, index) => (
                <ReactPlayer
                    key={`remoteIp-${index}`}
                    url={camera.camera_address}
                    playing
                    muted
                    ref={(ref) => (playerRefs.current[`remoteIp-${index}`] = ref)}
                    style={{ display: 'none' }}
                />
            ))}
            {liveStreamCameras.map((camera, index) => (
                <ReactPlayer
                    key={`liveStream-${index}`}
                    url={camera.camera_address}
                    playing
                    muted
                    ref={(ref) => (playerRefs.current[`liveStream-${index}`] = ref)}
                    style={{ display: 'none' }}
                />
            ))}
            {localVideoCameras.map((camera, index) => (
                <ReactPlayer
                    key={`localVideo-${index}`}
                    url={test_video}
                    playing
                    muted
                    ref={(ref) => (playerRefs.current[`localVideo-${index}`] = ref)}
                    style={{ display: 'none' }}
                />
            ))}
        </div>
    );
};

export default CameraManager;
