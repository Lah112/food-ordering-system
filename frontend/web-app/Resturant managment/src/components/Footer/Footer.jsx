import { assets } from '../../assets/assets'
import './Footer.css'

const Footer = () => {
  return (
    <div className='footer' id='footer'>

      <div className='footer-content'>
        <div className='footer-content-left'>
          <div className='footer-logo-wrapper'>
            <img src={assets.logo} alt='Bojrn Logo' className='footer-logo' />
          </div>
          <p>
            <br></br>
            <strong>Explore the flavors of Bojun </strong> – where every dish is crafted to satisfy. From fresh greens to indulgent treats, we bring deliciousness right to your door, pure veg and always premium.
          </p>
          <div className='footer-social-icons'>
            <img src={assets.facebook_icon} alt="Facebook" />
            <img src={assets.twitter_icon} alt="Twitter" />
            <img src={assets.linkedin_icon} alt="LinkedIn"/>
          </div>
        </div>
        <div className='footer-content-center'>
          <h2>COMPANY</h2>
          <li>Home</li>
          <li>About us</li>
          <li>Delivery</li>
          <li>Privacy policy</li>
        </div>
        <div className='footer-content-right'>
          <ul>
            <li>+94716787443</li>
            <li>Bojun@gmail.lk</li>
          </ul>
        </div>
      </div>
      <hr/>
      <p className='footer-copyright'>
        Copyright 2025 © Bojun - All Rights Reserved.
      </p>

    </div>
  )
}


export default Footer

