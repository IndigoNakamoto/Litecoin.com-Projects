import { ReactNode } from 'react'

interface Props {
  children: ReactNode
  title: string
  style?: string
}

export default function SubmittedSection({ title, children }: Props) {
  return (
    <div className="flex min-h-screen items-center justify-center rounded-xl bg-gray-200! p-6">
      <div className="w-full max-w-2xl p-8">
        <h1 className="py-4 text-center text-black! font-space-grotesk text-4xl font-semibold">
          {title}
        </h1>
        {children}
      </div>
    </div>
  )
}

