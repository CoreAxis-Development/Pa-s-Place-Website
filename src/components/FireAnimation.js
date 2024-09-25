import React from 'react';
import './FireAnimation.scss';

const FireAnimation = ({
                         fireScaleWidth = 1,
                         fireScaleHeight = 1,
                         fireTranslateX = 0,
                         fireTranslateY = 0,
                         imageScaleWidth = 1,
                         imageScaleHeight = 1,
                         imageTranslateX = 0,
                         imageTranslateY = 0,
                       }) => {
  return (
    <div className="fire-animation-container">
      <div className="content-wrapper">
        <div className="feature-image-wrapper">
          <img
            src="/home_mission_statement/feature.png"
            alt="Feature"
            className="feature-image"
          />
        </div>
        <div className="text-placeholder">
          <p>Our mission is to ignite the passion and potential within every individual, fostering a community of growth, support, and inspiration.</p>
        </div>
      </div>

      <div
        className="hands-wrapper"
        style={{
          transform: `translate(${imageTranslateX}px, ${imageTranslateY}px) scale(${imageScaleWidth}, ${imageScaleHeight})`,
        }}
      >
        <img
          src="/home_mission_statement/open_hands.png"
          alt="Open Hands"
          className="hands-image"
        />
      </div>

      <div
        className="fire-wrapper"
        style={{
          transform: `translate(${fireTranslateX}px, ${fireTranslateY}px) scale(${fireScaleWidth}, ${fireScaleHeight})`,
        }}
      >
        <svg
          viewBox="0 0 200 200"
          xmlns="http://www.w3.org/2000/svg"
          className="fire-svg"
        >
          <defs>
            <filter id="turb" x="-100%" y="-100%" width="300%" height="300%">
              <feTurbulence
                type="turbulence"
                baseFrequency="0.06"
                numOctaves="2.5"
                result="turbulence"
                seed="69"
              />
              <feDisplacementMap in2="turbulence" in="SourceGraphic" scale="35" />
            </filter>
            <filter id="turb2" x="-100%" y="-100%" width="300%" height="300%">
              <feTurbulence
                type="turbulence"
                baseFrequency="0.08"
                numOctaves="1"
                result="turbulence"
                seed="169"
              />
              <feDisplacementMap in2="turbulence" in="SourceGraphic" scale="35" />
            </filter>
            <radialGradient id="grad" cx="50%" cy="100%">
              <stop offset="0%" stopColor="blue" />
              <stop offset="20%" stopColor="gold" />
              <stop offset="60%" stopColor="gold" />
              <stop offset="100%" stopColor="red" />
            </radialGradient>
          </defs>
          <g>
            <path
              d="M70 200 h60 l-30 -90z"
              filter="url(#turb)"
              fill="url(#grad)"
            >
              <animate
                attributeName="d"
                values="M70 200 h60 l-30 -90z; M70 7200 h60 l-30 -90z"
                dur="100s"
                begin="0s"
                repeatCount="indefinite"
              />
            </path>
            <animateTransform
              attributeName="transform"
              attributeType="XML"
              type="translate"
              values="0 0; 0 -7000"
              dur="100s"
              begin="0s"
              repeatCount="indefinite"
            />
          </g>
        </svg>
      </div>
    </div>
  );
};

export default FireAnimation;