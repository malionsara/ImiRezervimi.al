// Instagram OAuth debug and configuration checker
import { useState, useEffect } from 'react';
import Head from 'next/head';

export default function InstagramDebug() {
  const [config, setConfig] = useState(null);
  const [testResults, setTestResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Get configuration from environment
    const checkConfig = async () => {
      try {
        const response = await fetch('/api/debug/instagram-config');
        const data = await response.json();
        setConfig(data);
      } catch (error) {
        console.error('Failed to fetch config:', error);
      }
    };
    
    checkConfig();
  }, []);

  const runConnectivityTests = async () => {
    setLoading(true);
    const tests = [
      {
        name: 'Instagram API Reachability',
        url: 'https://api.instagram.com/oauth/authorize',
        method: 'HEAD'
      },
      {
        name: 'Callback URL (www)',
        url: 'https://www.imirezervimi.al/api/auth/callback/instagram',
        method: 'HEAD'
      },
      {
        name: 'Callback URL (no www)',
        url: 'https://imirezervimi.al/api/auth/callback/instagram',
        method: 'HEAD'
      }
    ];

    const results = [];
    for (const test of tests) {
      try {
        const response = await fetch(test.url, { method: test.method });
        results.push({
          ...test,
          status: response.status,
          success: response.ok,
          redirected: response.redirected,
          finalUrl: response.url
        });
      } catch (error) {
        results.push({
          ...test,
          success: false,
          error: error.message
        });
      }
    }
    
    setTestResults(results);
    setLoading(false);
  };

  const generateInstagramAuthUrl = () => {
    if (!config?.clientId) return null;
    
    const params = new URLSearchParams({
      client_id: config.clientId,
      redirect_uri: 'https://www.imirezervimi.al/api/auth/callback/instagram',
      scope: 'user_profile,user_media',
      response_type: 'code',
      state: 'debug_test_' + Date.now()
    });

    return `https://api.instagram.com/oauth/authorize?${params.toString()}`;
  };

  return (
    <>
      <Head>
        <title>Instagram OAuth Diagnostic - ImiRezervimi.al</title>
      </Head>

      <div className="min-h-screen bg-cream py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="bg-paper rounded-lg shadow-soft p-8">
            <h1 className="text-3xl font-bold text-ink mb-8">
              🔍 Instagram OAuth Diagnostic Tool
            </h1>

            {/* Configuration Status */}
            <div className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">📋 Current Configuration</h2>
              <div className="bg-cream rounded-lg p-6">
                {config ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-semibold text-ink mb-2">Environment</h3>
                      <p className="text-sm font-mono bg-paper p-2 rounded border">
                        {config.environment || 'Not detected'}
                      </p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-ink mb-2">Client ID</h3>
                      <p className="text-sm font-mono bg-paper p-2 rounded border">
                        {config.clientId ? `${config.clientId.substring(0, 8)}...` : 'Not configured'}
                      </p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-ink mb-2">Client Secret</h3>
                      <p className="text-sm font-mono bg-paper p-2 rounded border">
                        {config.hasClientSecret ? 'Configured ✅' : 'Missing ❌'}
                      </p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-ink mb-2">Base URL</h3>
                      <p className="text-sm font-mono bg-paper p-2 rounded border">
                        {config.baseUrl || 'Not configured'}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p>Loading configuration...</p>
                )}
              </div>
            </div>

            {/* Required Instagram App Settings */}
            <div className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">⚙️ Required Instagram App Settings</h2>
              <div className="bg-accent-soft/40 border border-accent/25 rounded-lg p-6">
                <h3 className="font-semibold text-accent-strong mb-3">Go to Facebook Developers Console:</h3>
                <ol className="list-decimal list-inside space-y-3 text-accent-strong">
                  <li>Open <a href="https://developers.facebook.com/" className="underline font-semibold" target="_blank" rel="noopener noreferrer">Facebook Developers</a></li>
                  <li>Select your app → Instagram Basic Display → Basic Display</li>
                  <li><strong>Add these EXACT OAuth Redirect URIs:</strong></li>
                </ol>
                
                <div className="mt-4 space-y-2">
                  <div className="bg-paper p-3 rounded border border-blue-300">
                    <code className="text-sm break-all">https://www.imirezervimi.al/api/auth/callback/instagram</code>
                    <span className="ml-2 text-success font-semibold">← Primary (www)</span>
                  </div>
                  <div className="bg-paper p-3 rounded border border-blue-300">
                    <code className="text-sm break-all">https://imirezervimi.al/api/auth/callback/instagram</code>
                    <span className="ml-2 text-warning font-semibold">← Fallback (no www)</span>
                  </div>
                </div>

                <div className="mt-4">
                  <h4 className="font-semibold mb-2">Also add these URLs:</h4>
                  <div className="space-y-2">
                    <div className="bg-paper p-2 rounded border border-blue-300">
                      <strong>Deauthorize:</strong> <code className="text-sm break-all">https://www.imirezervimi.al/api/auth/deauthorize</code>
                    </div>
                    <div className="bg-paper p-2 rounded border border-blue-300">
                      <strong>Data Deletion:</strong> <code className="text-sm break-all">https://www.imirezervimi.al/api/auth/data-deletion</code>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Test Tools */}
            <div className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">🧪 Connectivity Tests</h2>
              <div className="flex flex-wrap gap-4 mb-4">
                <button
                  onClick={runConnectivityTests}
                  disabled={loading}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Testing...' : 'Run Connectivity Tests'}
                </button>
                
                {config?.clientId && (
                  <a
                    href={generateInstagramAuthUrl()}
                    className="bg-accent text-white px-6 py-2 rounded-lg hover:bg-accent-strong"
                  >
                    🔗 Test Instagram Login
                  </a>
                )}
              </div>

              {testResults.length > 0 && (
                <div className="bg-cream rounded-lg p-4">
                  <h3 className="font-semibold mb-3">Test Results:</h3>
                  {testResults.map((result, index) => (
                    <div key={index} className={`p-3 mb-2 rounded border ${result.success ? 'bg-success/5 border-success/25' : 'bg-accent-soft/60 border-accent/25'}`}>
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{result.name}</span>
                        <span className={`px-2 py-1 rounded text-sm ${result.success ? 'bg-success/10 text-success' : 'bg-accent-soft text-red-800'}`}>
                          {result.success ? '✅ Pass' : '❌ Fail'}
                        </span>
                      </div>
                      <div className="text-sm text-clay mt-1">
                        <p>URL: {result.url}</p>
                        {result.status && <p>Status: {result.status}</p>}
                        {result.error && <p className="text-accent">Error: {result.error}</p>}
                        {result.redirected && <p>Redirected to: {result.finalUrl}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Troubleshooting */}
            <div className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">🛠️ Common Issues & Solutions</h2>
              <div className="space-y-4">
                <div className="bg-accent-soft/60 border border-accent/25 rounded-lg p-4">
                  <h3 className="font-semibold text-red-800 mb-2">❌ &quot;Invalid platform app&quot; Error</h3>
                  <ul className="list-disc list-inside text-accent-strong space-y-1">
                    <li>Your Instagram app Client ID might be incorrect</li>
                    <li>The redirect URI doesn&apos;t exactly match what&apos;s in Facebook Developer Console</li>
                    <li>Your app might be in &quot;Development&quot; mode - add test users or submit for review</li>
                    <li>Domain verification issues with www vs non-www</li>
                  </ul>
                </div>

                <div className="bg-yellow-50 border border-warning/25 rounded-lg p-4">
                  <h3 className="font-semibold text-warning mb-2">⚠️ App Not Approved</h3>
                  <ul className="list-disc list-inside text-yellow-700 space-y-1">
                    <li>Add your Instagram account as a &quot;Tester&quot; in the app</li>
                    <li>Make sure testers accept the invitation in their Instagram app</li>
                    <li>For production: Submit app for Instagram review</li>
                  </ul>
                </div>

                <div className="bg-success/5 border border-success/25 rounded-lg p-4">
                  <h3 className="font-semibold text-success mb-2">✅ Quick Fixes</h3>
                  <ul className="list-disc list-inside text-success space-y-1">
                    <li>Ensure both www and non-www callback URLs are added</li>
                    <li>Wait 5-10 minutes after making changes in Facebook Console</li>
                    <li>Clear browser cache and cookies</li>
                    <li>Test in an incognito/private browser window</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Generated URLs */}
            {config?.clientId && (
              <div>
                <h2 className="text-2xl font-semibold mb-4">🔗 Generated OAuth URL</h2>
                <div className="bg-cream rounded-lg p-4">
                  <p className="text-sm text-clay mb-2">This is the exact URL that will be used for Instagram OAuth:</p>
                  <div className="bg-paper p-3 rounded border font-mono text-xs break-all">
                    {generateInstagramAuthUrl()}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}