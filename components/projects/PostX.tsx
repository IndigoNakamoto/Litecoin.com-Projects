'use client'

import React from 'react'
import { Tweet } from 'react-tweet'

interface PostXProps {
  XPostID: string
}

function PostX({ XPostID }: PostXProps) {
  if (!XPostID) {
    return null
  }

  return (
    <div data-theme="light" className="mb-6">
      <Tweet id={XPostID} />
    </div>
  )
}

export default PostX

