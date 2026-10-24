import React from 'react';
import EventDetailPage from './EventDetailPage';
import ripoff1 from './assets/ripoff/IMG_5513.JPG';
import ripoff2 from './assets/ripoff/IMG_5537.JPG';

const Ripoff = () => {
  const images = [ripoff1, ripoff2];
  const imageGrid = images.map((img, idx) => ({
    id: idx,
    image: img,
    title: `Ripoff Moment ${idx + 1}`,
    summary: 'From Ripoff event',
  }));

  const highlights = [
    'Unleash your inner designer with reimagined products',
    'Better utility, design, or sustainability focus',
    'Unique competition challenging participants to rip off and improve',
    'Showcase innovative redesigns and improvements'
  ];

  return (
    <EventDetailPage
      title="RIP"
      titleLine2="OFF"
      eventSubtitle="Mar 5, 2025 | Design Competition"
      eventDetail="Reimagine products • 60 designers"
      mainStatValue="60"
      mainStatLabel="Designers"
      statDetail="Categories: 5 | Winners: 3 Teams"
      highlights={highlights}
      images={images}
      imageGrid={imageGrid}
    />
  );
};

export default Ripoff;
