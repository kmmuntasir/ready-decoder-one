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

  const goToSlide = (index) => {
    setCurrentSlide(index);
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

  return (
    <div className="slideshow-container">
      <div className="slideshow-header">
        <h1>🎮 Ready Decoder One</h1>
        <div className="slideshow-controls">
          <button onClick={prevSlide} className="nav-button">
            ← Previous
          </button>
          <span className="slide-counter">
            {currentSlide + 1} / {references.length}
          </span>
          <button onClick={nextSlide} className="nav-button">
            Next →
          </button>
          <button 
            onClick={() => setIsAutoPlay(!isAutoPlay)} 
            className={`auto-play-button ${isAutoPlay ? 'active' : ''}`}
          >
            {isAutoPlay ? '⏸️ Pause' : '▶️ Auto'}
          </button>
        </div>
      </div>

      <div className="slide-container">
        <Slide 
          reference={references[currentSlide]} 
          isActive={true}
          slideNumber={currentSlide + 1}
        />
      </div>

      <div className="slide-dots">
        {references.map((_, index) => (
          <button
            key={index}
            className={`dot ${index === currentSlide ? 'active' : ''}`}
            onClick={() => goToSlide(index)}
            title={`Go to slide ${index + 1}: ${references[index].title}`}
          />
        ))}
      </div>

      <div className="slideshow-footer">
        <p>
          Use ← → arrow keys to navigate • Space bar to toggle auto-play
        </p>
      </div>
    </div>
  );
};

export default Slideshow; 