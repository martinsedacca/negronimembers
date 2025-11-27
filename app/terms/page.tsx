import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <div className="max-w-2xl mx-auto px-6 py-12">
        <Link 
          href="/member/profile" 
          className="inline-flex items-center gap-2 text-neutral-400 hover:text-white mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Profile
        </Link>

        <h1 className="text-3xl font-bold mb-8">Terms & Conditions</h1>
        
        <div className="prose prose-invert prose-neutral max-w-none space-y-6">
          <p className="text-neutral-300">
            Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>

          <section>
            <h2 className="text-xl font-semibold text-white mt-8 mb-4">1. Acceptance of Terms</h2>
            <p className="text-neutral-300">
              By accessing and using the Negroni Members app, you accept and agree to be bound by 
              these Terms and Conditions. If you do not agree to these terms, please do not use our services.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mt-8 mb-4">2. Membership Program</h2>
            <p className="text-neutral-300">
              The Negroni membership program allows you to earn points and access exclusive benefits. 
              Membership is free and available to individuals who meet our eligibility requirements.
            </p>
            <ul className="list-disc list-inside text-neutral-300 space-y-2 mt-2">
              <li>Points are earned based on purchases and visits</li>
              <li>Benefits vary by membership tier</li>
              <li>Points may expire according to program rules</li>
              <li>We reserve the right to modify the program at any time</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mt-8 mb-4">3. User Responsibilities</h2>
            <p className="text-neutral-300">
              As a member, you agree to:
            </p>
            <ul className="list-disc list-inside text-neutral-300 space-y-2 mt-2">
              <li>Provide accurate and complete information</li>
              <li>Maintain the security of your account</li>
              <li>Not share or transfer your membership benefits</li>
              <li>Use the app in compliance with all applicable laws</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mt-8 mb-4">4. Benefits and Promotions</h2>
            <p className="text-neutral-300">
              Benefits and promotions are subject to availability and may have additional terms. 
              We reserve the right to modify, suspend, or discontinue any benefit at any time.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mt-8 mb-4">5. Account Termination</h2>
            <p className="text-neutral-300">
              You may delete your account at any time through the app settings. We may also 
              terminate or suspend your account for violations of these terms or for any other 
              reason at our discretion.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mt-8 mb-4">6. Limitation of Liability</h2>
            <p className="text-neutral-300">
              We are not liable for any indirect, incidental, special, or consequential damages 
              arising from your use of the app or membership program.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mt-8 mb-4">7. Changes to Terms</h2>
            <p className="text-neutral-300">
              We may update these terms from time to time. We will notify you of any material 
              changes through the app or by email.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mt-8 mb-4">8. Contact</h2>
            <p className="text-neutral-300">
              For questions about these Terms & Conditions, please contact us at:{' '}
              <a href="mailto:legal@negroni.com" className="text-orange-500 hover:underline">
                legal@negroni.com
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
