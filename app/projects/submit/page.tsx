import { Metadata } from 'next'
import ProjectSubmissionForm from '@/components/projects/ProjectSubmissionForm'
import ApplySection from '@/components/ui/ApplySection'

export const metadata: Metadata = {
  title: 'Litecoin.net | Submit Your Project',
  description:
    'Submit your project to Litecoin.net for community crowdfunding and support. Join the Litecoin ecosystem and get your project listed today.',
}

export default function SubmitPage() {
  return (
    <ApplySection title="Submit a Project">
      <div className="my-auto mt-10 max-w-2xl space-y-8 xs:my-4 text-black">
        <p>
          Have a project that can benefit the Litecoin community? Use the form
          below to submit your project for consideration. Once approved, your
          project will be listed on Litecoin.net, where the community can help
          crowdfund and support your initiative.
        </p>
        <p>
          We will review the information you provide to ensure it aligns with
          our goals and values. If your project is selected, we&apos;ll reach out
          with any additional details needed to finalize your listing. This
          may include providing Litecoin addresses or other payment details to
          facilitate donations.
        </p>
        {/* Donation Policy */}
        <div className="prose max-w-none rounded-xl bg-gray-100 p-6 dark:bg-gray-100">
          <h2 className="text-xl font-semibold my- font-space-grotesk text-black">Donation Policies</h2>
          <p className="text-black">
            The Litecoin Foundation is a registered non-profit organization
            dedicated to advancing Litecoin and blockchain technology through
            open-source development. Your work is vital to our mission.
          </p>
          <h3 className="text-lg font-semibold my- font-space-grotesk text-black">Service Fee</h3>
          <p className="text-black">
            A 15% service fee is applied to each donation to cover operational
            costs, including administrative and marketing expenses that help
            us grow our impact.
          </p>
          <h3 className="text-lg font-semibold my- font-space-grotesk text-black">Fund Allocation</h3>
          <p className="text-black">
            While we always strive to honor the donor&apos;s intent, the Litecoin
            Foundation&apos;s Open Source Fund Council reserves the right to
            reallocate funds between supported projects as needed. This
            ensures we can adapt to changing priorities and support the
            ecosystem most effectively.
          </p>
        </div>
        <ProjectSubmissionForm />
      </div>
    </ApplySection>
  )
}

