// frontend/pages/test-instagram-complete.js
// Comprehensive Instagram OAuth testing page

import { useState, useEffect } from 'react';
import { signIn, getProviders, getSession } from 'next-auth/react';
import Head from 'next/head';

export default function TestInstagramComplete() {
  const [providers, setProviders] = useState(null);
  const [session, setSession] = useState(null);
  const [debugInfo, setDebugInfo] = useState(null);
  const [testResults, setTestResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Load NextAuth providers
    getProviders().then(setProviders);
    getSession().then(setSession);
    
    // Load debug info
    loadDebugInfo();
  }, []);

  const loadDebugInfo = async () => {
    try {
      const response = await fetch('/api/debug/nextauth');
      if (response.ok) {
        const data = await response.json();
        setDebugInfo(data);
      }
    } catch (error) {
      console.error('Failed to load debug info:', error);
    }
  };

  const runComprehensiveTest = async () => {
    setLoading(true);
    setTestResults(null);
    setError('');
    
    const results = {
      timestamp: new Date().toISOString(),
      tests: []
    };

    try {
      // Test 1: NextAuth providers endpoint
      try {
        const providersResponse = await fetch('/api/auth/providers');
        results.tests.push({
          name: 'NextAuth Providers Endpoint',
          status: providersResponse.ok ? 'PASS' : 'FAIL',
          details: `Status: ${providersResponse.status}`,
          data: providersResponse.ok ? await providersResponse.json() : null
        });
      } catch (e) {
        results.tests.push({
          name: 'NextAuth Providers Endpoint',
          status: 'ERROR',
          details: e.message
        });
      }

      // Test 2: Instagram OAuth URL generation
      try {
        const instagramUrl = generateInstagramUrl();
        results.tests.push({
          name: 'Instagram OAuth URL Generation',
          status: 'PASS',
          details: 'URL generated successfully',
          data: instagramUrl
        });
      } catch (e) {
        results.tests.push({
          name: 'Instagram OAuth URL Generation',
          status: 'ERROR',
          details: e.message
        });
      }

      // Test 3: NextAuth session endpoint
      try {
        const sessionResponse = await fetch('/api/auth/session');
        results.tests.push({
          name: 'NextAuth Session Endpoint',
          status: sessionResponse.ok ? 'PASS' : 'FAIL',
          details: `Status: ${sessionResponse.status}`,
          data: sessionResponse.ok ? await sessionResponse.json() : null
        });
      } catch (e) {
        results.tests.push({
          name: 'NextAuth Session Endpoint',
          status: 'ERROR',
          details: e.message
        });
      }

      // Test 4: Instagram callback URL accessibility
      try {
        const callbackResponse = await fetch('/api/auth/callback/instagram', {
          method: 'HEAD'
        });
        results.tests.push({
          name: 'Instagram Callback URL',
          status: callbackResponse.status < 500 ? 'PASS' : 'FAIL',
          details: `Status: ${callbackResponse.status} (400 is expected without params)`
        });
      } catch (e) {
        results.tests.push({
          name: 'Instagram Callback URL',
          status: 'ERROR',
          details: e.message
        });
      }

      // Test 5: GDPR endpoints
      try {
        const deauthResponse = await fetch('/api/auth/deauthorize', {
          method: 'HEAD'
        });
        const deletionResponse = await fetch('/api/auth/data-deletion', {
          method: 'HEAD'
        });
        
        results.tests.push({
          name: 'GDPR Compliance Endpoints',
          status: (deauthResponse.status < 500 && deletionResponse.status < 500) ? 'PASS' : 'FAIL',
          details: `Deauth: ${deauthResponse.status}, Deletion: ${deletionResponse.status}`
        });
      } catch (e) {
        results.tests.push({
          name: 'GDPR Compliance Endpoints',
          status: 'ERROR',
          details: e.message
        });
      }

      setTestResults(results);
    } catch (error) {
      setError(`Test execution failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const generateInstagramUrl = () => {
    const clientId = '1075659340661921';
    const baseUrl = window.location.origin;
    
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: `${baseUrl}/api/auth/callback/instagram`,
      scope: 'user_profile,user_media',
      response_type: 'code',
      state: 'test_' + Math.random().toString(36).substr(2, 9)
    });

    return `https://api.instagram.com/oauth/authorize?${params.toString()}`;
  };

  const testInstagramLogin = async () => {
    setLoading(true);
    setError('');
    
    try {
      const result = await signIn('instagram', {
        redirect: false
      });
      
      if (result?.error) {
        setError(`Instagram login failed: ${result.error}`);
      } else if (result?.ok) {
        setError(''); // Clear any previous errors
        // Refresh session
        const newSession = await getSession();
        setSession(newSession);
      }
    } catch (error) {
      setError(`Instagram login error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const directInstagramTest = () => {
    const instagramUrl = generateInstagramUrl();
    window.open(instagramUrl, '_blank');
  };

  return (
    <>
      <Head>
        <title>Complete Instagram OAuth Test - ImiRezervimi.al</title>
      </Head>

      <div className="min-h-screen bg-sand py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-paper rounded-lg shadow-soft p-6">
            <h1 className="text-3xl font-bold text-ink mb-6">
              Complete Instagram OAuth Diagnostic
            </h1>

            {/* Current Session */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Current Session</h2>
              <div className="bg-cream p-4 rounded-lg">
                <pre className="text-sm overflow-x-auto">
                  {JSON.stringify(session, null, 2)}
                </pre>
              </div>
            </div>

            {/* NextAuth Providers */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Available Providers</h2>
              <div className="bg-cream p-4 rounded-lg">
                <pre className="text-sm overflow-x-auto">
                  {JSON.stringify(providers, null, 2)}
                </pre>
              </div>
            </div>

            {/* Debug Information */}
            {debugInfo && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4">Configuration Debug</h2>
                <div className="bg-cream p-4 rounded-lg">
                  <pre className="text-sm overflow-x-auto">
                    {JSON.stringify(debugInfo, null, 2)}
                  </pre>
                </div>
              </div>
            )}

            {/* Test Actions */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Test Actions</h2>
              <div className="space-y-4">
                <button
                  onClick={runComprehensiveTest}
                  disabled={loading}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Running Tests...' : 'Run Comprehensive Test'}
                </button>
                
                <button
                  onClick={testInstagramLogin}
                  disabled={loading}
                  className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 disabled:opacity-50"
                >
                  {loading ? 'Testing...' : 'Test Instagram Login (NextAuth)'}
                </button>
                
                <button
                  onClick={directInstagramTest}
                  className="bg-pink-600 text-white px-6 py-3 rounded-lg hover:bg-pink-700"
                >
                  Test Direct Instagram OAuth
                </button>
              </div>
            </div>

            {/* Test Results */}
            {testResults && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4">Test Results</h2>
                <div className="space-y-4">
                  {testResults.tests.map((test, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-lg border ${
                        test.status === 'PASS'
                          ? 'bg-success/5 border-success/25'
                          : test.status === 'FAIL'
                          ? 'bg-accent-soft/60 border-accent/25'
                          : 'bg-yellow-50 border-warning/25'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold">{test.name}</h3>
                        <span
                          className={`px-2 py-1 rounded text-xs font-semibold ${
                            test.status === 'PASS'
                              ? 'bg-success/10 text-success'
                              : test.status === 'FAIL'
                              ? 'bg-accent-soft text-red-800'
                              : 'bg-warning/10 text-warning'
                          }`}
                        >
                          {test.status}
                        </span>
                      </div>
                      <p className="text-sm text-clay mb-2">{test.details}</p>
                      {test.data && (
                        <details>
                          <summary className="cursor-pointer text-sm font-medium">
                            View Data
                          </summary>
                          <pre className="text-xs mt-2 p-2 bg-paper rounded border overflow-x-auto">
                            {JSON.stringify(test.data, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Error Display */}
            {error && (
              <div className="mb-8">
                <div className="bg-accent-soft/60 border border-accent/25 rounded-lg p-4">
                  <h3 className="font-semibold text-red-800 mb-2">Error</h3>
                  <p className="text-accent-strong">{error}</p>
                </div>
              </div>
            )}

            {/* Instructions */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Troubleshooting Steps</h2>
              <div className="bg-accent-soft/40 border border-accent/25 rounded-lg p-4">
                <ol className="list-decimal list-inside space-y-2 text-accent-strong">
                  <li>Run the comprehensive test to identify configuration issues</li>
                  <li>Check that all environment variables are set in Vercel</li>
                  <li>Verify Instagram app has both redirect URIs configured</li>
                  <li>Test direct OAuth flow to isolate NextAuth vs Instagram issues</li>
                  <li>Check browser network tab for detailed error responses</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}