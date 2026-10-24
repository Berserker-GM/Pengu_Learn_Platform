import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  CheckCircle,
  AlertCircle,
  Brain,
  FileText,
  PlusCircle,
  LogOut,
  RefreshCw,
  Sparkles,
  ArrowLeft,
  ArrowRight,
  Clock,
  Shield,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  AlertTriangle,
  ListChecks,
  Compass,
  Mail
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { LampContainer } from '../ui/lamp';

const OTP_LENGTH = 6;

const IdeaDashboard = () => {
  // ── Auth State ─────────────────────────────────────────────────────────────
  const [authEmail, setAuthEmail] = useState('');
  const [authOtp, setAuthOtp] = useState('');
  const [authStep, setAuthStep] = useState('email'); // 'email' | 'otp'
  const [authUser, setAuthUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authBusy, setAuthBusy] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authMessage, setAuthMessage] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  // ── Dashboard Tabs ─────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState('submissions'); // 'submissions' | 'submit' | 'counsel'

  // ── Submissions History State ──────────────────────────────────────────────
  const [myIdeas, setMyIdeas] = useState([]);
  const [loadingIdeas, setLoadingIdeas] = useState(false);
  const [ideasError, setIdeasError] = useState('');
  const [expandedIdeaId, setExpandedIdeaId] = useState(null);

  // ── Submit New Idea State ──────────────────────────────────────────────────
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    idea: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(''); // 'success' | 'error' | ''
  const [submitSuccessMessage, setSubmitSuccessMessage] = useState('');

  // ── AI Counsel State ───────────────────────────────────────────────────────
  const [counselDraft, setCounselDraft] = useState('');
  const [isGettingFeedback, setIsGettingFeedback] = useState(false);
  const [aiFeedback, setAiFeedback] = useState(null);
  const [aiError, setAiError] = useState('');

  // ── Cooldown timer for OTP ─────────────────────────────────────────────────
  useEffect(() => {
    if (!resendCooldown) return undefined;
    const timer = window.setInterval(() => {
      setResendCooldown((prev) => Math.max(prev - 1, 0));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [resendCooldown]);

  // ── Verify session on mount & auth change ──────────────────────────────────
  useEffect(() => {
    let active = true;

    const verifySession = async (session) => {
      if (!session?.access_token || !active) {
        if (active) {
          setAuthUser(null);
          setMyIdeas([]);
        }
        return;
      }

      try {
        const response = await fetch('/api/auth/session', {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        const data = await response.json();
        if (!response.ok) throw new Error('Session verification failed.');
        if (active) {
          setAuthUser(data.user);
          setFormData((prev) => ({ ...prev, email: data.user.email }));
        }
      } catch {
        await supabase?.auth.signOut();
        if (active) {
          setAuthUser(null);
          setMyIdeas([]);
        }
      }
    };

    if (!supabase) {
      setAuthLoading(false);
      return () => { active = false; };
    }

    supabase.auth.getSession().then(({ data }) => verifySession(data.session)).finally(() => {
      if (active) setAuthLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      void verifySession(session);
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  // ── Fetch User's Previous Ideas ────────────────────────────────────────────
  const fetchMyIdeas = useCallback(async () => {
    if (!authUser) return;
    setLoadingIdeas(true);
    setIdeasError('');

    try {
      const { data: sessionData } = (await supabase?.auth.getSession()) || { data: { session: null } };
      const accessToken = sessionData.session?.access_token;

      // First attempt: direct Supabase authenticated select
      if (supabase && accessToken) {
        const { data, error } = await supabase
          .from('idea_submissions')
          .select('id, created_at, name, email, idea, status')
          .order('created_at', { ascending: false });

        if (!error && Array.isArray(data)) {
          setMyIdeas(data);
          setLoadingIdeas(false);
          return;
        }
      }

      // Fallback: fetch through server API
      if (accessToken) {
        const response = await fetch('/api/my-ideas', {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        const result = await response.json();
        if (response.ok && Array.isArray(result.ideas)) {
          setMyIdeas(result.ideas);
          setLoadingIdeas(false);
          return;
        }
      }

      setMyIdeas([]);
    } catch (err) {
      console.error('Error fetching ideas:', err);
      setIdeasError('Unable to load past submissions. Please try refreshing.');
    } finally {
      setLoadingIdeas(false);
    }
  }, [authUser]);

  // Fetch ideas once authenticated or tab switched to submissions
  useEffect(() => {
    if (authUser) {
      fetchMyIdeas();
    }
  }, [authUser, fetchMyIdeas]);

  // ── Request OTP Handler ────────────────────────────────────────────────────
  const handleRequestOtp = async () => {
    const trimmedEmail = authEmail.trim().toLowerCase();
    if (!trimmedEmail) {
      setAuthError('Please enter your college email.');
      return;
    }
    if (!trimmedEmail.endsWith('@bmsit.in')) {
      setAuthError('Access is restricted to BMSIT students (@bmsit.in).');
      return;
    }
    if (authStep === 'otp' && resendCooldown > 0) return;

    setAuthBusy(true);
    setAuthError('');
    setAuthMessage('');
    try {
      const response = await fetch('/api/auth/request-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmedEmail }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Unable to send the verification code.');

      setAuthStep('otp');
      setResendCooldown(60);
      setAuthMessage(data.message || `A 6-digit code was sent to ${trimmedEmail}`);
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Unable to send the verification code.');
    } finally {
      setAuthBusy(false);
    }
  };

  // ── Verify OTP Handler ─────────────────────────────────────────────────────
  const handleVerifyOtp = async () => {
    if (!authOtp || authOtp.length !== OTP_LENGTH) {
      setAuthError('Please enter the full 6-digit code.');
      return;
    }

    setAuthBusy(true);
    setAuthError('');
    setAuthMessage('');
    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: authEmail.trim().toLowerCase(), token: authOtp.trim() }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'The verification code is invalid or expired.');
      if (!supabase) throw new Error('Authentication is not configured for this browser.');

      await supabase.auth.setSession({ access_token: data.access_token, refresh_token: data.refresh_token });
      setAuthUser(data.user);
      setFormData((prev) => ({ ...prev, email: data.user.email }));
      setAuthOtp('');
      setAuthMessage('Email verified successfully! Welcome to your Idea Dashboard.');
      setActiveTab('submissions');
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'The verification code is invalid or expired.');
    } finally {
      setAuthBusy(false);
    }
  };

  // ── Logout Handler ─────────────────────────────────────────────────────────
  const handleLogout = async () => {
    setAuthBusy(true);
    try {
      const { data } = (await supabase?.auth.getSession()) || { data: { session: null } };
      if (data.session?.access_token) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${data.session.access_token}` },
        });
      }
      await supabase?.auth.signOut();
      setAuthUser(null);
      setMyIdeas([]);
      setAuthStep('email');
      setAuthEmail('');
      setAuthOtp('');
      setAuthMessage('You have been signed out.');
    } finally {
      setAuthBusy(false);
    }
  };

  // ── Form Input Change Handler ──────────────────────────────────────────────
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (submitStatus) setSubmitStatus('');
  };

  // ── Submit New Idea Handler ────────────────────────────────────────────────
  const handleSubmitIdea = async (e) => {
    e?.preventDefault();
    setSubmitStatus('');
    setSubmitSuccessMessage('');

    const errors = {};
    if (!formData.name.trim()) errors.name = 'Please provide your full name';
    else if (formData.name.trim().length < 2) errors.name = 'Name must be at least 2 characters';

    const currentEmail = authUser?.email || formData.email;
    if (!currentEmail?.trim()) errors.email = 'Email address is required';

    if (!formData.idea.trim()) errors.idea = 'Please describe your startup concept';
    else if (formData.idea.trim().length < 50) errors.idea = 'Your idea description must be at least 50 characters';
    else if (formData.idea.trim().length > 5000) errors.idea = 'Idea must be under 5,000 characters';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setSubmitStatus('error');
      return;
    }

    const { data: sessionData } = (await supabase?.auth.getSession()) || { data: { session: null } };
    const accessToken = sessionData.session?.access_token;
    if (!accessToken || !authUser) {
      setSubmitStatus('error');
      setFormErrors({ general: 'Session expired. Please re-verify your college email.' });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/submit-idea', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: currentEmail.trim(),
          idea: formData.idea.trim(),
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setSubmitStatus('success');
        setSubmitSuccessMessage('Idea submitted successfully! It has been logged in your dashboard and queued for mentor review.');
        setFormData({ name: '', email: authUser?.email || '', idea: '' });
        setFormErrors({});
        // Refresh ideas list and switch tab after short delay
        fetchMyIdeas();
        setTimeout(() => {
          setActiveTab('submissions');
        }, 1800);
      } else {
        setSubmitStatus('error');
        if (data.details) {
          const newErrors = {};
          data.details.forEach((err) => {
            newErrors[err.path] = err.msg;
          });
          setFormErrors(newErrors);
        } else {
          setFormErrors({ general: data.error || 'Failed to submit idea. Please try again.' });
        }
      }
    } catch (error) {
      console.error('Submission error:', error);
      setSubmitStatus('error');
      setFormErrors({ general: 'Network error. Please try again later.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── AI Counsel Feedback Handler ────────────────────────────────────────────
  const handleGetCounselFeedback = async () => {
    const textToAnalyze = counselDraft.trim() || formData.idea.trim();
    if (!textToAnalyze) {
      setAiError('Please enter a draft idea before requesting AI feedback.');
      return;
    }
    if (textToAnalyze.length < 20) {
      setAiError('Please provide a slightly more descriptive idea (at least 20 characters).');
      return;
    }
    if (textToAnalyze.length > 5000) {
      setAiError('Please keep your idea draft within 5,000 characters.');
      return;
    }

    setIsGettingFeedback(true);
    setAiError('');
    setAiFeedback(null);

    try {
      const { data: sessionData } = (await supabase?.auth.getSession()) || { data: { session: null } };
      const accessToken = sessionData.session?.access_token;
      if (!accessToken || !authUser) {
        throw new Error('Verify your college email before requesting AI Counsel feedback.');
      }

      const response = await fetch('/api/counsel/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ idea: textToAnalyze }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Unable to generate AI Counsel feedback.');
      }
      setAiFeedback(data);
    } catch (error) {
      setAiError(error instanceof Error ? error.message : 'Unable to connect to AI Counsel.');
    } finally {
      setIsGettingFeedback(false);
    }
  };

  // ── Load idea into AI Counsel tab ──────────────────────────────────────────
  const handleLoadIdeaToCounsel = (ideaText) => {
    setCounselDraft(ideaText);
    setActiveTab('counsel');
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  // ── Load AI Counsel idea into Submit Form ──────────────────────────────────
  const handleTransferToSubmitForm = () => {
    setFormData((prev) => ({
      ...prev,
      idea: counselDraft || formData.idea,
    }));
    setActiveTab('submit');
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  // ── Format Date Helper ─────────────────────────────────────────────────────
  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      const d = new Date(dateString);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  // ─── AUTHENTICATION STATE: CHECKING ───────────────────────────────────
  if (authLoading) {
    return (
      <div className="w-full min-h-screen bg-black text-white flex flex-col items-center justify-center py-24 text-center">
        <div className="w-10 h-10 border-2 border-white/20 border-t-[#ff3b1f] rounded-full animate-spin mb-4" />
        <p className="text-neutral-400 text-sm">Verifying college credentials...</p>
      </div>
    );
  }

  // ─── AUTHENTICATION STATE: NOT LOGGED IN (EXACT LANDING PAGE LAMP DESIGN) ───
  if (!authUser) {
    return (
      <div className="w-full min-h-screen bg-black text-white relative idea-section-wrapper" style={{ fontFamily: 'var(--font-body)' }}>
        {/* Navigation Breadcrumb / Top Bar */}
        <div className="absolute top-6 left-6 sm:left-10 z-50">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-[6px] border border-white/70 bg-transparent text-white hover:bg-white/10 font-bold text-xs uppercase tracking-[0.18em] transition-all group shadow-sm"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Home</span>
          </Link>
        </div>

        {/* Exact Lamp Container from Landing Page */}
        <div className="w-full relative z-10">
          <LampContainer 
            className="min-h-screen py-16 md:py-0"
            lampClassName="translate-y-16 md:translate-y-24 lg:translate-y-28"
            contentClassName="translate-y-4 sm:translate-y-6 md:translate-y-0 lg:translate-y-4 pt-16 sm:pt-20 md:pt-14 pb-16"
          >
            <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
              {/* Left Column: Title & Description */}
              <div className="flex flex-col items-center lg:items-start text-center lg:text-left space-y-4 sm:space-y-5">
                <motion.h1
                  initial={{ opacity: 0.5, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: 0.3,
                    duration: 0.8,
                    ease: "easeInOut",
                  }}
                  style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(2.5rem, 5vw, 4.5rem)', fontWeight: 500, lineHeight: 1.08 }}
                  className="w-full bg-gradient-to-br from-white to-neutral-400 py-2 bg-clip-text tracking-normal text-transparent opacity-100 build-idea-text font-medium uppercase"
                >
                  BUILD<br />YOUR IDEA
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ delay: 0.5, duration: 1 }}
                  className="text-neutral-400 max-w-lg text-sm sm:text-base md:text-lg font-normal leading-relaxed"
                  style={{ fontFamily: 'var(--font-body)' }}
                >
                  Authenticate with your official BMSIT college email to access proposal history, submit ventures, and consult AI Counsel.
                </motion.p>
              </div>

              {/* Right Column: Verification Form Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="w-full max-w-[430px] mx-auto lg:max-w-[430px] lg:mr-0"
              >
              <div className="rounded-[8px] bg-black border border-white/70 px-6 sm:px-8 py-10 sm:py-12 shadow-2xl text-left min-h-[400px] sm:min-h-[440px] flex flex-col justify-center">
                {/* Clean Header - moved a bit up */}
                <div className="text-center mb-10 sm:mb-12">
                  <h3
                    className="text-xl sm:text-2xl font-bold text-white tracking-wide uppercase"
                    style={{ fontFamily: 'var(--font-heading)' }}
                  >
                    Student Verification
                  </h3>
                  <p className="text-xs sm:text-sm text-neutral-400 mt-2.5">
                    Authenticate with your official BMSIT email
                  </p>
                </div>

                {/* Step 1: Email Input */}
                {authStep === 'email' && (
                  <div className="space-y-8 sm:space-y-9">
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/70" />
                      <input
                        type="email"
                        value={authEmail}
                        onChange={(e) => {
                          setAuthEmail(e.target.value);
                          setAuthError('');
                        }}
                        placeholder="yourusn@bmsit.in"
                        disabled={authBusy}
                        className="w-full pl-11 pr-4 py-3.5 sm:py-4 rounded-[4px] bg-black border border-white/70 text-white placeholder-neutral-400 text-sm sm:text-base focus:outline-none focus:border-white transition-colors"
                      />
                    </div>

                    {/* Capsule Button Design matching BuildIdeaCTA - moved a bit down */}
                    <div className="border border-white/70 rounded-[6px] p-[5px] bg-black">
                      <button
                        type="button"
                        onClick={handleRequestOtp}
                        disabled={authBusy || !authEmail.trim()}
                        className="w-full py-3.5 sm:py-4 px-4 sm:px-6 rounded-[3px] bg-white text-black font-bold text-xs sm:text-sm uppercase tracking-[0.14em] sm:tracking-[0.16em] hover:bg-neutral-200 active:scale-[0.99] transition-all flex items-center justify-center gap-2 sm:gap-2.5 cursor-pointer disabled:cursor-not-allowed shadow-sm whitespace-nowrap"
                        style={{ fontFamily: 'var(--font-heading)' }}
                      >
                        {authBusy ? (
                          <>
                            <div className="w-3.5 h-3.5 border-2 border-black/40 border-t-black rounded-full animate-spin" />
                            <span>Sending...</span>
                          </>
                        ) : (
                          <>
                            <span>Send Verification Code</span>
                            <ArrowRight className="w-4 h-4 shrink-0" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 2: 6-Digit OTP */}
                {authStep === 'otp' && (
                  <div className="space-y-6 sm:space-y-7">
                    <div className="flex items-center justify-between text-xs text-neutral-400 px-0.5">
                      <span className="truncate">Sent to <strong className="text-white font-mono">{authEmail}</strong></span>
                      <button
                        type="button"
                        onClick={() => {
                          setAuthStep('email');
                          setAuthError('');
                        }}
                        className="text-[#ff6b35] hover:underline cursor-pointer shrink-0 ml-2 font-semibold"
                      >
                        Change
                      </button>
                    </div>

                    <input
                      type="text"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      maxLength={OTP_LENGTH}
                      value={authOtp}
                      onChange={(e) => {
                        setAuthOtp(e.target.value.replace(/\D/g, '').slice(0, OTP_LENGTH));
                        setAuthError('');
                      }}
                      placeholder="••••••"
                      disabled={authBusy}
                      className="w-full py-3.5 sm:py-4 px-4 rounded-[4px] bg-black border border-white/70 text-white text-center font-mono text-xl sm:text-2xl tracking-[0.45em] placeholder-neutral-500 focus:outline-none focus:border-white transition-colors"
                    />

                    <div className="flex items-center justify-between text-[11px] text-neutral-400 px-0.5">
                      <span>Didn't receive email?</span>
                      <button
                        type="button"
                        onClick={handleRequestOtp}
                        disabled={authBusy || resendCooldown > 0}
                        className="text-[#ff6b35] hover:underline disabled:opacity-40 cursor-pointer"
                      >
                        {resendCooldown > 0 ? `Resend (${resendCooldown}s)` : 'Resend code'}
                      </button>
                    </div>

                    {/* Capsule Button Design matching BuildIdeaCTA - moved a bit down */}
                    <div className="border border-white/70 rounded-[6px] p-[5px] bg-black mt-7 sm:mt-8">
                      <button
                        type="button"
                        onClick={handleVerifyOtp}
                        disabled={authBusy || authOtp.length !== OTP_LENGTH}
                        className="w-full py-3.5 sm:py-4 px-4 sm:px-6 rounded-[3px] bg-white text-black font-bold text-xs sm:text-sm uppercase tracking-[0.14em] sm:tracking-[0.16em] hover:bg-neutral-200 active:scale-[0.99] transition-all flex items-center justify-center gap-2 sm:gap-2.5 cursor-pointer disabled:cursor-not-allowed shadow-sm whitespace-nowrap"
                        style={{ fontFamily: 'var(--font-heading)' }}
                      >
                        {authBusy ? (
                          <>
                            <div className="w-3.5 h-3.5 border-2 border-black/40 border-t-black rounded-full animate-spin" />
                            <span>Verifying...</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4 shrink-0" />
                            <span>Verify & Enter Dashboard</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* Error & Success Messages */}
                {authError && (
                  <div className="mt-4 p-3.5 rounded-[4px] bg-black border border-red-500/70 text-red-400 text-xs sm:text-sm flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                    <span>{authError}</span>
                  </div>
                )}

                {authMessage && !authError && (
                  <div className="mt-3.5 text-white text-xs sm:text-sm flex items-center gap-2 px-1">
                    <CheckCircle className="w-4 h-4 text-white shrink-0" />
                    <span>{authMessage}</span>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </LampContainer>
        </div>
      </div>
    );
  }

  // ─── AUTHENTICATED STATE: FULL DASHBOARD ──────────────────────────────
  return (
    <div className="w-full min-h-screen bg-black text-white relative idea-section-wrapper" style={{ fontFamily: 'var(--font-body)' }}>
      {/* Navigation Breadcrumb / Top Bar */}
      <div className="absolute top-6 left-6 sm:left-10 z-50">
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-[6px] border border-white/70 bg-transparent text-white hover:bg-white/10 font-bold text-xs uppercase tracking-[0.18em] transition-all group shadow-sm"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Home</span>
        </Link>
      </div>

      {/* Exact Lamp Container matching Verification Page */}
      <div className="w-full relative z-10">
        <LampContainer 
          className="min-h-screen overflow-visible py-16 md:py-0"
          lampClassName="translate-y-48 md:translate-y-60 lg:translate-y-72"
          contentClassName="translate-y-12 sm:translate-y-16 md:translate-y-16 lg:translate-y-20 pt-28 sm:pt-32 md:pt-36 pb-32 w-full"
        >
          <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Page Hero Title (Authenticated Dashboard View) */}
            <div className="text-center mb-10">
              <h1
                className="text-3xl sm:text-4xl md:text-5xl font-bold uppercase tracking-wide text-white leading-tight"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                BUILD YOUR IDEA
              </h1>
              <p className="mt-2.5 text-neutral-400 text-sm sm:text-base max-w-2xl mx-auto">
                Venture incubation, structured idea submissions, and instant AI Counsel advisory.
              </p>
            </div>

        {/* ─── AUTHENTICATED STATE: FULL DASHBOARD ────────────────────────────── */}
        {!authLoading && authUser && (
          <div className="space-y-8">
            {/* User Session Bar */}
            <div className="p-4 sm:p-5 rounded-[8px] bg-black border border-white/70 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
              <div className="text-left">
                <h2 className="text-sm font-bold text-white uppercase tracking-wider text-left" style={{ fontFamily: 'var(--font-heading)' }}>
                  Student Venture Portal
                </h2>
                <p className="text-xs text-neutral-400 font-mono mt-0.5 text-left">
                  {authUser.email}
                </p>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={authBusy}
                  className="px-4 py-2 rounded-[4px] border border-white/70 bg-black text-white hover:bg-white hover:text-black text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-[8px] bg-black border border-white/70">
              <button
                type="button"
                onClick={() => setActiveTab('submissions')}
                className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-[4px] text-xs sm:text-sm font-bold uppercase tracking-[0.14em] transition-all cursor-pointer ${
                  activeTab === 'submissions'
                    ? 'bg-white text-black'
                    : 'bg-black text-white/70 hover:text-white hover:bg-white/10'
                }`}
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                <FileText className="w-4 h-4" />
                <span>My Submissions</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-[3px] font-mono ${activeTab === 'submissions' ? 'bg-black text-white' : 'border border-white/50 text-white'}`}>
                  {myIdeas.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('submit')}
                className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-[4px] text-xs sm:text-sm font-bold uppercase tracking-[0.14em] transition-all cursor-pointer ${
                  activeTab === 'submit'
                    ? 'bg-white text-black'
                    : 'bg-black text-white/70 hover:text-white hover:bg-white/10'
                }`}
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                <PlusCircle className="w-4 h-4" />
                <span>Submit New Idea</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('counsel')}
                className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-[4px] text-xs sm:text-sm font-bold uppercase tracking-[0.14em] transition-all cursor-pointer ${
                  activeTab === 'counsel'
                    ? 'bg-white text-black'
                    : 'bg-black text-white/70 hover:text-white hover:bg-white/10'
                }`}
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                <Brain className="w-4 h-4" />
                <span>AI Counsel</span>
              </button>
            </div>

            {/* ─── TAB 1: MY SUBMISSIONS (PREVIOUS IDEAS) ───────────────────────── */}
            {activeTab === 'submissions' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold uppercase tracking-tight text-white" style={{ fontFamily: 'var(--font-heading)' }}>
                      Your Submitted Ideas
                    </h2>
                  </div>

                  <button
                    type="button"
                    onClick={fetchMyIdeas}
                    disabled={loadingIdeas}
                    className="p-2.5 rounded-[4px] bg-black border border-white/70 text-white hover:bg-white hover:text-black transition-all disabled:opacity-50 cursor-pointer"
                    title="Refresh Submissions"
                  >
                    <RefreshCw className={`w-4 h-4 ${loadingIdeas ? 'animate-spin text-white' : ''}`} />
                  </button>
                </div>

                {ideasError && (
                  <div className="p-4 rounded-[4px] bg-black border border-red-500/70 text-red-400 text-sm flex items-center justify-between">
                    <span>{ideasError}</span>
                    <button type="button" onClick={fetchMyIdeas} className="text-xs text-white underline cursor-pointer">Try again</button>
                  </div>
                )}

                {loadingIdeas && (
                  <div className="space-y-4">
                    {[1, 2].map((i) => (
                      <div key={i} className="p-6 rounded-[8px] bg-black border border-white/30 animate-pulse space-y-3">
                        <div className="h-4 bg-white/20 rounded-[2px] w-1/4" />
                        <div className="h-16 bg-white/10 rounded-[2px] w-full" />
                        <div className="h-4 bg-white/20 rounded-[2px] w-1/3" />
                      </div>
                    ))}
                  </div>
                )}

                {!loadingIdeas && myIdeas.length === 0 && (
                  <div className="text-center py-16 px-6 rounded-[8px] bg-black border border-white/70 shadow-xl">
                    <FileText className="w-8 h-8 text-neutral-400 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-white uppercase tracking-wider" style={{ fontFamily: 'var(--font-heading)' }}>
                      No Ideas Submitted Yet
                    </h3>
                    <p className="text-neutral-400 text-sm max-w-md mx-auto mt-2 leading-relaxed">
                      You haven't pitched any concepts to E-Cell BMSIT yet. Have an innovative problem you're tackling? Pitch your first idea or run it through AI Counsel first!
                    </p>
                    <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                      <div className="border border-white/70 rounded-[6px] p-[5px] bg-black">
                        <button
                          type="button"
                          onClick={() => setActiveTab('submit')}
                          className="px-6 py-2.5 rounded-[3px] bg-white text-black text-xs sm:text-sm font-bold uppercase tracking-[0.16em] hover:bg-neutral-200 transition-all flex items-center gap-2 cursor-pointer"
                          style={{ fontFamily: 'var(--font-heading)' }}
                        >
                          <PlusCircle className="w-4 h-4" />
                          <span>Submit Your First Idea</span>
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => setActiveTab('counsel')}
                        className="px-6 py-3 rounded-[4px] border border-white/70 bg-black text-white hover:bg-white hover:text-black text-xs sm:text-sm font-bold uppercase tracking-[0.16em] transition-all flex items-center gap-2 cursor-pointer"
                        style={{ fontFamily: 'var(--font-heading)' }}
                      >
                        <Brain className="w-4 h-4" />
                        <span>Try AI Counsel</span>
                      </button>
                    </div>
                  </div>
                )}

                {!loadingIdeas && myIdeas.length > 0 && (
                  <div className="space-y-4">
                    {myIdeas.map((item, index) => {
                      const isExpanded = expandedIdeaId === item.id;
                      const isLong = item.idea && item.idea.length > 280;

                      return (
                        <div
                          key={item.id || index}
                          className="p-6 rounded-[8px] bg-black border border-white/70 shadow-lg space-y-4"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
                            <div className="flex items-center gap-3">
                              <span className="text-xs font-mono text-neutral-400">
                                #{item.id ? item.id.slice(0, 8) : `00${index + 1}`}
                              </span>
                              <span className="text-xs text-neutral-400 flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5 text-neutral-400" />
                                {formatDate(item.created_at)}
                              </span>
                            </div>

                            {/* Status Badge */}
                            <div>
                              {item.status === 'reviewed' ? (
                                <span className="inline-flex items-center gap-1.5 text-white text-xs font-bold uppercase tracking-wider">
                                  <CheckCircle className="w-3.5 h-3.5 text-white" />
                                  Reviewed by E-Cell
                                </span>
                              ) : item.status === 'archived' ? (
                                <span className="inline-flex items-center gap-1.5 text-neutral-400 text-xs font-semibold uppercase tracking-wider">
                                  Archived
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 text-white text-xs font-semibold uppercase tracking-wider">
                                  <Clock className="w-3.5 h-3.5 text-white" />
                                  Under Review
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Submitter Name */}
                          {item.name && (
                            <div className="text-sm font-bold text-white mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
                              Pitch by: {item.name}
                            </div>
                          )}

                          {/* Idea Text Content */}
                          <div className="text-neutral-300 text-sm leading-relaxed whitespace-pre-wrap font-sans py-1">
                            {isLong && !isExpanded ? `${item.idea.slice(0, 280)}...` : item.idea}
                          </div>

                          {/* Footer Actions */}
                          <div className="mt-4 pt-3 border-t border-white/20 flex flex-wrap items-center justify-between gap-3">
                            {isLong ? (
                              <button
                                type="button"
                                onClick={() => setExpandedIdeaId(isExpanded ? null : item.id)}
                                className="text-xs text-neutral-400 hover:text-white inline-flex items-center gap-1 transition-colors cursor-pointer"
                              >
                                {isExpanded ? (
                                  <><span>Show less</span><ChevronUp className="w-3.5 h-3.5" /></>
                                ) : (
                                  <><span>Read full idea</span><ChevronDown className="w-3.5 h-3.5" /></>
                                )}
                              </button>
                            ) : <div />}

                            <button
                              type="button"
                              onClick={() => handleLoadIdeaToCounsel(item.idea)}
                              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-[4px] border border-white/70 bg-black text-white hover:bg-white hover:text-black text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
                            >
                              <Brain className="w-3.5 h-3.5" />
                              <span>Get AI Counsel on this idea</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            )}

            {/* ─── TAB 2: SUBMIT NEW IDEA ───────────────────────────────────────── */}
            {activeTab === 'submit' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full"
              >
                <div className="p-6 sm:p-10 rounded-[8px] bg-black border border-white/70 shadow-2xl relative overflow-hidden">
                  <div className="mb-8">
                    <h2 className="text-2xl font-bold uppercase tracking-wide text-white" style={{ fontFamily: 'var(--font-heading)' }}>
                      Submit Your Startup Proposal
                    </h2>
                  </div>

                  {submitStatus === 'success' && (
                    <div className="mb-6 p-4 rounded-[4px] bg-black border border-white/70 text-white text-sm flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-white shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold uppercase tracking-wider text-xs">Submission Confirmed!</p>
                        <p className="text-neutral-300 text-xs mt-1">{submitSuccessMessage}</p>
                      </div>
                    </div>
                  )}

                  {formErrors.general && (
                    <div className="mb-6 p-4 rounded-[4px] bg-black border border-red-500/70 text-red-400 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                      <span>{formErrors.general}</span>
                    </div>
                  )}

                  <form onSubmit={handleSubmitIdea} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      {/* Full Name */}
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-2">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleFormChange}
                          placeholder="e.g. Vansh Sharma"
                          disabled={isSubmitting}
                          className={`w-full px-4 py-3.5 rounded-[4px] bg-black border text-white placeholder-neutral-400 focus:outline-none transition-colors text-sm ${
                            formErrors.name
                              ? 'border-red-500 ring-1 ring-red-500'
                              : 'border-white/70 focus:border-white'
                          }`}
                        />
                        {formErrors.name && (
                          <p className="text-red-400 text-xs mt-1.5">{formErrors.name}</p>
                        )}
                      </div>

                      {/* Verified Email (Locked) */}
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-2 flex items-center justify-between">
                          <span>Verified College Email</span>
                          <span className="text-[10px] text-white border border-white/50 px-1.5 py-0.2 rounded-[2px] font-normal uppercase">Auto-linked</span>
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={authUser?.email || formData.email}
                          disabled={true}
                          className="w-full px-4 py-3.5 rounded-[4px] bg-black border border-white/40 text-neutral-400 text-sm cursor-not-allowed font-mono opacity-80"
                        />
                      </div>
                    </div>

                    {/* Startup Idea Description */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-neutral-300">
                          Startup Concept & Problem Statement *
                        </label>
                        <span className={`text-xs ${formData.idea.length > 5000 ? 'text-red-400' : 'text-neutral-500'}`}>
                          {formData.idea.length} / 5,000 chars
                          {formData.idea.length > 0 && formData.idea.length < 50 && (
                            <span className="text-red-400 ml-1">({50 - formData.idea.length} more needed)</span>
                          )}
                        </span>
                      </div>

                      <textarea
                        name="idea"
                        value={formData.idea}
                        onChange={handleFormChange}
                        rows={7}
                        placeholder="Detail your venture idea, the pain point you are tackling, and your intended solution... (Minimum 50 characters)"
                        disabled={isSubmitting}
                        className={`w-full px-4 py-3.5 rounded-[4px] bg-black border text-white placeholder-neutral-400 focus:outline-none transition-colors text-sm leading-relaxed resize-y min-h-[160px] ${
                          formErrors.idea
                            ? 'border-red-500 ring-1 ring-red-500'
                            : 'border-white/70 focus:border-white'
                        }`}
                      />
                      {formErrors.idea && (
                        <p className="text-red-400 text-xs mt-1.5">{formErrors.idea}</p>
                      )}
                    </div>

                    {/* Action Row */}
                    <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          if (formData.idea) {
                            setCounselDraft(formData.idea);
                          }
                          setActiveTab('counsel');
                        }}
                        className="w-full sm:w-auto px-6 py-4 rounded-[4px] border border-white/70 bg-black hover:bg-white hover:text-black text-white text-xs sm:text-sm font-bold uppercase tracking-[0.16em] transition-all flex items-center justify-center gap-2 cursor-pointer"
                        style={{ fontFamily: 'var(--font-heading)' }}
                      >
                        <Brain className="w-4 h-4" />
                        <span>Test with AI Counsel First</span>
                      </button>

                      <div className="border border-white/70 rounded-[6px] p-[5px] bg-black w-full sm:flex-1">
                        <button
                          type="submit"
                          disabled={isSubmitting || !formData.name || formData.idea.length < 50}
                          className="w-full py-3.5 sm:py-4 px-6 rounded-[3px] bg-white text-black font-bold uppercase tracking-[0.16em] text-xs sm:text-sm hover:bg-neutral-200 active:scale-[0.99] transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                          style={{ fontFamily: 'var(--font-heading)' }}
                        >
                          {isSubmitting ? (
                            <>
                              <div className="w-4 h-4 border-2 border-black/40 border-t-black rounded-full animate-spin" />
                              <span>Submitting to E-Cell...</span>
                            </>
                          ) : (
                            <>
                              <Send className="w-4 h-4" />
                              <span>Submit Idea to E-Cell</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              </motion.div>
            )}

            {/* ─── TAB 3: AI COUNSEL ───────────────────────────────────────────────── */}
            {activeTab === 'counsel' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full space-y-6"
              >
                {/* 2-Column Responsive Split Layout (Equal 50/50 Width & Identical Height) */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-stretch">
                  
                  {/* ── LEFT COLUMN: ENTER IDEA CONSOLE (50% Width, Matched Height) ── */}
                  <div className="flex flex-col lg:h-[calc(100vh-210px)] min-h-[520px]">
                    <div className="p-6 sm:p-7 rounded-[8px] bg-black border border-white/70 flex flex-col h-full shadow-2xl overflow-hidden">
                      {/* Header */}
                      <div className="mb-5 shrink-0">
                        <div className="min-w-0">
                          <h2
                            className="text-lg sm:text-xl font-bold uppercase tracking-wide text-white leading-tight"
                            style={{ fontFamily: 'var(--font-heading)' }}
                          >
                            AI Counsel
                          </h2>
                        </div>
                      </div>

                      {/* Text Input Area (Flex-1 to fill exact available height) */}
                      <div className="flex-1 flex flex-col min-h-0 space-y-3">
                        <div className="flex items-center justify-between text-xs text-neutral-400 shrink-0">
                          <label className="font-mono uppercase tracking-wider text-[11px] text-neutral-300">
                            IDEA THESIS OR DRAFT
                          </label>
                          {formData.idea && (
                            <button
                              type="button"
                              onClick={() => setCounselDraft(formData.idea)}
                              className="text-white hover:underline text-[11px] font-medium cursor-pointer"
                            >
                              Load from Submit Tab
                            </button>
                          )}
                        </div>

                        <textarea
                          value={counselDraft}
                          onChange={(e) => {
                            setCounselDraft(e.target.value);
                            if (aiError) setAiError('');
                          }}
                          placeholder="Describe your startup concept, target customer, problem, and value proposition..."
                          disabled={isGettingFeedback}
                          className="w-full flex-1 min-h-[140px] px-4 py-3.5 rounded-[4px] bg-black border border-white/70 text-white placeholder-neutral-400 focus:outline-none focus:border-white transition-colors text-sm leading-relaxed resize-none font-mono"
                        />

                        <div className="flex items-center justify-between gap-3 text-xs text-neutral-500 font-mono shrink-0">
                          <span>{counselDraft.length} / 5,000 characters</span>
                          {counselDraft.trim().length > 0 && (
                            <button
                              type="button"
                              onClick={() => setCounselDraft('')}
                              className="text-neutral-400 hover:text-white transition-colors cursor-pointer"
                            >
                              Clear
                            </button>
                          )}
                        </div>

                        {/* Analyze Button */}
                        <div className="border border-white/70 rounded-[6px] p-[5px] bg-black w-full shrink-0">
                          <button
                            type="button"
                            onClick={handleGetCounselFeedback}
                            disabled={isGettingFeedback || !counselDraft.trim()}
                            className="w-full py-3.5 sm:py-4 px-6 rounded-[3px] bg-white text-black font-bold uppercase tracking-[0.16em] text-xs sm:text-sm hover:bg-neutral-200 active:scale-[0.99] transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                            style={{ fontFamily: 'var(--font-heading)' }}
                          >
                            {isGettingFeedback ? (
                              <>
                                <div className="w-4 h-4 border-2 border-black/40 border-t-black rounded-full animate-spin" />
                                <span>Counsel is Analyzing...</span>
                              </>
                            ) : (
                              <>
                                <Sparkles className="w-4 h-4" />
                                <span>Analyze with AI Counsel</span>
                              </>
                            )}
                          </button>
                        </div>

                        {aiError && (
                          <div className="p-3 rounded-[4px] bg-black border border-red-500/70 text-red-400 text-xs flex items-center gap-2.5 shrink-0">
                            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                            <span>{aiError}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* ── RIGHT COLUMN: AI RESULT PANE (50% Width, Matched Height) ──── */}
                  <div className="flex flex-col lg:h-[calc(100vh-210px)] min-h-[520px]">
                    <div className="rounded-[8px] bg-black border border-white/70 flex flex-col h-full overflow-hidden shadow-2xl">
                      
                      {/* Result Pane Top Bar */}
                      <div className="px-6 py-4 border-b border-white/70 bg-black flex items-center justify-between gap-4 shrink-0">
                        <div className="flex items-center gap-2.5">
                          {isGettingFeedback ? (
                            <>
                              <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                              <span className="text-[11px] font-mono tracking-[0.2em] uppercase text-white font-semibold">
                                GENERATING DIAGNOSIS...
                              </span>
                            </>
                          ) : aiFeedback ? (
                            <>
                              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                              <span className="text-[11px] font-mono tracking-[0.2em] uppercase text-white font-semibold">
                                ADVISORY CRITIQUE READY
                              </span>
                            </>
                          ) : (
                            <>
                              <span className="w-2 h-2 rounded-full bg-neutral-600" />
                              <span className="text-[11px] font-mono tracking-[0.2em] uppercase text-neutral-400 font-semibold">
                                AWAITING ANALYSIS
                              </span>
                            </>
                          )}
                        </div>

                        {aiFeedback && (
                          <button
                            type="button"
                            onClick={handleTransferToSubmitForm}
                            className="px-3.5 py-1.5 rounded-[4px] border border-white/70 bg-white text-black hover:bg-neutral-200 active:scale-[0.98] transition-all font-bold uppercase tracking-wider text-[11px] flex items-center gap-1.5 shrink-0 cursor-pointer"
                            style={{ fontFamily: 'var(--font-heading)' }}
                          >
                            <span>Apply to Form</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      {/* Result Pane Scrollable Body (Fits Screen) */}
                      <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 counsel-scrollbar">
                        
                        {/* State 1: Awaiting Input / Empty */}
                        {!aiFeedback && !isGettingFeedback && (
                          <div className="h-full min-h-[360px] flex flex-col items-center justify-center text-center p-6 sm:p-10 my-auto">
                            <Brain className="w-8 h-8 text-neutral-400 mb-4" />
                            <h3
                              className="text-base sm:text-lg font-bold uppercase tracking-wider text-white"
                              style={{ fontFamily: 'var(--font-heading)' }}
                            >
                              No Analysis Generated Yet
                            </h3>
                            <p className="text-neutral-400 text-xs sm:text-sm max-w-sm mt-2 leading-relaxed font-sans">
                              Write or paste your startup idea on the left, then click <strong className="text-white">"Analyze with AI Counsel"</strong>. Your structured critique, constraint matrix, and validation steps will appear right here without leaving this view.
                            </p>
                          </div>
                        )}

                        {/* State 2: Evaluating Active Loader */}
                        {isGettingFeedback && (
                          <div className="h-full min-h-[360px] flex flex-col items-center justify-center text-center p-6 sm:p-10 my-auto space-y-5">
                            <div className="relative">
                              <div className="w-14 h-14 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                              <Brain className="w-6 h-6 text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                            </div>
                            <div>
                              <h3
                                className="text-white font-bold text-base sm:text-lg uppercase tracking-wider"
                                style={{ fontFamily: 'var(--font-heading)' }}
                              >
                                Evaluating Venture Viability...
                              </h3>
                              <p className="text-neutral-400 text-xs max-w-md mx-auto mt-2 leading-relaxed">
                                Inspecting problem validity, structural constraints, customer adoption hurdles, and research experiments.
                              </p>
                            </div>
                          </div>
                        )}

                        {/* State 3: Complete Structured Feedback Cards */}
                        {aiFeedback && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-4"
                          >
                            {/* Section 1: Core Understanding */}
                            <div className="p-5 rounded-[6px] bg-black border border-white/70 space-y-2">
                              <div className="flex items-center gap-2 text-white font-bold uppercase tracking-wider text-xs">
                                <Lightbulb className="w-4 h-4 shrink-0" />
                                <span>1. Core Proposition & Value Thesis</span>
                              </div>
                              <p className="text-neutral-200 text-xs sm:text-sm leading-relaxed">
                                {aiFeedback.understanding}
                              </p>
                            </div>

                            {/* Section 2: Strategic Questions */}
                            <div className="p-5 rounded-[6px] bg-black border border-white/70 space-y-2">
                              <div className="flex items-center gap-2 text-white font-bold uppercase tracking-wider text-xs">
                                <HelpCircle className="w-4 h-4 shrink-0" />
                                <span>2. Strategic Questions to Answer</span>
                              </div>
                              <div className="space-y-2">
                                {aiFeedback.questions?.map((item, idx) => (
                                  <div key={idx} className="p-3 rounded-[4px] bg-black border border-white/40 text-xs sm:text-sm text-neutral-200 flex items-start gap-2.5">
                                    <span className="w-4 h-4 rounded-[2px] bg-white text-black text-[10px] flex items-center justify-center shrink-0 font-bold mt-0.5">
                                      {idx + 1}
                                    </span>
                                    <span className="leading-relaxed">{item}</span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Section 3: Constraints & Risks */}
                            <div className="p-5 rounded-[6px] bg-black border border-white/70 space-y-2">
                              <div className="flex items-center gap-2 text-white font-bold uppercase tracking-wider text-xs">
                                <AlertTriangle className="w-4 h-4 shrink-0" />
                                <span>3. Key Constraints & Structural Risks</span>
                              </div>
                              <div className="space-y-2">
                                {aiFeedback.constraints?.map((item, idx) => (
                                  <div key={idx} className="p-3 rounded-[4px] bg-black border border-white/40 text-xs sm:text-sm text-neutral-200 flex items-start gap-2.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-white shrink-0 mt-2" />
                                    <span className="leading-relaxed">{item}</span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Section 4: Research Tasks */}
                            <div className="p-5 rounded-[6px] bg-black border border-white/70 space-y-2">
                              <div className="flex items-center gap-2 text-white font-bold uppercase tracking-wider text-xs">
                                <ListChecks className="w-4 h-4 shrink-0" />
                                <span>4. Validation & Research Experiments</span>
                              </div>
                              <div className="space-y-2">
                                {aiFeedback.researchTasks?.map((item, idx) => (
                                  <div key={idx} className="p-3 rounded-[4px] bg-black border border-white/40 text-xs sm:text-sm text-neutral-200 flex items-start gap-2.5">
                                    <span className="w-4 h-4 rounded-[2px] bg-white text-black text-[10px] flex items-center justify-center shrink-0 font-bold mt-0.5">
                                      ✓
                                    </span>
                                    <span className="leading-relaxed">{item}</span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Section 5: Next Step */}
                            <div className="p-5 rounded-[6px] bg-black border border-white/70 space-y-2">
                              <div className="flex items-center gap-2 text-white font-bold uppercase tracking-wider text-xs">
                                <Compass className="w-4 h-4 shrink-0" />
                                <span>5. Recommended Immediate Next Step</span>
                              </div>
                              <p className="text-white text-xs sm:text-sm font-medium leading-relaxed">
                                {aiFeedback.nextStep}
                              </p>
                            </div>

                            {/* Disclaimer */}
                            <div className="p-3 rounded-[4px] bg-black border border-white/40 text-neutral-400 text-[11px] leading-relaxed text-center">
                              {aiFeedback.disclaimer || 'AI feedback is for early exploration only. Verify assumptions with real users and mentors; it is not professional, legal, financial, or investment advice.'}
                            </div>
                          </motion.div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        )}
            </div>
          </LampContainer>
        </div>
      </div>
    );
};

export default IdeaDashboard;
