import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Eye, EyeOff, ShoppingBag, X, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useAuthStore } from '@/stores/useAuthStore'
import { cn } from '@/lib/utils'

// ── Forgot-password modal ──────────────────────────────────────────────────

type ForgotStep = 'phone' | 'code' | 'done'

const MOCK_CODE = '123456'

function ForgotPasswordModal({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState<ForgotStep>('phone')
  const [phone, setPhone] = useState('')
  const [phoneError, setPhoneError] = useState('')
  const [code, setCode] = useState('')
  const [codeError, setCodeError] = useState('')

  function handleSendCode() {
    const digits = phone.replace(/\D/g, '')
    if (digits.length < 9) {
      setPhoneError('Введите корректный номер телефона')
      return
    }
    setPhoneError('')
    setStep('code')
  }

  function handleVerifyCode() {
    if (code.trim() !== MOCK_CODE) {
      setCodeError('Неверный код. Попробуйте снова')
      return
    }
    setCodeError('')
    setStep('done')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* overlay */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
        onClick={onClose}
      />

      {/* dialog */}
      <div className="relative z-10 w-full max-w-sm rounded-xl bg-white p-6 shadow-lg">
        {/* close */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          aria-label="Закрыть"
        >
          <X size={18} />
        </button>

        {step === 'phone' && (
          <>
            <h2 className="mb-1 text-[17px] font-semibold text-gray-900">
              Восстановление пароля
            </h2>
            <p className="mb-5 text-sm text-gray-500">
              Введите номер телефона — отправим SMS с кодом подтверждения
            </p>

            <div className="flex flex-col gap-4">
              <Input
                label="Номер телефона"
                type="tel"
                placeholder="+998 90 123 45 67"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value)
                  if (phoneError) setPhoneError('')
                }}
                error={phoneError}
                autoFocus
              />

              <Button
                variant="primary"
                size="md"
                className="w-full"
                onClick={handleSendCode}
              >
                Получить код
              </Button>
            </div>
          </>
        )}

        {step === 'code' && (
          <>
            <h2 className="mb-1 text-[17px] font-semibold text-gray-900">
              Введите код
            </h2>
            <p className="mb-4 text-sm text-gray-500">
              Код отправлен на номер{' '}
              <span className="font-medium text-gray-700">{phone}</span>
            </p>

            {/* demo hint */}
            <div className="mb-4 flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2.5">
              <span className="text-xs text-blue-700">
                Демо-режим: ваш код —{' '}
                <span className="font-bold tracking-widest">{MOCK_CODE}</span>
              </span>
            </div>

            <div className="flex flex-col gap-4">
              <Input
                label="6-значный код"
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="000000"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value.replace(/\D/g, '').slice(0, 6))
                  if (codeError) setCodeError('')
                }}
                error={codeError}
                autoFocus
              />

              <Button
                variant="primary"
                size="md"
                className="w-full"
                onClick={handleVerifyCode}
                disabled={code.length !== 6}
              >
                Подтвердить
              </Button>

              <button
                type="button"
                className="text-center text-sm text-gray-500 hover:text-gray-700 transition-colors"
                onClick={() => {
                  setCode('')
                  setCodeError('')
                  setStep('phone')
                }}
              >
                Изменить номер
              </button>
            </div>
          </>
        )}

        {step === 'done' && (
          <div className="flex flex-col items-center py-2 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-50">
              <CheckCircle2 size={32} className="text-green-600" />
            </div>
            <h2 className="mb-1 text-[17px] font-semibold text-gray-900">
              Код подтверждён
            </h2>
            <p className="mb-6 text-sm text-gray-500">
              В реальном приложении здесь был бы сброс пароля. Войдите с
              текущими данными.
            </p>
            <Button
              variant="primary"
              size="md"
              className="w-full"
              onClick={onClose}
            >
              Вернуться ко входу
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Login page ─────────────────────────────────────────────────────────────

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const login = useAuthStore((s) => s.login)

  const [loginValue, setLoginValue] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loginError, setLoginError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [authError, setAuthError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showForgot, setShowForgot] = useState(false)

  const from =
    (location.state as { from?: { pathname: string } })?.from?.pathname ||
    '/purchase'

  function validate() {
    let ok = true
    if (!loginValue.trim()) {
      setLoginError('Введите логин')
      ok = false
    } else {
      setLoginError('')
    }
    if (!password) {
      setPasswordError('Введите пароль')
      ok = false
    } else {
      setPasswordError('')
    }
    return ok
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setAuthError('')
    if (!validate()) return

    setIsLoading(true)
    // tiny delay to simulate network
    await new Promise((r) => setTimeout(r, 500))

    const ok = login(loginValue, password)
    setIsLoading(false)

    if (ok) {
      navigate(from, { replace: true })
    } else {
      setAuthError('Неверный логин или пароль')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      {/* card */}
      <div className="w-full max-w-[400px] rounded-2xl bg-white px-8 py-10 shadow-sm border border-gray-100">

        {/* logo */}
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-900">
            <ShoppingBag size={24} className="text-white" />
          </div>
          <div className="text-center">
            <h1 className="text-[22px] font-bold tracking-tight text-gray-900">
              MegaPrice
            </h1>
            <p className="mt-0.5 text-sm text-gray-500">
              Платформа заказов для аптек
            </p>
          </div>
        </div>

        {/* form */}
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
          <Input
            label="Логин"
            type="text"
            placeholder="admin@megaprice.uz"
            value={loginValue}
            onChange={(e) => {
              setLoginValue(e.target.value)
              if (loginError) setLoginError('')
              if (authError) setAuthError('')
            }}
            error={loginError}
            autoComplete="username"
            autoFocus
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Пароль</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  if (passwordError) setPasswordError('')
                  if (authError) setAuthError('')
                }}
                autoComplete="current-password"
                className={cn(
                  'flex h-10 w-full rounded-md border bg-white px-3 py-2 pr-10 text-sm text-gray-700 placeholder:text-gray-400',
                  'transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1',
                  passwordError || authError
                    ? 'border-[#ee0000] focus-visible:border-[#ee0000] focus-visible:ring-[#ee0000]/20'
                    : 'border-gray-200 hover:border-gray-300 focus-visible:border-gray-900 focus-visible:ring-gray-900/20'
                )}
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label={showPassword ? 'Скрыть пароль' : 'Показать пароль'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {passwordError && (
              <p className="text-xs text-[#ee0000]">{passwordError}</p>
            )}
          </div>

          {/* auth error */}
          {authError && (
            <p className="rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-600">
              {authError}
            </p>
          )}

          {/* forgot password */}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setShowForgot(true)}
              className="text-sm text-gray-500 hover:text-gray-800 transition-colors"
            >
              Забыли пароль?
            </button>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="mt-1 w-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Входим...
              </span>
            ) : (
              'Войти'
            )}
          </Button>
        </form>

        {/* demo hint */}
        <div className="mt-6 rounded-lg bg-gray-50 px-4 py-3">
          <p className="text-[12px] font-medium text-gray-500 mb-1">Демо-данные для входа</p>
          <p className="text-[12px] text-gray-600">
            Логин:{' '}
            <span className="font-mono font-semibold text-gray-800">
              admin@megaprice.uz
            </span>
          </p>
          <p className="text-[12px] text-gray-600">
            Пароль:{' '}
            <span className="font-mono font-semibold text-gray-800">
              Mega2026
            </span>
          </p>
        </div>
      </div>

      {/* forgot password modal */}
      {showForgot && (
        <ForgotPasswordModal onClose={() => setShowForgot(false)} />
      )}
    </div>
  )
}
