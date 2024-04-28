import React, { useState, useEffect } from 'react';
import YouTube from 'react-youtube';

const VideoPlayer = ({ videoUrl }) => {
  const [videoId, setVideoId] = useState(null);
  const [showFrame, setShowFrame] = useState(false);
  const [thumbnailUrl, setThumbnailUrl] = useState(null);

  useEffect(() => {

    let VID_REGEX = /(?:youtube(?:-nocookie)?\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    console.log(videoUrl.match(VID_REGEX)[1])
    const match = videoUrl.match(VID_REGEX);
    if (match && match[1]) {
      setVideoId(match[1]);
    }
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
    event.target.pauseVideo();
  };

  const captureFrame = async (player) => {
    if (!videoId) return;
    try {
      const response = await fetch(`https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`);
      if (!response.ok) throw new Error('Failed to fetch thumbnail');
      const imageUrl = await response.blob();
      const urlCreator = window.URL || window.webkitURL;
      const imageUrlSrc = urlCreator.createObjectURL(imageUrl);
      console.log('Frame captured:', imageUrlSrc); // Here you can set state or handle the image URL further
    } catch (error) {
      console.error('Error fetching thumbnail:', error);
    }
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
        <YouTube videoId={videoId} opts={opts} onReady={onReady} />
      )}
      <button onClick={() => captureFrame()}>Capture Frame</button>
    </div>
  );
};

export default VideoPlayer;
