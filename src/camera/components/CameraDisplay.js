import React from 'react';
import ReactPlayer from 'react-player';
import Webcam from 'react-webcam';
import VideoPlayer from '../VideoPlayer';
import EntranceStream from '../EntranceStream';

const CameraDisplay = ({
        selectedOption,
        formData,
        entranceSetup,
        playerRef,
        showCurrentFrame,
        currentFrameImage,
        videoReady,
        loading,
        setVideoReady,
        handleFindSpotsClick,
        handleReturnToVideoClick,
        handleProcessClick }) => {
    return (
        <div>
            {selectedOption === 'connectedCamera' && formData.selectedCamera && (
                <Webcam
                    audio={false}
                    videoConstraints={{
                        deviceId: formData.selectedCamera,
                    }}
                    width="100%"
                    height="auto"
                />
            )}

            {selectedOption === 'remoteIP' && formData.cameraName && (
                <ReactPlayer url={`http://${formData.cameraName}/video`} playing controls width="100%" height="auto" />
            )}

            {selectedOption === 'liveStream' && formData.cameraName && (
                // <ReactPlayer url={formData.cameraName} playing controls width="100%" height="auto" />
                <VideoPlayer videoUrl={formData.cameraName} />
            )}

            {selectedOption === 'localVideo' && formData.localVideo && (
                <div>
                    {entranceSetup ? (
                        <EntranceStream videoRef={playerRef} localVideo={formData.localVideo} />
                    ) : (
                        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                            {!showCurrentFrame ? (
                                <ReactPlayer
                                    ref={playerRef}
                                    url={URL.createObjectURL(formData.localVideo)}
                                    width="100%"
                                    height="100%"
                                    controls={true}
                                    onReady={() => {
                                        setVideoReady(true);
                                    }}
                                />
                            ) : (
                                <img
                                    src={currentFrameImage}
                                    alt="Current Frame"
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                            )}
                            {showCurrentFrame && (
                                <>
                                    {loading && (
                                        <div
                                            style={{
                                                position: 'absolute',
                                                top: '50%',
                                                left: '50%',
                                                transform: 'translate(-50%, -50%)',
                                                zIndex: 1,
                                                color: 'white',
                                            }}
                                        >
                                            Loading...
                                        </div>
                                    )}

                                    <button
                                        style={{
                                            position: 'absolute',
                                            top: 0,
                                            left: '50%',
                                            transform: 'translateX(-50%)',
                                            padding: '10px',
                                            background: 'rgba(0, 0, 0, 0.5)',
                                            color: 'white',
                                            cursor: 'pointer',
                                        }}
                                        onClick={handleFindSpotsClick}
                                    >
                                        Find Spots
                                    </button>
                                </>
                            )}
                            {videoReady && (
                                <button
                                    style={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        padding: '10px',
                                        background: 'rgba(0, 0, 0, 0.5)',
                                        color: 'white',
                                        cursor: 'pointer',
                                    }}
                                    onClick={showCurrentFrame ? handleReturnToVideoClick : handleProcessClick}
                                >
                                    {showCurrentFrame ? 'Return to video' : 'Process'}
                                </button>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default CameraDisplay;
