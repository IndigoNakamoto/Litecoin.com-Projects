'use client'

import React from 'react'
import ProjectContent from './ProjectContent'
import ProjectUpdate from './ProjectUpdate'
import { FAQSection } from './FAQSection'
import PostsList from './PostsList'
import { TwitterUser } from '@/utils/types'
import type { Contributor } from '@/types/project'
import type { FAQItem } from '@/services/webflow/faqs'
import type { Update } from '@/services/webflow/updates'
import type { Post } from '@/services/webflow/posts'

type MenuSectionsProps = {
  selectedMenuItem: string
  title: string
  content: string
  socialSummary: string
  faq: FAQItem[]
  faqCount: number
  updates: Update[]
  selectedUpdateId: number | null
  setSelectedUpdateId: (id: number | null) => void
  hashtag: string
  tweetsData: Post[]
  twitterContributors: TwitterUser[]
  twitterContributorsBitcoin: Contributor[] | TwitterUser[]
  twitterContributorsLitecoin: Contributor[] | TwitterUser[]
  twitterAdvocates: Contributor[] | TwitterUser[]
  twitterUsers: TwitterUser[]
  isBitcoinOlympics2024: boolean
  formatLits: (value: number) => string
  formatUSD: (value: number) => string
  website: string
  gitRepository: string
  twitterHandle: string
  discordLink: string
  telegramLink: string
  facebookLink: string
  redditLink: string
}

const MenuSections: React.FC<MenuSectionsProps> = ({
  selectedMenuItem,
  title,
  content,
  socialSummary,
  faq,
  updates,
  selectedUpdateId,
  tweetsData,
  website,
  gitRepository,
  twitterHandle,
  discordLink,
  telegramLink,
  facebookLink,
  redditLink,
  twitterContributorsBitcoin,
  twitterContributorsLitecoin,
  twitterAdvocates,
}) => {
  switch (selectedMenuItem) {
    case 'Info':
      return (
        <div>
          <div className="markdown">
            <ProjectContent
              title={title}
              content={content}
              socialSummary={socialSummary}
              website={website}
              gitRepository={gitRepository}
              twitterHandle={twitterHandle}
              discordLink={discordLink}
              telegramLink={telegramLink}
              facebookLink={facebookLink}
              redditLink={redditLink}
              bitcoinContributors={twitterContributorsBitcoin as Contributor[]}
              litecoinContributors={twitterContributorsLitecoin as Contributor[]}
              advocates={twitterAdvocates as Contributor[]}
            />
          </div>
        </div>
      )
    case 'posts':
      return (
        <div className="markdown">
          <PostsList posts={tweetsData} />
        </div>
      )
    case 'faq':
      return (
        <div className="markdown">
          <FAQSection faqs={Array.isArray(faq) ? faq : []} bg={'#c6d3d6'} />
        </div>
      )
    case 'updates':
      return (
        <div className="markdown min-h-full">
          <div>
            {updates && updates.length > 0 ? (
              updates.map((post: Update, index: number) => {
                // Convert string ID to number for ProjectUpdate component
                const numericId = typeof post.id === 'string' 
                  ? parseInt(post.id.replace(/\D/g, ''), 10) || index 
                  : (post.id || index)
                
                return (
                  <div key={index} id={`update-${numericId}`}>
                    <ProjectUpdate
                      title={post.fieldData?.name || post.fieldData?.title || 'Update'}
                      summary={post.fieldData?.summary || ''}
                      authorTwitterHandle={post.fieldData?.authorTwitterHandle || ''}
                      date={post.fieldData?.date || post.fieldData?.createdOn || ''}
                      tags={post.fieldData?.tags || []}
                      content={post.fieldData?.content}
                      id={numericId}
                      highlight={selectedUpdateId === numericId}
                    />
                  </div>
                )
              })
            ) : (
              <h1>No updates available for this project.</h1>
            )}
          </div>
        </div>
      )
    default:
      return null
  }
}

export default MenuSections

