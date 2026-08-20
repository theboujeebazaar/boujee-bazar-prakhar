'use client'

import React, { useState, useEffect, useActionState, useTransition } from 'react'
import Link from 'next/link'
import { login, requestSignupOtp, verifySignupOtp } from '@/actions/auth'
import { Loader2, User, Mail, ArrowRight, Lock, Phone, KeyRound, Check } from 'lucide-react'

export default function AuthForm({ redirectTo }: { redirectTo?: string }) {
  const [mode, setMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN')
  const [showPassword, setShowPassword] = useState(false)

  // --- LOGIN: plain password auth via useActionState ---
  const [loginState, loginFormAction, isLoginPending] = useActionState(login, {
    error: undefined,
    success: undefined,
  })

  // --- REGISTER: 2-step OTP verification flow ---
  const [regStep, setRegStep] = useState<'DETAILS' | 'OTP'>('DETAILS')
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [otp, setOtp] = useState('')
  const [regPending, startRegTransition] = useTransition()
  const [regError, setRegError] = useState('')
  const [regSuccess, setRegSuccess] = useState('')
  const [resendTimer, setResendTimer] = useState(0)

  useEffect(() => {
    if (resendTimer <= 0) return
    const interval = setInterval(() => setResendTimer((t) => t - 1), 1000)
    return () => clearInterval(interval)
  }, [resendTimer])

  const switchMode = (next: 'LOGIN' | 'REGISTER') => {
    setMode(next)
    setRegStep('DETAILS')
    setRegError('')
    setRegSuccess('')
  }

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault()
    setRegError('')
    setRegSuccess('')

    if (!fullName || !email || !password) {
      setRegError('Full name, email, and password are required')
      return
    }

    startRegTransition(async () => {
      const res = await requestSignupOtp(fullName, email, phone)
      if (res?.error) {
        setRegError(res.error)
      } else {
        setRegStep('OTP')
        setResendTimer(60)
        setRegSuccess(`A 6-digit verification code has been sent to ${email}`)
      }
    })
  }

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault()
    setRegError('')
    setRegSuccess('')

    if (!otp || otp.length !== 6) {
      setRegError('Please enter the 6-digit code.')
      return
    }

    startRegTransition(async () => {
      const res = await verifySignupOtp(fullName, email, phone, password, otp, redirectTo)
      if (res?.error) {
        setRegError(res.error)
      }
    })
  }

  return (
    <div className="space-y-6" style={{ fontFamily: 'Poppins, sans-serif' }}>
      {mode === 'LOGIN' ? (
        <>
          {loginState?.error && (
            <div className="p-3.5 bg-red-50 text-red-600 rounded-xl text-xs font-semibold border border-red-100 flex items-start gap-2">
              <span>Oops!</span>
              <p>{loginState.error}</p>
            </div>
          )}

          <form action={loginFormAction} className="space-y-4">
            <input type="hidden" name="redirect_to" value={redirectTo || '/'} />

            <div>
              <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1.5">Email Address</label>
              <div className="relative">
                <input
                  name="email"
                  type="email"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-200 bg-neutral-50 focus:outline-none focus:border-[#c5a880] transition-colors text-xs font-medium"
                  placeholder="you@example.com"
                />
                <Mail className="absolute left-3.5 top-3 w-4 h-4 text-neutral-400" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1.5">Password</label>
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-200 bg-neutral-50 focus:outline-none focus:border-[#c5a880] transition-colors text-xs font-medium"
                  placeholder="••••••••••••"
                />
                <Lock className="absolute left-3.5 top-3 w-4 h-4 text-neutral-400" />
              </div>
              <div className="text-right mt-1.5">
                <Link
                  href="/forgot-password"
                  className="text-[11px] font-semibold text-neutral-600 hover:text-[#c5a880] transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoginPending}
              className="w-full py-2.5 px-4 bg-neutral-900 text-white rounded-xl text-xs font-bold hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-70 mt-2"
            >
              {isLoginPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  Login Securely
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </>
      ) : (
        <>
          {regError && (
            <div className="p-3.5 bg-red-50 text-red-600 rounded-xl text-xs font-semibold border border-red-100 flex items-start gap-2">
              <span>Oops!</span>
              <p>{regError}</p>
            </div>
          )}
          {regSuccess && !regError && (
            <div className="p-3.5 bg-green-50 text-green-700 rounded-xl text-xs font-semibold border border-green-100 flex items-start gap-2">
              <Check className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <p>{regSuccess}</p>
            </div>
          )}

          {regStep === 'DETAILS' ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1.5">Full Name</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-200 bg-neutral-50 focus:outline-none focus:border-[#c5a880] transition-colors text-xs font-medium"
                    placeholder="Ayesha Khan"
                  />
                  <User className="absolute left-3.5 top-3 w-4 h-4 text-neutral-400" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1.5">Phone Number</label>
                <div className="relative">
                  <input
                    type="text"
                    maxLength={10}
                    pattern="\d{10}"
                    title="Please enter exactly 10 digits"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-200 bg-neutral-50 focus:outline-none focus:border-[#c5a880] transition-colors text-xs font-medium"
                    placeholder="9876543210"
                  />
                  <Phone className="absolute left-3.5 top-3 w-4 h-4 text-neutral-400" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1.5">Email Address</label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-200 bg-neutral-50 focus:outline-none focus:border-[#c5a880] transition-colors text-xs font-medium"
                    placeholder="you@example.com"
                  />
                  <Mail className="absolute left-3.5 top-3 w-4 h-4 text-neutral-400" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1.5">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-200 bg-neutral-50 focus:outline-none focus:border-[#c5a880] transition-colors text-xs font-medium"
                    placeholder="••••••••••••"
                  />
                  <Lock className="absolute left-3.5 top-3 w-4 h-4 text-neutral-400" />
                </div>
              </div>

              <button
                type="submit"
                disabled={regPending}
                className="w-full py-2.5 px-4 bg-neutral-900 text-white rounded-xl text-xs font-bold hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-70 mt-2"
              >
                {regPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    Send Verification Code
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider">
                  Enter Verification Code
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setRegStep('DETAILS')
                    setRegError('')
                    setRegSuccess('')
                  }}
                  className="text-[11px] text-[#c5a880] hover:underline font-semibold"
                >
                  Change Details
                </button>
              </div>
              <div className="relative">
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  className="w-full pl-10 pr-4 py-2.5 tracking-widest text-center text-base font-bold rounded-xl border border-neutral-200 bg-neutral-50 focus:outline-none focus:border-[#c5a880] transition-colors"
                  placeholder="123456"
                />
                <KeyRound className="absolute left-3.5 top-3 w-4 h-4 text-neutral-400" />
              </div>

              <button
                type="submit"
                disabled={regPending}
                className="w-full py-2.5 px-4 bg-neutral-900 text-white rounded-xl text-xs font-bold hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-70 mt-2"
              >
                {regPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    Verify & Create Account
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="text-center mt-1">
                <button
                  type="button"
                  onClick={() => handleSendOtp({ preventDefault() {} } as React.FormEvent)}
                  disabled={regPending || resendTimer > 0}
                  className="text-[11px] text-neutral-600 hover:text-[#c5a880] transition-colors font-semibold underline disabled:opacity-50 disabled:no-underline disabled:cursor-not-allowed"
                >
                  {resendTimer > 0 ? `Resend code in ${resendTimer}s` : 'Resend code'}
                </button>
              </div>
            </form>
          )}
        </>
      )}

      {/* Mode switching options footer */}
      <div className="pt-4 border-t border-neutral-100 text-center">
        <p className="text-xs text-neutral-600 font-semibold">
          {mode === 'LOGIN' ? "Don't have an account?" : 'Already have an account?'}
        </p>
        <button
          type="button"
          onClick={() => switchMode(mode === 'LOGIN' ? 'REGISTER' : 'LOGIN')}
          className="mt-1.5 text-xs font-bold text-neutral-900 hover:text-[#c5a880] transition-colors underline underline-offset-4"
        >
          {mode === 'LOGIN' ? 'Create an Account' : 'Login Here'}
        </button>
      </div>
    </div>
  )
}
