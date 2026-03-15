'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { toast } from 'sonner'

type AuthMode = 'signin' | 'signup'

export default function LoginPage() {
  const router = useRouter()
  const [mode, setMode] = useState<AuthMode>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      if (!email || !password) {
        setError('Please enter both email and password')
        setIsLoading(false)
        return
      }
      if (!email.includes('@')) {
        setError('Please enter a valid email')
        setIsLoading(false)
        return
      }

      await api.login(email, password)
      toast.success('Login successful!')
      router.push('/dashboard')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed. Please check your credentials.'
      setError(message)
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      if (!email || !password || !confirmPassword) {
        setError('Please fill in all fields')
        setIsLoading(false)
        return
      }
      if (!email.includes('@')) {
        setError('Please enter a valid email')
        setIsLoading(false)
        return
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters')
        setIsLoading(false)
        return
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match')
        setIsLoading(false)
        return
      }

      await api.register(email, password)
      toast.success('Account created! Signing you in...')
      await api.login(email, password)
      router.push('/dashboard')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Sign up failed. Please try again.'
      setError(message)
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  const isSignUp = mode === 'signup'

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-b from-background via-background to-background/95 dark:from-[#0B0F14] dark:via-[#111827] dark:to-[#0B0F14]">
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl" style={{
          background: 'radial-gradient(circle, rgba(99,102,241,0.2), transparent 70%)',
          animation: 'float 6s ease-in-out infinite'
        }} />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl" style={{
          background: 'radial-gradient(circle, rgba(139,92,246,0.2), transparent 70%)',
          animation: 'float 8s ease-in-out infinite 1s'
        }} />
      </div>

      <motion.div
        className="relative z-10 w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="rounded-2xl border border-border/50 bg-card/80 backdrop-blur-xl shadow-2xl p-8 space-y-6">
          {/* Tabs */}
          <div className="flex rounded-lg border border-border/50 p-1 bg-muted/30">
            <button
              type="button"
              onClick={() => { setMode('signin'); setError(''); setConfirmPassword('') }}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${!isSignUp ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setMode('signup'); setError(''); setConfirmPassword('') }}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${isSignUp ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Sign Up
            </button>
          </div>

          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-bold text-foreground">
              {isSignUp ? 'Create an account' : 'Welcome Back'}
            </h1>
            <p className="text-sm text-muted-foreground">
              {isSignUp ? 'Sign up to analyze e-commerce products with AI' : 'Sign in to analyze e-commerce products with AI'}
            </p>
          </div>

          <form onSubmit={isSignUp ? handleSignUp : handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium">Email</label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError('') }}
                disabled={isLoading}
                className="border-border/50 bg-input/50 backdrop-blur-sm"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium">Password</label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError('') }}
                disabled={isLoading}
                className="border-border/50 bg-input/50 backdrop-blur-sm"
              />
            </div>

            {isSignUp && (
              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="block text-sm font-medium">Confirm password</label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); setError('') }}
                  disabled={isLoading}
                  className="border-border/50 bg-input/50 backdrop-blur-sm"
                />
              </div>
            )}

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-lg bg-destructive/10 border border-destructive/30"
              >
                <p className="text-sm text-destructive font-medium">{error}</p>
              </motion.div>
            )}

            <Button
              type="submit"
              disabled={isLoading || !email || !password || (isSignUp && (password !== confirmPassword || !confirmPassword))}
              className="w-full mt-6 bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {isLoading ? (
                <>
                  <Spinner className="w-4 h-4 mr-2" />
                  {isSignUp ? 'Creating account...' : 'Signing in...'}
                </>
              ) : (
                isSignUp ? 'Sign Up' : 'Sign In'
              )}
            </Button>
          </form>

          <div className="pt-4 border-t border-border/20 flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition-colors">Back to home</Link>
            <span>·</span>
            <span>Demo credentials available upon request</span>
          </div>
        </div>
      </motion.div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-30px); }
        }
      `}</style>
    </div>
  )
}
