import Link from 'next/link';
import styles from './ProfileCardComponent.module.css';
import { useEffect, useState } from 'react';

const ProfileCardComponent = () => {
  const profiles = [
    {
      title: 'Reach Out',
      body: 'Are you or someone you know in need of a safe haven for personal growth and community support? Pa’s Place offers a sanctuary for young guests, providing enriching activities, educational programs, and a nurturing environment. Reach out to us today and let’s embark on a journey of growth and joy together.',
      image: '/imageCardIcons/3.jpg', // Hard-coded image path
      link: '/reach-out',
    },
    {
      title: 'Discover More',
      body: 'Explore our site to learn more about Pa’s Place, our mission, and the various programs we offer to support and nurture young guests.',
      image: '/imageCardIcons/1.jpg', // Hard-coded image path
      link: '/',
    },
    {
      title: 'About Us',
      body: 'Learn more about Pa’s Place, our mission, and the dedicated team working tirelessly to create a nurturing environment for young guests. Discover our story and how we strive to make a positive impact in the community.',
      image: '/imageCardIcons/2.jpg', // Hard-coded image path
      link: '/aboutUs',
    },

  ];

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
        {profiles.map((profile, index) => (
          <Link href={profile.link} key={index} passHref>
            <div className={styles.card} style={{ height: cardHeight }}>
              <img
                src={profile.image}
                alt={profile.title}
                className={styles.image}
              />
              <h2 className={styles.title}>{profile.title}</h2>
              <p className={styles.body}>{profile.body}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default ProfileCardComponent;