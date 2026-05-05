import type { ReactNode } from "react"

interface AuthShellProps {
  eyebrow: string
  title: string
  description: string
  asideTitle: string
  asideBody: string
  highlights: string[]
  children: ReactNode
}

export default function AuthShell({
  eyebrow,
  title,
  description,
  asideTitle,
  asideBody,
  highlights,
  children,
}: AuthShellProps) {
  return (
    <main className="auth-shell">
      <section className="auth-shell__panel auth-shell__panel--brand" aria-label="Product introduction">
        <div className="auth-shell__brand-copy">
          <p className="auth-shell__eyebrow">{eyebrow}</p>
          <h1 className="auth-shell__title">{title}</h1>
          <p className="auth-shell__description">{description}</p>
        </div>

        <div className="auth-shell__story-card">
          <p className="auth-shell__story-label">Why teams like this flow</p>
          <h2 className="auth-shell__story-title">{asideTitle}</h2>
          <p className="auth-shell__story-body">{asideBody}</p>

          <ul className="auth-shell__highlights" aria-label="Key benefits">
            {highlights.map((highlight) => (
              <li key={highlight}>{highlight}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="auth-shell__panel auth-shell__panel--form">
        <div className="auth-shell__form-wrap">{children}</div>
      </section>
    </main>
  )
}
