import React from 'react';
import EventDetailPage from './EventDetailPage';
import auction from './assets/spl2/auction.svg';
import ball from './assets/spl2/ball.svg';
import bat from './assets/spl2/bat.svg';
import gavel from './assets/spl2/gavel.svg';
import helmet from './assets/spl2/helmet.svg';
import money from './assets/spl2/money.png';
import people from './assets/spl2/people.png';
import stocks from './assets/spl2/stocks.png';

/**
 * SPL 2.0 - Startup Premier League (Special Edition)
 * Uses EventDetailPage with SVG/PNG asset grid
 */
const Spl2 = () => {
  // Create image grid from available assets
  const svgAssets = [
    { src: auction, alt: 'Auction' },
    { src: ball, alt: 'Ball' },
    { src: bat, alt: 'Bat' },
    { src: gavel, alt: 'Gavel' },
    { src: helmet, alt: 'Helmet' },
  ];

  const pngAssets = [
    { src: money, alt: 'Money' },
    { src: people, alt: 'People' },
    { src: stocks, alt: 'Stocks' },
  ];

  const allAssets = [...svgAssets, ...pngAssets];

  const imageGrid = allAssets.map((asset, idx) => ({
    id: idx,
    image: asset.src,
    title: `SPL 2.0 Asset ${idx + 1}`,
    summary: asset.alt,
  }));

  const highlights = [
    'IPL-style auction format for startups',
    'Business strategy and simulation challenges',
    'Pitch your innovative ideas',
    'Compete with top student teams across colleges',
    'Win big with exciting cash prizes',
  ];

  return (
    <EventDetailPage
      title="SPL"
      titleLine2="2.0"
      eventSubtitle="Mar 20, 2025 | Business Gaming Event"
      eventDetail="Startup auctions • 120+ participants"
      mainStatValue="120+"
      mainStatLabel="Participants"
      statDetail="Prize Pool: ₹2,00,000 | Teams: 40\\"
      highlights={highlights}
      images={allAssets.map((a) => a.src)}
      imageGrid={imageGrid}
    />
  );
};

export default Spl2;
