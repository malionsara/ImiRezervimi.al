// frontend/pages/facebook-review-instructions.js
// Instructions for Facebook App Reviewers

import Head from 'next/head';

export default function FacebookReviewInstructions() {
  return (
    <>
      <Head>
        <title>Facebook App Review Instructions - ImiRezervimi.al</title>
        <meta name="description" content="Instructions for Facebook reviewers to test Instagram Basic Display integration" />
      </Head>

      <div className="min-h-screen bg-white">
        {/* Header */}
        <header className="bg-blue-600 text-white">
          <div className="max-w-4xl mx-auto px-4 py-6">
            <h1 className="text-2xl font-bold">Facebook App Review Instructions</h1>
            <p className="mt-2">ImiRezervimi.al - Instagram Basic Display Integration</p>
          </div>
        </header>

        {/* Content */}
        <div className="max-w-4xl mx-auto px-4 py-12">
          
          {/* Quick Overview */}
          <section className="mb-12 bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-lg">
            <h2 className="text-xl font-bold text-blue-900 mb-4">📋 Instagram Login Test</h2>
            <div className="text-center">
              <p className="text-lg mb-4"><strong>Review Time:</strong> 2 minutes</p>
              <p><strong>Purpose:</strong> User authentication only</p>
              <p><strong>Data:</strong> Username + User ID (nothing else)</p>
            </div>
          </section>

          {/* Testing Steps */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">🔑 Login Flow Test</h2>
            
            <div className="text-center space-y-6">
              <div className="bg-blue-600 text-white p-8 rounded-lg">
                <h3 className="text-2xl font-bold mb-4">Test Instagram Login</h3>
                <p className="mb-6">Click below to test the login flow</p>
                <a 
                  href="https://www.imirezervimi.al/login" 
                  className="bg-white text-blue-600 px-8 py-3 rounded-lg font-bold hover:bg-gray-100 inline-block"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  → Test Login Now
                </a>
              </div>
              
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div className="p-4 border rounded">
                  <div className="text-2xl mb-2">1️⃣</div>
                  <strong>Click Instagram button</strong>
                </div>
                <div className="p-4 border rounded">
                  <div className="text-2xl mb-2">2️⃣</div>
                  <strong>Authorize with Instagram</strong>
                </div>
                <div className="p-4 border rounded">
                  <div className="text-2xl mb-2">✅</div>
                  <strong>Login successful</strong>
                </div>
              </div>
            </div>
          </section>

          {/* What We Access */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">📋 What We Access</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="border border-green-200 rounded-lg p-6 bg-green-50">
                <h3 className="font-semibold mb-3 text-green-800">✅ We Access</h3>
                <ul className="space-y-2 text-sm text-green-700">
                  <li>Username (for profile display)</li>
                  <li>User ID (for account identification)</li>
                </ul>
              </div>
              
              <div className="border border-red-200 rounded-lg p-6 bg-red-50">
                <h3 className="font-semibold mb-3 text-red-800">❌ We DON&apos;T Access</h3>
                <ul className="space-y-2 text-sm text-red-700">
                  <li>Photos or media</li>
                  <li>Posts or stories</li>
                  <li>Messages or DMs</li>
                  <li>Friends or followers</li>
                  <li>Location or check-ins</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Purpose */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">🎯 Purpose</h2>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
              <p className="text-lg">
                <strong>Simple user authentication for Albanian beauty salon booking platform</strong>
              </p>
              <p className="mt-3 text-sm text-gray-600">
                Users discover salons on Instagram → Easy login with Instagram → Book appointments
              </p>
            </div>
          </section>

          {/* GDPR Compliance */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">🛡️ Privacy Compliance</h2>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="text-center p-4 border border-green-200 rounded-lg bg-green-50">
                <h4 className="font-semibold mb-2">📋 Privacy Policy</h4>
                <a href="https://www.imirezervimi.al/privacy-policy" className="text-blue-600 hover:underline text-sm">
                  View Albanian Privacy Policy
                </a>
              </div>
              
              <div className="text-center p-4 border border-blue-200 rounded-lg bg-blue-50">
                <h4 className="font-semibold mb-2">🗑️ Data Deletion</h4>
                <a href="https://www.imirezervimi.al/api/auth/data-deletion" className="text-blue-600 hover:underline text-sm">
                  Active GDPR Endpoint
                </a>
              </div>
            </div>
          </section>

          {/* Contact */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">📞 Contact</h2>
            
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
              <p>Questions? Contact: <strong>fatjona.bucpapaj@gmail.com</strong></p>
            </div>
          </section>


          {/* Footer */}
          <section className="text-center border-t pt-8">
            <div className="bg-blue-600 text-white p-6 rounded-lg">
              <h3 className="text-xl font-bold mb-4">Ready to Test?</h3>
              <a href="https://www.imirezervimi.al/login" className="bg-white text-blue-600 px-6 py-3 rounded-lg font-bold hover:bg-gray-100 inline-block">
                Test Instagram Login Now →
              </a>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}