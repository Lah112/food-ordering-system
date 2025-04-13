import React from "react";
import "./Footer.css";
import { assets } from "../../assets/frontend_assets/assets";

const Footer = () => {
  return (
    <div className="footer" id="footer">
      <div className="footer-content">
        <div className="footer-content-left">
        <img src={assets.logo} alt="logo" className="footer-logo" />
          <p>
          Bojun is a premium food delivery platform committed to bringing authentic, 
          flavorful meals from your favorite restaurants straight to your doorstep. 
          Rooted in the rich culinary heritage of Sri Lanka, Bojun blends tradition with 
          technology to offer a seamless, fast, and reliable food delivery experience.
          Whether you're craving local classics or international cuisine, Bojun ensures every dish 
          arrives fresh, delicious, and right on time. With a focus on quality, convenience, and customer
          satisfaction, Bojun is more than just a delivery app — it’s your trusted partner in every
          mealtime moment.
          </p>
          <div className="footer-social-icons">
            <img src={assets.facebook_icon} alt="" />
            <img src={assets.twitter_icon} alt="" />
            <img src={assets.linkedin_icon} alt="" />
          </div>
        </div>
        <div className="footer-content-center">
          <h2>Company</h2>
          <ul>
            <li>Home</li>
            <li>About us</li>
            <li>Delivery</li>
            <li>Privacy Policy</li>
          </ul>
        </div>
        <div className="footer-content-right">
          <h2>Get in touch</h2>
          <ul>
            <li>+94715674543</li>
            <li>info@bojun.lk</li>
          </ul>
        </div>
      </div>
      <hr />
      <p className="footer-copyright">
        Copyright 2025 @ Bojun.lk - All Right Reserved.
      </p>
    </div>
  );
};

export default Footer;
