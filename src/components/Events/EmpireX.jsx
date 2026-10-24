import React from 'react';
import EventDetailPage from './EventDetailPage';
import e1 from '../../assets/e8.jpg';
import e2 from '../../assets/e2.jpg';
import e3 from '../../assets/e3.jpg';
import e4 from '../../assets/e4.jpg';
import e5 from '../../assets/e5.jpg';
import e6 from '../../assets/e6.jpg';
import e7 from '../../assets/e7.jpg';
import e8 from '../../assets/e8.jpg';
import e9 from '../../assets/e9.jpg';

const EmpireX = () => {
  const images = [e1, e2, e3, e4, e5, e6, e7, e8, e9];
  const imageGrid = images.map((img, idx) => ({
    id: idx,
    image: img,
    title: `Empire X Moment ${idx + 1}`,
    summary: 'From Empire X event',
  }));

  const highlights = [
    'Business simulation and strategy game',
    'Lead a virtual company to success',
    'Make critical decisions under pressure',
    'Compete with teams across colleges'
  ];

  return (
    <EventDetailPage
      title="EMPIRE"
      titleLine2="X"
      eventSubtitle="Business Simulation Competition"
      eventDetail="EmpireX was a Monopoly-style business simulation event where participants built corporate empires through trading, negotiations, and market-based challenges. Teams competed to grow their net worth, survive market twists, and pitch innovative business models using the assets they acquired."
      mainStatValue="3"
      mainStatLabel="Competitive Rounds"
      statDetail="Format: 3 Competitive Rounds"
      highlights={[
        'Monopoly-inspired business acquisition challenge',
        'Strategic trading and asset management rounds',
        'Market survival phase with volatility-based gameplay',
        'Real-time business decision-making and negotiations',
        'Startup MVP pitching before judges',
        'Entrepreneurial learning through gamified competition'
      ]}
      images={images}
      imageGrid={imageGrid}
    />
  );
};

export default EmpireX;
