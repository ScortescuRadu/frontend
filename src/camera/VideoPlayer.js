import React, { useEffect, useState, useRef, forwardRef, useImperativeHandle } from 'react';
import ReactPlayer from 'react-player';

const VideoPlayer = forwardRef(({ videoUrl, setVideoReady }, ref) => {
  const [isYouTube, setIsYouTube] = useState(false);
  const playerRef = useRef(null);

  useEffect(() => {
    const isYouTubeUrl = /(?:youtube(?:-nocookie)?\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)/.test(videoUrl);
    setIsYouTube(isYouTubeUrl);
  }, [videoUrl]);

  useImperativeHandle(ref, () => ({
    getInternalPlayer: () => playerRef.current.getInternalPlayer()
  }));

  const onReady = () => {
    if (playerRef.current) {
      setVideoReady(true);
      if (isYouTube) {
        playerRef.current.getInternalPlayer().pauseVideo();
      }
    }
  };

  return (
    <div>
      {isYouTube ? (
        <ReactPlayer
          ref={playerRef}
          url={videoUrl}
          config={{ youtube: { playerVars: { autoplay: 1 } } }}
          onReady={onReady}
          controls
        />
      ) : (
        <ReactPlayer
          ref={playerRef}
          url={videoUrl}
          onReady={onReady}
          muted={true}
          controls
          config={{
            file: {
              attributes: {
                crossOrigin: 'anonymous', // Enable CORS
              },
            },
          }}
        />
      )}
    </div>
  );
});

export default VideoPlayer;
