import React from 'react'

import {
  FaXTwitter,
  FaRedditAlien,
  FaGithub,
  // FaFacebookF,
} from 'react-icons/fa6'

interface VerticalSocialIconsProps {
  topOffset?: string
}

const VerticalSocialIcons: React.FC<VerticalSocialIconsProps> = ({
  topOffset = '47%',
}) => {
  return (
    <div
      className="fixed right-0 z-50 hidden transform space-x-[65px] lg:block"
      style={{ top: topOffset, transform: 'translateY(-50%)' }}
    >
      <a
        href="https://x.com/ltcfoundation"
        target="_blank"
        rel="noopener noreferrer"
      >
        <FaXTwitter className="h-[30px] w-[30px] text-black transition-transform duration-200 ease-in-out hover:translate-y-[-4px]" />
      </a>
      <a
        href="https://reddit.com/r/litecoin"
        target="_blank"
        rel="noopener noreferrer"
      >
        <FaRedditAlien className="h-[30px] w-[30px] text-black transition-transform duration-200 ease-in-out hover:translate-y-[-4px]" />
      </a>
      <a
        href="https://github.com/litecoin-foundation/"
        target="_blank"
        rel="noopener noreferrer"
      >
        <FaGithub className="h-[30px] w-[30px] text-black transition-transform duration-200 ease-in-out hover:translate-y-[-4px]" />
      </a>
    </div>
  )
}

export default VerticalSocialIcons
