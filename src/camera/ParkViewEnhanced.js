import React, { useState, useEffect } from 'react';
import ReactPlayer from 'react-player';
import Webcam from 'react-webcam';

const ParkViewEnhanced = () => {
    const cardData = [
        { id: 1, title: 'Card 1', content: 'Lorem ipsum dolor sit amet.' },
        { id: 2, title: 'Card 2', content: 'Consectetur adipiscing elit.' },
        { id: 3, title: 'Card 3', content: 'Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas.' },
        { id: 4, title: 'Card 4', content: 'Nulla facilisi. Aenean nec ex eget purus vestibulum interdum id vel dolor.' },
        { id: 5, title: 'Card 5', content: 'Fusce dapibus est nec urna elementum, ut tincidunt libero laoreet.' },
    ];

    const [showModal, setShowModal] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [selectedOption, setSelectedOption] = useState('');
    const [formData, setFormData] = useState({
        cameraName: '',
        selectedCamera: '', // To store the selected camera ID
      });
    
      const [connectedCameras, setConnectedCameras] = useState([]);
    
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

    const handleModalClose = () => {
        setShowModal(false);
        setSelectedOption('');
        setFormData({
          selectedCamera: '',
          cameraName: '',
        });
    };

    const handleFormSubmit = (event) => {
        console.log('Form Data:', formData);
        setShowModal(false);
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
      
          default:
            return false;
        }
    };

    const videoConstraints = {
        facingMode: 'environment',
      };

    return (
        <div style={{ backgroundColor: '#000', color: '#fff', minHeight: '100vh', padding: '20px' }}>
            <h1 style={{ marginTop: '20px', color: '#fff', fontSize: '2.5em', textAlign: 'center', textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)' }}>
                Live Park View
            </h1>

            <div style={sectionTitleStyle}>
                <h2 style={{ textAlign: 'center', fontSize: '1.4em' }}>Parking Spaces</h2>
            </div>

            <div style={centeredTitleStyle}>
                <div style={{
                    display: 'inline-block',
                    background: 'yellow',
                    padding: '5px 10px',
                }}>
                    <h3 style={{ margin: 0 }}>Bulevardul Republicii nr.21</h3>
                </div>
            </div>

            <div style={gridContainerStyle}>
                <div style={cardStyle} onClick={handleAddCameraClick}>
                    <div style={plusStyle}>+</div>
                    <div style={titleStyle}>Add Camera</div>
                </div>
                {cardData.map(card => (
                    <div key={card.id} style={parkCardStyle}>
                    <h3 style={h3Style}>{card.title}</h3>
                    <p>{card.content}</p>
                    </div>
                ))}
            </div>

            <div style={sectionTitleStyle}>
                <h2 style={{ textAlign: 'center', fontSize: '1.4em' }}>Entrances</h2>
            </div>

            <div style={centeredTitleStyle}>
                <div style={{
                    display: 'inline-block',
                    background: 'yellow',
                    padding: '5px 10px',
                }}>
                    <h3 style={{ margin: 0 }}>Bulevardul Republicii nr.21</h3>
                </div>
            </div>

            <div style={gridContainerStyle}>
                <div style={cardStyle}>
                    <div style={plusStyle}>+</div>
                    <div style={titleStyle}>Add Camera</div>
                </div>
                {cardData.map(card => (
                    <div key={card.id} style={parkCardStyle}>
                    <h3 style={h3Style}>{card.title}</h3>
                    <p>{card.content}</p>
                    </div>
                ))}
            </div>

        {/* Modal */}
        {showModal && (
            <div style={modalOverlayStyle} onClick={handleModalClose}>
            <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
            {!showForm ? (
              <>
              <h2>Add Camera</h2>
              <form onSubmit={handleFormSubmit}>
                <label>
                  Select an option:
                  <select
                    name="selectedOption"
                    value={selectedOption}
                    onChange={(e) => {
                      setSelectedOption(e.target.value);
                      setFormData({
                        selectedCamera: '',
                        cameraName: '',
                      });
                    }}
                  >
                    <option value="">Select an Option</option>
                    <option value="connectedCamera">Connected Camera</option>
                    <option value="remoteIP">Remote IP Address</option>
                    <option value="liveStream">Live Stream</option>
                  </select>
                </label>
  
                {selectedOption === 'connectedCamera' && (
                  <label>
                    Connected Device:
                    <select name="selectedCamera" onChange={handleInputChange} value={formData.selectedCamera}>
                      <option value="">Select a Camera</option>
                      {connectedCameras.map((camera) => (
                        <option key={camera.deviceId} value={camera.deviceId}>
                          {camera.label || `Camera ${camera.deviceId}`}
                        </option>
                      ))}
                    </select>
                  </label>
                )}

                {selectedOption === 'remoteIP' && (
                  <label>
                    Remote IP Address:
                    <input type="text" name="cameraName" onChange={handleInputChange} value={formData.cameraName} />
                  </label>
                )}
  
                {selectedOption === 'liveStream' && (
                  <label>
                    Live Stream:
                    <input type="text" name="cameraName" onChange={handleInputChange} value={formData.cameraName} />
                  </label>
                )}
              </form>
  
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
                        <ReactPlayer url={formData.cameraName} playing controls width="100%" height="auto" />
                    )}
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

const sectionTitleStyle = {
    background: 'linear-gradient(to left, #fff 0%, #000 100%)',
    padding: '20px',
    marginTop: '50px',
    marginBottom: '20px',
    borderRadius: '10px',
};

const centeredTitleStyle = {
    textAlign: 'center',
    marginBottom: '20px',
};

const cardStyle = {
    // width: '200px',
    // height: '150px',
    border: '2px dotted #fff',
    borderRadius: '10px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    // margin: '10px',
    cursor: 'pointer',
};

const plusStyle = {
    fontSize: '36px',
    color: '#fff',
};

const titleStyle = {
    marginTop: '10px',
    fontSize: '16px',
    color: '#fff',
};

const gridContainerStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
    gap: '20px',
    padding: '20px',
  };

  const parkCardStyle = {
    backgroundColor: '#fff',
    border: '1px solid #ddd',
    borderRadius: '8px',
    padding: '20px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    transition: 'transform 0.3s ease-in-out',
    cursor: 'pointer',

    ':hover': {
      transform: 'scale(1.05)',
    },
};

const h3Style = {
    marginBottom: '10px',
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
