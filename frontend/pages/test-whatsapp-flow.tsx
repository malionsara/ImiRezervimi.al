// frontend/pages/test-whatsapp-flow.tsx
// WhatsApp Flow Testing Interface for ImiRezervimi.al
// Albanian Beauty Salon Booking Platform

import React, { useState } from 'react';
import Head from 'next/head';
import { AlertModal } from '../components/ui/ConfirmationModal';
import { useAlertModal } from '../hooks/useModals';

interface TestResult {
  test: string;
  status: 'success' | 'failed';
  message: string;
  error?: string;
}

interface TestSummary {
  total: number;
  passed: number;
  failed: number;
}

export default function TestWhatsAppFlow() {
  const [testPhone, setTestPhone] = useState('+355691234567');
  const [testType, setTestType] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);
  const [summary, setSummary] = useState<TestSummary | null>(null);
  const alertModal = useAlertModal();

  const runTests = async () => {
    if (!testPhone) {
      alertModal.showAlert({
        title: 'Gabim',
        message: 'Ju lutem vendosni numrin e telefonit për test',
        variant: 'warning'
      });
      return;
    }

    setIsLoading(true);
    setResults([]);
    setSummary(null);

    try {
      const response = await fetch('/api/test/whatsapp-flow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          testPhone,
          testType,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setResults(data.results || []);
        setSummary(data.summary || null);
      } else {
        alertModal.showAlert({
          title: 'Test dështoi',
          message: data.error?.message || 'Gabim i panjohur',
          variant: 'error'
        });
      }
    } catch (error) {
      console.error('Test error:', error);
      alertModal.showAlert({
        title: 'Gabim',
        message: 'Ka ndodhur një gabim gjatë testimit',
        variant: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>WhatsApp Flow Testing - ImiRezervimi.al</title>
        <meta name="description" content="Test WhatsApp notification flow" />
      </Head>

      <div className="min-h-screen bg-cream py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-paper rounded-lg shadow-soft p-6">
            <h1 className="text-3xl font-bold text-ink mb-6">
              🧪 WhatsApp Flow Testing
            </h1>

            <div className="bg-accent-soft/40 border border-accent/25 rounded-lg p-4 mb-6">
              <h2 className="font-semibold text-blue-900 mb-2">📋 Si të testoni:</h2>
              <ol className="list-decimal list-inside text-accent-strong space-y-1">
                <li>Sigurohuni që numri juaj i WhatsApp është i lidhur me Twilio Sandbox</li>
                <li>Dërgoni &quot;join [sandbox-name]&quot; te +14155238886</li>
                <li>Vendosni numrin tuaj të telefonit më poshtë</li>
                <li>Zgjidhni llojin e testit që doni të ekzekutoni</li>
                <li>Klikoni &quot;Fillo Testet&quot; dhe kontrolloni WhatsApp-in tuaj</li>
              </ol>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-ink mb-2">
                  Numri i Telefonit për Test
                </label>
                <input
                  type="tel"
                  value={testPhone}
                  onChange={(e) => setTestPhone(e.target.value)}
                  placeholder="+355691234567"
                  className="w-full px-3 py-2 border border-linen rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-xs text-clay mt-1">
                  Format: +355XXXXXXXX (numër shqiptar)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-ink mb-2">
                  Lloji i Testit
                </label>
                <select
                  value={testType}
                  onChange={(e) => setTestType(e.target.value)}
                  className="w-full px-3 py-2 border border-linen rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">Të gjitha testet</option>
                  <option value="basic">Mesazh bazik</option>
                  <option value="booking_request">Konfirmim rezervimi</option>
                  <option value="booking_approved">Rezervim i aprovuar</option>
                  <option value="booking_declined">Rezervim i refuzuar</option>
                  <option value="salon_notification">Njoftim për salon</option>
                  <option value="reminder">Kujtesë 24-orëshe</option>
                </select>
              </div>
            </div>

            <button
              onClick={runTests}
              disabled={isLoading || !testPhone}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? '🔄 Po teston...' : '🚀 Fillo Testet'}
            </button>

            {summary && (
              <div className="mt-6 p-4 border rounded-lg">
                <h3 className="font-semibold text-lg mb-2">📊 Përmbledhje e Testeve</h3>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-2 bg-cream rounded">
                    <div className="text-2xl font-bold text-ink">{summary.total}</div>
                    <div className="text-sm text-clay">Total</div>
                  </div>
                  <div className="p-2 bg-success/5 rounded">
                    <div className="text-2xl font-bold text-success">{summary.passed}</div>
                    <div className="text-sm text-success">Kaluan</div>
                  </div>
                  <div className="p-2 bg-accent-soft/60 rounded">
                    <div className="text-2xl font-bold text-accent">{summary.failed}</div>
                    <div className="text-sm text-accent">Dështuan</div>
                  </div>
                </div>
              </div>
            )}

            {results.length > 0 && (
              <div className="mt-6">
                <h3 className="font-semibold text-lg mb-4">📝 Rezultatet e Testeve</h3>
                <div className="space-y-3">
                  {results.map((result, index) => (
                    <div
                      key={index}
                      className={`p-4 border rounded-lg ${
                        result.status === 'success'
                          ? 'border-success/25 bg-success/5'
                          : 'border-accent/25 bg-accent-soft/60'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{result.test}</h4>
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            result.status === 'success'
                              ? 'bg-green-200 text-success'
                              : 'bg-red-200 text-red-800'
                          }`}
                        >
                          {result.status === 'success' ? '✅ Sukses' : '❌ Dështim'}
                        </span>
                      </div>
                      <p className="text-sm text-clay mt-1">{result.message}</p>
                      {result.error && (
                        <p className="text-sm text-accent mt-1">
                          <strong>Gabim:</strong> {result.error}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-8 text-center text-sm text-clay">
              <p>🔧 Development Testing Tool - ImiRezervimi.al</p>
            </div>
          </div>
        </div>
      </div>

      {/* Alert Modal */}
      <AlertModal
        isOpen={alertModal.isOpen}
        onClose={alertModal.hideAlert}
        title={alertModal.title}
        message={alertModal.message}
        variant={alertModal.variant}
        buttonText={alertModal.buttonText}
      />
    </>
  );
}