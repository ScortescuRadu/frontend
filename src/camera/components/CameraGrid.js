import React, { useEffect, useState, useRef } from 'react';
import ReactPlayer from 'react-player';
import Webcam from 'react-webcam';
import test_video from '../tests/camera_test.mp4'
import test_licences from '../tests/license_plates.mp4'

const CameraGrid = ({ title, cardData, onAddCamera, selectedAddress, formData }) => {
    const [showVideoModal, setShowVideoModal] = useState(false);
    const [selectedCamera, setSelectedCamera] = useState(null);
    const [cameraType, setCameraType] = useState('');
    const [ocrText, setOcrText] = useState('');
    const websocketRef = useRef(null);
    const playerRef = useRef(null);

    const handleCardClick = (camera) => {
        setSelectedCamera(camera.camera_address);
        setCameraType(camera.camera_type);
        console.log('clicked')
        setShowVideoModal(true);
    };

    const handleCloseVideoModal = () => {
        setShowVideoModal(false);
        setSelectedCamera(null);
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
                {title !== 'spot' && cardData && cardData.length > 0 && cardData
                    .filter(card => card.destination_type === title)
                    .map((card, index) => (
                        <div key={index} style={cameraCardStyle} onClick={() => handleCardClick(card)}>
                            <h3 style={h3Style}>{card.camera_address}</h3>
                        </div>
                    ))}
            </div>
            {showVideoModal && (
                <div style={modalOverlayStyle} onClick={handleCloseVideoModal}>
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
                        {cameraType === 'connectedCamera' && (
                            <Webcam
                                audio={false}
                                videoConstraints={{
                                    deviceId: selectedCamera,
                                }}
                                style={videoPlayerStyle}
                            />
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
};

const videoPlayerStyle = {
    width: '100%',
    height: 'auto',
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

export default CameraGrid;
