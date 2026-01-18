import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Mail, Check, AlertCircle, Loader2 } from 'lucide-react';
import { LoginForm, GoogleSignInButton } from '@/components/auth';
import { Button, Card } from '@/components/common';
import { PixelCharacter } from '@/components/game';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/utils/cn';

export function Login() {
  const { sendPasswordResetEmail, error, clearError } = useAuthStore();
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetStatus, setResetStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  const handleForgotPassword = async () => {
    if (!resetEmail.trim()) return;

    setResetStatus('sending');
    try {
      await sendPasswordResetEmail(resetEmail);
      setResetStatus('sent');
    } catch {
      setResetStatus('error');
    }
  };

  const handleBackToLogin = () => {
    setShowForgotPassword(false);
    setResetEmail('');
    setResetStatus('idle');
    clearError();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cream-50 to-warm-100 dark:from-slate-900 dark:to-slate-800 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Card variant="warm" className="p-8">
          {/* Logo/Branding */}
          <div className="text-center mb-8">
            <motion.div
              className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-warm-400 to-warm-500 flex items-center justify-center shadow-lg"
              whileHover={{ scale: 1.05, rotate: 5 }}
            >
              <PixelCharacter size="md" state="idle" />
            </motion.div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-cream-50 font-game">
              {showForgotPassword ? 'Reset Password' : 'Welcome Back!'}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              {showForgotPassword
                ? 'Enter your email to receive a reset link'
                : 'Sign in to continue your adventure'}
            </p>
          </div>

          {showForgotPassword ? (
            <div className="space-y-4">
              {resetStatus === 'sent' ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-4"
                >
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <Check size={32} className="text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-800 dark:text-cream-50 font-game">
                    Check your email!
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 mt-2">
                    We've sent a password reset link to {resetEmail}
                  </p>
                </motion.div>
              ) : (
                <>
                  {(resetStatus === 'error' || error) && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 text-red-600 dark:text-red-400 text-sm"
                    >
                      <AlertCircle size={16} />
                      {error || 'Failed to send reset email. Please try again.'}
                    </motion.div>
                  )}

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 font-game">
                      Email
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        placeholder="you@example.com"
                        className={cn(
                          'w-full px-4 py-3 pl-11 bg-cream-50 dark:bg-slate-800 border rounded-xl text-gray-800 dark:text-cream-50',
                          'focus:outline-none focus:ring-2 transition-all',
                          'border-warm-200 dark:border-slate-700 focus:border-warm-400 dark:focus:border-warm-500',
                          'focus:ring-warm-100 dark:focus:ring-warm-900/30'
                        )}
                        disabled={resetStatus === 'sending'}
                      />
                      <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    </div>
                  </div>

                  <Button
                    onClick={handleForgotPassword}
                    variant="primary"
                    className="w-full"
                    disabled={resetStatus === 'sending' || !resetEmail.trim()}
                  >
                    {resetStatus === 'sending' ? (
                      <>
                        <Loader2 size={18} className="mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      'Send Reset Link'
                    )}
                  </Button>
                </>
              )}

              <button
                onClick={handleBackToLogin}
                className="w-full flex items-center justify-center gap-2 text-warm-600 dark:text-warm-400 hover:text-warm-700 dark:hover:text-warm-300"
              >
                <ArrowLeft size={16} />
                Back to login
              </button>
            </div>
          ) : (
            <>
              {/* Login Form */}
              <LoginForm onForgotPassword={() => setShowForgotPassword(true)} />

              {/* Divider */}
              <div className="flex items-center gap-4 my-6">
                <div className="flex-1 h-px bg-warm-200 dark:bg-slate-700" />
                <span className="text-sm text-gray-500 dark:text-gray-400">or</span>
                <div className="flex-1 h-px bg-warm-200 dark:bg-slate-700" />
              </div>

              {/* Google Sign In */}
              <GoogleSignInButton />

              {/* Sign Up Link */}
              <p className="text-center mt-6 text-gray-500 dark:text-gray-400">
                Don't have an account?{' '}
                <Link
                  to="/signup"
                  className="text-warm-600 dark:text-warm-400 hover:text-warm-700 dark:hover:text-warm-300 font-semibold"
                >
                  Sign up
                </Link>
              </p>
            </>
          )}
        </Card>
      </motion.div>
    </div>
  );
}
