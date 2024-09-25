import Link from 'next/link';
import styles from './ProfileCardComponent.module.css';
import { useEffect, useState } from 'react';

const ProfileCardComponent = () => {
  const [cardHeight, setCardHeight] = useState('auto');

  useEffect(() => {
    const cardElements = document.querySelectorAll(`.${styles.card}`);
    let maxHeight = 0;

    cardElements.forEach((card) => {
      const cardHeight = card.offsetHeight;
      if (cardHeight > maxHeight) {
        maxHeight = cardHeight;
      }
    });

    setCardHeight(`${maxHeight}px`);
  }, []);

  return (
      <div className={styles.container}>
        <div className={styles.board}>
          <Link href="/reach-out" passHref>
            <div className={styles.card} style={{ height: cardHeight }}>
              <img
                  src="/imageCardIcons/3.jpg"
                  alt="Reach Out"
                  className={styles.image}
              />
              <h2 className={styles.title}>Reach Out</h2>
              <p className={styles.body}>
                Are you or someone you know in need of a safe haven for personal growth and community support? Pa’s Place offers a sanctuary for young guests, providing enriching activities, educational programs, and a nurturing environment. Reach out to us today and let’s embark on a journey of growth and joy together.
              </p>
            </div>
          </Link>
          <Link href="/" passHref>
            <div className={styles.card} style={{ height: cardHeight }}>
              <img
                  src="/imageCardIcons/1.jpg"
                  alt="Discover More"
                  className={styles.image}
              />
              <h2 className={styles.title}>Discover More</h2>
              <p className={styles.body}>
                Explore our site to learn more about Pa’s Place, our mission, and the various programs we offer to support and nurture young guests.
              </p>
            </div>
          </Link>
          <Link href="/aboutUs" passHref>
            <div className={styles.card} style={{ height: cardHeight }}>
              <img
                  src="/imageCardIcons/2.jpg"
                  alt="About Us"
                  className={styles.image}
              />
              <h2 className={styles.title}>About Us</h2>
              <p className={styles.body}>
                Learn more about Pa’s Place, our mission, and the dedicated team working tirelessly to create a nurturing environment for young guests. Discover our story and how we strive to make a positive impact in the community.
              </p>
            </div>
          </Link>
        </div>
      </div>
  );
};

export default ProfileCardComponent;