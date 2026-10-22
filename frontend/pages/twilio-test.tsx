// frontend/pages/twilio-test.tsx
// Test page for Twilio WhatsApp integration
// Albanian Beauty Salon Booking Platform

import { GetServerSideProps } from 'next';
import Head from 'next/head';
import TwilioTestPanel from '../components/TwilioTestPanel';

interface TwilioTestPageProps {
  isProduction: boolean;
}

const TwilioTestPage: React.FC<TwilioTestPageProps> = ({ isProduction }) => {
  if (isProduction) {
    return (
      <div className="min-h-screen bg-sand flex items-center justify-center">
        <div className="bg-paper p-8 rounded-lg shadow-soft text-center">
          <h1 className="text-2xl font-bold text-accent mb-4">🚫 Access Denied</h1>
          <p className="text-clay">
            Test page is not available in production environment.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Twilio WhatsApp Test - ImiRezervimi.al</title>
        <meta name="description" content="Test Twilio WhatsApp integration for ImiRezervimi.al" />
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <div className="min-h-screen bg-sand py-8">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="h-12 w-12 rounded bg-accent flex items-center justify-center shadow-soft">
                <span className="text-xl font-bold text-white">IR</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-ink">ImiRezervimi.al</h1>
                <p className="text-clay">Twilio WhatsApp Integration Test</p>
              </div>
            </div>
          </div>

          {/* Test Panel */}
          <TwilioTestPanel />

          {/* Instructions */}
          <div className="max-w-4xl mx-auto mt-8 p-6 bg-accent-soft/40 rounded-lg">
            <h3 className="text-lg font-semibold text-accent-strong mb-3">📋 Setup Instructions</h3>
            <div className="text-sm text-accent-strong space-y-2">
              <p><strong>1. Twilio Account Setup:</strong></p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Create account at <a href="https://console.twilio.com" target="_blank" rel="noopener noreferrer" className="underline">console.twilio.com</a></li>
                <li>Get Account SID and Auth Token from Console Dashboard</li>
                <li>Enable WhatsApp Sandbox for testing</li>
              </ul>
              
              <p><strong>2. Environment Variables:</strong></p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li><code>TWILIO_ACCOUNT_SID</code> - Your Twilio Account SID</li>
                <li><code>TWILIO_AUTH_TOKEN</code> - Your Twilio Auth Token</li>
                <li><code>TWILIO_WHATSAPP_NUMBER</code> - Twilio WhatsApp number (sandbox: +14155238886)</li>
                <li><code>TWILIO_TEST_PHONE_NUMBER</code> - Your test phone number (+355XXXXXXXX)</li>
              </ul>
              
              <p><strong>3. WhatsApp Sandbox Setup:</strong></p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Go to Twilio Console → Messaging → Try it out → Send a WhatsApp message</li>
                <li>Send &quot;join [sandbox-name]&quot; to +14155238886 from your WhatsApp</li>
                <li>Your phone number is now connected to the sandbox</li>
              </ul>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-8 text-clay text-sm">
            <p>🧪 Development Environment Only</p>
            <p>Made with ❤️ for Albanian beauty salons</p>
          </div>
        </div>
      </div>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async () => {
  return {
    props: {
      isProduction: process.env.NODE_ENV === 'production',
    },
  };
};

export default TwilioTestPage;