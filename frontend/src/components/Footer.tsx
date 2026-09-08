import React from "react";

export const Footer: React.FC = () => {
  return (
    <footer className="site-footer">
      <div className="footer-content">
        <a href="/" className="footer-logo">
          DINORAH
        </a>
        <div className="footer-social">
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
            Instagram
          </a>
          <a href="https://pinterest.com" target="_blank" rel="noopener noreferrer">
            Pinterest
          </a>
          <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
            Facebook
          </a>
        </div>
      </div>
      <div className="footer-bottom">
        <p>© 2026 Dinorah. All rights reserved.</p>
      </div>
    </footer>
  );
};
