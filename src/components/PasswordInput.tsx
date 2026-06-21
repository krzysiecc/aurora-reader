import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

interface PasswordInputProps {
  name: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  autoComplete?: string
  'aria-label'?: string
}

/**
 * Password field with show/hide toggle and a live caps-lock warning. Caps-lock
 * is read straight off the keyboard event (getModifierState) — no extra
 * dependency, unlike the original.
 */
export default function PasswordInput({
  name,
  value,
  onChange,
  placeholder = 'password',
  autoComplete = 'current-password',
  'aria-label': ariaLabel,
}: PasswordInputProps) {
  const [shown, setShown] = useState(false)
  const [capsLock, setCapsLock] = useState(false)

  return (
    <div>
      <div className="relative">
        <input
          type={shown ? 'text' : 'password'}
          name={name}
          value={value}
          placeholder={placeholder}
          autoComplete={autoComplete}
          aria-label={ariaLabel ?? placeholder}
          className="glass-input pr-12"
          onChange={(e) => onChange(e.target.value)}
          onKeyUp={(e) => setCapsLock(e.getModifierState('CapsLock'))}
          onKeyDown={(e) => setCapsLock(e.getModifierState('CapsLock'))}
        />
        <button
          type="button"
          onClick={() => setShown((s) => !s)}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-2 text-ink/60 hover:text-accent dark:text-paper/60"
          aria-label={shown ? 'Hide password' : 'Show password'}
          tabIndex={-1}
        >
          {shown ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
      {capsLock && (
        <p className="mt-1 text-sm text-amber-500" role="status">
          Caps Lock is on
        </p>
      )}
    </div>
  )
}
