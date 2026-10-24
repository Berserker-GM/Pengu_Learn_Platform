import React from 'react';
import EventDetailPage from './EventDetailPage';
import image10 from '../../assets/image10.webp';
import image11 from '../../assets/image25.webp';
import image13 from '../../assets/image13.webp';
//src/assets/image25.jpg
import image17 from '../../assets/image17.webp';
import image18 from '../../assets/group.webp';

const CodeRed25 = () => {
  const images = [image10, image11, image13, image18];
  const imageGrid = images.map((img, idx) => ({
    id: idx,
    image: img,
    title: `Code Red Moment ${idx + 1}`,
    summary: 'From Code Red 25 event',
  }));

  return (
    <EventDetailPage
      title="Code Red"
      titleLine2="3.0"
      eventSubtitle="National Level Hackathon • 3000+ registrations"
      eventDetail="National-level 24-hour overnight hackathon"
      mainStatValue="3000+"
      mainStatLabel="Registrations"
      statDetail="Duration: 24 Hours | Finalists: 50 Teams"
      highlights={[
        'National-level 24-hour overnight hackathon',
        'Real-world problem statements aligned with SDGs',
        '₹1,50,000 prize pool across multiple categories',
        'Industry mentors and expert evaluation panels',
        'Mid-night bonfire, networking, and collaboration sessions',
        'Final presentations by top 8 teams and announcement of winners'
      ]}
      images={images}
      imageGrid={imageGrid}
    />
  );
};

export default CodeRed25;
