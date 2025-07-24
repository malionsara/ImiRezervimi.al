// frontend/components/auth/InstagramLogin.tsx
// Instagram login component for ImiRezervimi.al

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { getInstagramErrorMessage } from '../../lib/instagram';

interface InstagramLoginProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
  redirectUrl?: string;
  className?: string;
}

export default function InstagramLogin({ 
  onSuccess, 
  onError, 
  redirectUrl = '/dashboard',
  className = '' 
}: InstagramLoginProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const handleInstagramLogin = async () => {
    setLoading(true);
    setError('');

    try {
      // Use NextAuth.js Facebook Login with Instagram access
      const result = await signIn('instagram-via-facebook', {
        callbackUrl: redirectUrl,
        redirect: true
      });

      if (result?.error) {
        const errorMessage = getInstagramErrorMessage(result.error);
        setError(errorMessage);
        onError?.(errorMessage);
      } else {
        onSuccess?.();
      }
    } catch (err) {
      const errorMessage = getInstagramErrorMessage(err instanceof Error ? err.message : 'Unknown error');
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`instagram-login-component ${className}`}>
      {/* Instagram Login Button */}
      <button
        onClick={handleInstagramLogin}
        disabled={loading}
        className="group relative w-full flex justify-center items-center py-4 px-6 border border-transparent text-lg font-semibold rounded-2xl text-white bg-gradient-to-r from-purple-600 via-pink-600 to-red-500 hover:from-purple-700 hover:via-pink-700 hover:to-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-500 transform hover:scale-105 hover:-translate-y-1 shadow-xl hover:shadow-2xl overflow-hidden"
      >
        {/* Background Animation */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-700 via-pink-700 to-red-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        <div className="relative flex items-center">
          {loading ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent mr-3"></div>
              <span>Po lidhet me Instagram...</span>
            </div>
          ) : (
            <>
              {/* Instagram Icon */}
              <div className="flex items-center justify-center w-8 h-8 mr-4 bg-white/20 rounded-lg backdrop-blur-sm">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </div>
              Vazhdo me Instagram
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