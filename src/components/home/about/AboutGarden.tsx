import Link from 'next/link'
import { personalInfo, skillsDetail, workExperience } from '@/data/site/personal'
import { SpiritSubpageHero } from '@/components/spirit/shell/SpiritSubpageHero'
import { SITE_ROUTES } from '@/lib/site/routes'

const CATEGORY_ORDER = ['frontend', 'backend', 'tools', 'other'] as const

const CATEGORY_META: Record<
  (typeof CATEGORY_ORDER)[number],
  { label: string; glyph: string; modifier: string }
> = {
  frontend: { label: '前端', glyph: '⚛', modifier: 'frontend' },
  backend: { label: '后端', glyph: '◈', modifier: 'backend' },
  tools: { label: '工具', glyph: '✦', modifier: 'tools' },
  other: { label: '其他', glyph: '◇', modifier: 'other' },
}

function getCategoryMeta(category: string) {
  return CATEGORY_META[category as (typeof CATEGORY_ORDER)[number]] ?? {
    label: category,
    glyph: '◇',
    modifier: 'other',
  }
}

export function AboutGarden() {
  const skillsSorted = [...skillsDetail].sort((a, b) => b.proficiency - a.proficiency)
  const categoryCounts = CATEGORY_ORDER.reduce<Record<string, number>>((acc, category) => {
    acc[category] = skillsDetail.filter((skill) => skill.category === category).length
    return acc
  }, {})

  const email = personalInfo.socialLinks.email?.replace(/^mailto:/, '') ?? ''

  return (
    <div className="sg-page sg-page--about">
      <SpiritSubpageHero
        theme="herb"
        eyebrow="园主手记"
        title={personalInfo.name}
        lead={
          <div className="sg-about-hero-lead">
            <p className="sg-about-lead">{personalInfo.title}</p>
            {personalInfo.bio.map((paragraph) => (
              <p key={paragraph} className="sg-about-bio">
                {paragraph}
              </p>
            ))}
            <div className="sg-card__tags sg-about-hero-tags">
              {personalInfo.skills.map((skill) => (
                <span key={skill} className="sg-tag">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        }
        stats={[
          { label: '工作经历', value: workExperience.length },
          { label: '技能项', value: skillsDetail.length },
        ]}
        actions={
          email ? (
            <a href={`mailto:${email}`} className="sg-btn sg-btn--primary sg-about-hero-cta">
              联系我 · {email}
            </a>
          ) : null
        }
      />

      <section
        className="sg-about-section sg-about-section--journal"
        aria-labelledby="about-timeline-heading"
      >
        <header className="sg-about-section-head">
          <p className="sg-about-section-eyebrow">Growth Trail</p>
          <h2 id="about-timeline-heading" className="sg-about-section-title">
            履历时间轴
          </h2>
          <p className="sg-about-section-hint">沿庭园中轴展开，记录每一段深耕与交付。</p>
        </header>
        <ol className="sg-about-journal">
          {workExperience.map((item, index) => (
            <li
              key={item.id}
              className={`sg-about-journal-entry ${
                index % 2 === 0 ? 'sg-about-journal-entry--left' : 'sg-about-journal-entry--right'
              }`}
            >
              <span className="sg-about-journal-entry__node" aria-hidden />
              <article className="sg-card sg-card--herb sg-about-journal-card">
                <div className="sg-about-journal-card__meta">
                  <span className="sg-about-journal-index" aria-hidden>
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span className="sg-about-period">{item.period}</span>
                  {item.location ? (
                    <span className="sg-about-location">{item.location}</span>
                  ) : null}
                </div>
                <h3 className="sg-about-journal-card__title">{item.company}</h3>
                <p className="sg-about-journal-card__role">{item.position}</p>
                <p className="sg-about-journal-card__desc">{item.description}</p>
                <ul className="sg-about-achievement-list">
                  {item.achievements.map((achievement) => (
                    <li key={achievement}>{achievement}</li>
                  ))}
                </ul>
                <div className="sg-card__tags">
                  {item.technologies.map((tech) => (
                    <span key={tech} className="sg-tag">
                      {tech}
                    </span>
                  ))}
                </div>
              </article>
            </li>
          ))}
        </ol>
      </section>

      <section
        className="sg-about-section sg-about-section--matrix"
        aria-labelledby="about-skills-heading"
      >
        <header className="sg-about-section-head">
          <p className="sg-about-section-eyebrow">Skill Constellation</p>
          <h2 id="about-skills-heading" className="sg-about-section-title">
            能力矩阵
          </h2>
          <p className="sg-about-section-hint">环形标本格，色环标注领域，环量对应熟练度。</p>
        </header>
        <ul className="sg-about-specimen-legend" aria-label="技能领域图例">
          {CATEGORY_ORDER.filter((category) => categoryCounts[category] > 0).map((category) => {
            const meta = CATEGORY_META[category]
            return (
              <li
                key={category}
                className={`sg-about-specimen-legend__item sg-about-specimen-legend__item--${meta.modifier}`}
              >
                <span className="sg-about-specimen-legend__dot" aria-hidden />
                <span>
                  {meta.label} · {categoryCounts[category]}
                </span>
              </li>
            )
          })}
        </ul>
        <ul className="sg-about-specimen-grid">
          {skillsSorted.map((skill) => {
            const meta = getCategoryMeta(skill.category)
            return (
              <li
                key={skill.name}
                className={`sg-about-specimen sg-about-specimen--${meta.modifier}`}
              >
                <div
                  className="sg-about-specimen__ring"
                  role="progressbar"
                  aria-valuenow={skill.proficiency}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`${skill.name} 熟练度 ${skill.proficiency}%`}
                  style={{ ['--specimen-level' as string]: skill.proficiency }}
                >
                  <span className="sg-about-specimen__inner">
                    <span className="sg-about-specimen__score">{skill.proficiency}</span>
                  </span>
                </div>
                <p className="sg-about-specimen__name">{skill.name}</p>
                <span className="sg-about-specimen__tag">{meta.label}</span>
                {skill.yearsOfExperience ? (
                  <span className="sg-about-specimen__years">{skill.yearsOfExperience} 年</span>
                ) : null}
              </li>
            )
          })}
        </ul>
      </section>

      <section className="sg-about-section sg-about-contact" aria-labelledby="about-contact-heading">
        <header className="sg-about-section-head">
          <h2 id="about-contact-heading" className="sg-about-section-title">
            联系与链接
          </h2>
          <p className="sg-about-section-hint">合作、内推或技术交流，欢迎直接邮件联系。</p>
        </header>
        <ul className="sg-about-contact-grid">
          {email ? (
            <li>
              <a
                href={`mailto:${email}`}
                className="sg-card sg-card--watercolor sg-about-contact-card"
                aria-label={`发送邮件至 ${email}`}
              >
                <span className="sg-about-contact-card__label">邮箱</span>
                <span className="sg-about-contact-card__value">{email}</span>
              </a>
            </li>
          ) : null}
          {personalInfo.socialLinks.github ? (
            <li>
              <a
                href={personalInfo.socialLinks.github}
                target="_blank"
                rel="noopener noreferrer"
                className="sg-card sg-card--watercolor sg-about-contact-card"
                aria-label="在 GitHub 查看园主仓库"
              >
                <span className="sg-about-contact-card__label">GitHub</span>
                <span className="sg-about-contact-card__value">
                  {personalInfo.socialLinks.github.replace('https://', '')}
                </span>
              </a>
            </li>
          ) : null}
        </ul>
        <div className="sg-about-actions">
          <Link href={SITE_ROUTES.projects} className="sg-btn sg-btn--ghost">
            查看归档
          </Link>
          <Link href={SITE_ROUTES.skills} className="sg-btn sg-btn--ghost">
            技能工坊
          </Link>
        </div>
      </section>
    </div>
  )
}
