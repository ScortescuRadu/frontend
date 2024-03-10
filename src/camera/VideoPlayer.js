import React, { useState, useEffect } from 'react';
import YouTube from 'react-youtube';

const VideoPlayer = ({ videoUrl }) => {
  const [videoId, setVideoId] = useState(null);
  const [showFrame, setShowFrame] = useState(false);
  const [thumbnailUrl, setThumbnailUrl] = useState(null);

  useEffect(() => {

    let VID_REGEX = /(?:youtube(?:-nocookie)?\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    console.log(videoUrl.match(VID_REGEX)[1])
    setVideoId(videoUrl.match(VID_REGEX)[1]);

  }, [videoUrl]);

  const opts = {
    height: '390',
    width: '640',
    playerVars: {
      autoplay: 1,
    },
  };

  const onReady = (event) => {
    // Uncomment the line below if you want to play the video programmatically
    // event.target.playVideo();
  };

  const onPlay = async (event) => {
    // Check if the video is playing and show the frame after 1 second
    if (event.target.getCurrentTime() > 1) {
      // Pause the video to capture a frame
      event.target.pauseVideo();
  
      // Get video details from the YouTube Data API
      try {
        const response = await fetch(
          `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&part=snippet&key=YOUR_YOUTUBE_API_KEY`
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch video details: ${response.status}`);
        }
  
        const data = await response.json();
  
        if (data.items && data.items.length > 0) {
          const thumbnailUrl = data.items[0].snippet.thumbnails.medium.url;
  
          // Set showFrame to true and update the thumbnail URL state
          setShowFrame(true);
          setThumbnailUrl(thumbnailUrl);
        } else {
          throw new Error('Video details not found');
        }
      } catch (error) {
        console.error('Error fetching video details:', error);
      }
    }
  };  

  return (
    <div>
      {videoId && (
        <YouTube videoId={videoId} opts={opts} onReady={onReady} onPlay={onPlay} />
      )}

      {/* Display the frame after the first second */}
      {showFrame && (
        <div>
          <h3>Frame after 1 second</h3>
            {/* Display the captured frame (thumbnail) */}
            <img src={thumbnailUrl} alt="Video Thumbnail" style={{ width: '100%', height: 'auto' }} />
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;
