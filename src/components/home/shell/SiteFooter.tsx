import Image from 'next/image'
import Link from 'next/link'
import { getMainNavTabsForRole, type SiteRole } from '@/lib/auth/roles'
import { personalInfo } from '@/data/site/personal'

export function SiteFooter({ role }: { role: SiteRole }) {
  const tabs = getMainNavTabsForRole(role)
  const email = personalInfo.socialLinks.email?.replace(/^mailto:/, '') ?? ''

  return (
    <footer className="sg-footer sg-footer--garden">
      <div className="sg-footer-top">
        <p className="sg-footer-copy-left">
          © {new Date().getFullYear()} SpiritGarden
        </p>
        <nav className="sg-footer-links" aria-label="页脚导航">
          {tabs.map((tab) => (
            <Link key={tab.href} href={tab.href}>
              {tab.label}
            </Link>
          ))}
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
