import React from 'react';
import EventDetailPage from './EventDetailPage';
import spl1 from './assets/spl/IMG_5837.JPG';
import spl2 from './assets/spl/IMG_5852.JPG';
import spl3 from './assets/spl/IMG_5973.JPG';
import spl4 from './assets/spl/IMG_5988.JPG';
import spl5 from './assets/spl/IMG_6005.JPG';

const SPL = () => {
  const images = [spl1, spl2, spl3, spl4, spl5];
  const imageGrid = images.map((img, idx) => ({
    id: idx,
    image: img,
    title: `SPL Moment ${idx + 1}`,
    summary: 'From Startup Premier League',
  }));

  const highlights = [
    'IPL-style auction format for startups',
    'Business strategy and simulation challenges',
    'Pitch your innovative ideas',
    'Compete with top student teams across colleges'
  ];

  return (
    <EventDetailPage
      title="SPL"
      titleLine2="3.0"
      eventSubtitle="Feb 22, 2025 | Business Strategy Event"
      eventDetail="Inter-college competition • 85 teams"
      mainStatValue="85"
      mainStatLabel="Teams"
      statDetail="Rounds: 3 | Prize Pool: ₹1,50,000"
      highlights={highlights}
      images={images}
      imageGrid={imageGrid}
    />
  );
};

export default SPL;