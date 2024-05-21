import React, {useState, useEffect, useRef} from 'react';
import ReactPlayer from 'react-player';
import Webcam from 'react-webcam';
import VideoPlayer from '../VideoPlayer';
import EntranceStream from '../EntranceStream';
import test_video from '../tests/camera_test.mp4'
import DrawingCanvas from './DrawingCanvas';

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
    const mediaContainerRef = useRef(null);
    const [mediaScale, setMediaScale] = useState({ scaleX: 1, scaleY: 1 });
    const [boxesDetails, setBoxesDetails] = useState([]);
    const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
    const [isDrawingActive, setIsDrawingActive] = useState(false);

    const handleFindSpotsClick = () => {
        originalHandleFindSpotsClick();
        setShowButtons(false);
    };

    const handleReturnToVideoClick = () => {
        originalHandleReturnToVideoClick();
        setShowButtons(true);
    };

    const handleBoxClick = (index, box) => {
        console.log(`Box ${index} clicked`, boxesDetails[index]);
        setSelectedBox({
            ...boxesDetails[index],
            index
        });
        setBoxesDetails((prevDetails) =>
        prevDetails.map((detail, i) => ({
            ...detail,
            selected: i === index
        }))
    );
    };

    const handleDetailChange = (detailType, value) => {
        if (!selectedBox) return;
        // console.log(`BoxIndex ${boxIndex} clicked`);
        setBoxesDetails((prevDetails) =>
        prevDetails.map((detail, i) =>
            i === selectedBox.index ? { ...detail, [detailType]: value } : detail
        )
        );

        // Also update the selectedBox state to reflect these changes immediately in the UI
        setSelectedBox((prev) => ({
            ...prev,
            [detailType]: value
        }));
    };

    const initiateDelete = () => {
        setIsConfirmingDelete(true);
    };

    const confirmDelete = () => {
        const filteredDetails = boxesDetails.filter((_, i) => i !== selectedBox.index);
        setBoxesDetails(filteredDetails);
        setIsConfirmingDelete(false);
        setSelectedBox(null);  // Reset selected box
    };

    const cancelDelete = () => {
        setIsConfirmingDelete(false);
    };

    const toggleDrawing = () => setIsDrawingActive(!isDrawingActive);

    const handleSaveDrawing = (newPolygons) => {
        console.log('saving boxes')
        const newBoxes = newPolygons.map(polygon => ({
            box: polygon,
            level: 1,
            letter: 'A',
            number: 1,
            selected: false
        }));
        console.log('New boxes:', newBoxes);
        setBoxesDetails([...boxesDetails, ...newBoxes]);
        console.log('Updated boxesDetails after saving:', [...boxesDetails, ...newBoxes]);
        setIsDrawingActive(false);
    };

    useEffect(() => {
        setBoxesDetails(
            boundingBoxes.map((box, index) => ({
                box,
                level: 1,
                letter: 'A',
                number: 1,
                selected: false,
            }))
        );
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

    useEffect(() => {
        console.log('Boxes details with coordinates:', boxesDetails.map(detail => ({
            left: detail.box[0].x * mediaScale.scaleX,
            top: detail.box[0].y * mediaScale.scaleY,
            width: (detail.box[2].x - detail.box[0].x) * mediaScale.scaleX,
            height: (detail.box[2].y - detail.box[0].y) * mediaScale.scaleY,
        })));
    }, [boxesDetails, mediaScale]);

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
            {videoReady && (
                <>
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
                <button onClick={toggleDrawing}
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: '43%',
                            backgroundColor: 'black',
                            padding: '10px',
                            border: '1px solid black',
                            display: 'flex',
                            alignItems: 'center',
                            color: 'white'
                        }}>
                    {isDrawingActive ? 'Stop Drawing' : 'Draw'}
                </button>
                </>
            )}
            {selectedOption === 'localVideo' && formData.localVideoPath && (
                <div>
                    {entranceSetup ? (
                        <EntranceStream videoRef={playerRef} localVideo={formData.localVideoPath} />
                    ) : (
                        <div ref={mediaContainerRef} style={{ position: 'relative', width: '100%', height: '100%', top:40, userSelect: isDrawingActive ? 'none' : 'auto' }}>
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
                                <>
                                {isDrawingActive ? (
                                    <DrawingCanvas
                                        currentFrameImage={currentFrameImage}
                                        onSave={handleSaveDrawing}
                                        onCancel={() => setIsDrawingActive(false)}
                                    />
                                ): (<img
                                    src={currentFrameImage}
                                    alt="Current Frame"
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />)}
                                </>
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
                                            zIndex: 2,
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
                            {Array.isArray(boxesDetails) &&
                                boxesDetails.map((detail, index) => (
                                    <div
                                        key={`box-${index}`}
                                        style={{
                                            position: 'absolute',
                                            border: detail.selected ? '3px solid blue' : '2px solid red',
                                            left: `${detail.box[0].x * originalImageWidth * mediaScale.scaleX}px`,
                                            top: `${detail.box[0].y * originalImageHeight * mediaScale.scaleY}px`,
                                            width: `${(detail.box[2].x - detail.box[0].x) * originalImageWidth * mediaScale.scaleX}px`,
                                            height: `${(detail.box[2].y - detail.box[0].y) * originalImageHeight * mediaScale.scaleY}px`,
                                            cursor: isDrawingActive ? 'default' : 'pointer',
                                            pointerEvents: isDrawingActive ? 'none' : 'auto'
                                        }}
                                        onClick={() => handleBoxClick(index)}
                                    >
                                        <span style={{
                                            fontSize: `${Math.min((detail.box[2].x - detail.box[0].x) * originalImageWidth * mediaScale.scaleX, (detail.box[2].y - detail.box[0].y) * originalImageHeight * mediaScale.scaleY) / 3}px`,
                                            userSelect: 'none',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            height: '100%' }}>
                                            {`${detail.level}-${detail.letter}-${detail.number}`}
                                        </span>
                                    </div>
                            ))}
                            {selectedBox && (
                                <div>
                                    <div style={{
                                        position: 'absolute',
                                        top: '0%',
                                        right: '19%',
                                        backgroundColor: 'black',
                                        padding: '5px',
                                        border: '1px solid black',
                                        display: 'flex',
                                        alignItems: 'center',
                                        color: 'white'
                                    }}>
                                        {!isConfirmingDelete ? (
                                            <button onClick={initiateDelete} style={{ padding: '5px 10px', marginRight: '10px' }}>
                                                Delete
                                            </button>
                                        ) : (
                                            <>
                                                <button onClick={confirmDelete} style={{ padding: '5px 10px', marginRight: '10px', color: 'green' }}>
                                                    ✔ Confirm
                                                </button>
                                                <button onClick={cancelDelete} style={{ padding: '5px 10px', marginRight: '10px', color: 'red' }}>
                                                    ✖ Cancel
                                                </button>
                                            </>
                                        )}
                                    </div>
                                <div
                                    style={{
                                        position: 'absolute',
                                        top: '0%',
                                        right: '0%',
                                        backgroundColor: 'black',
                                        padding: '10px',
                                        border: '1px solid black',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        width: '20%',
                                        color: 'white'
                                    }}
                                >
                                    <React.Fragment>
                                        {/* Level dropdown */}
                                        <select
                                            style={{ width: '30%', margin: '0 5px', backgroundColor: 'black' }}
                                            value={selectedBox.level}
                                            onChange={(e) => handleDetailChange('level', e.target.value)}
                                        >
                                            <option value="1">1</option>
                                            <option value="2">2</option>
                                        </select>
                                        {/* Letter input */}
                                        <input
                                            type="text"
                                            style={{ width: '30%', margin: '0 5px', backgroundColor: 'black' }}
                                            value={selectedBox.letter}
                                            onChange={(e) => handleDetailChange('letter', e.target.value)}
                                        />
                                        {/* Number input */}
                                        <input
                                            type="number"
                                            style={{ width: '30%', margin: '0 5px', backgroundColor: 'black' }}
                                            value={selectedBox.number}
                                            onChange={(e) => handleDetailChange('number', e.target.value)}
                                        />
                                    </React.Fragment>
                                </div>
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
