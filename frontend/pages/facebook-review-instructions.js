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

      <div className="min-h-screen bg-paper">
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
          <section className="mb-12 bg-accent-soft/40 border-l-4 border-blue-500 p-6 rounded-r-lg">
            <h2 className="text-xl font-bold text-blue-900 mb-4">📋 Instagram Login Test</h2>
            <div className="text-center">
              <p className="text-lg mb-4"><strong>Review Time:</strong> 2 minutes</p>
              <p><strong>Purpose:</strong> User authentication only</p>
              <p><strong>Data:</strong> Username + User ID (nothing else)</p>
            </div>
          </section>

          {/* Testing Steps */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-ink mb-6">🔑 Login Flow Test</h2>
            
            <div className="text-center space-y-6">
              <div className="bg-blue-600 text-white p-8 rounded-lg">
                <h3 className="text-2xl font-bold mb-4">Test Instagram Login</h3>
                <p className="mb-6">Click below to test the login flow</p>
                <a 
                  href="https://www.imirezervimi.al/login" 
                  className="bg-paper text-accent px-8 py-3 rounded-lg font-bold hover:bg-sand inline-block"
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
            <h2 className="text-2xl font-bold text-ink mb-6">📋 What We Access</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="border border-success/25 rounded-lg p-6 bg-success/5">
                <h3 className="font-semibold mb-3 text-success">✅ We Access</h3>
                <ul className="space-y-2 text-sm text-success">
                  <li>Username (for profile display)</li>
                  <li>User ID (for account identification)</li>
                </ul>
              </div>
              
              <div className="border border-accent/25 rounded-lg p-6 bg-accent-soft/60">
                <h3 className="font-semibold mb-3 text-red-800">❌ We DON&apos;T Access</h3>
                <ul className="space-y-2 text-sm text-accent-strong">
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
            <h2 className="text-2xl font-bold text-ink mb-6">🎯 Purpose</h2>
            
            <div className="bg-accent-soft/40 border border-accent/25 rounded-lg p-6 text-center">
              <p className="text-lg">
                <strong>Simple user authentication for Albanian beauty salon booking platform</strong>
              </p>
              <p className="mt-3 text-sm text-clay">
                Users discover salons on Instagram → Easy login with Instagram → Book appointments
              </p>
            </div>
          </section>

          {/* GDPR Compliance */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-ink mb-6">🛡️ Privacy Compliance</h2>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="text-center p-4 border border-success/25 rounded-lg bg-success/5">
                <h4 className="font-semibold mb-2">📋 Privacy Policy</h4>
                <a href="https://www.imirezervimi.al/privacy-policy" className="text-accent hover:underline text-sm">
                  View Albanian Privacy Policy
                </a>
              </div>
              
              <div className="text-center p-4 border border-accent/25 rounded-lg bg-accent-soft/40">
                <h4 className="font-semibold mb-2">🗑️ Data Deletion</h4>
                <a href="https://www.imirezervimi.al/api/auth/data-deletion" className="text-accent hover:underline text-sm">
                  Active GDPR Endpoint
                </a>
              </div>
            </div>
          </section>

          {/* Contact */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-ink mb-6">📞 Contact</h2>
            
            <div className="bg-cream border border-linen rounded-lg p-6 text-center">
              <p>Questions? Contact: <strong>fatjona.bucpapaj@gmail.com</strong></p>
            </div>
          </section>


          {/* Footer */}
          <section className="text-center border-t pt-8">
            <div className="bg-blue-600 text-white p-6 rounded-lg">
              <h3 className="text-xl font-bold mb-4">Ready to Test?</h3>
              <a href="https://www.imirezervimi.al/login" className="bg-paper text-accent px-6 py-3 rounded-lg font-bold hover:bg-sand inline-block">
                Test Instagram Login Now →
              </a>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}