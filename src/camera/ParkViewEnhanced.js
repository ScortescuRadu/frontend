import React, { useState, useEffect, useRef } from 'react';
import ReactPlayer from 'react-player';
import Webcam from 'react-webcam';
import ParkingLots from '../account/ParkingLots';
import VideoPlayer from './VideoPlayer';
import EntranceStream from './EntranceStream';
import CameraGrid from './components/CameraGrid';
import CameraSetupForm from './components/CameraSetupForm';
import CameraDisplay from './components/CameraDisplay';

const ParkViewEnhanced = () => {
    const cardData = [
        { id: 1, title: 'Card 1', content: 'Lorem ipsum dolor sit amet.' },
    ];

    const [showModal, setShowModal] = useState(false);
    const [entranceSetup, setEntranceSetup] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [selectedOption, setSelectedOption] = useState('');
    const [formData, setFormData] = useState({
        cameraName: '',
        selectedCamera: '',
        localVideo: null,
    });
    const [connectedCameras, setConnectedCameras] = useState([]);
    /// LocalVideo
    const [videoReady, setVideoReady] = useState(false);
    const [showCurrentFrame, setShowCurrentFrame] = useState(false);
    const [currentFrameImage, setCurrentFrameImage] = useState(null);
    const playerRef = useRef(null);
    const [loading, setLoading] = useState(false);
    //////////////

    useEffect(() => {
        // Fetch connected cameras when the component mounts
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
        console.log('localVideo:', formData.localVideo)
        switch (selectedOption) {
          case 'connectedCamera':
            return formData.selectedCamera !== '';
      
          case 'remoteIP':
          case 'liveStream':
            return formData.cameraName !== '';

          case 'localVideo':
              return formData.localVideo !== null;
      
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

    const handleFindSpotsClick = async () => {
      setLoading(true);

      if (currentFrameImage) {
        const imageBlob = await new Promise(resolve => {
          fetch(currentFrameImage)
            .then(response => response.blob())
            .then(blob => resolve(blob));
        });
  
        const formDataImage = new FormData();
        // console.log(formDataImage)
        formDataImage.append('image', imageBlob, 'current_frame.jpg');
        const response = await fetch('http://127.0.0.1:8000/spot-detection/process_image/', {
          method: 'POST',
          body: formDataImage,
        });

        if (response.ok) {
          const result = await response.json();
          const taskId = result.task_id;

          // Poll the Celery task status and get the result
          const pollTaskStatus = async () => {
              const statusResponse = await fetch(`http://127.0.0.1:8000/spot-detection/check_task_status/${taskId}/`);
              const taskStatus = await statusResponse.json();

          if (taskStatus.status === 'SUCCESS') {
            // Image processing completed, get the bounding boxes
            const boundingBoxes = taskStatus.result;

            // Update state or perform other actions with bounding boxes
            console.log('Bounding Boxes:', boundingBoxes);
            setLoading(false); // Hide loading indicator

            // Store bounding boxes in the database (optional)
            // await fetch('http://your-django-backend-url/store_bounding_boxes/', {
            //   method: 'POST',
            //   headers: {
            //     'Content-Type': 'application/json',
            //   },
            //   body: JSON.stringify({
            //     task_id: taskId,
            //     bounding_boxes_json: JSON.stringify(boundingBoxes),
            //   }),
            // });
          } else if (taskStatus.status === 'FAILURE') {
            console.error('Error processing image:', taskStatus.message);
            setLoading(false); // Hide loading indicator
          } else {
            // Task still in progress, continue polling
            setTimeout(pollTaskStatus, 1000);
          }
        };

          // Start polling the task status
          pollTaskStatus();
        } else {
          console.error('Error sending image to Django:', response.statusText);
          setLoading(false); // Hide loading indicator
        }
      }
    };

    return (
        <div style={{ backgroundColor: '#000', color: '#fff', minHeight: '100vh' }}>
            <ParkingLots color='#000'/>
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
              <h2>Add Camera</h2>
              <CameraSetupForm
                formData={formData}
                setFormData={setFormData}
                connectedCameras={connectedCameras}
                handleInputChange={handleInputChange}
                selectedOption={selectedOption}
                setSelectedOption={setSelectedOption}
                onSubmit={handleFormSubmit}
              />
              <div style={{ textAlign: 'center', marginTop: '10px', marginBottom: '10px' }}>
                {selectedOption && isDataFilled() && (
                    <button style={{color: 'red'}} onClick={handleNextButtonClick}>
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
                    />
                    <div style={{ textAlign: 'center', marginTop: '10px', marginBottom: '10px' }}>
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
    backgroundColor: '#fff',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
};

export default ParkViewEnhanced;
