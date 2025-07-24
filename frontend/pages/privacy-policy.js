// frontend/pages/privacy-policy.js
// Privacy Policy for ImiRezervimi.al

import Head from 'next/head';
import Link from 'next/link';

export default function PrivacyPolicy() {
  return (
    <>
      <Head>
        <title>Politika e Privatësisë - ImiRezervimi.al</title>
        <meta name="description" content="Politika e privatësisë për platformën ImiRezervimi.al" />
      </Head>

      <div className="min-h-screen bg-white">
        {/* Header */}
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-4xl mx-auto px-4 py-6">
            <Link href="/" className="inline-flex items-center text-red-600 hover:text-red-700">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Kthehu në ImiRezervimi.al
            </Link>
          </div>
        </header>

        {/* Content */}
        <div className="max-w-4xl mx-auto px-4 py-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Politika e Privatësisë</h1>
          
          <div className="prose prose-lg max-w-none space-y-8">
            {/* Introduction */}
            <section>
              <p className="text-gray-600 text-lg">
                <strong>E fundit përditësuar:</strong> {new Date().toLocaleDateString('sq-AL')}
              </p>
              <p className="mt-4">
                ImiRezervimi.al (&quot;ne&quot;, &quot;na&quot;, &quot;platforma jonë&quot;) respekton privatësinë tuaj dhe është e përkushtuar për të mbrojtur të dhënat tuaja personale. 
                Kjo politikë e privatësisë ju shpjegon se si ne mbledhim, përdorim dhe mbrojmë informacionin tuaj kur përdorni platformën tonë.
              </p>
            </section>

            {/* Information We Collect */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Informacioni që Mbledhim</h2>
              
              <h3 className="text-xl font-semibold mb-3">1.1 Informacioni që Jepni Vetë</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Emri dhe mbiemri juaj</li>
                <li>Adresa e email-it</li>
                <li>Numri i telefonit</li>
                <li>Informacioni i profilit të Instagram (nëse përdorni hyrjen me Instagram)</li>
                <li>Preferencat për rezervime</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3 mt-6">1.2 Informacioni i Mbledhur Automatikisht</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Informacioni i pajisjes (tipi i shfletuesit, sistemi operativ)</li>
                <li>Adresa IP</li>
                <li>Cookies dhe teknologji të ngjashme gjurmimi</li>
                <li>Aktiviteti në platformë (faqet e vizituara, koha e përdorimit)</li>
              </ul>
            </section>

            {/* How We Use Information */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Si Përdorim Informacionin</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>Për të krijuar dhe menaxhuar llogarinë tuaj</li>
                <li>Për të procesuar rezervimet tuaja</li>
                <li>Për të dërguar njoftime dhe komunikime të rëndësishme</li>
                <li>Për të përmirësuar shërbimet tona</li>
                <li>Për të siguruar platformën dhe parandaluar mashtrimet</li>
                <li>Për të përmbushur detyrimet ligjore</li>
              </ul>
            </section>

            {/* Instagram Data */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Të Dhënat e Instagram</h2>
              <p>
                Kur përdorni &quot;Hyrjen me Instagram&quot;, ne aksesojmë vetëm informacionin bazë të profilit tuaj:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-3">
                <li>Emri i përdoruesit të Instagram</li>
                <li>ID-ja e llogarisë</li>
                <li>Tipi i llogarisë (personale ose biznesi)</li>
              </ul>
              <p className="mt-4">
                <strong>Ne NUK aksesojmë:</strong> Fotot tuaja, postoimet, mesazhet private, ose të dhëna të tjera të ndjeshme.
              </p>
            </section>

            {/* Data Sharing */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Ndarja e Të Dhënave</h2>
              <p>Ne nuk i shesim, nuk i japim me qira ose nuk i ndajmë të dhënat tuaja personale me palë të treta, përveç:</p>
              <ul className="list-disc pl-6 space-y-2 mt-3">
                <li>Me sallonët e bukurisë për të procesuar rezervimet tuaja</li>
                <li>Me ofruesit e shërbimeve teknike (Vercel, Supabase, Twilio)</li>
                <li>Kur kërkohet nga ligji ose autoritetet kompetente</li>
                <li>Me pëlqimin tuaj të qartë</li>
              </ul>
            </section>

            {/* Data Security */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Siguria e Të Dhënave</h2>
              <p>
                Ne implementojmë masa të përshtatshme teknike dhe organizative për të mbrojtur të dhënat tuaja:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-3">
                <li>Enkriptimi i të dhënave në transit dhe në pushim</li>
                <li>Aksesi i kufizuar në të dhënat personale</li>
                <li>Monitorimi i rregullt i sigurisë</li>
                <li>Backup-e të sigurta</li>
              </ul>
            </section>

            {/* Your Rights */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Të Drejtat Tuaja</h2>
              <p>Ju keni të drejtën të:</p>
              <ul className="list-disc pl-6 space-y-2 mt-3">
                <li>Aksesoni të dhënat tuaja personale</li>
                <li>Korrigjoni informacionin e pasaktë</li>
                <li>Fshini llogarinë dhe të dhënat tuaja</li>
                <li>Kufizoni përpunimin e të dhënave</li>
                <li>Transferoni të dhënat tuaja</li>
                <li>Kundërshtoni përpunimin për qëllime specifike</li>
              </ul>
            </section>

            {/* Data Deletion */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Fshirja e Të Dhënave</h2>
              <p>
                Për të kërkuar fshirjen e të dhënave tuaja:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-3">
                <li>Dërgoni një email në: <a href="mailto:privacy@imirezervimi.al" className="text-red-600 hover:underline">privacy@imirezervimi.al</a></li>
                <li>Ose përdorni formularin e fshirjes së të dhënave në llogarinë tuaj</li>
                <li>Do të përpunojmë kërkesën tuaj brenda 30 ditëve</li>
              </ul>
            </section>

            {/* Cookies */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Cookies dhe Gjurmimi</h2>
              <p>
                Përdorim cookies për të përmirësuar përvojën tuaj. Mund të kontrolloni cookies përmes cilësimeve të shfletuesit tuaj.
              </p>
            </section>

            {/* Changes */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Ndryshime në Politikë</h2>
              <p>
                Mund të përditësojmë këtë politikë privatësie. Do t&apos;ju njoftojmë për ndryshime të rëndësishme përmes email-it ose njoftimeve në platformë.
              </p>
            </section>

            {/* Contact */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Kontakti</h2>
              <p>
                Për pyetje rreth kësaj politike privatësie ose të drejtave tuaja:
              </p>
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <p><strong>Email:</strong> <a href="mailto:privacy@imirezervimi.al" className="text-red-600 hover:underline">privacy@imirezervimi.al</a></p>
                <p><strong>Adresa:</strong> ImiRezervimi.al, Tiranë, Shqipëri</p>
              </div>
            </section>

            {/* Footer */}
            <section className="border-t pt-8 mt-12">
              <p className="text-gray-600 text-center">
                © 2025 ImiRezervimi.al. Të gjitha të drejtat e rezervuara.
              </p>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}