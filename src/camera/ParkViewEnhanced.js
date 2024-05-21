import React, { useState, useEffect, useRef } from 'react';
import ReactPlayer from 'react-player';
import Webcam from 'react-webcam';
import ParkingLots from '../account/ParkingLots';
import VideoPlayer from './VideoPlayer';
import EntranceStream from './EntranceStream';
import CameraGrid from './components/CameraGrid';
import CameraSetupForm from './components/CameraSetupForm';
import CameraDisplay from './components/CameraDisplay';
import AddCameraImage from './assets/AddCamera.jpg'
import { w3cwebsocket as W3CWebSocket } from 'websocket';

const ParkViewEnhanced = () => {
    const cardData = [
        { id: 1, title: 'Card 1', content: 'Lorem ipsum dolor sit amet.' },
    ];
    const [selectedAddress, setSelectedAddress] = useState(localStorage.getItem('selectedAddressOption') || '');
    const [showModal, setShowModal] = useState(false);
    const [entranceSetup, setEntranceSetup] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [selectedOption, setSelectedOption] = useState('');
    const [formData, setFormData] = useState({
        cameraName: '',
        selectedCamera: '',
        localVideo: null,
        localVideoPath: ''
    });
    const [connectedCameras, setConnectedCameras] = useState([]);
    /// LocalVideo
    const [videoReady, setVideoReady] = useState(false);
    const [showCurrentFrame, setShowCurrentFrame] = useState(false);
    const [currentFrameImage, setCurrentFrameImage] = useState(null);
    const playerRef = useRef(null);
    const [loading, setLoading] = useState(false);
    //////////////
    /// Image processing through websocket
    /////////////
    const [boundingBoxes, setBoundingBoxes] = useState([]);
    const [originalImageWidth, setOriginalImageWidth] = useState(null)
    const [originalImageHeight, setOriginalImageHeight] = useState(null)
    const client = useRef(null);

    useEffect(() => {
        fetchConnectedCameras();
    }, []);
    
    const fetchConnectedCameras = async () => {
        try {
          const devices = await navigator.mediaDevices.enumerateDevices();
          const cameras = devices.filter(device => device.kind === 'videoinput');
          setConnectedCameras(cameras);
        } catch (error) {
          console.error('Error fetching connected cameras:', error);
        }
    };
    

    const handleAddCameraClick = () => {
        setShowModal(true);
    };

    const handleAddEntranceCameraClick = () => {
      setShowModal(true);
      setEntranceSetup(true);
    };

    const handleModalClose = () => {
        setShowModal(false);
        setSelectedOption('');
        setFormData({
          selectedCamera: '',
          cameraName: '',
          localVideo: null,
          localVideoPath: ''
        });
        setLoading(false);
        setEntranceSetup(false);
    };

    const handleFormSubmit = (event) => {
        console.log('Form Data:', formData);
        setShowModal(false);
        setLoading(false);
    };

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setFormData({ ...formData, [name]: value });
    };
    
    const handleNextButtonClick = () => {
        setShowForm(true);
        // handleFormSubmit();
    };

    const handlePrevButtonClick = () => {
        setShowForm(false);
        // handleFormSubmit();
    };

    const isDataFilled = () => {
        switch (selectedOption) {
          case 'connectedCamera':
            return formData.selectedCamera !== '';
      
          case 'remoteIP':
          case 'liveStream':
            return formData.cameraName !== '';

          case 'localVideo':
              return formData.localVideoPath !== '';
      
          default:
            return false;
        }
    };

    const videoConstraints = {
        facingMode: 'environment',
      };

    const handleProcessClick = () => {
      if (playerRef.current) {
        const currentTime = playerRef.current.getCurrentTime();
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
  
        canvas.width = playerRef.current.getInternalPlayer().videoWidth;
        canvas.height = playerRef.current.getInternalPlayer().videoHeight;
  
        ctx.drawImage(playerRef.current.getInternalPlayer(), 0, 0, canvas.width, canvas.height);
  
        setCurrentFrameImage(canvas.toDataURL());
        setShowCurrentFrame(!showCurrentFrame);
        setVideoReady(!showCurrentFrame);
      }
    };

    const handleReturnToVideoClick = () => {
      setShowCurrentFrame(false);
      setVideoReady(true);
      setLoading(false);
    };

    const setupWebSocket = (task_id) => {
      const wsUrl = `ws://${window.location.hostname}:8000/ws/task_status/${task_id}/`;
      console.log(wsUrl);
      client.current = new W3CWebSocket(wsUrl);
  
      client.current.onopen = () => {
          console.log('WebSocket Client Connected for task:', task_id);
      };

      client.current.onmessage = (message) => {
          const data = JSON.parse(message.data);
          console.log('Received data from server:', data);
          if (data.message === "Processing complete") {
            console.log('Received Data:', data.content);
            console.log('Bounding Boxes:', data.content.xyxys[0]);
            console.log('Original Image size:', data.content.width, data.content.height)
            setBoundingBoxes(data.content.xyxys[0]); // Process the result
            setOriginalImageWidth(data.content.width)
            setOriginalImageHeight(data.content.height)
            setLoading(false);
            client.current.close();
        }
      };

      client.current.onerror = () => {
          console.log('WebSocket Connection Error');
      };
  
      client.current.onclose = () => {
          console.log('WebSocket Client Disconnected');
      };
    };

    const handleFindSpotsClick = async () => {
      setLoading(true);
  
      if (currentFrameImage) {
          const imageBlob = await fetch(currentFrameImage).then(res => res.blob());
  
          const formData = new FormData();
          formData.append('image', imageBlob, 'frame.jpg');
  
          fetch('http://127.0.0.1:8000/spot-detection/process_image/', {
              method: 'POST',
              body: formData,
          })
          .then(response => response.json())
          .then(data => {
              if (data.task_id) {
                  console.log('Processing started, task ID:', data.task_id);
                  // Establish WebSocket connection with the task ID
                  setupWebSocket(data.task_id);
              }
          })
          .catch(error => {
              console.error('Error uploading image:', error);
              setLoading(false);
          });
      }
    };

    // const handleFindSpotsClick = async () => {
    //   setLoading(true);

    //   if (currentFrameImage) {
    //     const imageBlob = await new Promise(resolve => {
    //       fetch(currentFrameImage)
    //         .then(response => response.blob())
    //         .then(blob => resolve(blob));
    //     });
  
    //     const formDataImage = new FormData();
    //     // console.log(formDataImage)
    //     formDataImage.append('image', imageBlob, 'current_frame.jpg');
    //     const response = await fetch('http://127.0.0.1:8000/spot-detection/process_image/', {
    //       method: 'POST',
    //       body: formDataImage,
    //     });

    //     if (response.ok) {
    //       const result = await response.json();
    //       const taskId = result.task_id;

    //       // Poll the Celery task status and get the result
    //       const pollTaskStatus = async () => {
    //           const statusResponse = await fetch(`http://127.0.0.1:8000/spot-detection/check_task_status/${taskId}/`);
    //           const taskStatus = await statusResponse.json();

    //       if (taskStatus.status === 'SUCCESS') {
    //         // Image processing completed, get the bounding boxes
    //         const boundingBoxes = taskStatus.result;

    //         // Update state or perform other actions with bounding boxes
    //         console.log('Bounding Boxes:', boundingBoxes);
    //         setLoading(false); // Hide loading indicator

    //         // Store bounding boxes in the database (optional)
    //         // await fetch('http://your-django-backend-url/store_bounding_boxes/', {
    //         //   method: 'POST',
    //         //   headers: {
    //         //     'Content-Type': 'application/json',
    //         //   },
    //         //   body: JSON.stringify({
    //         //     task_id: taskId,
    //         //     bounding_boxes_json: JSON.stringify(boundingBoxes),
    //         //   }),
    //         // });
    //       } else if (taskStatus.status === 'FAILURE') {
    //         console.error('Error processing image:', taskStatus.message);
    //         setLoading(false); // Hide loading indicator
    //       } else {
    //         // Task still in progress, continue polling
    //         setTimeout(pollTaskStatus, 1000);
    //       }
    //     };

    //       // Start polling the task status
    //       pollTaskStatus();
    //     } else {
    //       console.error('Error sending image to Django:', response.statusText);
    //       setLoading(false); // Hide loading indicator
    //     }
    //   }
    // };

    return (
        <div style={{ backgroundColor: '#000', color: '#fff', minHeight: '100vh' }}>
            <ParkingLots color='#000' selectedAddress={selectedAddress} setSelectedAddress={setSelectedAddress}/>
            <h1 style={{ marginTop: '20px', color: '#fff', fontSize: '2.5em', textAlign: 'center', textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)' }}>
                Live Park View
            </h1>
            <CameraGrid title="Parking Spaces" cardData={cardData} onAddCamera={handleAddCameraClick} />
            <CameraGrid title="Entrances" cardData={cardData} onAddCamera={handleAddEntranceCameraClick} />
        {/* Modal */}
        {showModal && (
            <div style={modalOverlayStyle} onClick={handleModalClose}>
            <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
            {!showForm ? (
              <>
              <h2 style={modalHeader}>Add Camera</h2>
              <img src={AddCameraImage} alt="Add Camera Animation" style={cameraGif} />
              <CameraSetupForm
                formData={formData}
                setFormData={setFormData}
                connectedCameras={connectedCameras}
                handleInputChange={handleInputChange}
                selectedOption={selectedOption}
                setSelectedOption={setSelectedOption}
                onSubmit={handleFormSubmit}
              />
              <div style={{nextButtonContainer}}>
                {selectedOption && isDataFilled() && (
                    <button style={nextButton} onClick={handleNextButtonClick}>
                        Next
                    </button>
                    )}
                </div>
                </>
            ) : (
                <div>
                    <CameraDisplay
                        selectedOption={selectedOption}
                        formData={formData}
                        entranceSetup={entranceSetup}
                        playerRef={playerRef}
                        showCurrentFrame={showCurrentFrame}
                        currentFrameImage={currentFrameImage}
                        videoReady={videoReady}
                        loading={loading}
                        setVideoReady={setVideoReady}
                        handleFindSpotsClick={handleFindSpotsClick}
                        handleReturnToVideoClick={handleReturnToVideoClick}
                        handleProcessClick={handleProcessClick}
                        boundingBoxes={boundingBoxes}
                        originalImageWidth={originalImageWidth}
                        originalImageHeight={originalImageHeight}
                    />
                    <div style={{ textAlign: 'center', marginTop: '50px', marginBottom: '10px' }}>
                        <button style={{color: 'red'}} onClick={handlePrevButtonClick}>
                            Prev
                        </button>
                    </div>
              </div>
            )}
            </div>
          </div>
        )}
        </div>
    );
};

const modalOverlayStyle = {
    position: 'fixed',
    top: '5%',
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
  textAlign: 'center'
};

const modalHeader = {
  marginBottom: '20px',
  color: '#333',
  textAlign: 'center'
};

const cameraGif = {
  width: '100%',
  maxWidth: '300px',
  margin: '0 auto',
  marginBottom: '20px',
  display: 'block'
};

const nextButtonContainer = {
  textAlign: 'center',
  marginTop: '20px'
};

const nextButton = {
  padding: '10px 20px',
  fontSize: '16px',
  color: '#fff',
  marginTop: '20px',
  backgroundColor: '#000',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
  outline: 'none'
}
export default ParkViewEnhanced;
