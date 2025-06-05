import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer-new">
      {/* Newsletter Bar */}
      <div className="footer-newsletter-bar">
        <div className="newsletter-left">
          <h3>Join our newsletter for £10 offs</h3>
          <p>Register now to get latest updates on promotions & coupons. Don't worry, we not spam!</p>
        </div>
        <form className="newsletter-right" onSubmit={e => e.preventDefault()}>
          <input type="email" placeholder="Enter your email address" required />
          <button type="submit">SEND</button>
        </form>
        <div className="newsletter-policy">
          <small>
            By subscribing you agree to our <a href="#">Terms & Conditions</a> and <a href="#">Privacy & Cookies Policy</a>.
          </small>
        </div>
      </div>
      <hr className="footer-divider" />
      {/* Main Columns */}
      <div className="footer-main-cols">
        {/* Support */}
        <div className="footer-col support">
          <h4>Do You Need Help ?</h4>
          <p className="footer-support-desc">Autoseligen syn. Nek diarsak fröbomba. Nör antipol kyonda nyna. Pressa fåmoska.</p>
          <div className="footer-support-contact">
            <div className="footer-support-row">
              <span className="footer-icon"><i className="fas fa-phone"></i></span>
              <span className="footer-support-info">
                <span className="footer-support-hours">Monday-Friday: 08am-9pm</span>
                <span className="footer-support-phone">0 800 300-353</span>
              </span>
            </div>
            <div className="footer-support-row">
              <span className="footer-icon"><i className="fas fa-envelope"></i></span>
              <span className="footer-support-info">
                <span className="footer-support-email">info@example.com</span>
                <span className="footer-support-help">Need help with your order?</span>
              </span>
            </div>
          </div>
        </div>
        {/* Make Money */}
        <div className="footer-col earn">
          <h4>Make Money with Us</h4>
          <ul>
            <li><a href="#">Sell on Grogin</a></li>
            <li><a href="#">Sell Your Services on Grogin</a></li>
            <li><a href="#">Sell on Grogin Business</a></li>
            <li><a href="#">Sell Your Apps on Grogin</a></li>
            <li><a href="#">Become an Affiliate</a></li>
            <li><a href="#">Advertise Your Products</a></li>
            <li><a href="#">Sell-Publish with Us</a></li>
            <li><a href="#">Become an Blowwe Vendor</a></li>
          </ul>
        </div>
        {/* Help */}
        <div className="footer-col help">
          <h4>Let Us Help You</h4>
          <ul>
            <li><a href="#">Accessibility Statement</a></li>
            <li><a href="#">Your Orders</a></li>
            <li><a href="#">Returns & Replacements</a></li>
            <li><a href="#">Shipping Rates & Policies</a></li>
            <li><a href="#">Refund and Returns Policy</a></li>
            <li><a href="#">Privacy Policy</a></li>
            <li><a href="#">Terms and Conditions</a></li>
            <li><a href="#">Cookie Settings</a></li>
            <li><a href="#">Help Center</a></li>
          </ul>
        </div>
        {/* About Us */}
        <div className="footer-col aboutus">
          <h4>Get to Know Us</h4>
          <ul>
            <li><a href="#">Careers for Grogin</a></li>
            <li><a href="#">About Grogin</a></li>
            <li><a href="#">Investor Relations</a></li>
            <li><a href="#">Grogin Devices</a></li>
            <li><a href="#">Customer reviews</a></li>
            <li><a href="#">Social Responsibility</a></li>
            <li><a href="#">Store Locations</a></li>
          </ul>
        </div>
        {/* App & Social */}
        <div className="footer-col app-social">
          <h4>Download our app</h4>
          <div className="footer-apps">
            <a href="#" className="app-btn google">
              <img src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" alt="Google Play" />
              <span className="app-discount">Download App Get <br />-10% Discount</span>
            </a>
            <a href="#" className="app-btn apple">
              <img src="https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg" alt="App Store" />
              <span className="app-discount">Download App Get <br />-20% Discount</span>
            </a>
          </div>
          <div className="footer-social-icons">
            <span>Follow us on social media:</span>
            <a href="#" aria-label="Facebook"><i className="fab fa-facebook-f"></i></a>
            <a href="#" aria-label="X"><i className="fab fa-x-twitter"></i></a>
            <a href="#" aria-label="Instagram"><i className="fab fa-instagram"></i></a>
            <a href="#" aria-label="LinkedIn"><i className="fab fa-linkedin-in"></i></a>
          </div>
        </div>
      </div>
      <hr className="footer-divider" />
      {/* Bottom Bar */}
      <div className="footer-bottom-bar-new">
        <div className="footer-bottom-left">
          <span>Copyright {currentYear} © Jinstore WooCommerce WordPress Theme. All right reserved. Powered by <a href="#">BlackRise Themes.</a></span>
        </div>
        <div className="footer-bottom-center">
          <img src="https://upload.wikimedia.org/wikipedia/commons/4/41/Visa_Logo.png" alt="Visa" />
          <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/PayPal_2014_logo.png" alt="PayPal" />
          <img src="https://upload.wikimedia.org/wikipedia/commons/8/89/Skrill_logo.svg" alt="Skrill" />
          <img src="https://upload.wikimedia.org/wikipedia/commons/5/5c/Klarna_Payment_Badge.svg" alt="Klarna" />
        </div>
        <div className="footer-bottom-right">
          <a href="#">Terms and Conditions</a>
          <a href="#">Privacy Policy</a>
          <a href="#">Order Tracking</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 

