import { useState, useEffect, useRef } from 'react';
import YouTubePlayer from './YouTubePlayer';
import './Slide.css';

const Slide = ({ reference, isActive, slideNumber }) => {
  const [dominantColor, setDominantColor] = useState('#1a1a1a');
  const [layoutType, setLayoutType] = useState('grid');
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

  // Extract dimensions from filename and calculate aspect ratio
  const getImageAspectRatio = (imagePath) => {
    const match = imagePath.match(/(\d+)x(\d+)/);
    if (match) {
      const width = parseInt(match[1]);
      const height = parseInt(match[2]);
      return width / height;
    }
    return 1; // Default square aspect ratio
  };

  // Determine optimal layout based on image aspect ratios and screen utilization
  const determineLayout = () => {
    if (images.length === 0) return 'grid';
    
    const aspectRatios = images.map(img => getImageAspectRatio(img));
    
    // Count different aspect ratio types
    const landscapeCount = aspectRatios.filter(ratio => ratio > 1.4).length;
    const portraitCount = aspectRatios.filter(ratio => ratio < 0.7).length;
    const squareCount = aspectRatios.filter(ratio => ratio >= 0.7 && ratio <= 1.4).length;
    
    // Single image layouts - maximize screen usage
    if (images.length === 1) {
      const ratio = aspectRatios[0];
      if (ratio > 2.5) return 'single-ultra-wide';
      if (ratio > 1.6) return 'single-wide';
      if (ratio < 0.4) return 'single-ultra-tall';
      if (ratio < 0.8) return 'single-tall';
      return 'single-centered';
    }
    
    // Two image layouts - optimize for screen space
    if (images.length === 2) {
      const ratio1 = aspectRatios[0];
      const ratio2 = aspectRatios[1];
      
      // Both landscape - stack vertically for better use of screen width
      if (ratio1 > 1.3 && ratio2 > 1.3) return 'two-landscape-stacked';
      // Both portrait - place side by side for better use of screen height
      if (ratio1 < 0.8 && ratio2 < 0.8) return 'two-portrait-side';
      // Mixed - adaptive layout
      return 'two-adaptive';
    }
    
    // Three images - special layouts
    if (images.length === 3) {
      if (landscapeCount >= 2) return 'three-landscape-focus';
      if (portraitCount >= 2) return 'three-portrait-focus';
      return 'three-mixed';
    }
    
    // Four or more images - grid layouts optimized for aspect ratios
    if (images.length >= 4) {
      if (landscapeCount > portraitCount) return 'multi-landscape-grid';
      if (portraitCount > landscapeCount) return 'multi-portrait-grid';
      return 'multi-balanced-grid';
    }
    
    // Multiple image layouts - legacy fallback
    if (portraitCount > landscapeCount) return 'portrait-grid';
    if (landscapeCount > portraitCount) return 'landscape-grid';
    
    return 'mixed-grid';
  };

  // Update layout when images change
  useEffect(() => {
    const layout = determineLayout();
    console.log('Layout determined:', layout, 'for images:', images.length, 'aspect ratios:', images.map(img => getImageAspectRatio(img)));
    setLayoutType(layout);
  }, [images]);

  // Extract dominant color from first image
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

  // Extract color from first image
  useEffect(() => {
    if (images[0]) {
      extractDominantColor(images[0]);
    }
  }, [images]);

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
                  <div className={`images-grid layout-${layoutType}`}>
                    {images.map((img, index) => (
                      <img
                        key={index}
                        src={img}
                        alt={`${reference.title} ${index + 1}`}
                        className="grid-image"
                      />
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className={`images-grid layout-${layoutType}`}>
                {images.map((img, index) => (
                  <img
                    key={index}
                    ref={index === 0 ? imageRef : null}
                    src={img}
                    alt={`${reference.title} ${index + 1}`}
                    className="grid-image"
                  />
                ))}
              </div>
            )}
          </div>

          <div className="text-container">
            <div className="slide-header">
              <span className="slide-number">#{slideNumber}</span>
              <h2 className="slide-title">{reference.title}</h2>
            </div>
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