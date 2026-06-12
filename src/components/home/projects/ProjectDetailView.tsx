import Image from 'next/image'
import Link from 'next/link'
import type { AllProjectItem } from '@/data/site/allProjects'
import { personalInfo } from '@/data/site/personal'
import { getArchiveAccent } from '@/utils/archiveCategory'
import { SITE_ROUTES } from '@/lib/site/routes'

interface ProjectDetailViewProps {
  project: AllProjectItem
}

export function ProjectDetailView({ project }: ProjectDetailViewProps) {
  const accent = getArchiveAccent(project.category)
  const email = personalInfo.socialLinks.email?.replace(/^mailto:/, '') ?? ''

  return (
    <article className="sg-page sg-project-detail">
      <header
        className="sg-project-detail__hero"
        style={{ ['--archive-accent' as string]: accent }}
      >
        <Link href={SITE_ROUTES.projects} className="sg-project-detail__back">
          ← 返回归档
        </Link>
        <p className="sg-project-detail__eyebrow">{project.category}</p>
        <h1>{project.name}</h1>
        {project.period ? <p className="sg-project-detail__period">{project.period}</p> : null}
        {project.role ? <p className="sg-project-detail__role">{project.role}</p> : null}
        <div className="sg-card__tags">
          {project.tags.map((tag) => (
            <span key={tag} className="sg-tag sg-tag--platform">
              {tag}
            </span>
          ))}
        </div>
      </header>

      {project.screenshots.length > 0 ? (
        <div className="sg-project-detail__media">
          <Image
            src={project.screenshots[0]}
            alt={`${project.name} 预览`}
            width={1200}
            height={675}
            className="sg-project-detail__img"
            priority
            sizes="(max-width: 768px) 100vw, 960px"
          />
        </div>
      ) : null}

      <div className="sg-project-detail__body">
        <section>
          <h2>业务痛点 / 核心功能</h2>
          <p>{project.description}</p>
        </section>

        <section>
          <h2>主导工作 / 核心贡献</h2>
          <p style={{ whiteSpace: 'pre-line' }}>{project.roleAndContribution}</p>
        </section>

        {project.highlights.length > 0 ? (
          <section>
            <h2>亮点成果</h2>
            <ul className="sg-project-detail__highlights">
              {project.highlights.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
        ) : null}

        {project.techStack.length > 0 ? (
          <section>
            <h2>技术栈</h2>
            <div className="sg-card__tags">
              {project.techStack.map((tech) => (
                <span key={tech} className="sg-tag">
                  {tech}
                </span>
              ))}
            </div>
          </section>
        ) : null}

        {project.body ? (
          <section>
            <h2>详细说明</h2>
            <p style={{ whiteSpace: 'pre-wrap' }}>{project.body}</p>
          </section>
        ) : null}

        <div className="sg-project-detail__actions">
          {project.isPublic ? (
            <a
              href={project.url}
              target="_blank"
              rel="noopener noreferrer"
              className="sg-btn sg-btn--primary"
            >
              访问项目 ↗
            </a>
          ) : (
            <span className="sg-btn sg-btn--ghost" aria-live="polite">
              需内网环境访问
            </span>
          )}
        </div>

        {email ? (
          <section className="sg-project-detail__contact" aria-labelledby="project-contact-heading">
            <h2 id="project-contact-heading">合作或内推</h2>
            <p>对这个项目感兴趣？欢迎邮件联系，或通过右下角「庭院导引」发起对话。</p>
            <a href={`mailto:${email}`} className="sg-btn sg-btn--ghost" aria-label={`发送邮件至 ${email}`}>
              联系我 · {email}
            </a>
          </section>
        ) : null}
      </div>
    </article>
  )
}
