// components/Testimonials.js
import React, { useRef, useState } from 'react';
import styles from './Testimonials.module.css';

const testimonials = [
  {
    name: "Emma, Age 10",
    image: "/testimonials/emma.jpg",
    feedback: "The getaway was magical! I loved the nature walks and making new friends. I can't wait to go again!",
  },
  {
    name: "Liam, Age 12",
    image: "/testimonials/liam.jpg",
    feedback: "Thank you for the best time ever! The activities were so much fun, and I felt like a superhero all week!",
  },
  {
    name: "Sophia's Mom",
    image: "/testimonials/mom.jpg",
    feedback: "This trip gave Sophia a chance to be a kid again. The joy I saw on her face is something I'll never forget.",
  },
];

const Testimonials = () => {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const cardRefs = useRef([]);

  const handleMouseEnter = (index) => {
    setHoveredIndex(index);
  };

  const handleMouseLeave = () => {
    setHoveredIndex(null);
  };

  return (
    <div className={styles.container}>
      <div className={styles.overlay}></div>
      <h2 className={styles.heading}>What Our Families Are Saying</h2>
      <div className={styles.testimonialContainer}>
        {testimonials.map((testimonial, index) => (
          <div
            key={index}
            ref={(el) => (cardRefs.current[index] = el)}
            className={`${styles.card} ${hoveredIndex !== null && index > hoveredIndex ? styles.inactive : ''}`}
            onMouseEnter={() => handleMouseEnter(index)}
            onMouseLeave={handleMouseLeave}
          >
            <div className={styles.bubble}>
              <img src={testimonial.image} alt={testimonial.name} className={styles.image} />
            </div>
            <p className={styles.feedback}>{testimonial.feedback}</p>
            <h3 className={styles.name}>{testimonial.name}</h3>
            <div className={styles.heartContainer}>
              <span className={styles.heart}>❤️</span>
              <span className={styles.heart}>❤️</span>
              <span className={styles.heart}>❤️</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Testimonials;
