import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SignUpForm, GoogleSignInButton } from '@/components/auth';
import { Card } from '@/components/common';
import { PixelCharacter } from '@/components/game';

export function SignUp() {
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
              <PixelCharacter size="md" state="celebrating" />
            </motion.div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-cream-50 font-game">
              Start Your Adventure!
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              Create an account to track your career journey
            </p>
          </div>

          {/* Sign Up Form */}
          <SignUpForm />

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-warm-200 dark:bg-slate-700" />
            <span className="text-sm text-gray-500 dark:text-gray-400">or</span>
            <div className="flex-1 h-px bg-warm-200 dark:bg-slate-700" />
          </div>

          {/* Google Sign Up */}
          <GoogleSignInButton label="Sign up with Google" />

          {/* Login Link */}
          <p className="text-center mt-6 text-gray-500 dark:text-gray-400">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-warm-600 dark:text-warm-400 hover:text-warm-700 dark:hover:text-warm-300 font-semibold"
            >
              Sign in
            </Link>
          </p>

          {/* Terms */}
          <p className="text-center mt-4 text-xs text-gray-400 dark:text-gray-500">
            By signing up, you agree to our{' '}
            <a href="#" className="underline hover:text-gray-600 dark:hover:text-gray-300">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#" className="underline hover:text-gray-600 dark:hover:text-gray-300">
              Privacy Policy
            </a>
          </p>
        </Card>
      </motion.div>
    </div>
  );
}
