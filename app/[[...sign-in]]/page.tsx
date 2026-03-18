'use client'

import * as Clerk from '@clerk/elements/common'
import * as SignInElements from '@clerk/elements/sign-in'
import { Eye, EyeOff, GraduationCap, ShieldCheck, Sparkles, School } from 'lucide-react'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { Spinner } from '@/components/ui/spinner'

export default function SignInPage() {
  const { isLoaded, isSignedIn, user } = useUser()
  const didToastRef = useRef(false)
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return

    const role = user?.publicMetadata.role

    if (!didToastRef.current) {
      toast.success('Signed in successfully')
      didToastRef.current = true
    }

    if (role) router.replace(`/${role}`)
  }, [isLoaded, isSignedIn, user, router])

  if (isLoaded && isSignedIn) {
    return (
      <main className="relative min-h-screen overflow-hidden bg-[linear-gradient(135deg,#f8f6f1_0%,#f8fafc_45%,#eef4ff_100%)]">
        <div className="absolute inset-0 bg-slate-900/5 backdrop-blur-[2px]" />
        <div className="relative flex min-h-screen items-center justify-center px-4">
          <div className="flex w-full max-w-md flex-col items-center gap-4 rounded-3xl border border-white/70 bg-white/90 p-8 text-center shadow-[0_30px_70px_-30px_rgba(15,23,42,0.28)] backdrop-blur-xl">
            <Spinner className="size-6 text-indigo-600" />
            <p className="text-base font-medium text-slate-800">Signing you in...</p>
            <p className="text-sm text-slate-500">Redirecting to your dashboard</p>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[linear-gradient(135deg,#f8f6f1_0%,#f8fafc_45%,#eef4ff_100%)] w-full">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-[-7rem] top-[-5rem] h-72 w-72 rounded-full bg-indigo-200/30 blur-3xl" />
        <div className="absolute right-[-12rem] top-[10%] h-[30rem] w-[30rem] rounded-full bg-sky-200/35 blur-3xl" />
        <div className="absolute bottom-[-6rem] left-[18%] h-72 w-72 rounded-full bg-amber-100/40 blur-3xl" />
      </div>

      <div className="pointer-events-none absolute inset-0 opacity-[0.06] [background-image:radial-gradient(#1e293b_0.7px,transparent_0.7px)] [background-size:24px_24px]" />

      <div className="relative flex min-h-screen w-full items-center justify-center px-4 py-4 sm:px-6 sm:py-10">
        <section className="flex w-full justify-center">
          <div className="w-full max-w-[35rem]">
            <div className="mb-6 text-center">
              <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-[1.25rem] border border-white/70 bg-white/90 text-slate-800 shadow-[0_12px_30px_-18px_rgba(15,23,42,0.35)] backdrop-blur">
                <GraduationCap className="size-6" />
              </div>

              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900 sm:text-[2rem]">
                Welcome back
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500 sm:text-[0.95rem]">
                Sign in to continue to your school portal
              </p>

              <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-indigo-200/70 bg-white/80 px-4 py-1.5 text-xs font-medium text-indigo-700 shadow-sm">
                <Sparkles className="size-3.5" />
                Secure school access
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/70 bg-white/85 p-2 shadow-[0_30px_70px_-30px_rgba(15,23,42,0.28)] backdrop-blur-xl sm:p-4">
              <SignInElements.Root
                fallback={
                  <div className="flex min-h-[18rem] flex-col items-center justify-center gap-3 rounded-[1.6rem] border border-slate-200/70 bg-white/95 p-6 text-center">
                    <Spinner className="size-5 text-indigo-600" />
                    <p className="text-sm font-medium text-slate-700">Preparing secure sign in</p>
                  </div>
                }
              >
                <SignInElements.Step
                  name="start"
                  className="rounded-[1.6rem] border border-slate-200/70 bg-white/95 p-3 sm:p-7"
                >
                  <div className="border-b border-slate-100 pb-5">
                    <h3 className="text-[1.55rem] font-semibold tracking-tight text-slate-900 sm:text-[1.8rem]">
                      School Sign In
                    </h3>
                    <p className="mt-1.5 text-sm leading-6 text-slate-500">
                      Enter your assigned school credentials
                    </p>
                  </div>

                  <Clerk.GlobalError className="mt-5 block rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700" />

                  <div className="mt-6 space-y-5">
                    <Clerk.Field name="identifier" className="space-y-2.5">
                      <Clerk.Label className="text-sm font-medium text-slate-700">
                        Username
                      </Clerk.Label>

                      <div className="group flex h-12 items-center rounded-2xl border border-slate-300/90 bg-white px-3.5 shadow-sm transition-all duration-200 focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/10">
                        <School className="mr-2 size-4 shrink-0 text-slate-400 transition-colors group-focus-within:text-indigo-600" />
                        <Clerk.Input
                          type="text"
                          required
                          className="h-full w-full min-w-0 border-0 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
                          placeholder="Enter your username"
                        />
                      </div>

                      <Clerk.FieldError className="block text-sm text-rose-500" />
                    </Clerk.Field>

                    <Clerk.Field name="password" className="space-y-2.5">
                      <Clerk.Label className="text-sm font-medium text-slate-700">
                        Password
                      </Clerk.Label>

                      <div className="group flex h-12 items-center rounded-2xl border border-slate-300/90 bg-white px-3.5 shadow-sm transition-all duration-200 focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/10">
                        <ShieldCheck className="mr-2 size-4 shrink-0 text-slate-400 transition-colors group-focus-within:text-indigo-600" />
                        <Clerk.Input
                          type={showPassword ? 'text' : 'password'}
                          required
                          className="h-full w-full min-w-0 border-0 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
                          placeholder="Enter your password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((prev) => !prev)}
                          className="ml-2 inline-flex shrink-0 items-center justify-center rounded-md p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                          aria-label={showPassword ? 'Hide password' : 'Show password'}
                        >
                          {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                        </button>
                      </div>

                      <Clerk.FieldError className="block text-sm text-rose-500" />
                    </Clerk.Field>
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-4">
                    <p className="text-xs text-slate-500">Protected access for authorized users only</p>

                    <SignInElements.Action
                      navigate="forgot-password"
                      className="text-sm font-medium text-indigo-700 transition hover:text-indigo-800"
                    >
                      Forgot password?
                    </SignInElements.Action>
                  </div>

                  <SignInElements.Action
                    submit
                    className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 cursor-pointer text-sm font-semibold text-white shadow-[0_18px_34px_-18px_rgba(37,99,235,0.75)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_22px_40px_-18px_rgba(37,99,235,0.85)] active:translate-y-0"
                  >
                    <Clerk.Loading>
                      {(isLoading) => (
                        <span className="inline-flex items-center gap-2">
                          {isLoading ? <Spinner className="size-4 text-white" /> : null}
                          {isLoading ? 'Signing in...' : 'Sign in to portal'}
                        </span>
                      )}
                    </Clerk.Loading>
                  </SignInElements.Action>

                  <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-center">
                    <p className="text-xs leading-5 text-slate-500">
                      By continuing, you are accessing your school's authorized academic system.
                    </p>
                  </div>
                </SignInElements.Step>
              </SignInElements.Root>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
