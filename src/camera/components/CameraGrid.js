import React, { useState, useRef } from 'react';
import ReactPlayer from 'react-player';
import Webcam from 'react-webcam';
import test_video from '../tests/camera_test.mp4'
import test_licences from '../tests/license_plates.mp4'

const CameraGrid = ({ title, cardData, onAddCamera }) => {
    const [showVideoModal, setShowVideoModal] = useState(false);
    const [selectedCamera, setSelectedCamera] = useState(null);
    const [cameraType, setCameraType] = useState('');
    const playerRef = useRef(null);

    const handleCardClick = (camera) => {
        setSelectedCamera(camera.camera_address);
        setCameraType(camera.camera_type);
        setShowVideoModal(true);
    };

    const handleCloseVideoModal = () => {
        setShowVideoModal(false);
        setSelectedCamera(null);
    };

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
