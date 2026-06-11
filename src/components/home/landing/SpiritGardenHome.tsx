'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Code2, ExternalLink, FlaskConical, Paintbrush, Paperclip, Sparkles, Terminal } from 'lucide-react'
import { SpiritDustCanvas } from '@/components/home/landing/SpiritDustCanvas'
import type { AllProjectItem } from '@/data/site/allProjects'
import { personalInfo } from '@/data/site/personal'
import type { HeroSeason, SoulMeterItem } from '@/lib/site/homeStats'
import { handleWatercolorHover } from '@/utils/watercolorHover'
import { SITE_ROUTES, projectRoute } from '@/lib/site/routes'

const SKILL_CHIPS = [
  { name: 'React', icon: Code2 },
  { name: 'Tailwind', icon: Paintbrush },
  { name: 'Framer', icon: Paperclip },
  { name: 'Next.js', icon: Terminal },
] as const

const FALLBACK_SOUL_METERS: SoulMeterItem[] = [
  { label: '创造力能量', value: 94 },
  { label: '咖啡因法力值', value: 62 },
  { label: '内心宁静度', value: 100 },
]

const FALLBACK_FEATURED = {
  eyebrow: '最新案例 | 项目回顾',
  title: '幻梦之森 3D',
  description:
    '基于 Three.js 构建的沉浸式森林场景，灵感源自《幽灵公主》中的精灵之森，探索 WebGL 光影与程序化动画的边界。',
  image: '/spirit-garden/project-forest.png',
  imageAlt: '幻梦之森 3D 预览',
  tags: ['WebGL', 'GSAP'],
  href: SITE_ROUTES.projects,
  external: false,
} as const

interface FeaturedDisplay {
  eyebrow: string
  title: string
  description: string
  image: string
  imageAlt: string
  tags: string[]
  href: string
  external: boolean
}

function resolveFeaturedDisplay(featured?: AllProjectItem | null): FeaturedDisplay {
  if (!featured) {
    return { ...FALLBACK_FEATURED, tags: [...FALLBACK_FEATURED.tags] }
  }

  return {
    eyebrow: '最新案例 | 项目回顾',
    title: featured.name,
    description: featured.description || FALLBACK_FEATURED.description,
    image: featured.screenshots[0] ?? FALLBACK_FEATURED.image,
    imageAlt: `${featured.name} 预览`,
    tags: featured.tags.length > 0 ? featured.tags.slice(0, 4) : ['项目'],
    href: projectRoute(featured.slug),
    external: false,
  }
}

interface SpiritGardenHomeProps {
  featured?: AllProjectItem | null
  soulMeters?: SoulMeterItem[]
  heroSeason?: HeroSeason
}

export function SpiritGardenHome({
  featured,
  soulMeters = FALLBACK_SOUL_METERS,
  heroSeason = 'spring',
}: SpiritGardenHomeProps) {
  const featuredDisplay = resolveFeaturedDisplay(featured)
  const meters = soulMeters.length > 0 ? soulMeters : FALLBACK_SOUL_METERS

  return (
    <>
      <div className="sg-hero-stage sg-hero-stage--garden">
        <div className="sg-hero-backdrop sg-hero-backdrop--natural sg-hero-backdrop--blend" aria-hidden>
          <Image
            src="/spirit-garden/hero-landscape.png"
            alt=""
            width={1024}
            height={571}
            priority
            sizes="100vw"
            className="sg-hero-backdrop-img sg-hero-backdrop-img--blend"
          />
          <SpiritDustCanvas className="sg-spirit-dust-canvas" />
          <div
            className={`sg-hero-backdrop-overlay sg-hero-backdrop-overlay--garden sg-hero-season--${heroSeason}`}
          />
        </div>

        <div className="sg-hero-inner-wrap sg-hero-inner-wrap--garden sg-hero-enter">
          <section id="hero" className="sg-hero-intro">
            <div className="sg-hero-profile-row sg-enter sg-enter--1">
              <div className="sg-hero-avatar-sm">
                <Image
                  src="/spirit-garden/avatar.png"
                  alt={personalInfo.name}
                  fill
                  sizes="40px"
                  className="sg-hero-avatar-img"
                />
              </div>
              <div className="sg-hero-profile-meta">
                <span className="sg-hero-name">{personalInfo.name}</span>
                <span className="sg-hero-badge">高级前端工程师</span>
              </div>
            </div>

            <h1 className="sg-hero-garden-title sg-enter sg-enter--2">欢迎来到我的数字庭院</h1>

            <p className="sg-hero-garden-lead sg-enter sg-enter--3">
              在这里，代码与吉卜力的美学温柔交织。我是一名追求极致情感体验的高级前端工程师，在逻辑的经纬间，编织充满生命力的数字交互。
            </p>

            <div className="sg-hero-actions sg-enter sg-enter--4">
              <Link href={SITE_ROUTES.projects} className="sg-btn sg-btn--primary">
                探寻作品
              </Link>
              <Link href={SITE_ROUTES.about} className="sg-btn sg-btn--ghost">
                了解我
              </Link>
            </div>
          </section>
        </div>
      </div>

      <main id="garden-content" className="sg-main sg-main--garden sg-enter sg-enter--5">
        <div className="sg-garden-grid">
          <article
            className="sg-card sg-card--featured sg-card--watercolor sg-enter sg-enter--6"
            onMouseMove={handleWatercolorHover}
          >
            <div className="sg-card-featured-head">
              <div>
                <p className="sg-card-eyebrow">{featuredDisplay.eyebrow}</p>
                <h2>{featuredDisplay.title}</h2>
                <p className="sg-card-desc">{featuredDisplay.description}</p>
              </div>
              {featuredDisplay.external ? (
                <a
                  href={featuredDisplay.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="sg-card-link-hit"
                  aria-label={`查看项目：${featuredDisplay.title}`}
                >
                  <ExternalLink size={18} className="sg-card-link-icon" aria-hidden />
                </a>
              ) : (
                <Link
                  href={featuredDisplay.href}
                  className="sg-card-link-hit"
                  aria-label={`查看项目：${featuredDisplay.title}`}
                >
                  <ExternalLink size={18} className="sg-card-link-icon" aria-hidden />
                </Link>
              )}
            </div>
            <div className="sg-card-featured-media">
              <Image
                src={featuredDisplay.image}
                alt={featuredDisplay.imageAlt}
                fill
                sizes="(max-width: 768px) 100vw, 720px"
                className="sg-card-featured-img"
              />
            </div>
            <div className="sg-card-tags">
              {featuredDisplay.tags.map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>
          </article>

          <article
            className="sg-card sg-card--meter sg-card--watercolor sg-enter sg-enter--7"
            onMouseMove={handleWatercolorHover}
          >
            <header className="sg-card-meter-head">
              <Sparkles size={18} aria-hidden />
              <div>
                <h2>灵魂度量仪</h2>
                <p>实时灵感监测</p>
              </div>
            </header>
            <div className="sg-meter-list">
              {meters.map((item) => (
                <div key={item.label} className="sg-meter-item">
                  <div className="sg-meter-label">
                    <span>{item.label}</span>
                    <span>{item.value}%</span>
                  </div>
                  <div className="sg-meter-track">
                    <div
                      className={`sg-meter-fill${
                        item.label === '咖啡因法力值' ? ' sg-meter-fill--muted' : ''
                      }`}
                      style={{ width: `${item.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <blockquote className="sg-meter-quote">
              「设计是连接冰冷逻辑与人类温度的桥梁。」
            </blockquote>
          </article>

          <article
            className="sg-card sg-card--lab sg-card--watercolor sg-enter sg-enter--8"
            onMouseMove={handleWatercolorHover}
          >
            <FlaskConical size={22} className="sg-card-lab-icon" aria-hidden />
            <h2>感官实验室</h2>
            <p>
              正在尝试将水彩纹理、微交互与界面动效结合，
              探索「温润之界」——技术应有温度、有呼吸感。
            </p>
            <Link href={SITE_ROUTES.vibe} className="sg-text-link">
              查阅笔记 →
            </Link>
          </article>

          <article
            className="sg-card sg-card--skills sg-card--watercolor sg-enter sg-enter--9"
            onMouseMove={handleWatercolorHover}
          >
            <h2>技能卷轴</h2>
            <div className="sg-skill-chip-grid">
              {SKILL_CHIPS.map(({ name, icon: Icon }) => (
                <div key={name} className="sg-skill-chip">
                  <Icon size={16} aria-hidden />
                  <span>{name}</span>
                </div>
              ))}
            </div>
          </article>
        </div>
      </main>
    </>
  )
}
