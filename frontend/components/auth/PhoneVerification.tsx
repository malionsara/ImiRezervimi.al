// frontend/components/auth/PhoneVerification.tsx
// Phone verification component for ImiRezervimi.al
// Albanian Beauty Salon Booking Platform

import { useState, useEffect } from 'react';

interface PhoneVerificationProps {
  onVerificationComplete: (phone: string) => void;
  onError?: (error: string) => void;
  initialPhone?: string;
  className?: string;
}

interface ApiResponse {
  success: boolean;
  data?: {
    phone?: string;
    verified?: boolean;
    messageSid?: string;
    timestamp?: string;
    expiresIn?: number;
    attemptsRemaining?: number;
  };
  error?: {
    code: string;
    message: string;
  };
}

export default function PhoneVerification({
  onVerificationComplete,
  onError,
  initialPhone = '',
  className = ''
}: PhoneVerificationProps) {
  // State management
  const [step, setStep] = useState<'phone' | 'code'>('phone');
  const [phone, setPhone] = useState(initialPhone);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [attemptsRemaining, setAttemptsRemaining] = useState<number | null>(null);
  const [canResend, setCanResend] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Countdown timer for resend functionality
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (step === 'code') {
      setCanResend(true);
    }
  }, [countdown, step]);

  // Format phone number as user types
  const formatPhoneNumber = (value: string): string => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');
    
    // Handle different input formats
    if (digits.startsWith('355')) {
      return '+' + digits;
    } else if (digits.startsWith('0')) {
      return '+355' + digits.substring(1);
    } else if (digits.length > 0 && !digits.startsWith('355')) {
      return '+355' + digits;
    }
    
    return digits ? '+355' : '';
  };

  // Validate Albanian phone number
  const isValidPhone = (phone: string): boolean => {
    return /^\+355[0-9]{8,9}$/.test(phone);
  };

  // Send verification code
  const handleSendCode = async () => {
    setError('');
    setSuccess('');
    
    if (!phone.trim()) {
      const errorMsg = 'Ju lutem shkruani numrin e telefonit';
      setError(errorMsg);
      onError?.(errorMsg);
      return;
    }

    if (!isValidPhone(phone)) {
      const errorMsg = 'Numri i telefonit duhet të jetë në formatin +355XXXXXXXX';
      setError(errorMsg);
      onError?.(errorMsg);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/send-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone }),
      });

      const data: ApiResponse = await response.json();

      if (data.success) {
        setSuccess('Kodi u dërgua me SMS! 📱');
        setStep('code');
        setCountdown(60); // 1 minute cooldown
        setCanResend(false);
        setAttemptsRemaining(3); // Reset attempts
      } else {
        const errorMsg = data.error?.message || 'Gabim në dërgimin e kodit';
        setError(errorMsg);
        onError?.(errorMsg);
      }
    } catch (err) {
      console.error('Send verification error:', err);
      const errorMsg = 'Gabim në komunikim me serverin';
      setError(errorMsg);
      onError?.(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Verify phone code
  const handleVerifyCode = async () => {
    setError('');
    setSuccess('');
    
    if (!code.trim()) {
      const errorMsg = 'Ju lutem shkruani kodin e verifikimit';
      setError(errorMsg);
      onError?.(errorMsg);
      return;
    }

    if (!/^[0-9]{6}$/.test(code)) {
      const errorMsg = 'Kodi duhet të jetë 6 shifra';
      setError(errorMsg);
      onError?.(errorMsg);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/verify-phone', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone, code }),
      });

      const data: ApiResponse = await response.json();

      if (data.success && data.data?.verified) {
        setSuccess('Numri u verifikua me sukses! ✅');
        setTimeout(() => {
          onVerificationComplete(phone);
        }, 1500);
      } else {
        const errorMsg = data.error?.message || 'Kod i pasakt';
        setError(errorMsg);
        onError?.(errorMsg);
        
        // Update attempts remaining
        if (data.data?.attemptsRemaining !== undefined) {
          setAttemptsRemaining(data.data.attemptsRemaining);
          
          if (data.data.attemptsRemaining === 0) {
            // Reset to phone step to get new code
            setStep('phone');
            setCode('');
            setCountdown(0);
            setCanResend(true);
          }
        }
      }
    } catch (err) {
      console.error('Verify code error:', err);
      const errorMsg = 'Gabim në komunikim me serverin';
      setError(errorMsg);
      onError?.(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Handle phone input change
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhone(formatted);
  };

  // Handle code input (only numbers, max 6 digits)
  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setCode(value);
  };

  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (step === 'phone') {
        handleSendCode();
      } else {
        handleVerifyCode();
      }
    }
  };

  return (
    <div className={`phone-verification-component ${className}`}>
      {/* Header */}
      <div className="text-center mb-8">
        <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {step === 'phone' ? 'Verifikimi i Telefonit' : 'Shkruaj Kodin'}
        </h2>
        <p className="text-gray-600">
          {step === 'phone' 
            ? 'Do t\'ju dërgojmë një kod verifikimi në SMS'
            : `Shkruaj kodin 6-shifror që u dërgua në ${phone}`
          }
        </p>
      </div>

      {/* Phone Number Input */}
      {step === 'phone' && (
        <div className="space-y-6">
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
              Numri i Telefonit
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">🇦🇱</span>
              </div>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={handlePhoneChange}
                onKeyPress={handleKeyPress}
                placeholder="+355 69 123 4567"
                disabled={loading}
                className="block w-full pl-12 pr-4 py-4 border border-gray-300 rounded-2xl text-lg 
                         placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 
                         focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed
                         transition-all duration-200"
              />
            </div>
            <p className="mt-2 text-sm text-gray-500">
              Formati: +355 XX XXX XXXX (numër shqiptar)
            </p>
          </div>

          <button
            onClick={handleSendCode}
            disabled={loading || !isValidPhone(phone)}
            className="w-full flex justify-center items-center py-4 px-6 border border-transparent 
                     text-lg font-semibold rounded-2xl text-white bg-gradient-to-r from-blue-600 
                     to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none 
                     focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 
                     disabled:cursor-not-allowed transition-all duration-200 transform 
                     hover:scale-105 disabled:transform-none"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent mr-3"></div>
                Po dërgon...
              </>
            ) : (
              <>
                <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                Dërgo Kodin
              </>
            )}
          </button>
        </div>
      )}

      {/* Verification Code Input */}
      {step === 'code' && (
        <div className="space-y-6">
          <div>
            <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2">
              Kodi i Verifikimit
            </label>
            <input
              id="code"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={code}
              onChange={handleCodeChange}
              onKeyPress={handleKeyPress}
              placeholder="123456"
              disabled={loading}
              className="block w-full px-4 py-4 border border-gray-300 rounded-2xl text-lg text-center
                       placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 
                       focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed
                       transition-all duration-200 tracking-widest font-mono"
              maxLength={6}
              autoComplete="one-time-code"
            />
            <div className="mt-2 flex justify-between items-center text-sm">
              <span className="text-gray-500">
                {attemptsRemaining !== null && attemptsRemaining < 3 && (
                  `Të mbeten ${attemptsRemaining} përpjekje`
                )}
              </span>
              {countdown > 0 ? (
                <span className="text-gray-500">
                  Mund të dërgoni përsëri pas {countdown}s
                </span>
              ) : canResend && (
                <button
                  onClick={handleSendCode}
                  disabled={loading}
                  className="text-blue-600 hover:text-blue-800 font-medium disabled:opacity-50"
                >
                  Dërgo përsëri kodin
                </button>
              )}
            </div>
          </div>

          <button
            onClick={handleVerifyCode}
            disabled={loading || code.length !== 6}
            className="w-full flex justify-center items-center py-4 px-6 border border-transparent 
                     text-lg font-semibold rounded-2xl text-white bg-gradient-to-r from-green-600 
                     to-blue-600 hover:from-green-700 hover:to-blue-700 focus:outline-none 
                     focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 
                     disabled:cursor-not-allowed transition-all duration-200 transform 
                     hover:scale-105 disabled:transform-none"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent mr-3"></div>
                Po verifikon...
              </>
            ) : (
              <>
                <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M5 13l4 4L19 7" />
                </svg>
                Verifikoni Numrin
              </>
            )}
          </button>

          {/* Back to phone step */}
          <button
            onClick={() => {
              setStep('phone');
              setCode('');
              setError('');
              setSuccess('');
              setCountdown(0);
              setCanResend(true);
            }}
            disabled={loading}
            className="w-full py-3 text-gray-600 hover:text-gray-800 font-medium disabled:opacity-50
                     transition-colors duration-200"
          >
            ← Ktheu te numri i telefonit
          </button>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-2xl shadow-sm animate-fade-in">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-green-400 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <p className="text-green-700 text-sm font-medium">{success}</p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-2xl shadow-sm animate-shake">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-red-400 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <p className="text-red-700 text-sm font-medium">{error}</p>
          </div>
        </div>
      )}

      {/* Custom Styles */}
      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0px); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
        
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }

        /* Custom number input styling */
        input[type="text"]:focus {
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        /* Hide number input spinners */
        input[type="text"]::-webkit-outer-spin-button,
        input[type="text"]::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }

        input[type="text"] {
          -moz-appearance: textfield;
        }
      `}</style>
    </div>
  );
}