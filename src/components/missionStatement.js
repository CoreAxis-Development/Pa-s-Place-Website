import { useEffect, useState } from 'react';
import styles from './MissionStatement.module.css';
import missionStatementIcon from '../../public/missionStatement/bg.webp'; // Replace this with the generated background

const MissionStatement = () => {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateDimensions = () => {
      const { clientWidth, clientHeight } = document.documentElement;
      setDimensions({ width: clientWidth, height: clientHeight });
    };

    window.addEventListener('resize', updateDimensions);
    updateDimensions();

    return () => {
      window.removeEventListener('resize', updateDimensions);
    };
  }, []);

  return (
    <div className={styles.container}>
      <div
        className={styles.backgroundCanvas}
        style={{
          backgroundImage: `url(${missionStatementIcon.src})`,
        }}
      />
      <div className={styles.overlay} />
      <div className={styles.content}>
        <div className={styles.missionBox}>
          <h1 className={styles.title}>Our Mission Statement</h1>
          <p className={styles.text}>
            At Pa's Place, our mission is to nurture the spirits of young guests
            by providing a safe, enriching environment that fosters community,
            personal growth, and unforgettable experiences. Through
            compassionate care and innovative programs, we aim to inspire and
            empower youth, granting them solace, inspiration, and a sense of
            belonging.
          </p>
        </div>
      </div>
    </div>
  );
};

export default MissionStatement;
