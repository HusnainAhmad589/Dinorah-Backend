import React from "react";

export const AboutSection: React.FC = () => {
  return (
    <section id="about" className="about">
      <div className="about-content">
        <p className="section-label">Our Story</p>
        <h2>
          Crafted with Passion,<br />
          <span className="italic">Worn with Pride</span>
        </h2>
        <p className="about-text">
          At Dinorah, we believe that jewelry is more than an accessory—it's a reflection of your unique story. Each piece in our collection is meticulously handcrafted by master artisans, blending traditional techniques with contemporary design.
        </p>
        <p className="about-text">
          From selecting the finest ethically-sourced gemstones to the final polish, every step of our process is guided by our commitment to excellence and sustainability. When you wear Dinorah, you wear a legacy of craftsmanship.
        </p>
      </div>
    </section>
  );
};
