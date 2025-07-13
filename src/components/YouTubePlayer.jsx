import { useEffect, useRef, useState } from 'react';

const YouTubePlayer = ({ videoId, startTime = 0, isActive }) => {
  const playerRef = useRef(null);
  const [player, setPlayer] = useState(null);
  const [isReady, setIsReady] = useState(false);

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
        player.destroy();
      }
    };
  }, [videoId]);

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
          },
          onStateChange: (event) => {
            // Handle player state changes if needed
          },
        },
      });
    }
  };

  // Handle autoplay/stop based on slide activity
  useEffect(() => {
    if (player && isReady) {
      if (isActive) {
        // Start playing when slide becomes active
        player.seekTo(startTime);
        player.playVideo();
      } else {
        // Stop playing when slide becomes inactive
        player.pauseVideo();
      }
    }
  }, [isActive, player, isReady, startTime]);

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