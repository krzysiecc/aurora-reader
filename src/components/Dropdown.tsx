import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'

export interface DropdownItem {
  label: string
  icon?: ReactNode
  onSelect?: () => void
  href?: string
  danger?: boolean
}

interface DropdownProps {
  trigger: ReactNode
  label: string
  items: DropdownItem[]
}

/**
 * A small accessible menu: real <button>/<a> items, closes on outside click
 * and Escape. Replaces the original CSSTransition multi-level menu, which used
 * <a onClick> elements with no keyboard support.
 */
export default function Dropdown({ trigger, label, items }: DropdownProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        className="icon-btn"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={label}
        onClick={() => setOpen((o) => !o)}
      >
        {trigger}
      </button>

      {open && (
        <div
          role="menu"
          className="glass animate-fade-up absolute right-0 mt-2 w-52 overflow-hidden rounded-xl p-1 shadow-xl"
        >
          {items.map((item) => {
            const className =
              'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-accent/15 ' +
              (item.danger ? 'font-semibold text-red-500' : '')
            const content = (
              <>
                {item.icon && <span className="text-ink/60 dark:text-paper/60">{item.icon}</span>}
                <span>{item.label}</span>
              </>
            )

            return item.href ? (
              <a
                key={item.label}
                href={item.href}
                target="_blank"
                rel="noreferrer"
                role="menuitem"
                className={className}
                onClick={() => setOpen(false)}
              >
                {content}
              </a>
            ) : (
              <button
                key={item.label}
                type="button"
                role="menuitem"
                className={className}
                onClick={() => {
                  setOpen(false)
                  item.onSelect?.()
                }}
              >
                {content}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
