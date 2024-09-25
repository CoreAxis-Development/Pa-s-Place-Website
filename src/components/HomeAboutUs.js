import React from 'react';
import FireAnimation from './FireAnimation';

const HomeAboutUs = () => {
  return (
    <div className="main-component">
      <FireAnimation
        fireScaleWidth={10}
        fireScaleHeight={13}
        fireTranslateX={325}
        fireTranslateY={-400}
        imageScaleWidth={6}
        imageScaleHeight={7}
        imageTranslateX={350}
        imageTranslateY={-70}
      />
    </div>
  );
};

export default HomeAboutUs;
