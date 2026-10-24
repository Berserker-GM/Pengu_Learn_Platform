import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

import Hero from '../components/Hero/Hero';
import About from '../components/About/About';
import Events from '../components/Events/Events';
import Footer from '../components/Footer/Footer';
import DownloadSection from '../components/Download/DownloadSection';

const Home = () => {
  const location = useLocation();

  useEffect(() => {
    // Check for hash on mount or route change (e.g. #download, #about, #features)
    if (location.hash) {
      const targetId = location.hash.substring(1);
      const element = document.getElementById(targetId);
      if (element) {
        setTimeout(() => {
          const topPosition = element.getBoundingClientRect().top + window.scrollY - 80;
          window.scrollTo({ top: topPosition, behavior: 'smooth' });
        }, 400);
      }
    }

    const handleAnchorClick = (e) => {
      const href = e.currentTarget.getAttribute('href');
      if (href && href.startsWith('#')) {
        e.preventDefault();
        const targetId = href.substring(1);
        const element = document.getElementById(targetId);

        if (element) {
          const topPosition = element.getBoundingClientRect().top + window.scrollY - 80;
          window.scrollTo({
            top: topPosition,
            behavior: 'smooth'
          });
          window.history.pushState(null, '', href);
        }
      }
    };

    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    anchorLinks.forEach(anchor => {
      anchor.addEventListener('click', handleAnchorClick);
    });

    return () => {
      anchorLinks.forEach(anchor => {
        anchor.removeEventListener('click', handleAnchorClick);
      });
    };
  }, [location.hash]);

  return (
    <div className="home-page bg-black text-white">
      <Hero />
      <About />
      <Events />
      <DownloadSection />
      <Footer />
    </div>
  );
};

export default Home;
