import React, { useState, useEffect, useRef } from 'react';
import { X, CheckCircle2, ShieldCheck, Loader2, Bookmark } from 'lucide-react';
import { authenticateWithGoogle, AuthUser } from '../services/auth';

interface GoogleAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: AuthUser) => void;
  pendingPlaceName?: string;
}

export const GoogleAuthModal: React.FC<GoogleAuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  pendingPlaceName,
}) => {
  const [emailInput, setEmailInput] = useState('tousif@gmail.com');
  const [nameInput, setNameInput] = useState('MD Tousif');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const googleBtnRef = useRef<HTMLDivElement>(null);

  const clientId =
    import.meta.env.VITE_GOOGLE_CLIENT_ID ||
    '762108023268-vqer99vjf0f2g4i9ki0ub4dcjman0gr5.apps.googleusercontent.com';

  // Initialize official Google Identity Services silently in background if client ID is configured
  useEffect(() => {
    if (!isOpen || !clientId) return;

    const renderGoogleButton = () => {
      const g = (window as any).google;
      if (!g?.accounts?.id) return;

      try {
        g.accounts.id.initialize({
          client_id: clientId,
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
        });

        if (googleBtnRef.current) {
          googleBtnRef.current.innerHTML = '';
          g.accounts.id.renderButton(googleBtnRef.current, {
            theme: 'outline',
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

    if ((window as any).google?.accounts?.id) {
      renderGoogleButton();
    } else {
      const timer = setInterval(() => {
        if ((window as any).google?.accounts?.id) {
          clearInterval(timer);
          renderGoogleButton();
        }
      }, 200);
      return () => clearInterval(timer);
    }
  }, [isOpen, clientId]);

  if (!isOpen) return null;

  // Validate email format on client-side before sending to server for DNS deliverability verification
  const isValidEmailSyntax = (val: string) => {
    return /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/.test(val.trim());
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = emailInput.trim();
    const cleanName = nameInput.trim();

    if (!cleanEmail) {
      setErrorMsg('Please enter your email address.');
      return;
    }

    if (!isValidEmailSyntax(cleanEmail)) {
      setErrorMsg('Please enter a valid email format (e.g. yourname@gmail.com).');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      // Sends email & custom username to backend.
      // Backend validates whether the email is legit (RFC syntax, MX records, real host domain),
      // attaches the custom display name and avatar, and returns the authenticated user session.
      const user = await authenticateWithGoogle({
        email: cleanEmail,
        name: cleanName || cleanEmail.split('@')[0],
        picture: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(cleanName || cleanEmail)}&backgroundColor=191919&textColor=ffffff`,
      });
      onLoginSuccess(user);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to authenticate. Please ensure your email is legit.');
    } finally {
      setIsLoading(false);
    }
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
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-[#77736D] hover:text-[#191919] hover:bg-[#F5F3EE] transition-colors cursor-pointer"
          title="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

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
            sign in or sign up with google
          </h3>
          {pendingPlaceName ? (
            <div className="mt-2.5 px-3.5 py-1.5 rounded-full bg-red-50 border border-red-200 inline-flex items-center gap-1.5 text-xs font-bold text-[#F02D25]">
              <Bookmark className="w-3.5 h-3.5 fill-current" />
              <span>Sign in to save &ldquo;{pendingPlaceName}&rdquo;</span>
            </div>
          ) : (
            <p className="text-xs text-[#77736D] mt-1.5 max-w-xs mx-auto leading-relaxed">
              Sync your saved destinations across devices and unlock customized urban recommendations.
            </p>
          )}
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-600 font-medium leading-relaxed">
            {errorMsg}
          </div>
        )}

        {/* Official Google Identity Services One Tap / Button (rendered via Client ID) */}
        {clientId && (
          <div className="mb-4">
            <div className="flex justify-center">
              <div ref={googleBtnRef} className="min-h-[44px]" />
            </div>
            <div className="relative my-4 flex items-center justify-center">
              <div className="border-t border-[#E3DFD7] w-full" />
              <span className="bg-white px-3 text-[10px] uppercase font-bold text-[#77736D] tracking-wider absolute">
                or with email
              </span>
            </div>
          </div>
        )}

        {/* Sign In Form with Email Legit Check & Custom Username */}
        <form onSubmit={handleSignIn} className="space-y-3.5">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-[10px] font-extrabold uppercase tracking-widest text-[#77736D]">
                Google Account Email
              </label>
              {emailInput && isValidEmailSyntax(emailInput) && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Valid format</span>
                </span>
              )}
            </div>
            <input
              type="email"
              required
              value={emailInput}
              onChange={(e) => {
                setEmailInput(e.target.value);
                if (errorMsg) setErrorMsg(null);
              }}
              placeholder="e.g. yourname@gmail.com"
              className="w-full px-4 py-2.5 rounded-2xl bg-[#F5F3EE] border border-[#E3DFD7] text-xs font-semibold text-[#191919] focus:outline-none focus:border-[#191919] transition-colors"
            />
          </div>

          <div>
            <label className="block text-[10px] font-extrabold uppercase tracking-widest text-[#77736D] mb-1.5">
              Account Display Name / Username
            </label>
            <input
              type="text"
              required
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder="e.g. MD Tousif or your nickname"
              className="w-full px-4 py-2.5 rounded-2xl bg-[#F5F3EE] border border-[#E3DFD7] text-xs font-semibold text-[#191919] focus:outline-none focus:border-[#191919] transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-3 px-4 rounded-full bg-[#191919] hover:bg-[#F02D25] text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-60"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Verifying email &amp; signing in...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continue with Google</span>
              </>
            )}
          </button>
        </form>

        {/* Security & Cloud Sync Badge */}
        <div className="mt-5 pt-4 border-t border-[#E3DFD7] flex items-center justify-center gap-2 text-[10px] text-[#77736D] font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Secured via Google Identity &amp; MongoDB Atlas Storage</span>
        </div>

      </div>
    </div>
  );
};
