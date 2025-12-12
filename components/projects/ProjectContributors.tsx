'use client'

import React from 'react'
import ContributorCard from '@/components/ui/ContributorCard'
import type { Contributor } from '@/types/project'

type ProjectContributorsProps = {
  bitcoinContributors?: Contributor[]
  litecoinContributors?: Contributor[]
  advocates?: Contributor[]
}

const ProjectContributors: React.FC<ProjectContributorsProps> = ({
  bitcoinContributors = [],
  litecoinContributors = [],
  advocates = [],
}) => {
  const allContributors = [
    ...(bitcoinContributors || []),
    ...(litecoinContributors || []),
    ...(advocates || []),
  ]

  // Remove duplicates based on ID
  const uniqueContributors = allContributors.filter(
    (contributor, index, self) =>
      index === self.findIndex((c) => c.id === contributor.id)
  )

  if (uniqueContributors.length === 0) {
    return null
  }

  return (
    <div className="mt-8">
      <h2 className="mb-4 text-2xl font-bold">Contributors</h2>
      <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {uniqueContributors.map((contributor) => (
          <ContributorCard key={contributor.id} contributor={contributor} backgroundColor="!bg-[#f2f2f2]" />
        ))}
      </div>
    </div>
  )
}

export default ProjectContributors

