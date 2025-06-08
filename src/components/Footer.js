import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebook, FaTwitter, FaLinkedin} from 'react-icons/fa';
import '../styles/Footer.css';

const Footer = () => {

  return (
    <footer className="footer">
      <p>© {new Date().getFullYear()} Excel Analytics Platform. All rights reserved.</p>
      <p>A powerful platform for uploading, analyzing, and visualizing Excel data.</p>

      <div className="footer-links">
        <Link to="/privacy">Privacy Policy</Link>
        <Link to="/terms">Terms of Service</Link>
        <Link to="/contact">Contact Us</Link>
      </div>

      <div className="footer-social">
        <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
  <FaFacebook size={32} color="white" />
</a>
<a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
  <FaTwitter size={32} color="white" />
</a>
<a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
  <FaLinkedin size={32} color="white" />
</a>

      </div>

    </footer>
  );
};

export default Footer;
