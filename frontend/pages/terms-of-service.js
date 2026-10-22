// frontend/pages/terms-of-service.js
// Terms of Service for ImiRezervimi.al

import Head from 'next/head';
import Link from 'next/link';

export default function TermsOfService() {
  return (
    <>
      <Head>
        <title>Kushtet e Shërbimit - ImiRezervimi.al</title>
        <meta name="description" content="Kushtet e shërbimit për platformën ImiRezervimi.al" />
      </Head>

      <div className="min-h-screen bg-paper">
        {/* Header */}
        <header className="bg-paper border-b border-linen">
          <div className="max-w-4xl mx-auto px-4 py-6">
            <Link href="/" className="inline-flex items-center text-accent hover:text-accent-strong">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Kthehu në ImiRezervimi.al
            </Link>
          </div>
        </header>

        {/* Content */}
        <div className="max-w-4xl mx-auto px-4 py-12">
          <h1 className="font-display text-4xl text-ink mb-8">Kushtet e Shërbimit</h1>
          
          <div className="prose prose-lg max-w-none space-y-8">
            {/* Introduction */}
            <section>
              <p className="text-clay text-lg">
                <strong>E fundit përditësuar:</strong> {new Date().toLocaleDateString('sq-AL')}
              </p>
              <p className="mt-4">
                Mirë se erdhët në ImiRezervimi.al (&quot;Platforma&quot;, &quot;ne&quot;, &quot;na&quot;). Këto kushte shërbimi (&quot;Kushtet&quot;) rregullojnë përdorimin tuaj të platformës sonë të rezervimeve online për sallone bukurie në Shqipëri.
              </p>
            </section>

            {/* Acceptance */}
            <section>
              <h2 className="font-display text-2xl text-ink mb-4">1. Pranimi i Kushteve</h2>
              <p>
                Duke përdorur ImiRezervimi.al, ju pranoni të jeni të detyruar nga këto Kushte. Nëse nuk pajtoheni me ndonjë pjesë të këtyre Kushteve, ju lutemi mos e përdorni platformën.
              </p>
            </section>

            {/* Description of Service */}
            <section>
              <h2 className="font-display text-2xl text-ink mb-4">2. Përshkrimi i Shërbimit</h2>
              <p>
                ImiRezervimi.al është një platformë online që lejon përdoruesit të:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-3">
                <li>Zbulojnë sallone bukurie në Shqipëri</li>
                <li>Rezervojnë takime për shërbime bukurie</li>
                <li>Menaxhojnë rezervimet e tyre</li>
                <li>Komunikojnë me sallonët përmes platformës</li>
              </ul>
            </section>

            {/* User Account */}
            <section>
              <h2 className="font-display text-2xl text-ink mb-4">3. Llogaria e Përdoruesit</h2>
              
              <h3 className="text-xl font-semibold mb-3">3.1 Regjistrimi</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Duhet të jeni të paktën 16 vjeç për të përdorur shërbimin</li>
                <li>Duhet të siguroni informacion të saktë dhe të plotë</li>
                <li>Jeni përgjegjës për ruajtjen e sigurisë së llogarisë suaj</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3 mt-6">3.2 Përgjegjësitë</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Mbani llogarinë tuaj të përditësuar</li>
                <li>Njoftoni menjëherë për çdo përdorim të paautorizuar</li>
                <li>Jeni përgjegjës për të gjitha aktivitetet në llogarinë tuaj</li>
              </ul>
            </section>

            {/* Booking Terms */}
            <section>
              <h2 className="font-display text-2xl text-ink mb-4">4. Kushtet e Rezervimit</h2>
              
              <h3 className="text-xl font-semibold mb-3">4.1 Bërja e Rezervimeve</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Rezervimet konfirmohen nga salloni përkatës</li>
                <li>Çmimet dhe disponueshmëria mund të ndryshojnë</li>
                <li>Politikat e anullimit ndryshojnë sipas sallonit</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3 mt-6">4.2 Pagesat</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Pagesat kryhen drejtpërdrejt me sallonin</li>
                <li>ImiRezervimi.al nuk përpunon pagesa në këtë fazë</li>
                <li>Çdo mosmarrëveshje pagese duhet zgjidhur me sallonin</li>
              </ul>
            </section>

            {/* User Conduct */}
            <section>
              <h2 className="font-display text-2xl text-ink mb-4">5. Sjellja e Përdoruesit</h2>
              <p>Ju pajtoheni të MOS:</p>
              <ul className="list-disc pl-6 space-y-2 mt-3">
                <li>Përdorni platformën për qëllime të paligjshme</li>
                <li>Ngarkoni përmbajtje të dëmshme ose të papërshtatshme</li>
                <li>Bëni rezervime të rreme ose mashtrues</li>
                <li>Shkelni të drejtat e të tjerëve</li>
                <li>Tentoni të aksesoni sisteme pa autorizim</li>
              </ul>
            </section>

            {/* Intellectual Property */}
            <section>
              <h2 className="font-display text-2xl text-ink mb-4">6. Pronësia Intelektuale</h2>
              <p>
                Të gjitha materialet në ImiRezervimi.al, përfshirë dizajnin, logon, tekstin dhe kodin, janë pronë e ImiRezervimi.al dhe mbrohen nga ligjet e pronësisë intelektuale.
              </p>
            </section>

            {/* Platform Availability */}
            <section>
              <h2 className="font-display text-2xl text-ink mb-4">7. Disponueshmëria e Platformës</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>Përpiqemi të mbajmë platformën të disponueshme 24/7</li>
                <li>Mund të ketë ndërprerje për mirëmbajtje</li>
                <li>Nuk garantojmë disponueshmëri të plotë</li>
                <li>Nuk jemi përgjegjës për humbje për shkak të ndërprerjeve</li>
              </ul>
            </section>

            {/* Disclaimers */}
            <section>
              <h2 className="font-display text-2xl text-ink mb-4">8. Mohimet e Përgjegjësisë</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>ImiRezervimi.al është vetëm një platformë ndërmjetësuese</li>
                <li>Sallonët janë të pavarur dhe përgjegjës për shërbimet e tyre</li>
                <li>Nuk garantojmë cilësinë e shërbimeve të sallonëve</li>
                <li>Përdoruesit duhet të vlerësojnë vetë sallonët</li>
              </ul>
            </section>

            {/* Limitation of Liability */}
            <section>
              <h2 className="font-display text-2xl text-ink mb-4">9. Kufizimi i Përgjegjësisë</h2>
              <p>
                ImiRezervimi.al nuk do të jetë përgjegjës për:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-3">
                <li>Dëme të tërthorta ose të rastësishme</li>
                <li>Humbje të të ardhurave ose përfitimeve</li>
                <li>Probleme me shërbimet e sallonëve</li>
                <li>Humbje të dhënash ose korrupsion</li>
              </ul>
            </section>

            {/* Termination */}
            <section>
              <h2 className="font-display text-2xl text-ink mb-4">10. Ndërprerja</h2>
              <p>
                Ne rezervojmë të drejtën të ndërpresim ose pezullojmë llogarinë tuaj nëse:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-3">
                <li>Shkelni këto Kushte</li>
                <li>Përdorni platformën në mënyrë të papërshtatshme</li>
                <li>Kryeni aktivitete të dyshimta ose mashtrues</li>
                <li>Na kërkoni ta bëni vetë</li>
              </ul>
            </section>

            {/* Applicable Law */}
            <section>
              <h2 className="font-display text-2xl text-ink mb-4">11. Ligji i Zbatueshëm</h2>
              <p>
                Këto Kushte rregullohen nga ligjet e Republikës së Shqipërisë. Çdo mosmarrëveshje do të zgjidhet në gjykatat kompetente të Tiranës.
              </p>
            </section>

            {/* Changes to Terms */}
            <section>
              <h2 className="font-display text-2xl text-ink mb-4">12. Ndryshime në Kushte</h2>
              <p>
                Mund të përditësojmë këto Kushte herë pas here. Do t&apos;ju njoftojmë për ndryshime të rëndësishme përmes email-it ose njoftimeve në platformë.
              </p>
            </section>

            {/* Contact */}
            <section>
              <h2 className="font-display text-2xl text-ink mb-4">13. Kontakti</h2>
              <p>
                Për pyetje rreth këtyre Kushteve:
              </p>
              <div className="mt-4 p-4 bg-cream rounded-lg">
                <p><strong>Email:</strong> <a href="mailto:support@imirezervimi.al" className="text-accent hover:underline">support@imirezervimi.al</a></p>
                <p><strong>Adresa:</strong> ImiRezervimi.al, Tiranë, Shqipëri</p>
              </div>
            </section>

            {/* Footer */}
            <section className="border-t pt-8 mt-12">
              <p className="text-clay text-center">
                © 2025 ImiRezervimi.al. Të gjitha të drejtat e rezervuara.
              </p>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}