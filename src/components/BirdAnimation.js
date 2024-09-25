// src/components/BirdAnimation.js
import React from 'react';
import styles from './BirdAnimation.module.css';

const BirdAnimation = () => {
  return (
    <div className={styles.container}>
      <div className={`${styles.birdContainer} ${styles.birdContainerOne}`}>
        <div className={`${styles.bird} ${styles.birdOne}`}></div>
      </div>
      <div className={`${styles.birdContainer} ${styles.birdContainerTwo}`}>
        <div className={`${styles.bird} ${styles.birdTwo}`}></div>
      </div>
      <div className={`${styles.birdContainer} ${styles.birdContainerThree}`}>
        <div className={`${styles.bird} ${styles.birdThree}`}></div>
      </div>
      <div className={`${styles.birdContainer} ${styles.birdContainerFour}`}>
        <div className={`${styles.bird} ${styles.birdFour}`}></div>
      </div>
    </div>
  );
};

export default BirdAnimation;