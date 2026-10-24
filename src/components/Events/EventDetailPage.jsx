import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Footer from '../Footer/Footer';
import { X, MoveRight } from 'lucide-react';
import ecellLogo from '../../assets/ecell.png';

const EventDetailPage = ({
  title,
  titleLine2 = '',
  eventSubtitle,
  eventDetail,
  mainStatValue,
  mainStatLabel,
  statDetail,
  highlights = [],
  images = [],
  imageGrid = [],
}) => {
  const [selectedImage, setSelectedImage] = useState(null);

  // Lock body scroll when the image modal is open to prevent background scrolling
  useEffect(() => {
    if (selectedImage) {
      document.body.style.overflow = 'hidden';
      document.body.classList.add('hide-navbar');
    } else {
      document.body.style.overflow = 'unset';
      document.body.classList.remove('hide-navbar');
    }
    return () => {
      document.body.style.overflow = 'unset';
      document.body.classList.remove('hide-navbar');
    };
  }, [selectedImage]);

  const displayImages = imageGrid.length > 0 
    ? imageGrid 
    : images.map((img, idx) => ({
        id: idx,
        image: img,
        title: `Moment ${idx + 1}`,
        summary: `From ${title}`,
      }));

  const heroImages = displayImages.slice(0, 4);
  const galleryImages = displayImages;

  // Fanning animation for hero images
  const fanVariants = {
    hidden: { opacity: 0, y: 200, rotate: 0 },
    visible: (i) => {
      const rotations = [-15, -5, 5, 15];
      const xOffsets = ['-10vw', '-3vw', '3vw', '10vw'];
      return {
        opacity: 1,
        y: 0,
        x: xOffsets[i % 4] || 0,
        rotate: rotations[i % 4] || 0,
        transition: {
          type: "spring",
          stiffness: 60,
          damping: 12,
          delay: 0.3 + (i * 0.1)
        }
      };
    },
    hover: (i) => {
      const rotations = [-22, -8, 8, 22];
      const xOffsets = ['-22vw', '-8vw', '8vw', '22vw'];
      const yOffsets = [15, 0, 0, 15];
      return {
        x: xOffsets[i % 4] || 0,
        rotate: rotations[i % 4] || 0,
        y: yOffsets[i % 4] || 0,
        scale: 1.05,
        transition: {
          type: "spring",
          stiffness: 300,
          damping: 20,
        }
      };
    }
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-white selection:text-black overflow-hidden">
      
      {/* Hero Section - Playful Typography & Fanning Cards */}
      <section className="pt-32 pb-24 px-6 md:px-12 max-w-7xl mx-auto flex flex-col items-center text-center relative">
        
        {/* Title Group with Relative Anchor for Overlapping Badges */}
        <div className="relative inline-block">

          {/* Main Title */}
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tighter leading-tight mb-8 max-w-5xl z-10 uppercase"
          >
            {title} <br/>
            {titleLine2 && <span>{titleLine2}</span>}
          </motion.h1>
        </div>

        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-lg md:text-xl font-medium mt-4 max-w-2xl mx-auto text-white/60 mb-16"
        >
          {eventSubtitle}
        </motion.p>

        {/* Fanned Cards */}
        {heroImages.length > 0 && (
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            whileHover="hover"
            className="relative w-full max-w-2xl h-[30vh] md:h-[50vh] flex justify-center items-center mt-12 mb-20"
          >
            {heroImages.map((item, i) => (
              <motion.div
                key={item.id}
                custom={i}
                variants={fanVariants}
                whileHover={{ y: -30, scale: 1.15, zIndex: 50, rotate: 0 }}
                className="absolute w-40 h-56 md:w-64 md:h-80 rounded-[2rem] overflow-hidden border-4 md:border-[6px] border-[#333] shadow-2xl cursor-pointer"
                style={{ zIndex: i }}
                onClick={() => setSelectedImage(item)}
              >
                <div 
                  className="w-full h-full bg-cover bg-center preserve-color" 
                  style={{ backgroundImage: `url(${item.image})` }}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </section>


      <main className="max-w-7xl mx-auto px-6 md:px-12 mb-32">
        
        {/* Elegant Typography Overview */}
        <div className="mb-24">
          <motion.h2 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-lg md:text-xl lg:text-2xl font-medium tracking-tight leading-relaxed max-w-4xl mx-auto text-white/80"
          >
            {eventDetail}
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">
          
          {/* Pure Typography Stat */}
          {mainStatValue && (
            <div className="lg:col-span-5 flex flex-col justify-center items-center text-center">
              <span className="text-sm font-semibold tracking-widest uppercase text-white/50 mb-2">{mainStatLabel}</span>
              <motion.div 
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-[5rem] md:text-[7rem] lg:text-[8rem] font-medium leading-none tracking-tighter text-white"
              >
                {mainStatValue}
              </motion.div>
              {statDetail && (
                <p className="text-base md:text-lg text-white/60 font-medium mt-6 max-w-md leading-relaxed text-center mx-auto">
                  {statDetail}
                </p>
              )}
            </div>
          )}

          {/* Elegant Borderless List */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            {highlights.map((highlight, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="group border-t border-white/20 py-8 md:py-10 flex items-start gap-6 md:gap-10 last:border-b border-white/20"
              >
                <div className="text-white/40 text-lg md:text-xl font-mono pt-1 md:pt-2">
                  {(idx + 1).toString().padStart(2, '0')}
                </div>
                <h3 className="text-lg md:text-xl lg:text-2xl font-medium tracking-tight text-white/90 group-hover:text-white transition-colors leading-[1.4] text-left">
                  {typeof highlight === 'string' ? highlight : highlight.title}
                </h3>
              </motion.div>
            ))}
          </div>
        </div>
      </main>

      {/* Avatar/Gallery Grid ("You will find yourself among us") */}
      {galleryImages.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 md:px-12 mb-32 text-center">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold tracking-tight mb-16"
          >
            Event Moments.
          </motion.h2>

          <div className="grid grid-cols-2 md:grid-cols-4 auto-rows-[150px] md:auto-rows-[250px] gap-4 md:gap-6 grid-flow-dense">
            {galleryImages.map((item, idx) => {
              const pattern = [
                "md:col-span-2 md:row-span-2 col-span-2 row-span-2",
                "md:col-span-1 md:row-span-1 col-span-1 row-span-1",
                "md:col-span-1 md:row-span-1 col-span-1 row-span-1",
                "md:col-span-2 md:row-span-1 col-span-2 row-span-1",
                "md:col-span-1 md:row-span-2 col-span-1 row-span-2",
                "md:col-span-1 md:row-span-1 col-span-1 row-span-1",
              ];
              const gridClass = pattern[idx % 6];
              
              return (
                <motion.div
                  key={item.id || idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ type: "spring", delay: (idx % 8) * 0.05 }}
                  onClick={() => setSelectedImage(item)}
                  className={`w-full h-full overflow-hidden rounded-[2rem] border-2 md:border-4 border-white/10 hover:border-white transition-all shadow-lg cursor-pointer hover:-translate-y-2 hover:shadow-2xl relative group ${gridClass}`}
                >
                  <div 
                    className="absolute inset-0 w-full h-full bg-cover bg-center preserve-color transition-transform duration-700 group-hover:scale-110"
                    style={{ backgroundImage: `url(${item.image})` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </motion.div>
              );
            })}
          </div>
        </section>
      )}

      {/* Image Modal - Portaled to body to escape .light-theme filter containing block */}
      {createPortal(
        <AnimatePresence>
          {selectedImage && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100000] flex items-center justify-center bg-black/95 backdrop-blur-md p-4 md:p-12"
              onClick={() => setSelectedImage(null)}
            >
              <motion.div
                initial={{ scale: 0.5, rotate: -5 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ type: "spring", damping: 20 }}
                className="relative max-w-4xl w-full flex flex-col items-center justify-center"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => setSelectedImage(null)}
                  className="absolute -top-16 right-0 p-4 text-white hover:scale-110 transition-transform bg-[#222] rounded-full border-2 border-white/20 shadow-xl z-50"
                >
                  <X className="w-8 h-8" strokeWidth={3} />
                </button>
                
                <div className="w-full rounded-[3rem] overflow-hidden border-4 border-white/20 shadow-2xl bg-[#111]">
                  <img
                    src={selectedImage.image}
                    alt={selectedImage.title}
                    className="w-full h-auto max-h-[70vh] object-contain"
                  />
                </div>
                
                <div className="mt-8 bg-[#222] text-white px-8 py-4 rounded-full border-2 border-white/20 shadow-xl font-bold text-xl">
                  {selectedImage.title || "Awesome Moment!"}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}

      <Footer />
    </div>
  );
};

export default EventDetailPage;
