import { useEffect, useRef, useState } from 'react';

const YouTubePlayer = ({ videoId, startTime = 0, isActive }) => {
  const playerRef = useRef(null);
  const [player, setPlayer] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const [currentVideoId, setCurrentVideoId] = useState(null);

  // Initialize the YouTube player once
  useEffect(() => {
    // Load YouTube IFrame API
    if (!window.YT) {
      const script = document.createElement('script');
      script.src = 'https://www.youtube.com/iframe_api';
      script.async = true;
      document.body.appendChild(script);

      window.onYouTubeIframeAPIReady = () => {
        initializePlayer();
      };
    } else {
      initializePlayer();
    }

    return () => {
      if (player) {
        try {
          player.destroy();
        } catch (error) {
          console.warn('Error destroying YouTube player:', error);
        }
      }
    };
  }, []); // Remove videoId dependency to prevent recreation

  const initializePlayer = () => {
    if (playerRef.current && videoId) {
      const newPlayer = new window.YT.Player(playerRef.current, {
        height: '315',
        width: '560',
        videoId: videoId,
        playerVars: {
          start: startTime,
          autoplay: 0,
          controls: 1,
          modestbranding: 1,
          rel: 0,
          showinfo: 0,
          iv_load_policy: 3,
        },
        events: {
          onReady: (event) => {
            setPlayer(event.target);
            setIsReady(true);
            setCurrentVideoId(videoId);
          },
          onStateChange: (event) => {
            // Handle player state changes if needed
          },
          onError: (event) => {
            console.error('YouTube player error:', event.data);
          },
        },
      });
    }
  };

  // Handle video changes by loading new video instead of recreating player
  useEffect(() => {
    if (player && isReady && videoId && videoId !== currentVideoId) {
      try {
        player.loadVideoById({
          videoId: videoId,
          startSeconds: startTime
        });
        setCurrentVideoId(videoId);
      } catch (error) {
        console.error('Error loading new video:', error);
      }
    }
  }, [videoId, startTime, player, isReady, currentVideoId]);

  // Handle autoplay/stop based on slide activity
  useEffect(() => {
    if (player && isReady && currentVideoId) {
      try {
        if (isActive) {
          // Start playing when slide becomes active
          player.seekTo(startTime);
          player.playVideo();
        } else {
          // Stop playing when slide becomes inactive
          player.pauseVideo();
        }
      } catch (error) {
        console.error('Error controlling video playback:', error);
      }
    }
  }, [isActive, player, isReady, startTime, currentVideoId]);

  return (
    <div className="youtube-player">
      <div 
        ref={playerRef}
        className="youtube-iframe"
      />
      {!isReady && (
        <div className="youtube-loading">
          <p>Loading video...</p>
        </div>
      )}
    </div>
  );
};

export default YouTubePlayer; 