import { Project } from '@/types/project'
import ProjectCard from './ProjectCard'
import SectionGrey from '@/components/ui/SectionGrey'

interface ProjectsListProps {
  title: string
  projects: Project[]
  onProjectClick: (project: Project) => void
  bgColor?: string
  bgColors?: string[]
  emptyMessage?: string
  emptyDescription?: string
}

export default function ProjectsList({
  title,
  projects,
  onProjectClick,
  bgColor = 'bg-[white]',
  bgColors,
  emptyMessage,
  emptyDescription,
}: ProjectsListProps) {
  if (projects.length === 0) {
    return (
      <SectionGrey>
        <div className="flex flex-col items-center pb-8">
          <h1 className="w-full pb-8 pt-8 font-space-grotesk !text-[30px] font-semibold leading-tight tracking-tight text-black">
            {title}
          </h1>
          <div className="text-gray-600 py-8 text-center">
            <p className="mb-2">{emptyMessage || `No ${title.toLowerCase()} found.`}</p>
            {emptyDescription && (
              <p className="text-sm">{emptyDescription}</p>
            )}
          </div>
        </div>
      </SectionGrey>
    )
  }

  return (
    <SectionGrey>
      <div className="flex flex-col items-center pb-8">
        <h1 className="w-full pb-8 pt-8 font-space-grotesk !text-[30px] font-semibold leading-tight tracking-tight text-black">
          {title}
        </h1>
        <ul className="grid max-w-full grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {projects.map((project, i) => {
            const cardBgColor = bgColors 
              ? bgColors[i % bgColors.length] 
              : bgColor
            return (
              <li key={project.id} className="flex">
                <ProjectCard
                  project={project}
                  openPaymentModal={() => onProjectClick(project)}
                  bgColor={cardBgColor}
                />
              </li>
            )
          })}
        </ul>
      </div>
    </SectionGrey>
  )
}

