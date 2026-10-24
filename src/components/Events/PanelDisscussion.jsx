import React from 'react';
import EventDetailPage from './EventDetailPage';
import panel1 from './assets/paneldiscussion/img1.jpg';
import panel2 from './assets/paneldiscussion/img2.jpg';
import panel3 from './assets/paneldiscussion/img3.jpg';
import panel4 from './assets/paneldiscussion/img4.jpg';
import panel5 from './assets/paneldiscussion/img5.jpg';

const PanelDiscussion = () => {
  const images = [panel1, panel2, panel3, panel4, panel5];
  const imageGrid = images.map((img, idx) => ({
    id: idx,
    image: img,
    title: `Panel Discussion Moment ${idx + 1}`,
    summary: 'From Panel Discussion event',
  }));

  const highlights = [
    'Industry experts share insights and experiences',
    'Interactive Q&A session with panelists',
    'Learn about career paths in entrepreneurship',
    'Network with successful entrepreneurs and mentors'
  ];

  return (
    <EventDetailPage
      title="Next Compass"
      titleLine2="Navigating the New Universe"
      eventSubtitle="Panel Discussion • 220+ participants"
      eventDetail="Format: Interactive Panel Discussion"
      mainStatValue="220+"
      mainStatLabel="Participants"
      statDetail=""
      highlights={[
        'Seniors shared real college experiences and practical guidance',
        'Interactive Q&A on academics, internships, networking, and campus life',
        'Insights on balancing GPA, extracurriculars, and mental health',
        'Featured speakers including founders, interns, and student leaders',
        'Encouraged mentorship and peer-to-peer learning culture',
        'Actionable takeaways and "senior secrets" for students'
      ]}
      images={images}
      imageGrid={imageGrid}
    />
  );
};

export default PanelDiscussion;
