import React from 'react';
import EventDetailPage from './EventDetailPage';

const Advert = () => {
  const images = [
    'https://images.unsplash.com/photo-1552664730-d307ca884978?w=500&h=300&fit=crop',
    'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=500&h=300&fit=crop',
    'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=500&h=300&fit=crop',
    'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=500&h=300&fit=crop',
  ];

  const imageGrid = images.map((img, idx) => ({
    id: idx,
    image: img,
    title: `Advert Moment ${idx + 1}`,
    summary: 'From Advert 2.0 event',
  }));

  const highlights = [
    'Creative advertising campaigns',
    'Marketing strategy and execution',
    'Brand storytelling and messaging',
    'Showcase innovative marketing ideas'
  ];

  return (
    <EventDetailPage
      title="ADVERT"
      titleLine2="2.0"
      eventSubtitle="Mar 15, 2025 | Creative Marketing"
      eventDetail="Advertising competition • 45 teams"
      mainStatValue="45"
      mainStatLabel="Teams"
      statDetail="Categories: 3 | Winners: 3 Teams"
      highlights={highlights}
      images={images}
      imageGrid={imageGrid}
    />
  );
};

export default Advert;
