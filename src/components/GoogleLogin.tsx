import { useEffect, useRef } from 'react';

interface GoogleLoginProps {
  onSuccess: (credential: string) => void;
  onError: () => void;
}

export function GoogleLogin({ onSuccess, onError }: GoogleLoginProps) {
  const googleButtonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load Google Identity Services script
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.onload = initializeGoogleSignIn;
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  const initializeGoogleSignIn = () => {
    if (window.google && googleButtonRef.current) {
      // Get client ID from environment or use fallback for development
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || 
                      '896831455329-tuo2uqr5eg3c8jckkqhrlvno8dgjcg1d.apps.googleusercontent.com';
      
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleCredentialResponse,
        use_fedcm_for_prompt: true,
        auto_select: false, // Don't auto-select for better UX
        cancel_on_tap_outside: false, // Keep popup open
      });

      window.google.accounts.id.renderButton(googleButtonRef.current, {
        theme: 'outline',
        size: 'large',
        width: '100%',
        text: 'signin_with',
        shape: 'rectangular',
        logo_alignment: 'left',
      });

      // Show the One Tap prompt for returning users
      window.google.accounts.id.prompt();
    }
  };

  const handleCredentialResponse = (response: { credential: string }) => {
    try {
      onSuccess(response.credential);
    } catch (error) {
      console.error('Google login error:', error);
      onError();
    }
  };

  return (
    <div className="w-full">
      <div ref={googleButtonRef} className="w-full flex justify-center"></div>
    </div>
  );
}

// Extend Window interface for Google Identity Services
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          renderButton: (element: HTMLElement, config: any) => void;
          prompt: () => void;
        };
      };
    };
  }
}
