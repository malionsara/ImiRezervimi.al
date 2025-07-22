// frontend/pages/test-instagram.tsx
// Test page for Instagram login component

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import Head from 'next/head';
import Link from 'next/link';
import InstagramLogin from '../components/auth/InstagramLogin';

export default function TestInstagramPage() {
  const { data: session, status } = useSession();
  const [testResults, setTestResults] = useState<string[]>([]);

  const addTestResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`]);
  };

  const handleLoginSuccess = () => {
    addTestResult('✅ Instagram login successful');
  };

  const handleLoginError = (error: string) => {
    addTestResult(`❌ Instagram login failed: ${error}`);
  };

  const testInstagramConfig = () => {
    const hasClientId = !!process.env.NEXT_PUBLIC_INSTAGRAM_CLIENT_ID;
    const hasRedirectUri = !!process.env.NEXT_PUBLIC_INSTAGRAM_REDIRECT_URI;
    
    addTestResult(`Instagram Client ID configured: ${hasClientId ? '✅' : '❌'}`);
    addTestResult(`Instagram Redirect URI configured: ${hasRedirectUri ? '✅' : '❌'}`);
  };

  return (
    <>
      <Head>
        <title>Test Instagram Login - ImiRezervimi.al</title>
        <meta name="description" content="Test page for Instagram login functionality" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-red-50 to-orange-50">
        {/* Header */}
        <header className="bg-white/95 backdrop-blur-xl border-b border-red-100/50 shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Link href="/" className="flex items-center">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center mr-3">
                  <span className="text-white font-bold text-lg">IR</span>
                </div>
                <span className="text-xl font-bold text-gray-900">Instagram Test</span>
              </Link>
              <Link href="/login" className="text-red-500 hover:text-red-600 font-medium">
                ← Kthehu te Login
              </Link>
            </div>
          </div>
        </header>

        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Instagram Login Test
            </h1>
            <p className="text-xl text-gray-600">
              Test page për të verifikuar funksionalitetin e Instagram login
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Login Component Test */}
            <div className="bg-white rounded-3xl p-8 shadow-xl">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Instagram Login Component</h2>
              
              {status === 'authenticated' ? (
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-green-600 mb-2">I identifikuar!</h3>
                  <p className="text-gray-600 mb-4">Mirë se erdhe, {session.user?.name}!</p>
                  <div className="bg-gray-50 rounded-xl p-4 text-left">
                    <h4 className="font-semibold text-gray-900 mb-2">Session Details:</h4>
                    <pre className="text-sm text-gray-600 overflow-auto">
                      {JSON.stringify(session, null, 2)}
                    </pre>
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-gray-600 mb-6">
                    Kliko butonin më poshtë për të testuar Instagram login:
                  </p>
                  <InstagramLogin
                    onSuccess={handleLoginSuccess}
                    onError={handleLoginError}
                    redirectUrl="/test-instagram"
                  />
                </div>
              )}
            </div>

            {/* Test Results */}
            <div className="bg-white rounded-3xl p-8 shadow-xl">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Test Results</h2>
                <button
                  onClick={testInstagramConfig}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Test Config
                </button>
              </div>
              
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {testResults.length === 0 ? (
                  <p className="text-gray-500 italic">No test results yet...</p>
                ) : (
                  testResults.map((result, index) => (
                    <div
                      key={index}
                      className="p-3 bg-gray-50 rounded-lg text-sm font-mono"
                    >
                      {result}
                    </div>
                  ))
                )}
              </div>
              
              <button
                onClick={() => setTestResults([])}
                className="mt-4 w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Clear Results
              </button>
            </div>
          </div>

          {/* Configuration Guide */}
          <div className="mt-12 bg-white rounded-3xl p-8 shadow-xl">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Instagram App Configuration</h2>
            <div className="prose max-w-none">
              <p className="text-gray-600 mb-4">
                Për të përdorur Instagram login, duhet të konfiguroni variablat e mjedisit:
              </p>
              
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="font-semibold text-gray-900 mb-3">Environment Variables (.env.local):</h3>
                <pre className="text-sm text-gray-700 overflow-x-auto">
{`# Instagram Basic Display API
INSTAGRAM_CLIENT_ID=your_instagram_app_id
INSTAGRAM_CLIENT_SECRET=your_instagram_app_secret
NEXT_PUBLIC_INSTAGRAM_CLIENT_ID=your_instagram_app_id
NEXT_PUBLIC_INSTAGRAM_REDIRECT_URI=http://localhost:3000/api/auth/callback/instagram

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret`}
                </pre>
              </div>

              <div className="mt-6">
                <h3 className="font-semibold text-gray-900 mb-3">Instagram App Setup:</h3>
                <ol className="list-decimal list-inside space-y-2 text-gray-600">
                  <li>Shkoni te <a href="https://developers.facebook.com/" className="text-blue-500 hover:underline" target="_blank" rel="noopener noreferrer">Facebook Developers</a></li>
                  <li>Krijoni një aplikacion të ri</li>
                  <li>Shtoni Instagram Basic Display product</li>
                  <li>Konfiguroni OAuth Redirect URIs</li>
                  <li>Kopjoni App ID dhe App Secret</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}