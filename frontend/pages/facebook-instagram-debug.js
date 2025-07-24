// Facebook Login with Instagram access debug and configuration checker
import { useState, useEffect } from 'react';
import Head from 'next/head';

export default function FacebookInstagramDebug() {
  const [config, setConfig] = useState(null);
  const [testResults, setTestResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Get configuration from environment
    const checkConfig = async () => {
      try {
        const response = await fetch('/api/debug/facebook-config');
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
        name: 'Facebook Graph API Reachability',
        url: 'https://graph.facebook.com/v18.0/me',
        method: 'GET'
      },
      {
        name: 'Facebook OAuth Callback (www)',
        url: 'https://www.imirezervimi.al/api/auth/callback/instagram-via-facebook',
        method: 'HEAD'
      },
      {
        name: 'Facebook OAuth Callback (no www)',
        url: 'https://imirezervimi.al/api/auth/callback/instagram-via-facebook',
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
          success: response.ok || response.status === 400, // 400 is expected without token
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

  const generateFacebookAuthUrl = () => {
    if (!config?.clientId) return null;
    
    const params = new URLSearchParams({
      client_id: config.clientId,
      redirect_uri: 'https://www.imirezervimi.al/api/auth/callback/instagram-via-facebook',
      scope: 'email,public_profile,instagram_basic,pages_show_list',
      response_type: 'code',
      state: 'debug_test_' + Date.now()
    });

    return `https://www.facebook.com/v18.0/dialog/oauth?${params.toString()}`;
  };

  return (
    <>
      <Head>
        <title>Facebook Instagram Login Diagnostic - ImiRezervimi.al</title>
      </Head>

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">
              🔍 Facebook Instagram Login Diagnostic Tool
            </h1>

            {/* Important Update Notice */}
            <div className="mb-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-blue-800 mb-3">📢 Important Update</h2>
              <div className="text-blue-700 space-y-2">
                <p><strong>Instagram Basic Display API has been deprecated!</strong></p>
                <p>Meta has consolidated Instagram authentication into Facebook Login. You now use <strong>Facebook Login</strong> to access Instagram data.</p>
                <p>✅ <strong>Good news:</strong> Your existing Facebook app can handle Instagram authentication!</p>
              </div>
            </div>

            {/* Configuration Status */}
            <div className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">📋 Current Configuration</h2>
              <div className="bg-gray-50 rounded-lg p-6">
                {config ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-semibold text-gray-700 mb-2">Environment</h3>
                      <p className="text-sm font-mono bg-white p-2 rounded border">
                        {config.environment || 'Not detected'}
                      </p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-700 mb-2">Facebook App ID</h3>
                      <p className="text-sm font-mono bg-white p-2 rounded border">
                        {config.clientId ? `${config.clientId.substring(0, 8)}...` : 'Not configured'}
                      </p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-700 mb-2">App Secret</h3>
                      <p className="text-sm font-mono bg-white p-2 rounded border">
                        {config.hasClientSecret ? 'Configured ✅' : 'Missing ❌'}
                      </p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-700 mb-2">Base URL</h3>
                      <p className="text-sm font-mono bg-white p-2 rounded border">
                        {config.baseUrl || 'Not configured'}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p>Loading configuration...</p>
                )}
              </div>
            </div>

            {/* Required Facebook App Settings */}
            <div className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">⚙️ Required Facebook App Settings</h2>
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <h3 className="font-semibold text-green-800 mb-3">✅ What you need to configure:</h3>
                <ol className="list-decimal list-inside space-y-3 text-green-700">
                  <li>Go to <a href="https://developers.facebook.com/" className="underline font-semibold" target="_blank" rel="noopener noreferrer">Facebook Developers</a></li>
                  <li>Select your app → Click on <strong>&quot;Authenticate and request data from users with Facebook Login&quot;</strong></li>
                  <li>Go to <strong>Facebook Login → Settings</strong></li>
                  <li><strong>Add these Valid OAuth Redirect URIs:</strong></li>
                </ol>
                
                <div className="mt-4 space-y-2">
                  <div className="bg-white p-3 rounded border border-green-300">
                    <code className="text-sm">https://www.imirezervimi.al/api/auth/callback/instagram-via-facebook</code>
                    <span className="ml-2 text-green-600 font-semibold">← Primary</span>
                  </div>
                  <div className="bg-white p-3 rounded border border-green-300">
                    <code className="text-sm">https://imirezervimi.al/api/auth/callback/instagram-via-facebook</code>
                    <span className="ml-2 text-yellow-600 font-semibold">← Fallback</span>
                  </div>
                </div>

                <div className="mt-4">
                  <h4 className="font-semibold mb-2">📋 Required Permissions:</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-white p-2 rounded border border-green-300">
                      <strong>email</strong> - User email address
                    </div>
                    <div className="bg-white p-2 rounded border border-green-300">
                      <strong>public_profile</strong> - Basic profile info
                    </div>
                    <div className="bg-white p-2 rounded border border-green-300">
                      <strong>instagram_basic</strong> - Instagram account access
                    </div>
                    <div className="bg-white p-2 rounded border border-green-300">
                      <strong>pages_show_list</strong> - Connected Instagram accounts
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
                    href={generateFacebookAuthUrl()}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2 rounded-lg hover:from-blue-700 hover:to-indigo-700"
                  >
                    🔗 Test Facebook Instagram Login
                  </a>
                )}
              </div>

              {testResults.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold mb-3">Test Results:</h3>
                  {testResults.map((result, index) => (
                    <div key={index} className={`p-3 mb-2 rounded border ${result.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{result.name}</span>
                        <span className={`px-2 py-1 rounded text-sm ${result.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {result.success ? '✅ Pass' : '❌ Fail'}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        <p>URL: {result.url}</p>
                        {result.status && <p>Status: {result.status}</p>}
                        {result.error && <p className="text-red-600">Error: {result.error}</p>}
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
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h3 className="font-semibold text-red-800 mb-2">❌ &quot;Access Denied&quot; or Login Fails</h3>
                  <ul className="list-disc list-inside text-red-700 space-y-1">
                    <li>Make sure redirect URIs are added to Facebook Login settings</li>
                    <li>Verify your Facebook App ID and Secret are correct</li>
                    <li>Check that your app is in &quot;Live&quot; mode or you&apos;re added as a test user</li>
                    <li>Ensure required permissions are requested in app settings</li>
                  </ul>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h3 className="font-semibold text-yellow-800 mb-2">⚠️ Instagram Data Not Available</h3>
                  <ul className="list-disc list-inside text-yellow-700 space-y-1">
                    <li>User must have an Instagram Business or Creator account</li>
                    <li>Instagram account must be connected to their Facebook page</li>
                    <li>User needs to grant instagram_basic permission</li>
                    <li>Some users may only have personal Instagram accounts (limited access)</li>
                  </ul>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="font-semibold text-green-800 mb-2">✅ Migration from Instagram Basic Display</h3>
                  <ul className="list-disc list-inside text-green-700 space-y-1">
                    <li>✅ No need to create a new app - use your existing Facebook app</li>
                    <li>✅ More stable and future-proof authentication method</li>
                    <li>✅ Access to both Facebook and Instagram data in one login</li>
                    <li>✅ Better permission management through Facebook</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Generated URLs */}
            {config?.clientId && (
              <div>
                <h2 className="text-2xl font-semibold mb-4">🔗 Generated OAuth URL</h2>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-2">This is the exact URL that will be used for Facebook Instagram OAuth:</p>
                  <div className="bg-white p-3 rounded border font-mono text-xs break-all">
                    {generateFacebookAuthUrl()}
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