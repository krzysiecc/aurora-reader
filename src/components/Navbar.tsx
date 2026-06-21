import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Info, LogOut, MoreVertical, HelpCircle } from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { useTheme } from '@/lib/theme'
import ThemeToggle from './ThemeToggle'
import Dropdown from './Dropdown'
import Modal from './Modal'
import logoLight from '@/Icons/logo_lightmode.svg'
import logoDark from '@/Icons/logo_darkmode.svg'

const AUTHORS = ['Ula Mądzielewska', 'Pola Nadarzewska', 'Sandra Gołuńska', 'Krzysiek Wiłnicki']

export default function Navbar() {
  const { user, logout } = useAuth()
  const { theme } = useTheme()
  const navigate = useNavigate()
  const [aboutOpen, setAboutOpen] = useState(false)

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-4 px-4 py-3 sm:px-8">
      <Link to={user ? '/library' : '/'} aria-label="Aurora Reader — home" className="shrink-0">
        <img
          src={theme === 'light' ? logoLight : logoDark}
          alt="Aurora Reader"
          className="h-9 w-auto"
        />
      </Link>

      <nav className="flex items-center gap-2 sm:gap-3">
        {user && (
          <span className="mr-1 hidden text-sm sm:inline">
            hello <span className="font-semibold text-accent">{user.name}</span>
          </span>
        )}

        <ThemeToggle />

        {user && (
          <Dropdown
            label="Account menu"
            trigger={<MoreVertical size={18} />}
            items={[
              { label: 'About', icon: <Info size={16} />, onSelect: () => setAboutOpen(true) },
              {
                label: 'Help',
                icon: <HelpCircle size={16} />,
                href: 'https://github.com/krisior/aurora-reader',
              },
              {
                label: 'Log out',
                icon: <LogOut size={16} />,
                danger: true,
                onSelect: () => {
                  logout()
                  navigate('/')
                },
              },
            ]}
          />
        )}
      </nav>

      <Modal open={aboutOpen} onClose={() => setAboutOpen(false)} title="About Aurora">
        <p className="bg-gradient-to-r from-ink to-accent bg-clip-text font-semibold text-transparent dark:from-paper">
          Aurora Reader © 2021–2022
        </p>
        <p className="mt-4 text-sm text-ink/70 dark:text-paper/70">authors</p>
        <ul className="mt-2 space-y-1">
          {AUTHORS.map((a) => (
            <li key={a}>{a}</li>
          ))}
        </ul>
      </Modal>
    </header>
  )
}
