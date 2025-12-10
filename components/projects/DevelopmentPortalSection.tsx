import Link from 'next/link'
import Button from '@/components/ui/Button'
import TypingScroll from '@/components/ui/TypingScroll'
import SectionWhite from '@/components/ui/SectionWhite'
import SectionContributors from '@/components/ui/SectionContributors'

export default function DevelopmentPortalSection() {
  return (
    <SectionWhite>
      <div className="flex flex-col items-center pb-8 pt-4 text-center">
        <h1 className="font-space-grotesk text-[39px] font-[600] text-[black]">
          The Litecoin Project Development Portal
        </h1>
        <h2 className="pt-2 font-space-grotesk text-[30px] font-[600] text-[black]">
          We help advance
        </h2>
        <h3 className="font-space-grotesk text-[20px] font-semibold text-[black]">
          <TypingScroll />
        </h3>
      </div>
      <div className="m-auto flex h-full w-[1300px] max-w-[90%] flex-col-reverse justify-center lg:flex-row lg:items-center">
        <div className="flex h-4/6 min-h-fit w-full flex-col justify-center border border-[black] p-8">
          <h1 className="m-auto py-4 font-space-grotesk !text-[30px] font-[600] leading-[32px] text-[black]">
            Submit a Project
          </h1>
          <p className="m-auto max-w-3xl text-center text-lg text-[black]">
            We are looking to support talented individuals and teams who share
            our commitment to decentralized open-source solutions and the future
            of Litecoin.
          </p>
          <Link href="/projects/submit" className="m-auto pt-4">
            <Button variant="primary" className="w-48">
              Submit Project
            </Button>
          </Link>
        </div>
      </div>

      <div className="flex flex-col items-center pt-16">
        <h1 className="w-full pb-8 pt-8 font-space-grotesk !text-[30px] font-semibold leading-tight tracking-tight text-black">
          Project Builders
        </h1>
        <SectionContributors />
      </div>
    </SectionWhite>
  )
}

