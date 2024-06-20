import React from 'react';

const FirstPage = () => {
    const styles = {
        firstPage: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            width: '100%',
            backgroundColor: 'black'
        },
        videoContainer: {
            width: '100%',
            height: '80%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            overflow: 'hidden',
        },
        video: {
            width: '100%',
            height: '100%',
            objectFit: 'cover',
        },
        continueContainer: {
            width: '100%',
            height: '20%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
        },
        continueButton: {
            padding: '10px 20px',
            fontSize: '18px',
            cursor: 'pointer',
        },
    };

    return (
        <div style={styles.firstPage}>
            <div style={styles.videoContainer}>
                <video style={styles.video} src="/example.mp4" autoPlay loop muted />
            </div>
        </div>
    );
};

export default FirstPage;
