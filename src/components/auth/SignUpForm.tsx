import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, AlertCircle, Loader2, User } from 'lucide-react';
import { Button } from '@/components/common';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/utils/cn';

export function SignUpForm() {
  const { signUpWithEmail, isSigningUp, error, clearError } = useAuthStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    clearError();

    if (!name.trim()) {
      setLocalError('Please enter your name');
      return;
    }
    if (!email.trim()) {
      setLocalError('Please enter your email');
      return;
    }
    if (!password) {
      setLocalError('Please enter a password');
      return;
    }
    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters');
      return;
    }
    if (password !== confirmPassword) {
      setLocalError('Passwords do not match');
      return;
    }

    try {
      await signUpWithEmail(email, password, name);
    } catch {
      // Error is handled by the store
    }
  };

  const displayError = localError || error;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {displayError && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 text-red-600 dark:text-red-400 text-sm"
        >
          <AlertCircle size={16} />
          {displayError}
        </motion.div>
      )}

      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 font-game">
          Name
        </label>
        <div className="relative">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className={cn(
              'w-full px-4 py-3 pl-11 bg-cream-50 dark:bg-slate-800 border rounded-xl text-gray-800 dark:text-cream-50',
              'focus:outline-none focus:ring-2 transition-all',
              'border-warm-200 dark:border-slate-700 focus:border-warm-400 dark:focus:border-warm-500',
              'focus:ring-warm-100 dark:focus:ring-warm-900/30'
            )}
            disabled={isSigningUp}
          />
          <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 font-game">
          Email
        </label>
        <div className="relative">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className={cn(
              'w-full px-4 py-3 pl-11 bg-cream-50 dark:bg-slate-800 border rounded-xl text-gray-800 dark:text-cream-50',
              'focus:outline-none focus:ring-2 transition-all',
              'border-warm-200 dark:border-slate-700 focus:border-warm-400 dark:focus:border-warm-500',
              'focus:ring-warm-100 dark:focus:ring-warm-900/30'
            )}
            disabled={isSigningUp}
          />
          <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 font-game">
          Password
        </label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 6 characters"
            className={cn(
              'w-full px-4 py-3 pl-11 pr-11 bg-cream-50 dark:bg-slate-800 border rounded-xl text-gray-800 dark:text-cream-50',
              'focus:outline-none focus:ring-2 transition-all',
              'border-warm-200 dark:border-slate-700 focus:border-warm-400 dark:focus:border-warm-500',
              'focus:ring-warm-100 dark:focus:ring-warm-900/30'
            )}
            disabled={isSigningUp}
          />
          <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            disabled={isSigningUp}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 font-game">
          Confirm Password
        </label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm your password"
            className={cn(
              'w-full px-4 py-3 pl-11 bg-cream-50 dark:bg-slate-800 border rounded-xl text-gray-800 dark:text-cream-50',
              'focus:outline-none focus:ring-2 transition-all',
              'border-warm-200 dark:border-slate-700 focus:border-warm-400 dark:focus:border-warm-500',
              'focus:ring-warm-100 dark:focus:ring-warm-900/30'
            )}
            disabled={isSigningUp}
          />
          <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        </div>
      </div>

      <Button
        type="submit"
        variant="primary"
        className="w-full"
        disabled={isSigningUp}
      >
        {isSigningUp ? (
          <>
            <Loader2 size={18} className="mr-2 animate-spin" />
            Creating account...
          </>
        ) : (
          'Create Account'
        )}
      </Button>
    </form>
  );
}
