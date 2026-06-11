import Image from 'next/image'
import Link from 'next/link'
import { personalInfo } from '@/data/site/personal'
import { SITE_NAV_TABS, SITE_ROUTES } from '@/lib/site/routes'

export function SiteFooter() {
  const email = personalInfo.socialLinks.email?.replace(/^mailto:/, '') ?? ''

  return (
    <footer className="sg-footer sg-footer--garden">
      <div className="sg-footer-top">
        <p className="sg-footer-copy-left">
          © {new Date().getFullYear()} SpiritGarden
        </p>
        <nav className="sg-footer-links" aria-label="页脚导航">
          {SITE_NAV_TABS.slice(0, 4).map((tab) => (
            <Link key={tab.href} href={tab.href}>
              {tab.label}
            </Link>
          ))}
          <Link href={SITE_ROUTES.about}>园主</Link>
          <Link href={SITE_ROUTES.showcase}>展柜</Link>
          <Link href={SITE_ROUTES.changelog}>庭园志</Link>
          <Link href={SITE_ROUTES.stats}>庭园度量</Link>
          <Link href={SITE_ROUTES.studio}>工作台</Link>
        </nav>
        <div className="sg-footer-social">
          {email ? (
            <a href={`mailto:${email}`} className="sg-footer-email" aria-label={`发送邮件至 ${email}`}>
              {email}
            </a>
          ) : null}
          {personalInfo.socialLinks.github ? (
            <a
              href={personalInfo.socialLinks.github}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
            >
              <Image src="/spirit-garden/icon-share.png" alt="" width={18} height={20} aria-hidden unoptimized />
            </a>
          ) : null}
        </div>
      </div>
    </footer>
  )
}
