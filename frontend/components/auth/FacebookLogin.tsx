// frontend/components/auth/FacebookLogin.tsx
// Facebook login component for ImiRezervimi.al

import { useState } from 'react';
import { signIn } from 'next-auth/react';

interface FacebookLoginProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
  redirectUrl?: string;
  className?: string;
}

const getFacebookErrorMessage = (error: string): string => {
  switch (error) {
    case 'OAuthAccountNotLinked':
      return 'Ky llogari Facebook është i lidhur tashmë me një llogari tjetër.';
    case 'EmailSignin':
      return 'Ju lutemi kontrolloni emailin tuaj për të vazhduar.';
    case 'CredentialsSignin':
      return 'Të dhënat e identifikimit janë të gabuara.';
    case 'SessionRequired':
      return 'Ju lutemi identifikohuni për të vazhduar.';
    default:
      return 'Ka ndodhur një gabim gjatë identifikimit me Facebook. Ju lutemi provoni përsëri.';
  }
};

export default function FacebookLogin({ 
  onSuccess, 
  onError, 
  redirectUrl = '/dashboard',
  className = '' 
}: FacebookLoginProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const handleFacebookLogin = async () => {
    setLoading(true);
    setError('');

    try {
      // Use NextAuth.js Facebook Login
      const result = await signIn('facebook', {
        callbackUrl: redirectUrl,
        redirect: true
      });

      if (result?.error) {
        const errorMessage = getFacebookErrorMessage(result.error);
        setError(errorMessage);
        onError?.(errorMessage);
      } else {
        onSuccess?.();
      }
    } catch (err) {
      const errorMessage = getFacebookErrorMessage(err instanceof Error ? err.message : 'Unknown error');
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`facebook-login-component ${className}`}>
      {/* Facebook Login Button — official Facebook blue per brand guidelines */}
      <button
        onClick={handleFacebookLogin}
        disabled={loading}
        className="w-full flex justify-center items-center gap-3 py-3.5 px-6 text-base font-medium rounded text-white bg-[#1877F2] hover:bg-[#166FE5] focus:outline-none focus:ring-2 focus:ring-[#1877F2]/40 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 btn-touch"
      >
        {loading ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
            <span>Po lidhet me Facebook...</span>
          </>
        ) : (
          <>
            {/* Facebook Icon */}
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            Vazhdo me Facebook
          </>
        )}
      </button>

      {/* Error Display */}
      {error && (
        <div className="mt-4 p-4 bg-danger/5 border border-danger/25 rounded error-shake">
          <p className="text-ink text-sm font-medium">{error}</p>
        </div>
      )}
    </div>
  );
}