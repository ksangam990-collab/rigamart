import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { loginWithGoogle, clearError } from '../../features/auth/authSlice.js';

export default function GoogleAuthButton({
  mode = 'login',
  role = 'customer',
  enableOneTap = true,
  onSuccess
}) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoading } = useSelector((state) => state.auth);

  const googleBtnContainerRef = useRef(null);
  const [gisLoaded, setGisLoaded] = useState(false);
  const [localLoading, setLocalLoading] = useState(false);

  const clientId =
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GOOGLE_CLIENT_ID) ||
    '618958392141-fij6dape2cl1plhnhg02sirp0flhnmei.apps.googleusercontent.com';

  const redirectPath = location.state?.from?.pathname || '/';

  // Handle Google Credential Response (from One-Tap or Button click)
  const handleCredentialResponse = async (response) => {
    if (!response?.credential) return;

    dispatch(clearError());
    setLocalLoading(true);

    try {
      const result = await dispatch(
        loginWithGoogle({
          credential: response.credential,
          role
        })
      );

      if (loginWithGoogle.fulfilled.match(result)) {
        if (onSuccess) {
          onSuccess(result.payload);
        } else {
          navigate(redirectPath, { replace: true });
        }
      }
    } finally {
      setLocalLoading(false);
    }
  };

  // Dynamically load Google Identity Services script
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (window.google?.accounts?.id) {
      setGisLoaded(true);
      return;
    }

    const scriptId = 'google-gsi-client-script';
    let script = document.getElementById(scriptId);

    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => setGisLoaded(true);
      script.onerror = () => {
        console.warn('Google Identity Services script failed to load. Using fallback button.');
      };
      document.head.appendChild(script);
    } else {
      script.addEventListener('load', () => setGisLoaded(true));
    }
  }, []);

  // Initialize GIS and render button + One-Tap
  useEffect(() => {
    if (!gisLoaded || !window.google?.accounts?.id || !clientId) return;

    try {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleCredentialResponse,
        auto_select: false,
        cancel_on_tap_outside: true,
        itp_support: true
      });

      // Render official Google button into ref if present
      if (googleBtnContainerRef.current) {
        googleBtnContainerRef.current.innerHTML = '';
        window.google.accounts.id.renderButton(googleBtnContainerRef.current, {
          theme: 'outline',
          size: 'large',
          width: 360,
          text: mode === 'register' ? 'signup_with' : 'signin_with',
          shape: 'rectangular',
          logo_alignment: 'left'
        });
      }

      // Display Google One-Tap prompt if enabled
      if (enableOneTap) {
        window.google.accounts.id.prompt((notification) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            // Dismissed or ignored, fallback button remains active
          }
        });
      }
    } catch (err) {
      console.warn('GIS initialization error:', err);
    }
  }, [gisLoaded, clientId, mode, role, enableOneTap]);

  // Fallback trigger for local dev or custom click
  const handleFallbackClick = () => {
    if (window.google?.accounts?.id) {
      window.google.accounts.id.prompt();
    } else {
      // In dev or sandbox environments where Google API is blocked or offline,
      // simulate demo authentication for developer testing
      alert('Google Identity Services is initializing. Please click again in a moment or sign in with your email & password.');
    }
  };

  const isBusy = isLoading || localLoading;

  return (
    <div className="w-full space-y-2">
      {/* Official Google Button Container */}
      <div
        ref={googleBtnContainerRef}
        className={`w-full flex justify-center min-h-[44px] ${
          !gisLoaded ? 'hidden' : 'block'
        }`}
      />

      {/* Modern Accessible Fallback Button (visible while GIS loads or as alternative) */}
      {!gisLoaded && (
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          type="button"
          onClick={handleFallbackClick}
          disabled={isBusy}
          className="w-full py-2.5 px-4 bg-white hover:bg-gray-50 active:bg-gray-100 border border-gray-300 text-gray-700 font-semibold text-xs sm:text-sm rounded-lg shadow-xs transition-all flex items-center justify-center gap-3 disabled:opacity-60 cursor-pointer"
        >
          {isBusy ? (
            <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
          ) : (
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
          )}
          <span>{mode === 'register' ? 'Sign up with Google' : 'Continue with Google'}</span>
        </motion.button>
      )}
    </div>
  );
}
