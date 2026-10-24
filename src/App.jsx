import {
  useState,
  useEffect,
  createContext,
  useRef,
  Suspense,
  lazy,
  Component
} from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { Sun, Moon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Analytics } from "@vercel/analytics/react";
import Navbar from "./components/Navbar/Navbar";
import Preloader from "./components/Preloader/Preloader";
import Home from "./Pages/Home";
import "./App.css";

const NotFound = lazy(() => import("./Pages/NotFound.jsx"));

const CHUNK_RECOVERY_KEY = "pengu-chunk-recovery";

const ClearChunkRecoveryMarker = () => {
  useEffect(() => {
    try {
      sessionStorage.removeItem(CHUNK_RECOVERY_KEY);
    } catch {
      // Storage may be unavailable in restricted contexts.
    }
  }, []);

  return null;
};

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error("Runtime error caught by boundary:", error, errorInfo);

    const message = error?.message || String(error);
    const isChunkLoadError = /failed to fetch dynamically imported module|importing a module script failed|loading chunk .* failed|chunkloaderror|failed to load module script/i.test(message);

    if (isChunkLoadError) {
      const failedResource = message.match(/https?:\/\/[^\s]+|\/assets\/[^\s]+/)?.[0] || message;

      try {
        const previousFailure = sessionStorage.getItem(CHUNK_RECOVERY_KEY);
        if (previousFailure !== failedResource) {
          sessionStorage.setItem(CHUNK_RECOVERY_KEY, failedResource);
          window.location.reload();
        }
      } catch {
        // Fall through
      }
    }
  }
  render() {
    if (this.state.hasError) {
      return (
        <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: "2rem", background: "#0a0a0a", color: "#f5f5f5", fontFamily: "system-ui, sans-serif" }}>
          <section role="alert" style={{ width: "min(100%, 32rem)", textAlign: "center" }}>
            <h1 style={{ margin: "0 0 0.75rem", fontSize: "clamp(1.75rem, 5vw, 2.5rem)" }}>We couldn’t load this page</h1>
            <p style={{ margin: "0 0 1.5rem", color: "#888", lineHeight: 1.6 }}>
              The application may have updated. Reload the page to load the latest build.
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              style={{ border: 0, borderRadius: "999px", padding: "0.8rem 1.6rem", background: "#38bdf8", color: "#000", font: "inherit", fontWeight: 700, cursor: "pointer" }}
            >
              Reload page
            </button>
          </section>
        </main>
      );
    }
    return this.props.children;
  }
}

export const PreloaderContext = createContext();

// NavigationWatcher: Component that listens for route changes
const NavigationWatcher = ({ setLoading, setShowContent, setDisplayLocation }) => {
  const location = useLocation();
  const prevPath = useRef(location.pathname);

  useEffect(() => {
    if (prevPath.current !== location.pathname) {
      setDisplayLocation(location);
      setLoading(true);
      setShowContent(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
      prevPath.current = location.pathname;
    }
  }, [location, setLoading, setShowContent, setDisplayLocation]);

  return null;
};

function App() {
  const location = useLocation();
  const [displayLocation, setDisplayLocation] = useState(location);
  const [loading, setLoading] = useState(true);
  const [showContent, setShowContent] = useState(false);
  const [themePreference, setThemePreference] = useState(() => localStorage.getItem("pengu-theme-preference") || "light");

  const isLightMode = themePreference === "light";

  const handleThemeToggle = (event) => {
    const isKeyboardTrigger = event?.clientX === 0 && event?.clientY === 0;
    const fallbackX = window.innerWidth - 28;
    const fallbackY = window.innerHeight - 28;
    const clickX = isKeyboardTrigger ? fallbackX : event.clientX;
    const clickY = isKeyboardTrigger ? fallbackY : event.clientY;

    document.documentElement.style.setProperty('--theme-toggle-x', `${clickX}px`);
    document.documentElement.style.setProperty('--theme-toggle-y', `${clickY}px`);

    const nextTheme = isLightMode ? "dark" : "light";
    const applyTheme = () => {
      localStorage.setItem("pengu-theme-preference", nextTheme);
      setThemePreference(nextTheme);
    };

    if (typeof document.startViewTransition !== 'function') {
      applyTheme();
      return;
    }

    document.startViewTransition(() => {
      applyTheme();
    });
  };

  const handlePreloaderComplete = () => {
    setDisplayLocation(location);
    setLoading(false);
    setTimeout(() => setShowContent(true), 100);
  };

  return (
    <ErrorBoundary>
      <PreloaderContext.Provider value={{ loading, setLoading }}>
        <NavigationWatcher
          setLoading={setLoading}
          setShowContent={setShowContent}
          setDisplayLocation={setDisplayLocation}
        />
        <Navbar />
        <div className="relative pt-0">
          <AnimatePresence mode="wait">
            {loading ? (
              <Preloader key="preloader" onComplete={handlePreloaderComplete} />
            ) : (
              <motion.div
                key="content"
                initial={{ opacity: 0 }}
                animate={{ opacity: showContent ? 1 : 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className={`min-h-screen ${isLightMode ? 'light-theme' : ''}`}
              >
                <Suspense fallback={<div className="min-h-screen"></div>}>
                  <ClearChunkRecoveryMarker />
                  <Routes location={displayLocation}>
                    <Route path="/" element={<Home />} />
                    <Route path="/download" element={<Home />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
              </motion.div>
            )}
          </AnimatePresence>

          {!loading && (
            <button
              type="button"
              role="switch"
              aria-checked={isLightMode}
              aria-label={isLightMode ? 'Switch to dark mode' : 'Switch to light mode'}
              title={isLightMode ? 'Switch to dark mode' : 'Switch to light mode'}
              onClick={handleThemeToggle}
              className={`theme-toggle preserve-color ${isLightMode ? 'theme-toggle--light' : 'theme-toggle--dark'}`}
            >
              {isLightMode ? <Moon size={22} /> : <Sun size={22} />}
            </button>
          )}
        </div>
        <Analytics />
      </PreloaderContext.Provider>
    </ErrorBoundary>
  );
}

const AppWrapper = () => (
  <Router>
    <App />
  </Router>
);

export default AppWrapper;
