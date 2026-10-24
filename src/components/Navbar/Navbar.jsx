import React, { useState, useEffect, useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import { PreloaderContext } from "../../App";
import PhoneMenu from "./PhoneMenu";
import { PenguIcon } from "../Pengu/PenguLogo";
import "./PhoneMenu.css";
import "./Navbar.css";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isInstantClose, setIsInstantClose] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const location = useLocation();
  const { loading } = useContext(PreloaderContext);

  // Prevent scrolling when full screen mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      document.body.classList.add("phone-menu-open");
    } else {
      document.body.style.overflow = "";
      document.body.classList.remove("phone-menu-open");
    }
    return () => {
      document.body.style.overflow = "";
      document.body.classList.remove("phone-menu-open");
    };
  }, [isOpen]);

  const toggleMenu = () => {
    if (!isOpen) {
      setIsInstantClose(false);
    }
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    const controlNavbar = () => {
      if (typeof window !== "undefined") {
        const currentScrollY = window.scrollY;

        if (loading) {
          setIsVisible(false);
        } else if (currentScrollY < 100 || currentScrollY < lastScrollY) {
          setIsVisible(true);
        } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
          setIsVisible(false);
          setIsOpen(false);
        }

        setLastScrollY(currentScrollY);
      }
    };

    if (typeof window !== "undefined") {
      window.addEventListener("scroll", controlNavbar);
      controlNavbar();
      return () => window.removeEventListener("scroll", controlNavbar);
    }
  }, [lastScrollY, loading]);

  const navItems = [
    { to: "/#hero", label: "Home" },
    { to: "/#the-idea", label: "The Idea" },
    { to: "/#how-it-feels", label: "How It Works" },
    { to: "/#download", label: "Download & Pricing" },
    { to: "/#footer", label: "Contact" },
  ];

  const handleNavClick = (e, targetHref) => {
    if (targetHref.startsWith("/#")) {
      const hash = targetHref.replace("/", "");
      const targetId = hash.substring(1);
      
      if (location.pathname === "/") {
        e.preventDefault();
        const element = document.getElementById(targetId);
        if (element) {
          const topPosition = element.getBoundingClientRect().top + window.scrollY - 80;
          window.scrollTo({ top: topPosition, behavior: "smooth" });
          window.history.pushState(null, "", hash);
        }
      }
    }
  };

  return (
    <>
      <nav
        className={`fixed z-[99999] transition-all duration-500 ease-in-out ${
          isVisible ? "translate-y-0 opacity-100" : "-translate-y-20 opacity-0"
        } md:top-6 md:left-1/2 md:-translate-x-1/2 top-6 left-0 right-0 px-4 md:px-0`}
        style={{
          fontFamily: "var(--font-heading)",
        }}
      >
        {/* Desktop & Mobile Container */}
        <div className="relative w-full">
          {/* Main Navbar */}
          <div className="flex items-center justify-end md:justify-center gap-3 w-full md:w-fit mx-auto">
            {/* Logo Button */}
            <a 
              href="/#hero" 
              onClick={(e) => handleNavClick(e, "/#hero")}
              className="hidden md:flex items-center justify-center w-[46px] h-[46px] rounded-full bg-[#E8E8E8] hover:bg-[#DCDCDC] transition-all duration-300 shadow-sm"
              title="Pengu Learn Home"
            >
              <PenguIcon size={24} className="text-black" />
            </a>

            {/* Desktop Menu Pill */}
            <div className="hidden md:flex items-center bg-[#E8E8E8] rounded-full px-2 py-1.5 gap-0.5 shadow-sm">
              {navItems.map((item) => (
                <a
                  key={item.to}
                  href={item.to}
                  onClick={(e) => handleNavClick(e, item.to)}
                  className="desktop-nav-link px-5 py-1.5 rounded-full text-[14px] tracking-wide transition-all duration-300 whitespace-nowrap text-[#555555] hover:text-black font-medium hover:bg-[#DCDCDC]/50"
                  style={{ fontFamily: 'var(--font-body)' }}
                >
                  {item.label}
                </a>
              ))}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMenu}
              className={`md:hidden hamburger-toggle flex items-center justify-center w-[46px] h-[46px] rounded-[14px] bg-[#E8E8E8] hover:bg-[#DCDCDC] transition-all duration-300 ${isOpen ? "active" : ""}`}
              style={{ backgroundColor: isOpen ? 'transparent' : '#E8E8E8' }}
              aria-label="Toggle menu"
            >
              <div className="hamburger-line" style={{ backgroundColor: "#1a1a1a" }}></div>
              <div className="hamburger-line" style={{ backgroundColor: "#1a1a1a" }}></div>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Full Screen Menu */}
      <PhoneMenu
        isOpen={isOpen}
        toggleMenu={toggleMenu}
        isInstantClose={isInstantClose}
        setIsInstantClose={setIsInstantClose}
      />
    </>
  );
}
