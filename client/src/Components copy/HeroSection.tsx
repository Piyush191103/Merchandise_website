import React from "react";
import { Link } from "react-router-dom";
import "./CSS/HeroSection.css"; // Adjust the path if your CSS is in a different folder

const HeroSection: React.FC = () => {
  return (
    <section className="hero">
      <div className="hero-overlay">
        <div className="hero-content">
          <h1>Premium Merchandise</h1>
          <p>Discover our collection of high-quality apparel and accessories</p>
          <div className="hero-buttons">
            <a href="/Categories" className="btn btn-light">
              Shop Now
            </a>
            <Link to={"/search"} className="findmore">
              View Collections
            </Link> *
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
