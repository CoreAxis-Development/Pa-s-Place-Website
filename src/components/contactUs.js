import React from 'react';
import { FaEnvelope, FaPhone } from 'react-icons/fa';
import styles from './contactUs.module.css';

const ContactUs = () => {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1>Contact Us</h1>
        <p>
          <FaEnvelope className={styles.icon} /> Email:{' '}
          <a href="mailto:info@pasplace.co.za">info@pasplace.co.za</a>
        </p>
        <p>
          <FaPhone className={styles.icon} /> Phone:{' '}
          <a href="tel:+27833097288">Pierre: 083 309 7288</a>
        </p>
      </div>
    </div>
  );
};

export default ContactUs;