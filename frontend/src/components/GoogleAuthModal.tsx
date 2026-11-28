import React, { useState, useEffect, useRef } from 'react';
import { X, ShieldCheck, Loader2, Bookmark, Settings, ExternalLink, KeyRound } from 'lucide-react';
import { authenticateWithGoogle, AuthUser } from '../services/auth';

interface GoogleAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: AuthUser) => void;
  pendingPlaceName?: string;
}

const STORAGE_CLIENT_ID_KEY = 'bango_google_client_id';

export const GoogleAuthModal: React.FC<GoogleAuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  pendingPlaceName,
}) => {
  const envClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
  const [customClientId, setCustomClientId] = useState(() => {
    return localStorage.getItem(STORAGE_CLIENT_ID_KEY) || '';
  });
  const [clientIdInput, setClientIdInput] = useState('');
  const [showConfig, setShowConfig] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const googleBtnRef = useRef<HTMLDivElement>(null);

  const activeClientId = envClientId || customClientId;

  // Initialize official Google Identity Services (GIS) when modal opens and client ID exists
  useEffect(() => {
    if (!isOpen || !activeClientId) return;

    const initGsi = () => {
      const g = (window as any).google;
      if (!g?.accounts?.id) return;

      try {
        g.accounts.id.initialize({
          client_id: activeClientId,
          callback: async (response: any) => {
            if (response.credential) {
              setIsLoading(true);
              setErrorMsg(null);
              try {
                const user = await authenticateWithGoogle({ credential: response.credential });
                onLoginSuccess(user);
                onClose();
              } catch (err: any) {
                setErrorMsg(err.message || 'Google authentication failed');
              } finally {
                setIsLoading(false);
              }
            }
          },
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        if (googleBtnRef.current) {
          googleBtnRef.current.innerHTML = '';
          g.accounts.id.renderButton(googleBtnRef.current, {
            theme: 'filled_black',
            size: 'large',
            width: 320,
            text: 'continue_with',
            shape: 'pill',
            logo_alignment: 'left',
          });
        }
      } catch (e) {
        console.warn('Google GSI initialization warning:', e);
      }
    };

    // Attempt initialization; if script is still loading, wait a moment
    if ((window as any).google?.accounts?.id) {
      initGsi();
    } else {
      const timer = setInterval(() => {
        if ((window as any).google?.accounts?.id) {
          clearInterval(timer);
          initGsi();
        }
      }, 250);
      return () => clearInterval(timer);
    }
  }, [isOpen, activeClientId, showConfig]);

  if (!isOpen) return null;

  // Trigger Google OAuth 2.0 Popup via Google Identity Services
  const handleGoogleOAuthPopup = () => {
    if (!activeClientId) {
      setShowConfig(true);
      return;
    }

    const g = (window as any).google;
    if (!g?.accounts?.oauth2) {
      setErrorMsg('Google authentication services are still loading. Please check your internet connection.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const tokenClient = g.accounts.oauth2.initTokenClient({
        client_id: activeClientId,
        scope: 'openid email profile',
        callback: async (tokenResponse: any) => {
          if (tokenResponse.error) {
            setIsLoading(false);
            if (tokenResponse.error !== 'popup_closed_by_user') {
              setErrorMsg(tokenResponse.error_description || tokenResponse.error || 'Google sign-in was cancelled.');
            }
            return;
          }
          if (tokenResponse.access_token) {
            try {
              const user = await authenticateWithGoogle({ access_token: tokenResponse.access_token });
              onLoginSuccess(user);
              onClose();
            } catch (err: any) {
              setErrorMsg(err.message || 'Failed to authenticate Google user with server.');
            } finally {
              setIsLoading(false);
            }
          }
        },
        error_callback: (err: any) => {
          setIsLoading(false);
          const detail = err?.message || 'Google popup could not be opened.';
          if (detail.includes('origin')) {
            setErrorMsg(`Origin unauthorized: Ensure "${window.location.origin}" is added to Authorized JavaScript origins in Google Cloud Console.`);
          } else {
            setErrorMsg(detail);
          }
        },
      });

      tokenClient.requestAccessToken({ prompt: 'consent' });
    } catch (err: any) {
      setIsLoading(false);
      setErrorMsg(err?.message || 'Failed to initialize Google authentication popup.');
    }
  };

  const handleSaveCustomClientId = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = clientIdInput.trim();
    if (!cleanId) return;

    localStorage.setItem(STORAGE_CLIENT_ID_KEY, cleanId);
    setCustomClientId(cleanId);
    setShowConfig(false);
    setErrorMsg(null);
  };

  const handleResetClientId = () => {
    localStorage.removeItem(STORAGE_CLIENT_ID_KEY);
    setCustomClientId('');
    setShowConfig(true);
  };

  return (
    <div className="fixed inset-0 z-[2500] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
      />

      {/* Modal Dialog */}
      <div className="relative z-10 w-full max-w-md bg-white rounded-3xl shadow-2xl border border-[#E3DFD7] p-6 sm:p-8 font-sans overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Top Right Controls */}
        <div className="absolute top-5 right-5 flex items-center gap-1.5">
          {activeClientId && !showConfig && (
            <button
              onClick={() => {
                setClientIdInput(activeClientId);
                setShowConfig(true);
              }}
              className="p-2 rounded-xl text-[#77736D] hover:text-[#191919] hover:bg-[#F5F3EE] transition-colors cursor-pointer"
              title="Google OAuth Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#77736D] hover:text-[#191919] hover:bg-[#F5F3EE] transition-colors cursor-pointer"
            title="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Header */}
        <div className="text-center mb-6">
          {/* Google 4-Color Logo */}
          <div className="w-14 h-14 rounded-2xl bg-white border border-[#E3DFD7] shadow-sm flex items-center justify-center mx-auto mb-3.5">
            <svg className="w-7 h-7" viewBox="0 0 24 24">
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
          </div>

          <h3 className="font-display font-bold text-2xl lowercase tracking-tight text-[#191919]">
            {showConfig ? 'google oauth configuration' : 'sign in with google'}
          </h3>
          {pendingPlaceName ? (
            <div className="mt-2.5 px-3.5 py-1.5 rounded-full bg-red-50 border border-red-200 inline-flex items-center gap-1.5 text-xs font-bold text-[#F02D25]">
              <Bookmark className="w-3.5 h-3.5 fill-current" />
              <span>Sign in to save &ldquo;{pendingPlaceName}&rdquo;</span>
            </div>
          ) : (
            <p className="text-xs text-[#77736D] mt-1.5 max-w-xs mx-auto leading-relaxed">
              {showConfig
                ? 'Configure your Google Cloud OAuth 2.0 Client ID to enable authentic Google Sign-In.'
                : 'Sign in with your verified Google account to sync your saved urban discoveries.'}
            </p>
          )}
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-600 font-medium leading-relaxed">
            {errorMsg}
          </div>
        )}

        {/* Main Content: Authentic Google Auth Flow OR Configuration Mode */}
        {!activeClientId || showConfig ? (
          /* Client ID Setup Form */
          <form onSubmit={handleSaveCustomClientId} className="space-y-4">
            <div className="p-3.5 rounded-2xl bg-[#F5F3EE] border border-[#E3DFD7] text-xs text-[#191919] space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-[#191919]">
                <KeyRound className="w-4 h-4 text-[#F02D25]" />
                <span>Google OAuth 2.0 Client ID</span>
              </div>
              <p className="text-[11px] text-[#77736D] leading-relaxed">
                To connect real Google accounts, supply your OAuth 2.0 Client ID from Google Cloud Console (or define <code className="bg-white px-1.5 py-0.5 rounded border border-[#E3DFD7] font-mono text-[#F02D25]">VITE_GOOGLE_CLIENT_ID</code> in <code className="font-mono">.env</code>).
              </p>
              <div className="text-[10px] text-[#77736D] pt-1">
                Authorized JavaScript Origin for this site:{' '}
                <span className="font-mono font-bold text-[#191919] bg-white px-1.5 py-0.5 rounded border border-[#E3DFD7]">
                  {typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173'}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-extrabold uppercase tracking-widest text-[#77736D] mb-1.5">
                Google Client ID
              </label>
              <input
                type="text"
                required
                value={clientIdInput}
                onChange={(e) => setClientIdInput(e.target.value)}
                placeholder="e.g. 123456789-abcdefg.apps.googleusercontent.com"
                className="w-full px-4 py-2.5 rounded-2xl bg-[#F5F3EE] border border-[#E3DFD7] text-xs font-mono text-[#191919] focus:outline-none focus:border-[#191919] transition-colors"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="submit"
                className="flex-1 py-3 px-4 rounded-full bg-[#191919] hover:bg-[#F02D25] text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer"
              >
                Save &amp; Enable Google Auth
              </button>
              {activeClientId && (
                <button
                  type="button"
                  onClick={() => setShowConfig(false)}
                  className="py-3 px-4 rounded-full bg-[#F5F3EE] hover:bg-[#E3DFD7] text-[#191919] text-xs font-bold transition-all cursor-pointer"
                >
                  Cancel
                </button>
              )}
            </div>

            <div className="text-center pt-2">
              <a
                href="https://console.cloud.google.com/apis/credentials"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#77736D] hover:text-[#191919] transition-colors"
              >
                <span>Open Google Cloud Credentials Console</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </form>
        ) : (
          /* Official Real Google Authentication Action */
          <div className="space-y-4">
            {/* Google Identity Services Official Rendered Button Container */}
            <div className="flex justify-center">
              <div ref={googleBtnRef} className="min-h-[44px] flex items-center justify-center" />
            </div>

            {/* Direct Google OAuth 2.0 Popup Trigger */}
            <button
              type="button"
              onClick={handleGoogleOAuthPopup}
              disabled={isLoading}
              className="w-full py-3.5 px-4 rounded-full bg-[#191919] hover:bg-[#F02D25] text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2.5 shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-60"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Connecting with Google...</span>
                </>
              ) : (
                <>
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
                  <span>Sign in with Google</span>
                </>
              )}
            </button>

            {/* Config & Security Footer */}
            <div className="pt-2 flex items-center justify-between text-[10px] text-[#77736D]">
              <span className="truncate max-w-[200px] font-mono">
                Client: {activeClientId.slice(0, 16)}...
              </span>
              <button
                type="button"
                onClick={() => {
                  setClientIdInput(activeClientId);
                  setShowConfig(true);
                }}
                className="underline hover:text-[#191919] transition-colors cursor-pointer"
              >
                Change Client ID
              </button>
            </div>
          </div>
        )}

        {/* Security & Cloud Sync Badge */}
        <div className="mt-5 pt-4 border-t border-[#E3DFD7] flex items-center justify-center gap-2 text-[10px] text-[#77736D] font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Official Google Identity Services &amp; OAuth 2.0</span>
        </div>

      </div>
    </div>
  );
};
