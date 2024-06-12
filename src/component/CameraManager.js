import React, { useEffect, useState, useRef } from 'react';
import Webcam from 'react-webcam';
import ReactPlayer from 'react-player';
import test_video from '../camera/tests/camera_test.mp4';
import { w3cwebsocket as W3CWebSocket } from 'websocket';

const CameraManager = () => {
    const [webcams, setWebcams] = useState([]);
    const [remoteIpCameras, setRemoteIpCameras] = useState([]);
    const [liveStreamCameras, setLiveStreamCameras] = useState([]);
    const [localVideoCameras, setLocalVideoCameras] = useState([]);
    const [cameraTasks, setCameraTasks] = useState([]);
    const webcamRefs = useRef({});
    const playerRefs = useRef({});
    const socketRef = useRef(null);

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
    
        console.log('Remote IP Cameras:', remoteIpTasks.map(task => ({
            address: task.camera_address,
            destination: task.destination_type
        })));
        console.log('Live Stream Cameras:', liveStreamTasks.map(task => ({
            address: task.camera_address,
            destination: task.destination_type
        })));
        console.log('Local Video Cameras:', localVideoTasks.map(task => ({
            address: task.camera_address,
            destination: task.destination_type
        })));
    }, [cameraTasks]);

    // WebSocket initialization
    useEffect(() => {
        const entranceExitTasks = cameraTasks.filter(task => task.destination_type === 'entrance' || task.destination_type === 'exit');

        if (entranceExitTasks.length > 0) {
            socketRef.current = new W3CWebSocket('ws://localhost:8000/ws/gate_camera_updates/');
    
            socketRef.current.onopen = () => {
                console.log('WebSocket connection opened');
            };
    
            socketRef.current.onclose = () => {
                console.log('WebSocket connection closed');
            };

            socketRef.current.onerror = (error) => {
                console.error('WebSocket error:', error);
            };
    
            socketRef.current.onmessage = (message) => {
                console.log('WebSocket message received:', message);
            };
        }

        // Continuously capture and send frames for entrance and exit cameras
        const captureAndSendContinuousFrames = async () => {
            console.log('capture entrance/exit frame')
            const frames = await Promise.all(entranceExitTasks.map(async (camera) => {
                if (camera.camera_type === 'localVideo') {
                    return captureFrameFromUrl(test_video, 'localVideo');
                } else {
                    return captureFrameFromUrl(camera.camera_address, camera.camera_type);
                }
            }));

            frames.forEach(frame => {
                console.log('Captured frame:', frame);
                const frameFilename = frame.device_id.split('/').pop();
                const task = entranceExitTasks.find(task => {
                    const taskFilename = task.camera_address.split('/').pop();
                    console.log('Checking task:', task, 'against frameFilename:', frameFilename);
                    return taskFilename === frameFilename;
                });
                console.log('Matching task:', task);
                if (task && task.destination_type) {  // Ensure destination_type is defined
                    const message = {
                        device_id: frame.device_id,
                        token: localStorage.getItem('access_token'),
                        parking_lot: localStorage.getItem('selectedAddressOption') || '',
                        type: frame.type,
                        destination_type: task.destination_type,  // Use destination_type
                        image: frame.image  // Directly assign the base64 image string
                    };
                    console.log('Prepared message:', message);
                    if (socketRef.current) {
                        console.log('Sending message:', message);
                        socketRef.current.send(JSON.stringify(message));
                    } else {
                        console.error('WebSocket is not open.');
                    }
                } else {
                    console.error('Task or destination_type is not defined for frame:', frame);
                }
            });
        };

        const interval = setInterval(() => {
            captureAndSendContinuousFrames();
        }, 200000); // 2 seconds

        return () => {
            clearInterval(interval);
            if (socketRef.current) {
                socketRef.current.close();
            }
        };
    }, [cameraTasks]);

    const displayBase64Image = (base64String) => {
        const imageElement = document.createElement('img');
        imageElement.src = `data:image/jpeg;base64,${base64String}`;
        document.body.appendChild(imageElement); // Append the image to the body or any other container
    };

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
    
            return new Promise((resolve, reject) => {
                const videoElement = document.createElement('video');
                videoElement.src = videoSrc;
                videoElement.crossOrigin = 'anonymous';
    
                videoElement.addEventListener('loadeddata', async () => {
                    const canvas = document.createElement('canvas');
                    canvas.width = videoElement.videoWidth;
                    canvas.height = videoElement.videoHeight;
    
                    canvas.getContext('2d').drawImage(videoElement, 0, 0);
                    const imageSrc = canvas.toDataURL('image/jpeg');
                    const base64Image = imageSrc.split(',')[1];

                    displayBase64Image(base64Image);

                    resolve({ device_id: url, image: base64Image, type: type });
                });
    
                videoElement.addEventListener('error', (err) => {
                    reject(err);
                });
    
                videoElement.load();
            });
        } catch (error) {
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
        const parkingLotAddress = localStorage.getItem('selectedAddressOption') || '';
        formData.append('parking_lot', parkingLotAddress);

        try {
            console.log('Sending frames to backend...');
            const response = await fetch('http://127.0.0.1:8000/image-task/process-frames/', {
                method: 'POST',
                headers: {
                    'Authorization': `Token ${localStorage.getItem('access_token')}`,
                },
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
        }, 600000); // 60 seconds

        return () => clearInterval(interval);
    }, [webcams, remoteIpCameras, liveStreamCameras, localVideoCameras]);

    return (
        <div>
            {/* {webcams.map((camera) => (
                <Webcam
                    key={camera.deviceId}
                    audio={false}
                    ref={(ref) => (webcamRefs.current[camera.deviceId] = ref)}
                    screenshotFormat="image/jpeg"
                    videoConstraints={{ deviceId: camera.deviceId }}
                    style={{ display: 'none' }}
                />
            ))} */}
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
