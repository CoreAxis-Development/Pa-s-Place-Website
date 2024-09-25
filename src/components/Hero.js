// src/components/Hero.js
import React, { useEffect, useState } from 'react';
import styles from './Hero.module.scss';
import BirdAnimation from './BirdAnimation';

const Hero = () => {
  const [animate, setAnimate] = useState(false);
  const [showBirds, setShowBirds] = useState(false);
  const [showText, setShowText] = useState(false);
  const [sunFadeOut, setSunFadeOut] = useState(false);

  useEffect(() => {
    setAnimate(true);
    setTimeout(() => setShowBirds(true), 4000);
    setTimeout(() => {
      setSunFadeOut(true);
      setTimeout(() => {
        setShowText(true);
      }, 2000); // Delay text appearance by 2 seconds after sun starts fading
    }, 6000);
  }, []);

  return (
    <div className={styles.heroContainer}>
      <div className={`${styles.sun} 
                       ${animate ? styles.animateSun : ''} 
                       ${sunFadeOut ? styles.fadeSun : ''}`}>
        {[...Array(40)].map((_, index) => (
          <div key={index} className={`${styles.sunRay} ${styles[`ray${index + 1}`]}`}></div>
        ))}
        <div className={styles.sunFace}></div>
      </div>
      {showBirds && <BirdAnimation />}
      {showText && (
        <div className={styles.heroText}>
          <h1 className={styles.heroTitle}>Pa's Place</h1>
          <p className={styles.heroSubtitle}>Pocket of Peace</p>
        </div>
      )}
    </div>
  );
};

export default Hero;