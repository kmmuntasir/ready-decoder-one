import { useState, useEffect, useRef } from 'react';
import YouTubePlayer from './YouTubePlayer';
import './Slide.css';

const Slide = ({ reference, isActive, slideNumber }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [dominantColor, setDominantColor] = useState('#1a1a1a');
  const imageRef = useRef(null);

  // Get all available images for this reference
  const getImages = () => {
    const images = [];
    if (reference.image) images.push(reference.image);
    if (reference.altImage) images.push(reference.altImage);
    if (reference.extraImages) images.push(...reference.extraImages);
    return images;
  };

  const images = getImages();

  // Cycle through images if multiple exist
  useEffect(() => {
    if (images.length > 1 && isActive) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % images.length);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [images.length, isActive]);

  // Extract dominant color from image
  const extractDominantColor = (imageSrc) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = img.width;
      canvas.height = img.height;
      
      ctx.drawImage(img, 0, 0);
      
      try {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        let r = 0, g = 0, b = 0;
        let pixelCount = 0;
        
        // Sample every 10th pixel for performance
        for (let i = 0; i < data.length; i += 40) {
          r += data[i];
          g += data[i + 1];
          b += data[i + 2];
          pixelCount++;
        }
        
        r = Math.floor(r / pixelCount);
        g = Math.floor(g / pixelCount);
        b = Math.floor(b / pixelCount);
        
        // Darken the color for background use
        const darkR = Math.floor(r * 0.3);
        const darkG = Math.floor(g * 0.3);
        const darkB = Math.floor(b * 0.3);
        
        setDominantColor(`rgb(${darkR}, ${darkG}, ${darkB})`);
      } catch (error) {
        // Fallback color if CORS or other issues
        setDominantColor('#1a1a1a');
      }
    };
    img.src = imageSrc;
  };

  // Extract color when image changes
  useEffect(() => {
    if (images[currentImageIndex]) {
      extractDominantColor(images[currentImageIndex]);
    }
  }, [currentImageIndex, images]);

  // Extract YouTube video ID from URL
  const getYouTubeVideoId = (url) => {
    if (!url) return null;
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/);
    return match ? match[1] : null;
  };

  const getYouTubeStartTime = (url) => {
    if (!url) return 0;
    const match = url.match(/[?&]t=(\d+)/);
    return match ? parseInt(match[1]) : 0;
  };

  const videoId = getYouTubeVideoId(reference.youtubeUrl);
  const startTime = getYouTubeStartTime(reference.youtubeUrl);

  return (
    <div 
      className="slide"
      style={{
        background: `linear-gradient(135deg, ${dominantColor} 0%, rgba(0,0,0,0.8) 100%)`
      }}
    >
      <div className="slide-content">
        <div className="slide-header">
          <span className="slide-number">#{slideNumber}</span>
          <h2 className="slide-title">{reference.title}</h2>
        </div>

        <div className="slide-body">
          <div className="media-container">
            {reference.youtubeUrl ? (
              <div className="youtube-container">
                <YouTubePlayer
                  videoId={videoId}
                  startTime={startTime}
                  isActive={isActive}
                />
                {images.length > 0 && (
                  <div className="thumbnail-images">
                    {images.map((img, index) => (
                      <img
                        key={index}
                        src={img}
                        alt={`${reference.title} ${index + 1}`}
                        className={`thumbnail ${index === currentImageIndex ? 'active' : ''}`}
                        onClick={() => setCurrentImageIndex(index)}
                      />
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="image-container">
                {images.length > 0 && (
                  <img
                    ref={imageRef}
                    src={images[currentImageIndex]}
                    alt={reference.title}
                    className="slide-image"
                  />
                )}
                {images.length > 1 && (
                  <div className="image-indicators">
                    {images.map((_, index) => (
                      <button
                        key={index}
                        className={`indicator ${index === currentImageIndex ? 'active' : ''}`}
                        onClick={() => setCurrentImageIndex(index)}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="text-container">
            <p className="slide-description">{reference.description}</p>
            
            {reference.youtubeUrl && (
              <div className="youtube-link">
                <a 
                  href={reference.youtubeUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="external-link"
                >
                  🎥 Watch on YouTube
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Slide; 