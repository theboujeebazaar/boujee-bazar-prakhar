'use client'

import React, { useState, useActionState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { resetPassword } from '@/actions/auth'
import { Loader2, Lock, ArrowRight, Check } from 'lucide-react'

export default function ResetPasswordForm() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token') || ''
  const [showPassword, setShowPassword] = useState(false)

  const [state, formAction, isPending] = useActionState(resetPassword, {
    error: undefined,
    success: undefined,
  })

  if (!token) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100 text-center">
        This reset link is invalid.{' '}
        <Link href="/forgot-password" className="font-bold underline">
          Request a new one
        </Link>
        .
      </div>
    )
  }

  if (state?.success) {
    return (
      <div className="space-y-6 text-center" style={{ fontFamily: 'Poppins, sans-serif' }}>
        <div className="p-4 bg-green-50 text-green-700 rounded-xl text-sm border border-green-100 flex items-start gap-2 text-left">
          <Check className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <p>Your password has been updated. You can now log in with your new password.</p>
        </div>
        <Link
          href="/login"
          className="inline-block py-2.5 px-6 bg-neutral-900 text-white rounded-xl text-xs font-bold hover:bg-neutral-800 transition-colors"
        >
          Go to Login
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6" style={{ fontFamily: 'Poppins, sans-serif' }}>
      {state?.error && (
        <div className="p-3.5 bg-red-50 text-red-600 rounded-xl text-xs font-semibold border border-red-100 flex items-start gap-2">
          <span>Oops!</span>
          <p>{state.error}</p>
        </div>
      )}

      <form action={formAction} className="space-y-4">
        <input type="hidden" name="token" value={token} />

        <div>
          <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1.5">
            New Password
          </label>
          <div className="relative">
            <input
              name="password"
              type={showPassword ? 'text' : 'password'}
              required
              minLength={6}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-200 bg-neutral-50 focus:outline-none focus:border-[#c5a880] transition-colors text-xs font-medium"
              placeholder="••••••••••••"
            />
            <Lock className="absolute left-3.5 top-3 w-4 h-4 text-neutral-400" />
          </div>
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="mt-1.5 text-[11px] font-semibold text-neutral-400 hover:text-[#c5a880] transition-colors"
          >
            {showPassword ? 'Hide password' : 'Show password'}
          </button>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full py-2.5 px-4 bg-neutral-900 text-white rounded-xl text-xs font-bold hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-70 mt-2"
        >
          {isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              Update Password
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>
    </div>
  )
}
