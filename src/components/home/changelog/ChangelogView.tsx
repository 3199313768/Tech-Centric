import { CHANGELOG_ENTRIES } from '@/data/site/changelog'
import { SpiritSubpageHero } from '@/components/spirit/shell/SpiritSubpageHero'

export function ChangelogView() {
  return (
    <div className="sg-page">
      <SpiritSubpageHero
        theme="archive"
        eyebrow="庭园志"
        title="变更日志"
        lead="SpiritGarden 站点迭代记录，按版本回溯主要交付。"
        stats={[{ label: '版本记录', value: CHANGELOG_ENTRIES.length }]}
      />

      <ol className="sg-changelog-list">
        {CHANGELOG_ENTRIES.map((entry) => (
          <li key={entry.version} className="sg-changelog-item">
            <header className="sg-changelog-item__head">
              <div>
                <h2>{entry.title}</h2>
                <p className="sg-changelog-item__meta">
                  v{entry.version} · {entry.date}
                </p>
              </div>
            </header>
            <ul>
              {entry.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
    </div>
  )
}
