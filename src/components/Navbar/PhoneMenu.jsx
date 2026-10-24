import React, { useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";
import { PreloaderContext } from "../../App";
import { PenguIcon } from "../Pengu/PenguLogo";
import "./PhoneMenu.css";

const PhoneMenu = ({
  isOpen,
  toggleMenu,
  isInstantClose,
  setIsInstantClose,
}) => {
  const location = useLocation();
  const { setLoading } = useContext(PreloaderContext);

  const displayItems = [
    { label: "Home", to: "/#hero" },
    { label: "About", to: "/#about" },
    { label: "Modules", to: "/#features" },
    { label: "Download & Pricing", to: "/#download" },
    { label: "Contact", to: "/#footer" },
  ];

  const handleLinkClick = (e, item) => {
    if (item.to.startsWith("/#")) {
      e.preventDefault();
      const targetId = item.to.replace("/#", "");
      
      toggleMenu();
      if (location.pathname !== "/") {
        window.location.href = item.to;
      } else {
        const element = document.getElementById(targetId);
        if (element) {
          const topPosition = element.getBoundingClientRect().top + window.scrollY - 80;
          window.scrollTo({ top: topPosition, behavior: "smooth" });
          window.history.pushState(null, "", `#${targetId}`);
        }
      }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Blurred Background Overlay */}
          <motion.div
            className="fixed inset-0 z-[99997] bg-black/40 backdrop-blur-md md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.2 } }}
            exit={{ opacity: 0, transition: { duration: 0.2, delay: isInstantClose ? 0 : 0.4 } }}
            onClick={toggleMenu}
            style={{ willChange: "opacity" }}
          />
          
          {/* Menu Dropdown */}
          <motion.div
            className="fixed top-0 left-0 right-0 z-[99998] bg-[#F5F5F5] flex flex-col pt-6 px-5 md:hidden max-h-[80vh] overflow-y-auto pb-6 shadow-2xl rounded-b-3xl"
            initial={{ y: "-100%" }}
            animate={{ 
              y: 0,
              transition: {
                duration: 0.5,
                ease: [0.76, 0, 0.24, 1],
                delay: 0.1
              }
            }}
            exit={{ 
              y: "-100%",
              transition: {
                duration: isInstantClose ? 0.01 : 0.5,
                ease: [0.76, 0, 0.24, 1]
              }
            }}
            style={{ fontFamily: "var(--font-body)", willChange: "transform" }}
          >
            {/* Top Bar */}
            <div className="flex items-center justify-between w-full h-[46px] border-b border-black/10 pb-2">
              <div className="flex items-center gap-2">
                <PenguIcon size={24} className="text-black" />
                <span className="text-[15px] text-[#1a1a1a] font-bold tracking-tight" style={{ fontFamily: "var(--font-heading)" }}>
                  Pengu Learn
                </span>
              </div>
              <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-black/10 text-neutral-600">
                v2.4
              </span>
            </div>

            {/* Links */}
            <div className="flex flex-col gap-3.5 px-1 pt-4">
              {displayItems.map((item, index) => (
                <motion.div
                  key={item.label}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 + index * 0.06, ease: [0.33, 1, 0.68, 1] }}
                  className="flex items-baseline gap-4"
                >
                  <span className="text-[11px] text-[#777] font-mono w-5">
                    {(index + 1).toString().padStart(2, '0')}
                  </span>
                  <a
                    href={item.to}
                    className="text-[18px] text-[#1a1a1a] font-semibold hover:text-sky-600 transition-colors"
                    onClick={(e) => handleLinkClick(e, item)}
                    style={{ fontFamily: "var(--font-heading)" }}
                  >
                    {item.label}
                  </a>
                </motion.div>
              ))}
            </div>

            {/* CTA in Mobile Menu */}
            <div className="pt-6 mt-2 border-t border-black/10">
              <a
                href="/#download"
                onClick={(e) => handleLinkClick(e, { to: "/#download" })}
                className="w-full py-3 rounded-xl bg-black text-white text-center text-xs font-bold uppercase tracking-wider block"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Download Product ($19 / Voucher)
              </a>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default PhoneMenu;
