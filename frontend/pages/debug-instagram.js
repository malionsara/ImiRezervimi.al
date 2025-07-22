// frontend/pages/debug-instagram.js
// Instagram OAuth debugging page

import { useState, useEffect } from 'react';
import Head from 'next/head';

export default function DebugInstagram() {
  const [debugInfo, setDebugInfo] = useState({});

  useEffect(() => {
    const checkEnvironment = () => {
      setDebugInfo({
        currentUrl: window.location.href,
        currentDomain: window.location.hostname,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString()
      });
    };

    checkEnvironment();
  }, []);

  const testUrls = [
    'https://imirezervimi.al/api/auth/callback/instagram',
    'https://www.imirezervimi.al/api/auth/callback/instagram',
    'https://imirezervimi.al/api/auth/deauthorize',
    'https://www.imirezervimi.al/api/auth/deauthorize',
    'https://imirezervimi.al/api/auth/data-deletion',
    'https://www.imirezervimi.al/api/auth/data-deletion'
  ];

  const testUrl = async (url) => {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      return {
        url,
        status: response.status,
        ok: response.ok,
        redirected: response.redirected,
        finalUrl: response.url
      };
    } catch (error) {
      return {
        url,
        error: error.message
      };
    }
  };

  const runTests = async () => {
    const results = await Promise.all(testUrls.map(testUrl));
    console.log('URL Test Results:', results);
    return results;
  };

  const generateInstagramUrl = () => {
    const clientId = '1075659340661921';
    const baseUrl = debugInfo.currentDomain?.includes('www') 
      ? 'https://www.imirezervimi.al' 
      : 'https://imirezervimi.al';
    
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: `${baseUrl}/api/auth/callback/instagram`,
      scope: 'user_profile,user_media',
      response_type: 'code',
      state: 'debug_' + Math.random().toString(36).substr(2, 9)
    });

    return `https://api.instagram.com/oauth/authorize?${params.toString()}`;
  };

  return (
    <>
      <Head>
        <title>Instagram OAuth Debug - ImiRezervimi.al</title>
      </Head>

      <div className="min-h-screen bg-gray-100 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">
              Instagram OAuth Debug Tool
            </h1>

            {/* Environment Info */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Environment Information</h2>
              <div className="bg-gray-50 p-4 rounded-lg">
                <pre className="text-sm">
                  {JSON.stringify(debugInfo, null, 2)}
                </pre>
              </div>
            </div>

            {/* URL Configuration */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Required Instagram App URLs</h2>
              <div className="space-y-2">
                <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                  <strong>OAuth Redirect URIs (add BOTH to Instagram app):</strong>
                  <ul className="mt-2 space-y-1">
                    <li className="font-mono text-sm">https://imirezervimi.al/api/auth/callback/instagram</li>
                    <li className="font-mono text-sm">https://www.imirezervimi.al/api/auth/callback/instagram</li>
                  </ul>
                </div>
                <div className="p-3 bg-green-50 border border-green-200 rounded">
                  <strong>Deauthorize Callback URL:</strong>
                  <p className="font-mono text-sm mt-1">https://www.imirezervimi.al/api/auth/deauthorize</p>
                </div>
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                  <strong>Data Deletion Request URL:</strong>
                  <p className="font-mono text-sm mt-1">https://www.imirezervimi.al/api/auth/data-deletion</p>
                </div>
              </div>
            </div>

            {/* Test Instagram OAuth */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Test Instagram OAuth</h2>
              <div className="space-y-4">
                <button
                  onClick={runTests}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Test All URLs
                </button>
                
                <a
                  href={generateInstagramUrl()}
                  className="inline-block bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg hover:from-purple-700 hover:to-pink-700"
                >
                  Test Instagram Login
                </a>
              </div>
            </div>

            {/* Instructions */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Fix Instructions</h2>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h3 className="font-semibold text-red-800 mb-2">To fix the 302 error:</h3>
                <ol className="list-decimal list-inside space-y-2 text-red-700">
                  <li>Go to <a href="https://developers.facebook.com/" className="underline">Facebook Developers Console</a></li>
                  <li>Open your Instagram Basic Display app</li>
                  <li>Go to Instagram Basic Display → Basic Display</li>
                  <li>In &quot;OAuth Redirect URIs&quot;, add BOTH URLs:</li>
                  <ul className="list-disc list-inside ml-6 mt-1 space-y-1">
                    <li><code>https://imirezervimi.al/api/auth/callback/instagram</code></li>
                    <li><code>https://www.imirezervimi.al/api/auth/callback/instagram</code></li>
                  </ul>
                  <li>Save the configuration</li>
                  <li>Wait 5-10 minutes for changes to propagate</li>
                  <li>Test the Instagram login again</li>
                </ol>
              </div>
            </div>

            {/* Current Configuration */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Current Configuration</h2>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p><strong>Instagram Client ID:</strong> 1075659340661921</p>
                <p><strong>Current Domain:</strong> {debugInfo.currentDomain}</p>
                <p><strong>Generated OAuth URL:</strong></p>
                <div className="mt-2 p-2 bg-white border rounded text-xs break-all">
                  {generateInstagramUrl()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}