'use client'

import React, { useActionState } from 'react'
import Link from 'next/link'
import { requestPasswordReset } from '@/actions/auth'
import { Loader2, Mail, ArrowRight, Check } from 'lucide-react'

export default function ForgotPasswordForm() {
  const [state, formAction, isPending] = useActionState(requestPasswordReset, {
    error: undefined,
    success: undefined,
  })

  if (state?.success) {
    return (
      <div className="space-y-6 text-center" style={{ fontFamily: 'Poppins, sans-serif' }}>
        <div className="p-4 bg-green-50 text-green-700 rounded-xl text-sm border border-green-100 flex items-start gap-2 text-left">
          <Check className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <p>
            We&apos;ve sent a password reset link to your email. Please check your inbox (and
            spam folder).
          </p>
        </div>
        <Link
          href="/login"
          className="inline-block text-xs font-bold text-neutral-900 hover:text-[#c5a880] transition-colors underline underline-offset-4"
        >
          Back to Login
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
        <div>
          <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1.5">
            Email Address
          </label>
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

        <button
          type="submit"
          disabled={isPending}
          className="w-full py-2.5 px-4 bg-neutral-900 text-white rounded-xl text-xs font-bold hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-70 mt-2"
        >
          {isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              Send Reset Link
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <div className="pt-4 border-t border-neutral-100 text-center">
        <Link
          href="/login"
          className="text-xs font-bold text-neutral-900 hover:text-[#c5a880] transition-colors underline underline-offset-4"
        >
          Back to Login
        </Link>
      </div>
    </div>
  )
}
