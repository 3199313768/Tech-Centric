import Link from 'next/link'
import { SITE_ROUTES } from '@/lib/site/routes'

export function ForbiddenPanel({ message = '无权限访问' }: { message?: string }) {
  return (
    <div className="spirit-garden-content sg-subpage">
      <div className="sg-kb-error" role="alert">
        <p>{message}</p>
        <Link href={SITE_ROUTES.home} className="sg-btn sg-btn--primary">
          返回首页
        </Link>
      </div>
    </div>
  )
}
