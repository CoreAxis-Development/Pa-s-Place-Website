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
          <a href="mailto:lukebriangilmore@outlook.com">lukebriangilmore@outlook.com</a>
        </p>
        <p>
          <FaPhone className={styles.icon} /> Phone:{' '}
          <a href="tel:+27734365056">Luke: 073 436 5056</a>
        </p>
      </div>
    </div>
  );
};

export default ContactUs;