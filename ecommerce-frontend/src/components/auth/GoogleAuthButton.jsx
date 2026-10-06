import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { loginWithGoogle, clearError } from '../../features/auth/authSlice.js';

export default function GoogleAuthButton({
  mode = 'login',
  role = 'customer',
  onSuccess
}) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoading } = useSelector((state) => state.auth);

  const [gisLoaded, setGisLoaded] = useState(false);
  const [localLoading, setLocalLoading] = useState(false);
  const tokenClientRef = useRef(null);
  const popupTimeoutRef = useRef(null);

  const clientId =
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GOOGLE_CLIENT_ID) ||
    '618958392141-fij6dape2cl1plhnhg02sirp0flhnmei.apps.googleusercontent.com';

  const redirectPath = location.state?.from?.pathname || '/';

  // Handle Google Credential Response
  const handleCredentialResponse = async (credential) => {
    if (!credential) {
      setLocalLoading(false);
      return;
    }

    dispatch(clearError());
    setLocalLoading(true);

    try {
      const result = await dispatch(
        loginWithGoogle({
          credential,
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
    } catch (err) {
      console.error('Google login dispatch error:', err);
    } finally {
      setLocalLoading(false);
    }
  };

  // Dynamically load Google Identity Services client script
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (window.google?.accounts?.oauth2) {
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
        console.warn('Google Identity Services script failed to load.');
      };
      document.head.appendChild(script);
    } else {
      script.addEventListener('load', () => setGisLoaded(true));
    }
  }, []);

  // Initialize and cache Token Client instance
  useEffect(() => {
    if (!gisLoaded || !window.google?.accounts?.oauth2 || !clientId) return;

    try {
      tokenClientRef.current = window.google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: 'email profile openid',
        callback: async (tokenResponse) => {
          if (popupTimeoutRef.current) clearTimeout(popupTimeoutRef.current);
          if (tokenResponse?.error) {
            setLocalLoading(false);
            return;
          }
          if (tokenResponse?.access_token) {
            await handleCredentialResponse(tokenResponse.access_token);
          } else {
            setLocalLoading(false);
          }
        },
        error_callback: (error) => {
          if (popupTimeoutRef.current) clearTimeout(popupTimeoutRef.current);
          console.warn('Google sign-in popup closed or cancelled:', error);
          setLocalLoading(false);
        }
      });
    } catch (err) {
      console.warn('Failed to initialize Google token client:', err);
    }
  }, [gisLoaded, clientId, role]);

  // Listen for OAuth token in URL hash (in case redirect fallback was triggered)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const hash = window.location.hash;
    if (hash && hash.includes('access_token=')) {
      const params = new URLSearchParams(hash.replace('#', ''));
      const token = params.get('access_token');
      if (token) {
        window.history.replaceState(null, '', window.location.pathname);
        handleCredentialResponse(token);
      }
    }
  }, []);

  // Window focus listener to auto-reset loading if user cancels popup
  useEffect(() => {
    const handleWindowFocus = () => {
      // When user returns to window, give 1.2s for any in-flight token, then release loading
      if (localLoading) {
        setTimeout(() => {
          setLocalLoading(false);
        }, 1200);
      }
    };

    window.addEventListener('focus', handleWindowFocus);
    return () => {
      window.removeEventListener('focus', handleWindowFocus);
      if (popupTimeoutRef.current) clearTimeout(popupTimeoutRef.current);
    };
  }, [localLoading]);

  // Click handler that never locks up
  const handleGoogleClick = () => {
    dispatch(clearError());

    // If client is already ready, request access token
    if (tokenClientRef.current) {
      setLocalLoading(true);

      // Auto-unlock after 30 seconds max as failsafe
      popupTimeoutRef.current = setTimeout(() => {
        setLocalLoading(false);
      }, 30000);

      tokenClientRef.current.requestAccessToken({ prompt: 'select_account' });
      return;
    }

    // If script is loaded but ref not yet created, create on the fly
    if (window.google?.accounts?.oauth2) {
      setLocalLoading(true);
      try {
        const client = window.google.accounts.oauth2.initTokenClient({
          client_id: clientId,
          scope: 'email profile openid',
          callback: async (tokenResponse) => {
            if (tokenResponse?.access_token) {
              await handleCredentialResponse(tokenResponse.access_token);
            } else {
              setLocalLoading(false);
            }
          },
          error_callback: () => {
            setLocalLoading(false);
          }
        });
        tokenClientRef.current = client;
        client.requestAccessToken({ prompt: 'select_account' });
      } catch (e) {
        console.error('Google OAuth init error:', e);
        setLocalLoading(false);
      }
      return;
    }

    // Direct fallback if script is blocked or offline
    const redirectUri = window.location.origin + '/login';
    const oauthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&response_type=token&scope=email%20profile%20openid&prompt=select_account`;
    window.location.href = oauthUrl;
  };

  const isBusy = isLoading || localLoading;

  return (
    <div className="w-full">
      <motion.button
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        type="button"
        onClick={handleGoogleClick}
        disabled={isBusy}
        className="w-full py-2.5 px-4 bg-white hover:bg-gray-50 active:bg-gray-100 border border-gray-300 text-gray-700 font-semibold text-xs sm:text-sm rounded-xl shadow-xs transition-all flex items-center justify-center gap-3 disabled:opacity-70 cursor-pointer"
        aria-label="Sign in with Google"
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
        <span>{mode === 'register' ? 'Sign up with Google' : 'Sign in with Google'}</span>
      </motion.button>
    </div>
  );
}
