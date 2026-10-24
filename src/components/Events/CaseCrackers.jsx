import React from 'react';
import EventDetailPage from './EventDetailPage';
import casecracker1 from './assets/casecrackers/20241107_161643.jpg';

const CaseCrackers = () => {
  const images = [casecracker1];
  const imageGrid = images.map((img, idx) => ({
    id: idx,
    image: img,
    title: `Case Crackers Moment ${idx + 1}`,
    summary: 'From Case Crackers event',
  }));

  const highlights = [
    'Complex real-world business problems solved by students',
    'Collaboration with industry partners for case studies',
    'Top 3 teams received internship offers',
    'Evaluation based on feasibility, scalability, and innovation',
  ];

  return (
    <EventDetailPage
      title="CASE"
      titleLine2="CRACKERS"
      eventSubtitle="Mar 10, 2025 at 5 Hours"
      eventDetail="Business case competition • 42 teams"
      mainStatValue="42"
      mainStatLabel="Teams"
      statDetail="Solutions: 38"
      highlights={highlights}
      images={images}
      imageGrid={imageGrid}
    />
  );
};

export default CaseCrackers;
