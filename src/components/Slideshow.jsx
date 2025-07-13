import { useState, useEffect } from 'react';
import { references } from '../data/references';
import Slide from './Slide';
import './Slideshow.css';

const Slideshow = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(false);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % references.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + references.length) % references.length);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event) => {
      switch (event.key) {
        case 'ArrowLeft':
          prevSlide();
          break;
        case 'ArrowRight':
          nextSlide();
          break;
        case ' ':
          event.preventDefault();
          setIsAutoPlay(!isAutoPlay);
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAutoPlay]);

  // Auto-play functionality
  useEffect(() => {
    if (isAutoPlay) {
      const interval = setInterval(nextSlide, 10000); // 10 seconds per slide
      return () => clearInterval(interval);
    }
  }, [isAutoPlay, currentSlide]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  return (
    <div className="slideshow-container">
      <div className="slide-container">
        <Slide 
          reference={references[currentSlide]} 
          isActive={true}
          slideNumber={currentSlide + 1}
        />
      </div>

      {/* Floating controls */}
      <div className="floating-controls">
        <button onClick={prevSlide} className="control-btn" title="Previous slide">
          ←
        </button>
        <span className="slide-counter">
          {currentSlide + 1} / {references.length}
        </span>
        <button onClick={nextSlide} className="control-btn" title="Next slide">
          →
        </button>
        <button 
          onClick={() => setIsAutoPlay(!isAutoPlay)} 
          className={`control-btn ${isAutoPlay ? 'active' : ''}`}
          title={isAutoPlay ? 'Pause auto-play' : 'Start auto-play'}
        >
          {isAutoPlay ? '⏸️' : '▶️'}
        </button>
        <button onClick={toggleFullscreen} className="control-btn" title="Toggle fullscreen">
          ⛶
        </button>
      </div>
    </div>
  );
};

export default Slideshow; 