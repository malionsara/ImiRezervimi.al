// frontend/components/TwilioTestPanel.tsx
// Test panel for Twilio WhatsApp integration
// Albanian Beauty Salon Booking Platform

import { useState } from 'react';

interface TestResult {
  success: boolean;
  data?: unknown;
  error?: unknown;
}

const TwilioTestPanel: React.FC = () => {
  const [testPhone, setTestPhone] = useState('+355691234567');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Record<string, TestResult>>({});

  const runTest = async (testType: string) => {
    setLoading(true);
    
    try {
      const response = await fetch(`/api/twilio/test?type=${testType}&phone=${encodeURIComponent(testPhone)}`);
      const result = await response.json();
      
      setResults(prev => ({
        ...prev,
        [testType]: result
      }));
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      setResults(prev => ({
        ...prev,
        [testType]: {
          success: false,
          error: errorMessage
        }
      }));
    } finally {
      setLoading(false);
    }
  };

  const sendCustomMessage = async () => {
    setLoading(true);
    
    try {
      const response = await fetch('/api/twilio/send-whatsapp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: testPhone,
          message: '🧪 Test mesazh nga ImiRezervimi.al\n\nKy është një test mesazh për të verifikuar WhatsApp integrimin! ✅'
        }),
      });
      
      const result = await response.json();
      
      setResults(prev => ({
        ...prev,
        custom: result
      }));
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      setResults(prev => ({
        ...prev,
        custom: {
          success: false,
          error: errorMessage
        }
      }));
    } finally {
      setLoading(false);
    }
  };

  const testTypes = [
    { key: 'connection', label: 'Test Connection', description: 'Test basic Twilio connection' },
    { key: 'booking_request', label: 'Booking Request', description: 'Test booking request template' },
    { key: 'booking_approved', label: 'Booking Approved', description: 'Test booking approved template' },
    { key: 'booking_declined', label: 'Booking Declined', description: 'Test booking declined template' },
    { key: 'reminder', label: 'Reminder', description: 'Test 24h reminder template' },
    { key: 'salon_notification', label: 'Salon Notification', description: 'Test salon notification template' },
  ];

  const getResultColor = (result?: TestResult) => {
    if (!result) return 'bg-gray-100';
    return result.success ? 'bg-green-100 border-green-300' : 'bg-red-100 border-red-300';
  };

  const getResultIcon = (result?: TestResult) => {
    if (!result) return '⏳';
    return result.success ? '✅' : '❌';
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          🧪 Twilio WhatsApp Test Panel
        </h2>
        <p className="text-gray-600">
          Test WhatsApp integration dhe Albanian message templates
        </p>
      </div>

      {/* Phone Number Input */}
      <div className="mb-6">
        <label htmlFor="testPhone" className="block text-sm font-medium text-gray-700 mb-2">
          Test Phone Number (Albanian format)
        </label>
        <input
          type="tel"
          id="testPhone"
          value={testPhone}
          onChange={(e) => setTestPhone(e.target.value)}
          placeholder="+355691234567"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
        />
        <p className="text-xs text-gray-500 mt-1">
          Duhet të jetë në formatin +355XXXXXXXX
        </p>
      </div>

      {/* Test Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {testTypes.map((test) => (
          <div key={test.key} className="border rounded-lg p-4">
            <h3 className="font-semibold text-gray-800 mb-1">{test.label}</h3>
            <p className="text-sm text-gray-600 mb-3">{test.description}</p>
            <button
              onClick={() => runTest(test.key)}
              disabled={loading}
              className="w-full bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-md transition-colors"
            >
              {loading ? 'Testing...' : 'Run Test'}
            </button>
            
            {/* Result Display */}
            {results[test.key] && (
              <div className={`mt-3 p-2 rounded border ${getResultColor(results[test.key])}`}>
                <div className="flex items-center gap-2 text-sm">
                  <span>{getResultIcon(results[test.key])}</span>
                  <span className="font-medium">
                    {results[test.key].success ? 'Success' : 'Failed'}
                  </span>
                </div>
                {results[test.key].error ? (
                  <p className="text-xs text-red-600 mt-1">
                    {typeof results[test.key].error === 'object' && results[test.key].error !== null && 'message' in (results[test.key].error as object)
                      ? (results[test.key].error as { message: string }).message
                      : String(results[test.key].error)}
                  </p>
                ) : null}
                {results[test.key].data ? (
                  <pre className="text-xs text-gray-600 mt-1 overflow-x-auto">
                    {JSON.stringify(results[test.key].data, null, 2)}
                  </pre>
                ) : null}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Custom Message Test */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Custom Message Test</h3>
        <button
          onClick={sendCustomMessage}
          disabled={loading}
          className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-6 py-2 rounded-md transition-colors"
        >
          {loading ? 'Sending...' : 'Send Custom Test Message'}
        </button>
        
        {results.custom && (
          <div className={`mt-3 p-3 rounded border ${getResultColor(results.custom)}`}>
            <div className="flex items-center gap-2 text-sm mb-2">
              <span>{getResultIcon(results.custom)}</span>
              <span className="font-medium">
                {results.custom.success ? 'Message Sent' : 'Failed'}
              </span>
            </div>
            {results.custom.error && (
              <p className="text-sm text-red-600">
                {typeof results.custom.error === 'object' && results.custom.error !== null && 'message' in (results.custom.error as object)
                  ? (results.custom.error as { message: string }).message
                  : String(results.custom.error)}
              </p>
            )}
            {results.custom.data && (
              <pre className="text-xs text-gray-600 overflow-x-auto">
                {JSON.stringify(results.custom.data, null, 2)}
              </pre>
            )}
          </div>
        )}
      </div>

      {/* Environment Info */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium text-gray-800 mb-2">Environment Info</h4>
        <div className="text-sm text-gray-600 space-y-1">
          <p><strong>Environment:</strong> {process.env.NODE_ENV}</p>
          <p><strong>Note:</strong> Twilio credentials are server-side only for security</p>
          <p><strong>Test Status:</strong> Use the test buttons above to verify configuration</p>
        </div>
      </div>
    </div>
  );
};

export default TwilioTestPanel;