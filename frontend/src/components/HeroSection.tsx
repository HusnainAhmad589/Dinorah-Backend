import React from "react";

interface HeroSectionProps {
  onExploreClick: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onExploreClick }) => {
  return (
    <section className="hero">
      <div className="hero-bg"></div>
      <div className="hero-content">
        <p className="hero-subtitle">Timeless Elegance</p>
        <h1>
          Where Beauty<br />
          <span className="italic">Meets Art</span>
        </h1>
        <p className="hero-description">
          Discover our exquisite collection of handcrafted jewelry, designed for those who appreciate refined beauty.
        </p>
        <a
          href="#collections"
          className="button"
          onClick={(e) => {
            e.preventDefault();
            onExploreClick();
          }}
        >
          Explore Collection
        </a>
      </div>
      <div className="scroll-indicator" onClick={onExploreClick}>
        <span>Scroll</span>
        <div className="scroll-line"></div>
      </div>
    </section>
  );
};
