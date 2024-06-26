import React, { useEffect, useState, useRef } from 'react';
import ReactPlayer from 'react-player';
import Webcam from 'react-webcam';
import test_video from '../tests/camera_test.mp4'
import test_licences from '../tests/license_plates.mp4'
import VideoPlayer from '../VideoPlayer';
import { w3cwebsocket as W3CWebSocket } from 'websocket';

const CameraGrid = ({ title, cardData, onAddCamera, selectedAddress, formData }) => {
    const [showVideoModal, setShowVideoModal] = useState(false);
    const [selectedCamera, setSelectedCamera] = useState(null);
    const [cameraType, setCameraType] = useState('');
    const [boundingBoxes, setBoundingBoxes] = useState([]);
    const [ocrText, setOcrText] = useState('');
    const websocketRef = useRef(null);
    const playerRef = useRef(null);
    const [mediaScale, setMediaScale] = useState({ scaleX: 1, scaleY: 1 });
    const mediaContainerRef = useRef(null);
    const [originalImageDimensions, setOriginalImageDimensions] = useState({ width: 720, height: 639 });
    const [summaryString, setSummaryString] = useState('');
    const [entrancePlates, setEntrancePlates] = useState({});
    const [exitPlates, setExitPlates] = useState({});
    const [imageSrc, setImageSrc] = useState('');

    const handleCardClick = (camera) => {
        setSelectedCamera(camera.camera_address);
        console.log(camera.camera_type)
        setCameraType(camera.camera_type);
        console.log('clicked')
        setShowVideoModal(true);
        if (title === 'spot')
        {
            console.log('fetching bounding boxes')
            fetchBoundingBoxes(camera.camera_address);
        }
    };

    const handleCloseVideoModal = () => {
        setShowVideoModal(false);
        setSelectedCamera(null);
        setBoundingBoxes([]);
    };

    useEffect(() => {
        if (selectedAddress) {
            fetchLicensePlates();
        }
    }, [selectedAddress]);

    useEffect(() => {
        // WebSocket setup
        websocketRef.current = new W3CWebSocket('ws://localhost:8000/ws/license-plates/');

        websocketRef.current.onopen = () => {
            console.log('WebSocket connection opened');
        };

        websocketRef.current.onclose = () => {
            console.log('WebSocket connection closed');
        };

        websocketRef.current.onerror = (error) => {
            console.error('WebSocket error:', error);
        };

        websocketRef.current.onmessage = (message) => {
            const data = JSON.parse(message.data);
            console.log('WebSocket message received:', data);

            const { type, license_plate, timestamp, camera_address, is_paid } = data.message;

            if (type === 'entrance') {
                setEntrancePlates((prev) => ({
                    ...prev,
                    [camera_address]: [
                        ...(prev[camera_address] || []).filter(plate => plate.license_plate !== license_plate),
                        { license_plate, timestamp }
                    ],
                }));
            } else if (type === 'exit') {
                setExitPlates((prev) => ({
                    ...prev,
                    [camera_address]: [
                        ...(prev[camera_address] || []).filter(plate => plate.license_plate !== license_plate),
                        { license_plate, timestamp, is_paid }
                    ],
                }));
            }
        };

        return () => {
            websocketRef.current.close();
        };
    }, []);

    const fetchLicensePlates = async () => {
        try {
            const [entrancesResponse, exitsResponse] = await Promise.all([
                fetch(`http://localhost:8000/entrance/today-entrances/?street_address=${selectedAddress}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Token ${localStorage.getItem('access_token')}`,
                    },
                }),
                fetch(`http://localhost:8000/exit/today-exits/?street_address=${selectedAddress}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Token ${localStorage.getItem('access_token')}`,
                    },
                }),
            ]);

            const entrancesData = await entrancesResponse.json();
            const exitsData = await exitsResponse.json();

            const entrancePlatesByCamera = {};
            const exitPlatesByCamera = {};

            entrancesData.forEach((plate) => {
                if (!entrancePlatesByCamera[plate.camera_address]) {
                    entrancePlatesByCamera[plate.camera_address] = [];
                }
                entrancePlatesByCamera[plate.camera_address] = [
                    ...entrancePlatesByCamera[plate.camera_address].filter(p => p.license_plate !== plate.license_plate),
                    plate
                ];
            });
            
            exitsData.forEach((plate) => {
                if (!exitPlatesByCamera[plate.camera_address]) {
                    exitPlatesByCamera[plate.camera_address] = [];
                }
                exitPlatesByCamera[plate.camera_address] = [
                    ...exitPlatesByCamera[plate.camera_address].filter(p => p.license_plate !== plate.license_plate),
                    plate
                ];
            });

            console.log('Entrance Plates By Camera:', entrancePlatesByCamera);
            console.log('Exit Plates By Camera:', exitPlatesByCamera);

            setEntrancePlates(entrancePlatesByCamera);
            setExitPlates(exitPlatesByCamera);
        } catch (error) {
            console.error('Error fetching license plates:', error);
        }
    };

    useEffect(() => {
        const calculateScale = () => {
            const container = mediaContainerRef.current;
            if (container) {
                console.log('containet', container.clientWidth, container.clientHeight)
                const scaleWidth = container.clientWidth / originalImageDimensions.width;
                const scaleHeight = 490 / originalImageDimensions.height;
                setMediaScale({ scaleX: scaleWidth, scaleY: scaleHeight });
                console.log('Container scale factors:', scaleWidth, scaleHeight);
            }
        };
    
        window.addEventListener('resize', calculateScale);
        calculateScale(); // Initial calculation
    
        return () => {
            window.removeEventListener('resize', calculateScale);
        };
    }, [showVideoModal, originalImageDimensions]);

    const fetchBoundingBoxes = async (cameraAddress) => {
        try {
            const response = await fetch('http://localhost:8000/image-task/by-task/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Token ${localStorage.getItem('access_token')}`,
                },
                body: JSON.stringify({
                    token: localStorage.getItem('access_token'),
                    camera_address: cameraAddress,
                    camera_type: cameraType,
                    parking_lot: selectedAddress,
                }),
            });
            if (response.ok) {
                const data = await response.json();
                setBoundingBoxes(data.bounding_boxes);
                setOriginalImageDimensions({
                    width: data.image_task.original_image_width,
                    height: data.image_task.original_image_height,
                });
                console.log('originalIm', originalImageDimensions)
            } else {
                console.error('Error fetching bounding boxes:', response.statusText);
            }
        } catch (error) {
            console.error('Error fetching bounding boxes:', error);
        }
    };

    // WebSocket setup
    useEffect(() => {
        if ( showVideoModal === true && playerRef.current && (title === 'entrance' || title === 'exit')) {
            websocketRef.current = new WebSocket('ws://localhost:8000/ws/entrance_exit_frames/');
            websocketRef.current.onopen = () => {
                console.log('WebSocket connection opened');
            };
            websocketRef.current.onclose = () => {
                console.log('WebSocket connection closed');
            };
            websocketRef.current.onerror = error => {
                console.error('WebSocket error:', error);
            };
            websocketRef.current.onmessage = message => {
                const data = JSON.parse(message.data);
                console.log('WebSocket message received:', data);
                if (data.ocr_texts && data.ocr_texts.length > 0) {
                    setOcrText(data.ocr_texts.join(', '));
                }
            };

            const captureFrameAndSend = async () => {
                const canvas = document.createElement('canvas');
                const videoElement = playerRef.current.getInternalPlayer();
                if (videoElement) {
                    canvas.width = videoElement.videoWidth;
                    canvas.height = videoElement.videoHeight;
                    const context = canvas.getContext('2d');
                    context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
                    const imageBlob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg'));
                    const reader = new FileReader();
                    reader.onloadend = () => {
                        const base64data = reader.result;
                        websocketRef.current.send(JSON.stringify({
                            image: base64data.split(',')[1],  // Remove the data URL part
                            device_id_0: formData.selectedCamera || 'current_frame',
                            parking_lot: selectedAddress,
                            token: localStorage.getItem('access_token')
                        }));
                        console.log('Sent frame to WebSocket');
                    };
                    reader.readAsDataURL(imageBlob);
                }
            };

            const intervalId = setInterval(() => {
                captureFrameAndSend();
            }, 1000); // Send every second

            return () => {
                clearInterval(intervalId);
                    websocketRef.current.close();
                };
            }
    }, [showVideoModal, playerRef, title, formData, selectedAddress]);

    // WebSocket setup for spot
    useEffect(() => {
        if (showVideoModal === true && playerRef.current && title === 'spot') {
            websocketRef.current = new WebSocket('ws://localhost:8000/ws/spot_frames/');
            websocketRef.current.onopen = () => {
                console.log('WebSocket connection opened');
            };
            websocketRef.current.onclose = () => {
                console.log('WebSocket connection closed');
            };
            websocketRef.current.onerror = error => {
                console.error('WebSocket error:', error);
            };
            websocketRef.current.onmessage = message => {
                const data = JSON.parse(message.data);
                console.log('WebSocket message received:', data);
                if (data.detail) {
                    console.error(data.detail);
                    return;
                }
                if (data.summary_string) {
                    setSummaryString(data.summary_string);
                }
                if (data.image_data) {
                    const imageSrc = `data:image/jpeg;base64,${data.image_data}`;
                    setImageSrc(imageSrc); // Update the state to display the image
                }
            };

            const captureFrameAndSendSpot = async () => {
                const canvas = document.createElement('canvas');
                const videoElement = playerRef.current.getInternalPlayer();
                if (videoElement) {
                    canvas.width = videoElement.videoWidth;
                    canvas.height = videoElement.videoHeight;
                    const context = canvas.getContext('2d');
                    context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
                    const imageBlob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg'));
                    const reader = new FileReader();
                    reader.onloadend = () => {
                        const base64data = reader.result;
                        websocketRef.current.send(JSON.stringify({
                            image: base64data.split(',')[1],  // Remove the data URL part
                            camera_address: selectedCamera,
                            parking_lot: selectedAddress,
                            camera_type: cameraType,
                            token: localStorage.getItem('access_token')
                        }));
                        console.log('Sent frame to WebSocket');
                        console.log('image', base64data.split(',')[1])
                    };
                    reader.readAsDataURL(imageBlob);
                }
            };

            const intervalId = setInterval(() => {
                captureFrameAndSendSpot();
            }, 1000); // Send every second

            return () => {
                clearInterval(intervalId);
                websocketRef.current.close();
            };
        }
    }, [showVideoModal, playerRef, title, formData, selectedAddress]);

    return (
        <div>
            <div style={gridContainerStyle}>
                <div style={cardStyle} onClick={onAddCamera}>
                    <div style={plusStyle}>+</div>
                    <div style={cardTitleStyle}>Add Camera</div>
                </div>
                {title === 'spot' && cardData && cardData.length > 0 && cardData.map((card, index) => (
                    <div key={index} style={cameraCardStyle} onClick={() => handleCardClick(card)}>
                        <h3 style={h3Style}>{card.camera_address}</h3>
                        <div style={spotsGridContainerStyle}>
                            {card.spots.map((spot) => (
                                <div
                                    key={spot.id}
                                    style={{
                                        ...spotStyle,
                                        backgroundColor: spot.is_occupied ? 'red' : 'green'
                                    }}
                                >
                                    {`${spot.level}/${spot.sector}/${spot.number}`}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
                {title === 'entrance' && cardData && cardData.length > 0 && cardData
                    .filter(card => card.destination_type === title)
                    .map((card, index) => (
                        <div key={index} style={cameraCardStyle} onClick={() => handleCardClick(card)}>
                            <h3 style={h3Style}>{card.camera_address}</h3>
                            <div style={licensePlateContainerStyle}>
                                {entrancePlates[card.camera_address] && entrancePlates[card.camera_address].map((plate, idx) => (
                                    <div
                                        key={idx}
                                        style={{
                                            ...licensePlateStyle,
                                            backgroundColor: 'red',
                                        }}
                                    >
                                        {plate.license_plate}
                                    </div>
                                ))}
                            </div>
                        </div>
                ))}
                {title === 'exit' && cardData && cardData.length > 0 && cardData
                    .filter(card => card.destination_type === title)
                    .map((card, index) => (
                        <div key={index} style={cameraCardStyle} onClick={() => handleCardClick(card)}>
                            <h3 style={h3Style}>{card.camera_address}</h3>
                            <div style={licensePlateContainerStyle}>
                                {exitPlates[card.camera_address] && exitPlates[card.camera_address].map((plate, idx) => (
                                    <div
                                        key={idx}
                                        style={{
                                            ...licensePlateStyle,
                                            backgroundColor: plate.is_paid ? 'green' : 'red',
                                        }}
                                    >
                                        {plate.license_plate}
                                    </div>
                                ))}
                            </div>
                        </div>
                ))}
            </div>
            {showVideoModal && (
                <div ref={mediaContainerRef} style={modalOverlayStyle} onClick={handleCloseVideoModal}>
                    <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
                        {ocrText &&
                            <div style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '10%',
                                backgroundColor: 'black',
                                zIndex: 1,
                            }}>
                                <p style={{ color: 'white', textAlign: 'center', margin: 0, padding: '10px' }}>
                                    License Plate: {ocrText}
                                </p>
                            </div>
                        }
                        {summaryString && (
                            <div style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '10%',
                                backgroundColor: 'black',
                                zIndex: 1,
                            }}>
                                <p style={{ color: 'white', textAlign: 'center', margin: 0, padding: '10px' }}>
                                    {summaryString}
                                </p>
                            </div>
                        )}
                        {cameraType === 'connectedCamera' && (
                            <Webcam
                                audio={false}
                                videoConstraints={{
                                    deviceId: selectedCamera,
                                }}
                                style={videoPlayerStyle}
                            />
                        )}
                        {cameraType === 'localVideo' && (
                            <ReactPlayer
                                ref={playerRef}
                                url={title === 'exit' || title === 'entrance' ? test_licences : test_video}
                                controls
                                width="100%"
                                height="auto"
                                muted={true}
                            />
                        )}
                        {cameraType === 'liveStream' && (
                            <VideoPlayer
                                videoUrl={selectedCamera}
                                ref={playerRef}
                                width="100%"
                                height="100%"
                                controls={true}
                                muted={true}
                                setVideoReady={() => {}}
                            />
                        )}
                        {title === 'spot' && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                                <ReactPlayer
                                    ref={playerRef}
                                    // url={test_video}
                                    controls
                                    width="0%"
                                    height="auto"
                                    muted={true}
                                />
                                {imageSrc && (
                                    <img 
                                        src={imageSrc} 
                                        alt="Processed frame" 
                                        style={{ 
                                            width: '48%', 
                                            height: 'auto', 
                                            display: 'block', 
                                            margin: '0 auto' 
                                        }} 
                                    />
                                )}
                            </div>
                        )}
                        {/* {Array.isArray(boundingBoxes) &&
                            boundingBoxes.map((detail, index) => (
                                <div
                                    key={`box-${index}`}
                                    style={{
                                        position: 'absolute',
                                        border: `2px solid ${detail.is_empty ? 'green' : 'red'}`,
                                        left: detail.is_drawn
                                            ? `${detail.bounding_boxes_json[0].x * originalImageDimensions.width * mediaScale.scaleX}px`
                                            : `${detail.bounding_boxes_json[0] * mediaScale.scaleX}px`,
                                        top: detail.is_drawn
                                            ? `${detail.bounding_boxes_json[0].y * originalImageDimensions.height * mediaScale.scaleY}px`
                                            : `${detail.bounding_boxes_json[1] * mediaScale.scaleY}px`,
                                        width: detail.is_drawn
                                            ? `${(detail.bounding_boxes_json[2].x - detail.bounding_boxes_json[0].x) * originalImageDimensions.width * mediaScale.scaleX}px`
                                            : `${(detail.bounding_boxes_json[2] - detail.bounding_boxes_json[0]) * mediaScale.scaleX}px`,
                                        height: detail.is_drawn
                                            ? `${(detail.bounding_boxes_json[2].y - detail.bounding_boxes_json[0].y) * originalImageDimensions.height * mediaScale.scaleY}px`
                                            : `${(detail.bounding_boxes_json[3] - detail.bounding_boxes_json[1]) * mediaScale.scaleY}px`,
                                    }}
                                >
                                    <span style={{
                                        fontSize: detail.is_drawn
                                            ? `${Math.min((detail.bounding_boxes_json[2].x - detail.bounding_boxes_json[0].x) * originalImageDimensions.width * mediaScale.scaleX, (detail.bounding_boxes_json[2].y - detail.bounding_boxes_json[0].y) * originalImageDimensions.height * mediaScale.scaleY) / 3}px`
                                            : `${Math.min((detail.bounding_boxes_json[2] - detail.bounding_boxes_json[0]) * mediaScale.scaleX, (detail.bounding_boxes_json[3] - detail.bounding_boxes_json[1]) * mediaScale.scaleY) / 3}px`,
                                        userSelect: 'none',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        height: '100%',
                                    }}>
                                        {`${detail.parking_spot.level}-${detail.parking_spot.sector}-${detail.parking_spot.number}`}
                                    </span>
                                </div>
                            ))
                        } */}
                        <button onClick={handleCloseVideoModal} style={closeButtonStyle}>Close</button>
                    </div>
                </div>
            )}
        </div>
    );
};

const gridContainerStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
    gap: '20px',
    padding: '20px',
};

const cardStyle = {
    border: '2px dotted #fff',
    borderRadius: '10px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    padding: '20px',
    height: '150px',
    textAlign: 'center',
};

const plusStyle = {
    fontSize: '36px',
    color: '#fff',
};

const cardTitleStyle = {
    marginTop: '10px',
    fontSize: '16px',
    color: '#fff',
};

const cameraCardStyle = {
    backgroundColor: 'black',
    border: '1px solid #ddd',
    borderRadius: '8px',
    padding: '20px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    transition: 'transform 0.3s ease-in-out',
    color: 'white',
    maxHeight: '300px',
    overflow: 'auto',
    cursor: 'pointer',

    ':hover': {
        transform: 'scale(1.05)',
    },
};

const h3Style = {
    marginBottom: '10px',
    color: 'white',
    fontSize: '1.5em',
    fontWeight: 'bold',
    letterSpacing: '0.5px',
};

const spotsGridContainerStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(50px, 1fr))',
    gap: '10px',
    maxHeight: '200px',
    overflowY: 'auto',
};

const spotStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    borderRadius: '4px',
    padding: '10px',
};

const modalOverlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
};

const modalContentStyle = {
    position: 'relative',
    padding: '20px',
    backgroundColor: '#fff',
    borderRadius: '10px',
    boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.5)',
    textAlign: 'center',
    width: '80%',
    height: 'auto',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
};

const videoPlayerStyle = {
    width: '100%',
    height: 'auto',
    display: 'block',
    margin: '0 auto',
};

const closeButtonStyle = {
    marginTop: '10px',
    padding: '10px 20px',
    fontSize: '16px',
    backgroundColor: '#000',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
};

const licensePlateContainerStyle = {
    maxHeight: '150px',
    overflowY: 'auto',
    marginTop: '10px',
};

const licensePlateStyle = {
    padding: '5px',
    borderRadius: '4px',
    color: 'white',
    textAlign: 'center',
    marginBottom: '5px',
};

export default CameraGrid;
