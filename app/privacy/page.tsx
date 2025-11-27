import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function PrivacyPage() {
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

        <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>
        
        <div className="prose prose-invert prose-neutral max-w-none space-y-6">
          <p className="text-neutral-300">
            Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>

          <section>
            <h2 className="text-xl font-semibold text-white mt-8 mb-4">1. Information We Collect</h2>
            <p className="text-neutral-300">
              We collect information you provide directly to us, including:
            </p>
            <ul className="list-disc list-inside text-neutral-300 space-y-2 mt-2">
              <li>Name, email address, and phone number</li>
              <li>Date of birth</li>
              <li>Transaction history and preferences</li>
              <li>Device information and usage data</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mt-8 mb-4">2. How We Use Your Information</h2>
            <p className="text-neutral-300">
              We use the information we collect to:
            </p>
            <ul className="list-disc list-inside text-neutral-300 space-y-2 mt-2">
              <li>Provide and maintain our membership services</li>
              <li>Process transactions and send related information</li>
              <li>Send promotional communications (with your consent)</li>
              <li>Personalize your experience and improve our services</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mt-8 mb-4">3. Information Sharing</h2>
            <p className="text-neutral-300">
              We do not sell, trade, or otherwise transfer your personal information to outside parties. 
              We may share information with trusted third parties who assist us in operating our app, 
              conducting our business, or servicing you.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mt-8 mb-4">4. Data Security</h2>
            <p className="text-neutral-300">
              We implement appropriate security measures to protect your personal information. 
              However, no method of transmission over the Internet is 100% secure.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mt-8 mb-4">5. Your Rights</h2>
            <p className="text-neutral-300">
              You have the right to:
            </p>
            <ul className="list-disc list-inside text-neutral-300 space-y-2 mt-2">
              <li>Access and update your personal information</li>
              <li>Request deletion of your account and data</li>
              <li>Opt out of promotional communications</li>
              <li>Request a copy of your data</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mt-8 mb-4">6. Contact Us</h2>
            <p className="text-neutral-300">
              If you have any questions about this Privacy Policy, please contact us at:{' '}
              <a href="mailto:mkt@negronius.com" className="text-orange-500 hover:underline">
                mkt@negronius.com
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
