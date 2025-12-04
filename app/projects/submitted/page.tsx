import { Metadata } from 'next'
import SubmittedSection from '@/components/ui/SubmittedSection'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Litecoin.net | Project Submitted',
  description:
    'Thank you for submitting your project to Litecoin.net. We will review your application shortly.',
}

export default function SubmittedPage() {
  return (
    <SubmittedSection title="Thank You for Your Submission!">
      <div className="my-auto mt-10 max-w-2xl space-y-8 text-center xs:my-4">
        <p>
          We've received your project submission and are excited to review
          your application. The Litecoin Foundation appreciates your
          initiative and your commitment to strengthening the Litecoin
          ecosystem.
        </p>
        <p>
          Our team will carefully review the details you've provided. You can
          expect to hear from us within the next 7-10 business days regarding
          the status of your submission. We'll reach out if we have any
          questions.
        </p>
      </div>
    </SubmittedSection>
  )
}

