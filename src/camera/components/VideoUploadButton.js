import React from 'react';

const VideoUploadButton = ({ onFileSelect }) => {
    const fileInputRef = React.useRef(null);

    const handleFileInput = (e) => {
        console.log('input')
        if (e.target.files[0]) {
            onFileSelect(e.target.files[0]);
            console.log('File selected:', e.target.files[0].name);
        }
        console.log('e')
    };

    const handleClick = (e) => {
        e.preventDefault();  // Prevent the button from triggering form submission
        e.stopPropagation(); // Stop the event from bubbling up to the form element
        console.log('Opening file dialog...');
        fileInputRef.current.click();
    };

    return (
        <>
            <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onInput={handleFileInput}
                accept="video/*" // Specify that only video files are accepted
            />
            <button onClick={handleClick} style={{ padding: '10px 20px', backgroundColor: '#000', color: '#fff', cursor: 'pointer', borderRadius: '5px' }}>
                Choose File
            </button>
        </>
    );
};
                
export default VideoUploadButton;
