import React, { useState, useEffect, useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
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
    if (!isOpen) setIsInstantClose(false);
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    const controlNavbar = () => {
      const currentScrollY = window.scrollY;
      if (loading) setIsVisible(false);
      else if (currentScrollY < 100 || currentScrollY < lastScrollY) setIsVisible(true);
      else if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
        setIsOpen(false);
      }
      setLastScrollY(currentScrollY);
    };
    window.addEventListener("scroll", controlNavbar);
    controlNavbar();
    return () => window.removeEventListener("scroll", controlNavbar);
  }, [lastScrollY, loading]);

  const navItems = [
    { to: "/#hero", label: "Home" },
    { to: "/#the-idea", label: "The Idea" },
    { to: "/#how-it-feels", label: "How It Works" },
    { to: "/#download", label: "Download" },
    { to: "/#footer", label: "Contact" },
  ];

  const handleNavClick = (e, targetHref) => {
    if (targetHref.startsWith("/#") && location.pathname === "/") {
      e.preventDefault();
      const hash = targetHref.replace("/", "");
      const element = document.getElementById(hash.substring(1));
      if (element) {
        const topPosition = element.getBoundingClientRect().top + window.scrollY - 88;
        window.scrollTo({ top: topPosition, behavior: "smooth" });
        window.history.pushState(null, "", hash);
      }
    }
  };

  return (
    <>
      <nav
        className={`fixed z-[99999] transition-all duration-500 ease-in-out ${
          isVisible ? "translate-y-0 opacity-100" : "-translate-y-24 opacity-0"
        } top-4 left-3 right-3 md:top-5 md:left-1/2 md:right-auto md:-translate-x-1/2`}
        style={{ fontFamily: "var(--font-heading)" }}
      >
        <div className="flex items-center justify-between gap-2 rounded-md border border-white/10 bg-black px-2 py-1 text-white shadow-lg md:w-max md:rounded-md md:px-2">
          <a
            href="/#hero"
            onClick={(e) => handleNavClick(e, "/#hero")}
            className="flex shrink-0 items-center gap-2 rounded-sm py-0.5 pl-1 pr-2 transition-colors hover:bg-white/10"
            title="Pengu Learn Home"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-sky-300 text-neutral-950">
              <PenguIcon size={22} />
            </span>
            <span className="text-sm font-bold tracking-tight">Pengu<span className="text-sky-300">Learn</span></span>
          </a>

          <div className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => (
              <a
                key={item.to}
                href={item.to}
                onClick={(e) => handleNavClick(e, item.to)}
                className="desktop-nav-link rounded-full px-3 py-1.5 text-[12px] font-medium text-white/65 transition-all duration-200 hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300"
                style={{ fontFamily: "var(--font-body)" }}
              >
                {item.label}
              </a>
            ))}
          </div>

          <a
            href="/#download"
            onClick={(e) => handleNavClick(e, "/#download")}
            className="hidden shrink-0 items-center gap-1.5 rounded-full bg-sky-300 px-3.5 py-2 text-xs font-bold text-neutral-950 transition-colors hover:bg-sky-200 md:inline-flex"
          >
            Get Pengu <ArrowUpRight size={14} />
          </a>

          <button
            onClick={toggleMenu}
            className={`md:hidden hamburger-toggle flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/10 transition-all ${isOpen ? "active" : ""}`}
            aria-label={isOpen ? "Close menu" : "Open menu"}
            aria-expanded={isOpen}
          >
            <span className="hamburger-line" />
            <span className="hamburger-line" />
          </button>
        </div>
      </nav>

      <PhoneMenu
        isOpen={isOpen}
        toggleMenu={toggleMenu}
        isInstantClose={isInstantClose}
        setIsInstantClose={setIsInstantClose}
      />
    </>
  );
}

