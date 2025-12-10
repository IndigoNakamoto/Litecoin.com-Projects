import { useRef } from 'react'
import Button from '@/components/ui/Button'
import { useSpinnerAnimation } from '@/hooks/useSpinnerAnimation'
import { scrollToElement } from '@/utils/scrollHelpers'

interface HeroSectionProps {
  onDonateClick: () => void
  projectsRef: React.RefObject<HTMLDivElement | null>
  bountiesRef: React.RefObject<HTMLDivElement | null>
}

export default function HeroSection({
  onDonateClick,
  projectsRef,
  bountiesRef,
}: HeroSectionProps) {
  const { outerSpinnerRef, innerSpinnerRef } = useSpinnerAnimation()

  const scrollToProjects = () => {
    scrollToElement(projectsRef.current)
  }

  const scrollToBounties = () => {
    scrollToElement(bountiesRef.current)
  }

  return (
    <section
      className="relative flex max-h-fit min-h-[62vh] w-full items-center overflow-x-hidden bg-cover bg-center lg:py-24"
      style={{
        backgroundImage: "url('/static/images/design/Mask-Group-20.webp')",
        fontFamily:
          'system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif',
      }}
    >
      <div className="w-full items-center">
        <div className="m-auto flex h-full w-[1300px] max-w-[90%] flex-col justify-center gap-y-6 lg:gap-y-40 lg:flex-row lg:items-center">
          {/* Column 1: Text content (appears second on mobile, first on desktop) */}
          <div className="order-2 lg:order-1 lg:py-30 py-8 lg:w-1/2">
            <h1 className="font-space-grotesk text-[39px] font-semibold leading-[32px] tracking-tight text-black">
              Litecoin Projects
            </h1>
            <p className="w-11/12 pt-6 text-[18px] text-black">
              The Litecoin Foundation is dedicated to consistently improving
              the Litecoin network, whilst supporting the development of
              exciting projects on the Litecoin blockchain. Below are a
              handful of initiatives that demonstrate Litecoin&apos;s commitment to
              innovation and improving the experience of its users.
            </p>
            <div className="my-8 flex w-11/12 max-w-[508px] flex-col gap-4">
              <div className="">
                <Button
                  variant="primary"
                  onClick={onDonateClick}
                  className="h-12 w-full px-6 py-1 !tracking-wide"
                >
                  DONATE NOW
                </Button>
              </div>

              <div className="flex w-full flex-row justify-center gap-2 ">
                <Button
                  variant="secondary"
                  onClick={scrollToProjects}
                  className="w-full px-6 py-3 text-black! rounded-2xl"
                >
                  VIEW PROJECTS
                </Button>
                <Button
                  variant="secondary"
                  onClick={scrollToBounties}
                  className="w-full px-6 py-3 text-black! rounded-2xl"
                >
                  VIEW PAST PROJECTS
                </Button>
              </div>
            </div>
          </div>
          {/* Column 2: Spinner (appears first on mobile, second on desktop) */}
          <div className="order-1 lg:order-2 w-7/12 pt-8 lg:w-1/2 lg:pb-0 lg:pl-20 lg:pt-0">
            <div className="relative flex min-h-[400px] items-center justify-center lg:min-h-[550px]">
              <img
                src="/static/images/design/outline-litecoin-spinner-inner.svg"
                alt="Litecoin Spinner Inner"
                ref={innerSpinnerRef}
                className="absolute z-10 object-contain"
                style={{ top: '50%', left: '50%' }}
              />
              <img
                src="/static/images/design/outline-litecoin-spinner-outer.svg"
                alt="Litecoin Spinner Outer"
                ref={outerSpinnerRef}
                className="absolute w-full h-full object-contain"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

