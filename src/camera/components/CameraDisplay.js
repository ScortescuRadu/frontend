import React, {useState, useEffect, useRef} from 'react';
import ReactPlayer from 'react-player';
import Webcam from 'react-webcam';
import VideoPlayer from '../VideoPlayer';
import EntranceStream from '../EntranceStream';
import test_video from '../tests/camera_test.mp4'

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
        handleFindSpotsClick: originalHandleFindSpotsClick,
        handleReturnToVideoClick: originalHandleReturnToVideoClick,
        handleProcessClick,
        boundingBoxes,
        originalImageWidth,
        originalImageHeight}) => {
    const [showButtons, setShowButtons] = useState(true);
    const [selectedBox, setSelectedBox] = useState(null);
    const mediaContainerRef = useRef(null); // Ref for the media container
    const [mediaScale, setMediaScale] = useState({ scaleX: 1, scaleY: 1 });

    const handleFindSpotsClick = () => {
        originalHandleFindSpotsClick();
        setShowButtons(false);
    };

    const handleReturnToVideoClick = () => {
        originalHandleReturnToVideoClick();
        setShowButtons(true);
    };

    const handleBoxClick = (index, box) => {
        console.log(`Box ${index} clicked`, box);
        setSelectedBox({index, ...box});
        // Here you might trigger a modal or input form to fill in details
    };

    useEffect(() => {
        // Calculate the scale factors when the component mounts or when the boundingBoxes update
        const calculateScale = () => {
          const container = mediaContainerRef.current;
          if (container) {
            const scaleWidth = container.clientWidth / originalImageWidth;
            const scaleHeight = container.clientHeight / originalImageHeight;
            setMediaScale({ scaleX: scaleWidth, scaleY: scaleHeight });
          }
        };
        // Add a resize listener to recalculate on window resize
        window.addEventListener('resize', calculateScale);
        calculateScale(); // Initial calculation

        return () => {
          window.removeEventListener('resize', calculateScale);
        };
    }, [boundingBoxes, originalImageWidth, originalImageHeight]);
    

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

            {selectedOption === 'localVideo' && formData.localVideoPath && (
                <div>
                    {entranceSetup ? (
                        <EntranceStream videoRef={playerRef} localVideo={formData.localVideoPath} />
                    ) : (
                        <div ref={mediaContainerRef} style={{ position: 'relative', width: '100%', height: '100%' }}>
                            {!showCurrentFrame ? (
                                <ReactPlayer
                                    ref={playerRef}
                                    url={test_video} // url={URL.createObjectURL(formData.localVideo)}
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
                                        <div style={{
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            width: '100%',
                                            height: '100%',
                                            background: 'rgba(0, 0, 0, 0.75)',
                                            display: 'flex',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            zIndex: 2, // Make sure this is above all other content
                                        }}>
                                            <div style={{
                                                animation: 'shake 0.82s cubic-bezier(.36,.07,.19,.97) both',
                                                transform: 'translate3d(0, 0, 0)',
                                                backfaceVisibility: 'hidden',
                                                perspective: '1000px',
                                                color: 'white',
                                                fontSize: '24px',
                                                fontWeight: 'bold',
                                                textTransform: 'uppercase'
                                            }}>
                                                Processing...
                                            </div>
                                        </div>
                                    )}
                                {showButtons && (
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
                                )}
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
                            {Array.isArray(boundingBoxes) && boundingBoxes.map((box, index) => (
                                <div 
                                    key={`box-${index}`} // Unique key for each child
                                    style={{
                                        position: 'absolute',
                                        border: '2px solid red',
                                        left: `${box[0] * mediaScale.scaleX}px`,
                                        top: `${box[1] * mediaScale.scaleY}px`,
                                        width: `${(box[2] - box[0]) * mediaScale.scaleX}px`,
                                        height: `${(box[3] - box[1]) * mediaScale.scaleY}px`,
                                        cursor: 'pointer',
                                      }} 
                                    onClick={() => handleBoxClick(index, box)}
                                >
                                </div>
                            ))}
                            {selectedBox && (
                                <div style={{
                                    position: 'absolute',
                                    top: 10,
                                    right: 10,
                                    backgroundColor: 'white',
                                    padding: '5px',
                                    border: '1px solid black'
                                }}>
                                    <p>Selected Box: {selectedBox.index}</p>
                                    {/* Display any inputs or additional details here */}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default CameraDisplay;
