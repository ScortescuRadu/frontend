import React, {useState, useEffect, useRef} from 'react';
import ReactPlayer from 'react-player';
import Webcam from 'react-webcam';
import axios from 'axios';
import VideoPlayer from '../VideoPlayer';
import EntranceStream from '../EntranceStream';
import test_video from '../tests/camera_test.mp4'
import test_licences from '../tests/license_plates.mp4'
import DrawingCanvas from './DrawingCanvas';
import BoxEdit from './BoxEdit';

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
        originalImageHeight,
        selectedAddress,
        handleModalClose,
        isEntrance,
        isExit}) => {
    const [showButtons, setShowButtons] = useState(true);
    const [selectedBox, setSelectedBox] = useState(null);
    const [selectedDrawnBox, setSelectedDrawnBox] = useState(null);
    const mediaContainerRef = useRef(null);
    const [mediaScale, setMediaScale] = useState({ scaleX: 1, scaleY: 1 });
    const [boxesDetails, setBoxesDetails] = useState([]);
    const [drawnBoxesDetails, setDrawnBoxesDetails] = useState([]);
    const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
    const [isDrawingActive, setIsDrawingActive] = useState(false);
    const [ocrText, setOcrText] = useState('');
    const websocketRef = useRef(null);

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

    const handleDrawnBoxClick = (index, box) => {
        console.log(`Drawn Box ${index} clicked`, drawnBoxesDetails[index]);
        setSelectedDrawnBox({
            ...drawnBoxesDetails[index],
            index
        });
        setDrawnBoxesDetails((prevDetails) =>
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

    const handleDrawnDetailChange = (detailType, value) => {
        if (!selectedDrawnBox) return;
        setDrawnBoxesDetails((prevDetails) =>
            prevDetails.map((detail, i) =>
                i === selectedDrawnBox.index ? { ...detail, [detailType]: value } : detail
            )
        );

        setSelectedDrawnBox((prev) => ({
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

    const confirmDrawnDelete = () => {
        const filteredDetails = drawnBoxesDetails.filter((_, i) => i !== selectedDrawnBox.index);
        setDrawnBoxesDetails(filteredDetails);
        setIsConfirmingDelete(false);
        setSelectedDrawnBox(null);
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
            selected: false,
            is_drawn: true
        }));
        console.log('New boxes:', newBoxes);
        setDrawnBoxesDetails([...drawnBoxesDetails, ...newBoxes]);
        console.log('Updated drawnBoxesDetails after saving:', [...drawnBoxesDetails, ...newBoxes]);
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
                is_drawn: false
            }))
        );
        // Calculate the scale factors when the component mounts or when the boundingBoxes update
        const calculateScale = () => {
        const container = mediaContainerRef.current;
          if (container) {
            console.log('containet', container.clientWidth, container.clientHeight)
            const scaleWidth = container.clientWidth / originalImageWidth;
            const scaleHeight = container.clientHeight / originalImageHeight;
            setMediaScale({ scaleX: scaleWidth, scaleY: scaleHeight });
            console.log('Container scale factors:', scaleWidth, scaleHeight);
          }
        };
        // Add a resize listener to recalculate on window resize
        window.addEventListener('resize', calculateScale);
        calculateScale(); // Initial calculation

        return () => {
          window.removeEventListener('resize', calculateScale);
        };
    }, [boundingBoxes, originalImageWidth, originalImageHeight]);

    const areBoxDetailsUnique = () => {
        const allDetails = [...boxesDetails, ...drawnBoxesDetails];
        const detailSet = new Set();
    
        for (const detail of allDetails) {
            const detailString = `${detail.level}-${detail.letter}-${detail.number}`;
            if (detailSet.has(detailString)) {
                return false;
            }
            detailSet.add(detailString);
        }
        return true;
    };

    const confirmPublicImage = async () => {
        return window.confirm('Do you agree to make the picture public for the purpose of detection improvement?');
    };

    const sendImageToBackend = async () => {
        const formData = new FormData();
        const blob = await fetch(currentFrameImage).then(res => res.blob());
        const timestamp = new Date().toISOString();

        const allDetails = [...boxesDetails, ...drawnBoxesDetails].map(detail => ({
            ...detail,
            is_drawn: detail.box.hasOwnProperty('x')
        }));

        formData.append('image', blob, `${selectedAddress}_${timestamp}.jpg`);
        formData.append('street_address', selectedAddress);
        formData.append('bounding_boxes', JSON.stringify(allDetails));
        formData.append('original_image_width', originalImageWidth);
        formData.append('original_image_height', originalImageHeight);

        try {
            const response = await fetch('http://127.0.0.1:8000/image-dataset/create/', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Error sending image to backend:', errorData);
                alert('Error sending image to backend:', errorData.detail);
            } else {
                console.log('Image sent to backend');
            }
        } catch (error) {
            console.error('Error sending image to backend', error);
        }
    };

    const sendBoxesToBackend = async () => {
        const convertBox = (box) => {
            console.log('converting')
            if (Array.isArray(box) && box[0].hasOwnProperty('x') && box[0].hasOwnProperty('y')) {
                const originalWidth = originalImageWidth;
                const originalHeight = originalImageHeight;

                // Get the min and max values for x and y to form the bounding box
                const xValues = box.map(point => point.x * originalWidth);
                const yValues = box.map(point => point.y * originalHeight);

                const xmin = Math.min(...xValues);
                const ymin = Math.min(...yValues);
                const xmax = Math.max(...xValues);
                const ymax = Math.max(...yValues);

                return [xmin, ymin, xmax, ymax];
            }
            return box;
        };
    
        const allDetails = [...boxesDetails, ...drawnBoxesDetails].map(detail => ({
            ...detail,
            box: convertBox(detail.box),
            is_drawn: detail.box.hasOwnProperty('x')
        }));
        console.log('street:', selectedAddress)
        console.log(localStorage.getItem("access_token"))
        console.log(formData)
    
        const data = {
            token: localStorage.getItem("access_token"),
            street_address: selectedAddress,
            camera_address: formData.cameraName || formData.localVideoPath,
            camera_type: selectedOption,
            bounding_boxes: allDetails,
            destination_type: 'spot'
        };

        try {
            const response = await fetch('http://127.0.0.1:8000/spot-detection/store_bounding_boxes/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data),
            });
    
            if (!response.ok) {
                const errorData = await response.json();
                console.error('Error data:', errorData);
            } else {
                console.log('Boxes sent to backend', allDetails);
            }
        } catch (error) {
            console.error('Error sending boxes to backend', error);
        }
    };

    const sendEntranceOrExitDataToBackend = async () => {
        const allDetails = [...boxesDetails, ...drawnBoxesDetails].map(detail => ({
            ...detail,
            is_drawn: detail.box.hasOwnProperty('x')
        }));
    
        const data = {
            token: localStorage.getItem("access_token"),
            street_address: selectedAddress,
            camera_address: formData.cameraName || formData.localVideoPath,
            camera_type: selectedOption,
            device_id: formData.selectedCamera || null,
            destination_type: isEntrance ? 'entrance' : 'exit',
            bounding_boxes: allDetails
        };
    
        try {
            const response = await fetch('http://127.0.0.1:8000/image-task/create-entrance-exit/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Token ${localStorage.getItem('access_token')}`
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Error data:', errorData);
            } else {
                console.log('Data sent to backend', data);
            }
        } catch (error) {
            console.error('Error sending data to backend', error);
        }
    };

    // WebSocket setup
    useEffect(() => {
        if (isEntrance || isExit) {
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
    }, [isEntrance, isExit, playerRef]);

    const handleFinishClick = () => {
        // if (!areBoxDetailsUnique()) {
        //     alert('There are duplicate boxes with the same details.');
        //     return;
        // }

        if (drawnBoxesDetails.length > 0) {
            if (confirmPublicImage()) {
                sendImageToBackend();
            }
        }

        if (isEntrance || isExit) {
            sendEntranceOrExitDataToBackend();
        } else {
            sendBoxesToBackend();
        }
        handleModalClose();
    };

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

            {/* {selectedOption === 'liveStream' && formData.cameraName && (
                // <ReactPlayer url={formData.cameraName} playing controls width="100%" height="auto" />
                <VideoPlayer videoUrl={formData.cameraName} />
            )} */}
            {videoReady && !isEntrance & !isExit && (
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
            {((selectedOption === 'localVideo' && formData.localVideoPath) ||
             (selectedOption === 'liveStream' && formData.cameraName))
             && (
                <div>
                        {/* <EntranceStream videoRef={playerRef} localVideo={formData.localVideoPath} /> */}
                        <div ref={mediaContainerRef} style={{ position: 'relative', width: '100%', height: '100%', top:40, userSelect: isDrawingActive ? 'none' : 'auto' }}>
                            {isEntrance || isExit ? (
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
                            ) : null}
                            {!showCurrentFrame ? (
                                selectedOption === 'liveStream' ? (
                                    <VideoPlayer
                                        videoUrl={formData.cameraName}
                                        ref={playerRef}
                                        width="100%"
                                        height="100%"
                                        controls={true}
                                        muted={true}
                                        setVideoReady={setVideoReady}
                                    />
                                ) : (
                                    <ReactPlayer
                                        ref={playerRef}
                                        url={isEntrance || isExit ? test_licences : test_video} // url={URL.createObjectURL(formData.localVideo)}
                                        width="100%"
                                        height="100%"
                                        controls={true}
                                        muted={true}
                                        onReady={() => {
                                            setVideoReady(true);
                                        }}
                                    />
                                )
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
                            {/* Display drawn boxes */}
                            {Array.isArray(drawnBoxesDetails) &&
                                drawnBoxesDetails.map((detail, index) => (
                                    <div
                                        key={`drawn-box-${index}`}
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
                                        onClick={() => handleDrawnBoxClick(index)}
                                    >
                                        <span style={{
                                            fontSize: `${Math.min((detail.box[2].x - detail.box[0].x) * originalImageWidth * mediaScale.scaleX, (detail.box[2].y - detail.box[0].y) * originalImageHeight * mediaScale.scaleY) / 3}px`,
                                            userSelect: 'none',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            height: '100%'
                                        }}>
                                            {`${detail.level}-${detail.letter}-${detail.number}`}
                                        </span>
                                    </div>
                                ))}
                            {/* Display server boxes */}
                            {Array.isArray(boxesDetails) &&
                                boxesDetails.map((detail, index) => (
                                    <div
                                        key={`box-${index}`}
                                        style={{
                                            position: 'absolute',
                                            border: detail.selected ? '3px solid blue' : '2px solid red',
                                            left: `${detail.box[0] * mediaScale.scaleX}px`,
                                            top: `${detail.box[1] * mediaScale.scaleY}px`,
                                            width: `${(detail.box[2] - detail.box[0]) * mediaScale.scaleX}px`,
                                            height: `${(detail.box[3] - detail.box[1]) * mediaScale.scaleY}px`,
                                            cursor: isDrawingActive ? 'default' : 'pointer',
                                            pointerEvents: isDrawingActive ? 'none' : 'auto'
                                        }}
                                        onClick={() => handleBoxClick(index)}
                                    >
                                        <span style={{
                                            fontSize: `${Math.min((detail.box[2] - detail.box[0]) * mediaScale.scaleX, (detail.box[3] - detail.box[1]) * mediaScale.scaleY) / 3}px`,
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
                                <BoxEdit
                                    selectedBox={selectedBox}
                                    isConfirmingDelete={isConfirmingDelete}
                                    initiateDelete={initiateDelete}
                                    confirmDelete={confirmDelete}
                                    cancelDelete={cancelDelete}
                                    handleDetailChange={handleDetailChange}
                                />
                            )}
                            {selectedDrawnBox && (
                                <BoxEdit
                                    selectedBox={selectedDrawnBox}
                                    isConfirmingDelete={isConfirmingDelete}
                                    initiateDelete={initiateDelete}
                                    confirmDelete={confirmDrawnDelete}
                                    cancelDelete={cancelDelete}
                                    handleDetailChange={handleDrawnDetailChange}
                                />
                            )}
                            <button
                                style={{
                                    position: 'absolute',
                                    top: -60,
                                    right: -20,
                                    padding: '10px',
                                    background: 'rgba(0, 0, 0, 0.5)',
                                    color: 'white',
                                    cursor: 'pointer',
                                }}
                                onClick={handleFinishClick}
                            >
                                Finish
                            </button>
                        </div>
                </div>
            )}
        </div>
    );
};

export default CameraDisplay;
