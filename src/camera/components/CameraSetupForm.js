// CameraSetupForm.js
import React from 'react';

const CameraSetupForm = ({ formData, setFormData, connectedCameras, handleInputChange, selectedOption, setSelectedOption, onSubmit }) => {
    return (
        <form onSubmit={onSubmit}>
            <label>
                Select an option:
                <select
                    name="selectedOption"
                    value={selectedOption}
                    onChange={(e) => {
                        setSelectedOption(e.target.value);
                        setFormData({ ...formData, selectedCamera: '', cameraName: '' });
                    }}
                >
                    <option value="">Select an Option</option>
                    <option value="connectedCamera">Connected Camera</option>
                    <option value="remoteIP">Remote IP Address</option>
                    <option value="liveStream">Live Stream</option>
                    <option value="localVideo">Local Video</option>
                </select>
            </label>

            {selectedOption === 'connectedCamera' && (
                <label>
                    Connected Device:
                    <select
                        name="selectedCamera"
                        onChange={handleInputChange}
                        value={formData.selectedCamera}
                    >
                        <option value="">Select a Camera</option>
                        {connectedCameras.map((camera) => (
                            <option key={camera.deviceId} value={camera.deviceId}>
                                {camera.label || `Camera ${camera.deviceId}`}
                            </option>
                        ))}
                    </select>
                </label>
            )}

            {selectedOption === 'localVideo' && (
                <label>
                    Local Video File:
                    <input
                        type="file"
                        name="localVideo"
                        accept="video/*"
                        onChange={(e) => {
                            const file = e.target.files[0];
                            setFormData({ ...formData, localVideo: file });
                        }}
                    />
                </label>
            )}

            {['remoteIP', 'liveStream'].includes(selectedOption) && (
                <label>
                    {selectedOption === 'remoteIP' ? 'Remote IP Address:' : 'Live Stream URL:'}
                    <input
                        type="text"
                        name="cameraName"
                        onChange={handleInputChange}
                        value={formData.cameraName}
                    />
                </label>
            )}
        </form>
    );
};

export default CameraSetupForm;
