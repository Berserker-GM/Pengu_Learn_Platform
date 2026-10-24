// EventDetailPage Component - Usage Guide
// =========================================

import EventDetailPage from './EventDetailPage';

// Basic Example
const MyEventPage = () => {
  const images = [img1, img2, img3, img4];
  
  const imageGrid = images.map((img, idx) => ({
    id: idx,
    image: img,
    title: `Image ${idx + 1}`,
    summary: 'From my event',
  }));

  return (
    <EventDetailPage
      // Header
      title="EVENT"                    // Main title (required)
      titleLine2="NAME"                // Second line of title (optional)
      
      // Subtitle and Details
      eventSubtitle="Date • Description" // Top subtitle
      eventDetail="Type • Number of participants"
      
      // Statistics
      mainStatValue="123"              // Large stat number
      mainStatLabel="Participants"     // Label for the stat
      statDetail="Additional details" // More stats
      
      // Content
      highlights={[                    // Array of highlight strings or objects
        'Highlight 1',
        'Highlight 2',
        { title: 'Highlight 3', description: 'Details' }
      ]}
      
      // Images (choose one method)
      images={images}                  // Simple array of image URLs/imports
      // OR
      imageGrid={imageGrid}            // Pre-formatted grid data with metadata
    />
  );
};

/*
PROPS REFERENCE:
================

title (string, required)
- Main event name displayed prominently

titleLine2 (string, optional)
- Second line of the title (e.g., "3.0")

eventSubtitle (string)
- Displayed under main title (e.g., "Feb 15, 2025 at 6 Hours")

eventDetail (string)
- Description line with event type and participant count

mainStatValue (string/number)
- Large number displayed in details card

mainStatLabel (string)
- Label for the main stat (e.g., "Participants")

statDetail (string, optional)
- Additional statistics line

highlights (array)
- List of event highlights (strings or objects with title property)

images (array, optional)
- Simple array of image URLs or imported image paths
- Used if imageGrid is not provided

imageGrid (array, optional)
- Pre-formatted array of image objects:
  [{
    id: number,
    image: string (URL or imported path),
    title: string,
    summary: string
  }, ...]

LAYOUT GRID:
============
The component uses a 12-column responsive grid with predefined positions:
- Row 0: 4 images (3 cols each, top row)
- Row 1: 3 images (4 cols each, middle row)
- Row 2: 3 images (3 cols each, bottom row)

Images are cycled through grid positions automatically.

STYLING:
========
- Dark theme (bg-[#0d0d0d])
- Sidebar: 30% width on desktop, full width on mobile
- Gallery: Responsive grid with hover effects
- Borders: white/10 opacity
- Font: Sora (sans-serif), Georgia (serif) for headings

FEATURES:
=========
✓ Responsive design (mobile/tablet/desktop)
✓ Hover overlays on images
✓ Full-screen modal view
✓ Animated transitions (Framer Motion)
✓ Dark mode styling
✓ Footer integration
*/
