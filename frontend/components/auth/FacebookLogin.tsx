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
      {/* Facebook Login Button */}
      <button
        onClick={handleFacebookLogin}
        disabled={loading}
        className="group relative w-full flex justify-center items-center py-4 px-6 border border-transparent text-lg font-semibold rounded-2xl text-white bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 hover:from-blue-700 hover:via-blue-800 hover:to-blue-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-500 transform hover:scale-105 hover:-translate-y-1 shadow-xl hover:shadow-2xl overflow-hidden"
      >
        {/* Background Animation */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-700 via-blue-800 to-blue-900 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        <div className="relative flex items-center">
          {loading ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent mr-3"></div>
              <span>Po lidhet me Facebook...</span>
            </div>
          ) : (
            <>
              {/* Facebook Icon */}
              <div className="flex items-center justify-center w-8 h-8 mr-4 bg-white/20 rounded-lg backdrop-blur-sm">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </div>
              Vazhdo me Facebook
              <span className="ml-3 transform group-hover:translate-x-2 transition-transform duration-300">→</span>
            </>
          )}
        </div>
        
        {/* Shimmer effect */}
        <div className="absolute inset-0 -top-2 -left-2 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 transform translate-x-[-100%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
      </button>

      {/* Error Display */}
      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-2xl shadow-sm animate-shake">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-red-400 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <p className="text-red-700 text-sm font-medium">{error}</p>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0px); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
}