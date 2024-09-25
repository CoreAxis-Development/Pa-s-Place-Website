// pages/index.js
import React from 'react';
import fs from 'fs';
import path from 'path';
import Header from '../components/Header';
import ScrollingQuotes from '../components/ScrollingQuotes';
import Carousel from '../components/Carousel';
import ProfileCardComponent from '../components/ProfileCardComponent';
import Hero from '../components/Hero';
import Footer from '../components/Footer';
import Testimonials from '../components/Testimonials';
import HomeAboutUs from '../components/HomeAboutUs';
function HomePage({ carouselImages }) {


  const keyPoints = (
    <div>
      <h2>Our Key Points</h2>
      <ul>
        <li>Safe and nurturing environment</li>
        <li>Enriching activities</li>
        <li>Educational opportunities</li>
        <li>Support for personal growth</li>
      </ul>
    </div>
  );

  return (
    <div>
      <Header />
      <Hero />
      <HomeAboutUs />
      <ScrollingQuotes />
      <ProfileCardComponent />
      <div className="relative">
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black to-transparent z-10"></div>
        <Carousel images={carouselImages} keyPoints={keyPoints} />
      </div>
      <Testimonials />
      <Footer />
    </div>
  );
}

export async function getStaticProps() {
  const keyPointsCarouselDirectory = path.join(
    process.cwd(),
    'public/keyPointsCarousel',
  );
  const keyPointsFilenames = fs.readdirSync(keyPointsCarouselDirectory);

  const carouselImages = keyPointsFilenames.map(
    (name) => `/keyPointsCarousel/${name}`,
  );

  return {
    props: {
      carouselImages,
    },
  };
}

export default HomePage;
