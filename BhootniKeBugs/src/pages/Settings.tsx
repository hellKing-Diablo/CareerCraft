import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Target,
  Bell,
  Shield,
  Moon,
  Sun,
  Database,
  Download,
  Trash2,
  Save,
  ChevronRight,
  LucideIcon,
  User,
  Sparkles,
  Bot,
  Key,
  Eye,
  EyeOff,
  Check,
  AlertCircle,
  Zap,
  Brain,
  Info,
  LogOut,
  UserX,
  Cloud,
  CloudOff,
  Loader2,
} from 'lucide-react';
import { Card, CardHeader, Button, Badge, Modal } from '@/components/common';
import { useUserStore } from '@/store/userStore';
import { useAuthStore } from '@/store/authStore';
import { useThemeStore } from '@/store/themeStore';
import { useAIStore } from '@/store/aiStore';
import { roleBenchmarks } from '@/data/roleBenchmarks';
import { PixelCharacter } from '@/components/game';
import { cn } from '@/utils/cn';
import { isRealBackend } from '@/services/backend';
import { getAIService } from '@/services/ai';

// Check if API key is from environment
const ENV_API_KEY = import.meta.env.VITE_MISTRAL_API_KEY as string | undefined;
const hasEnvKey = ENV_API_KEY && ENV_API_KEY !== 'your_api_key_here';

export function Settings() {
  const { user, careerGoals, setCareerGoal, loadMockUser, clearUser, syncStatus } = useUserStore();
  const { authUser, signOut, deleteAccount, isSigningOut } = useAuthStore();
  const { theme, toggleTheme, setTheme } = useThemeStore();
  const { apiKey, isConfigured, isValidating, setApiKey, clearApiKey, setValidating, setConfigured } = useAIStore();
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [selectedGoalType, setSelectedGoalType] = useState<'short' | 'long'>('long');
  const [apiKeyInput, setApiKeyInput] = useState(apiKey);
  const [showApiKey, setShowApiKey] = useState(false);
  const [validationStatus, setValidationStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Check if AI is configured (from env or store)
  const aiConfigured = isConfigured;
  const isUsingFirebase = isRealBackend();

  const currentLongTermGoal = careerGoals.find(g => g.timeframe === 'long');
  const currentShortTermGoal = careerGoals.find(g => g.timeframe === 'short');

  const longTermRole = roleBenchmarks.find(r => r.id === currentLongTermGoal?.targetRoleId);
  const shortTermRole = roleBenchmarks.find(r => r.id === currentShortTermGoal?.targetRoleId);

  const handleSelectGoal = (roleId: string) => {
    setCareerGoal(roleId, selectedGoalType);
    setIsGoalModalOpen(false);
  };

  const handleValidateApiKey = async () => {
    if (!apiKeyInput.trim()) {
      setValidationStatus('error');
      return;
    }

    setValidating(true);
    setValidationStatus('idle');

    try {
      // Validate by making a test call to Mistral API
      const aiService = getAIService();
      aiService.setApiKey(apiKeyInput);

      // Try a simple API call to validate the key
      const response = await fetch('https://api.mistral.ai/v1/models', {
        headers: {
          'Authorization': `Bearer ${apiKeyInput}`,
        },
      });

      if (response.ok) {
        setApiKey(apiKeyInput);
        setConfigured(true);
        setValidationStatus('success');
      } else {
        setValidationStatus('error');
      }
    } catch {
      setValidationStatus('error');
    } finally {
      setValidating(false);
    }
  };

  const handleClearApiKey = () => {
    clearApiKey();
    setApiKeyInput('');
    setValidationStatus('idle');
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await deleteAccount();
      setShowDeleteModal(false);
    } catch (error) {
      setDeleteError(error instanceof Error ? error.message : 'Failed to delete account');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Account Section - Only show when using Firebase */}
      {isUsingFirebase && authUser && (
        <Card variant="warm">
          <CardHeader
            title="Account"
            subtitle="Manage your account"
            icon={<User className="w-5 h-5" />}
            action={
              <div className="flex items-center gap-2">
                {syncStatus === 'syncing' && (
                  <Badge variant="info" size="sm">
                    <Loader2 size={12} className="mr-1 animate-spin" /> Syncing
                  </Badge>
                )}
                {syncStatus === 'synced' && (
                  <Badge variant="success" size="sm">
                    <Cloud size={12} className="mr-1" /> Synced
                  </Badge>
                )}
              </div>
            }
          />
          <div className="space-y-4">
            <div className="flex items-center gap-5">
              <div className="relative">
                {authUser.photoURL ? (
                  <img
                    src={authUser.photoURL}
                    alt={authUser.displayName || 'User'}
                    className="w-20 h-20 rounded-2xl object-cover border-2 border-warm-300 dark:border-warm-700/50"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-warm-100 to-warm-200 dark:from-warm-900/30 dark:to-warm-800/30 border-2 border-warm-300 dark:border-warm-700/50 flex items-center justify-center">
                    <PixelCharacter size="md" state="idle" />
                  </div>
                )}
                <motion.div
                  className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-green-500 border-2 border-white dark:border-slate-800 flex items-center justify-center"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Sparkles size={12} className="text-white" />
                </motion.div>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800 dark:text-cream-50 font-game">
                  {authUser.displayName || 'Adventurer'}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {authUser.email}
                </p>
                <Badge variant="warm" className="mt-2" animate>
                  {user?.stage ?? 'beginner'} adventurer
                </Badge>
              </div>
            </div>

            <div className="pt-4 border-t border-warm-100 dark:border-slate-700 space-y-3">
              <Button
                variant="secondary"
                className="w-full justify-center"
                onClick={handleSignOut}
                disabled={isSigningOut}
              >
                {isSigningOut ? (
                  <>
                    <Loader2 size={16} className="mr-2 animate-spin" />
                    Signing out...
                  </>
                ) : (
                  <>
                    <LogOut size={16} className="mr-2" />
                    Sign Out
                  </>
                )}
              </Button>

              <Button
                variant="danger"
                className="w-full justify-center"
                onClick={() => setShowDeleteModal(true)}
              >
                <UserX size={16} className="mr-2" />
                Delete Account
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Profile Section - Show for mock users */}
      {!isUsingFirebase && (
        <Card variant="warm">
          <CardHeader
            title="Profile"
            subtitle="Your adventurer information"
            icon={<User className="w-5 h-5" />}
            action={
              <div className="flex items-center gap-2">
                <Badge variant="warning" size="sm">
                  <CloudOff size={12} className="mr-1" /> Local Only
                </Badge>
                <Button variant="secondary" size="sm">
                  <Save size={14} className="mr-2" /> Save
                </Button>
              </div>
            }
          />
          <div className="space-y-4">
            <div className="flex items-center gap-5">
              <div className="relative">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-warm-100 to-warm-200 dark:from-warm-900/30 dark:to-warm-800/30 border-2 border-warm-300 dark:border-warm-700/50 flex items-center justify-center">
                  <PixelCharacter size="md" state="idle" />
                </div>
                <motion.div
                  className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-green-500 border-2 border-white dark:border-slate-800 flex items-center justify-center"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Sparkles size={12} className="text-white" />
                </motion.div>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800 dark:text-cream-50 font-game">
                  {user?.name ?? 'Adventurer'}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {user?.email ?? 'user@careercraft.com'}
                </p>
                <Badge variant="warm" className="mt-2" animate>
                  {user?.stage ?? 'beginner'} adventurer
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-warm-100 dark:border-slate-700">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 font-game">
                  Name
                </label>
                <input
                  type="text"
                  defaultValue={user?.name}
                  className="w-full px-4 py-2.5 bg-cream-50 dark:bg-slate-800 border border-warm-200 dark:border-slate-700 rounded-xl text-gray-800 dark:text-cream-50 focus:outline-none focus:border-warm-400 dark:focus:border-warm-500 focus:ring-2 focus:ring-warm-100 dark:focus:ring-warm-900/30 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 font-game">
                  Email
                </label>
                <input
                  type="email"
                  defaultValue={user?.email}
                  className="w-full px-4 py-2.5 bg-cream-50 dark:bg-slate-800 border border-warm-200 dark:border-slate-700 rounded-xl text-gray-800 dark:text-cream-50 focus:outline-none focus:border-warm-400 dark:focus:border-warm-500 focus:ring-2 focus:ring-warm-100 dark:focus:ring-warm-900/30 transition-all"
                />
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Career Goals */}
      <Card>
        <CardHeader
          title="Career Goals"
          subtitle="Set your target quests"
          icon={<Target className="w-5 h-5" />}
        />
        <div className="space-y-3">
          <motion.button
            onClick={() => {
              setSelectedGoalType('long');
              setIsGoalModalOpen(true);
            }}
            className="w-full flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-warm-50 to-cream-50 dark:from-slate-800 dark:to-slate-800/50 border border-warm-200 dark:border-slate-700 hover:border-warm-300 dark:hover:border-slate-600 transition-all group"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-warm-400 to-warm-500 flex items-center justify-center shadow-sm">
                <span className="text-xl">🏰</span>
              </div>
              <div className="text-left">
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Long-term Quest</p>
                <p className="font-bold text-gray-800 dark:text-cream-50 font-game">
                  {longTermRole?.roleName ?? 'Not set'}
                </p>
              </div>
            </div>
            <ChevronRight size={20} className="text-gray-400 group-hover:text-warm-500 transition-colors" />
          </motion.button>

          <motion.button
            onClick={() => {
              setSelectedGoalType('short');
              setIsGoalModalOpen(true);
            }}
            className="w-full flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-sky-50 to-sky-100/30 dark:from-slate-800 dark:to-slate-800/50 border border-sky-200 dark:border-slate-700 hover:border-sky-300 dark:hover:border-slate-600 transition-all group"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-400 to-sky-500 flex items-center justify-center shadow-sm">
                <span className="text-xl">🎯</span>
              </div>
              <div className="text-left">
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Short-term Quest</p>
                <p className="font-bold text-gray-800 dark:text-cream-50 font-game">
                  {shortTermRole?.roleName ?? 'Not set'}
                </p>
              </div>
            </div>
            <ChevronRight size={20} className="text-gray-400 group-hover:text-sky-500 transition-colors" />
          </motion.button>
        </div>
      </Card>

      {/* Appearance - Theme Toggle */}
      <Card>
        <CardHeader
          title="Appearance"
          subtitle="Customize how CareerCraft looks"
          icon={<Sun className="w-5 h-5" />}
        />
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-cream-50 to-warm-50 dark:from-slate-800 dark:to-slate-800/50 border border-warm-100 dark:border-slate-700">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-sm">
                {theme === 'light' ? (
                  <Sun size={22} className="text-white" />
                ) : (
                  <Moon size={22} className="text-white" />
                )}
              </div>
              <div>
                <p className="font-semibold text-gray-800 dark:text-cream-50 font-game">Theme</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Currently: {theme === 'light' ? 'Light Mode' : 'Dark Mode'}
                </p>
              </div>
            </div>
            <ThemeToggle checked={theme === 'dark'} onChange={toggleTheme} />
          </div>

          {/* Theme Preview Cards */}
          <div className="grid grid-cols-2 gap-3">
            <motion.button
              onClick={() => setTheme('light')}
              className={cn(
                'p-4 rounded-xl border-2 transition-all text-left',
                theme === 'light'
                  ? 'border-warm-500 bg-warm-50 dark:bg-warm-900/20'
                  : 'border-gray-200 dark:border-slate-700 hover:border-warm-300'
              )}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="w-full h-16 rounded-lg bg-gradient-to-br from-cream-100 to-warm-100 border border-warm-200 mb-3 flex items-center justify-center">
                <Sun size={24} className="text-warm-500" />
              </div>
              <p className="font-semibold text-gray-800 dark:text-cream-50 font-game text-sm">Light</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Warm and bright</p>
            </motion.button>

            <motion.button
              onClick={() => setTheme('dark')}
              className={cn(
                'p-4 rounded-xl border-2 transition-all text-left',
                theme === 'dark'
                  ? 'border-warm-500 bg-warm-50 dark:bg-warm-900/20'
                  : 'border-gray-200 dark:border-slate-700 hover:border-warm-300'
              )}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="w-full h-16 rounded-lg bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 mb-3 flex items-center justify-center">
                <Moon size={24} className="text-slate-400" />
              </div>
              <p className="font-semibold text-gray-800 dark:text-cream-50 font-game text-sm">Dark</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Easy on the eyes</p>
            </motion.button>
          </div>
        </div>
      </Card>

      {/* AI Configuration */}
      <Card>
        <CardHeader
          title="AI Configuration"
          subtitle="Configure AI-powered career guidance"
          icon={<Bot className="w-5 h-5" />}
          action={
            aiConfigured ? (
              <Badge variant="success" animate>
                <Check size={12} className="mr-1" /> {hasEnvKey ? 'Pre-configured' : 'Connected'}
              </Badge>
            ) : null
          }
        />
        <div className="space-y-4">
          {/* Environment Key Info Banner - shown when key is from env */}
          {hasEnvKey ? (
            <div className="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-800/10 border border-green-200 dark:border-green-800/30">
              <Check size={18} className="text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-green-800 dark:text-green-200 font-medium">AI is ready to use</p>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                  API key is pre-configured. You can start using AI features right away.
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Info Banner */}
              <div className="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-r from-sky-50 to-sky-100/50 dark:from-sky-900/20 dark:to-sky-800/10 border border-sky-200 dark:border-sky-800/30">
                <Info size={18} className="text-sky-600 dark:text-sky-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-sky-800 dark:text-sky-200 font-medium">Your API key is stored locally</p>
                  <p className="text-xs text-sky-600 dark:text-sky-400 mt-1">
                    The key is saved in your browser only and calls are made directly to Mistral. We never see your key.
                  </p>
                </div>
              </div>

              {/* API Key Input */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 font-game">
                  <Key size={14} className="inline mr-2" />
                  Mistral API Key
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type={showApiKey ? 'text' : 'password'}
                      value={apiKeyInput}
                      onChange={(e) => {
                        setApiKeyInput(e.target.value);
                        setValidationStatus('idle');
                      }}
                      placeholder="Enter your Mistral API key..."
                      className={cn(
                        'w-full px-4 py-2.5 pr-12 bg-cream-50 dark:bg-slate-800 border rounded-xl text-gray-800 dark:text-cream-50 focus:outline-none focus:ring-2 transition-all font-mono text-sm',
                        validationStatus === 'error'
                          ? 'border-red-400 dark:border-red-500 focus:border-red-500 focus:ring-red-100 dark:focus:ring-red-900/30'
                          : validationStatus === 'success'
                          ? 'border-green-400 dark:border-green-500 focus:border-green-500 focus:ring-green-100 dark:focus:ring-green-900/30'
                          : 'border-warm-200 dark:border-slate-700 focus:border-warm-400 dark:focus:border-warm-500 focus:ring-warm-100 dark:focus:ring-warm-900/30'
                      )}
                    />
                    <button
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                    >
                      {showApiKey ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  <Button
                    variant="secondary"
                    onClick={handleValidateApiKey}
                    disabled={isValidating || !apiKeyInput.trim()}
                  >
                    {isValidating ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      >
                        <Zap size={16} />
                      </motion.div>
                    ) : (
                      'Validate'
                    )}
                  </Button>
                  {apiKey && (
                    <Button variant="danger" onClick={handleClearApiKey}>
                      Clear
                    </Button>
                  )}
                </div>
                {validationStatus === 'error' && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-red-500 mt-2 flex items-center gap-1"
                  >
                    <AlertCircle size={14} /> Invalid API key. Please check and try again.
                  </motion.p>
                )}
                {validationStatus === 'success' && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-green-500 mt-2 flex items-center gap-1"
                  >
                    <Check size={14} /> API key validated and saved!
                  </motion.p>
                )}
              </div>
            </>
          )}

          {/* Model Info */}
          <div className="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 border border-purple-200 dark:border-purple-800/30">
            <Brain size={18} className="text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm text-purple-800 dark:text-purple-200 font-medium">Powered by Devstral 2</p>
              <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                Using Mistral's Devstral Small model for skill extraction, gap analysis, and personalized guidance.
              </p>
            </div>
          </div>

          {/* Get API Key Link - only show if not pre-configured */}
          {!hasEnvKey && (
            <div className="text-center pt-2">
              <a
                href="https://console.mistral.ai/api-keys/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-warm-600 dark:text-warm-400 hover:text-warm-700 dark:hover:text-warm-300 underline-offset-4 hover:underline"
              >
                Get your API key from Mistral Console
              </a>
            </div>
          )}
        </div>
      </Card>

      {/* Preferences */}
      <Card>
        <CardHeader
          title="Preferences"
          subtitle="Customize your experience"
          icon={<Bell className="w-5 h-5" />}
        />
        <div className="space-y-4">
          <SettingRow
            icon={Bell}
            title="Notifications"
            description="Get updates about your progress"
            action={<ToggleSwitch defaultChecked />}
          />
          <SettingRow
            icon={Shield}
            title="Privacy"
            description="Control who sees your profile"
            action={<Button variant="ghost" size="sm">Manage</Button>}
          />
        </div>
      </Card>

      {/* Data Management */}
      <Card>
        <CardHeader
          title="Data Management"
          subtitle="Export or reset your data"
          icon={<Database className="w-5 h-5" />}
        />
        <div className="space-y-4">
          <SettingRow
            icon={Download}
            title="Export Data"
            description="Download all your skill data"
            action={<Button variant="secondary" size="sm">Export</Button>}
          />
          {!isUsingFirebase && (
            <SettingRow
              icon={Database}
              title="Load Mock Data"
              description="Load sample data for demo"
              action={
                <Button variant="secondary" size="sm" onClick={loadMockUser}>
                  Load
                </Button>
              }
            />
          )}
          <SettingRow
            icon={Trash2}
            title="Reset All Data"
            description="Clear all your progress"
            action={
              <Button variant="danger" size="sm" onClick={clearUser}>
                Reset
              </Button>
            }
          />
        </div>
      </Card>

      {/* Backend Status Info */}
      <Card className="bg-gradient-to-r from-cream-50 to-warm-50 dark:from-slate-800 dark:to-slate-800/50 border-dashed border-warm-300 dark:border-slate-600">
        <div className="text-center py-4">
          {isUsingFirebase ? (
            <>
              <Badge variant="success" size="lg" animate>
                <Cloud size={14} className="mr-1" /> Cloud Sync Enabled
              </Badge>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-3 font-game">
                Your data is synced to the cloud and persists across devices
              </p>
            </>
          ) : (
            <>
              <Badge variant="warning" size="lg" animate>
                <CloudOff size={14} className="mr-1" /> Local Mode
              </Badge>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-3 font-game">
                Add Firebase config to .env to enable cloud sync
              </p>
            </>
          )}
        </div>
      </Card>

      {/* Goal Selection Modal */}
      <Modal
        isOpen={isGoalModalOpen}
        onClose={() => setIsGoalModalOpen(false)}
        title={`Select ${selectedGoalType === 'long' ? 'Long-term' : 'Short-term'} Quest`}
        size="lg"
        variant="warm"
      >
        <div className="space-y-2 max-h-[400px] overflow-y-auto">
          {roleBenchmarks.map((role, index) => {
            const isSelected = selectedGoalType === 'long'
              ? currentLongTermGoal?.targetRoleId === role.id
              : currentShortTermGoal?.targetRoleId === role.id;

            return (
              <motion.button
                key={role.id}
                onClick={() => handleSelectGoal(role.id)}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={cn(
                  'w-full flex items-center justify-between p-4 rounded-xl transition-all text-left',
                  isSelected
                    ? 'bg-gradient-to-r from-warm-100 to-warm-50 dark:from-warm-900/30 dark:to-warm-800/20 border-2 border-warm-400 dark:border-warm-600'
                    : 'bg-cream-50 dark:bg-slate-800 border border-warm-200 dark:border-slate-700 hover:border-warm-300 dark:hover:border-slate-600'
                )}
              >
                <div>
                  <h3 className="font-semibold text-gray-800 dark:text-cream-50 font-game">{role.roleName}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">{role.seniorityLevel} Level</p>
                </div>
                {isSelected && (
                  <Badge variant="success" animate>Selected</Badge>
                )}
              </motion.button>
            );
          })}
        </div>
      </Modal>

      {/* Delete Account Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => !isDeleting && setShowDeleteModal(false)}
        title="Delete Account"
        size="md"
        variant="warm"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30">
            <AlertCircle size={20} className="text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm text-red-800 dark:text-red-200 font-medium">This action cannot be undone</p>
              <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                All your data, including skills, goals, courses, projects, and achievements will be permanently deleted.
              </p>
            </div>
          </div>

          {deleteError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 text-red-600 dark:text-red-400 text-sm"
            >
              <AlertCircle size={16} />
              {deleteError}
            </motion.div>
          )}

          <div className="flex gap-3">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => setShowDeleteModal(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              className="flex-1"
              onClick={handleDeleteAccount}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 size={16} className="mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 size={16} className="mr-2" />
                  Delete Account
                </>
              )}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

interface SettingRowProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action: React.ReactNode;
}

function SettingRow({ icon: Icon, title, description, action }: SettingRowProps) {
  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-warm-100 dark:bg-slate-700/50 flex items-center justify-center">
          <Icon size={18} className="text-warm-600 dark:text-warm-400" />
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-800 dark:text-cream-50 font-game">{title}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>
        </div>
      </div>
      {action}
    </div>
  );
}

interface ThemeToggleProps {
  checked: boolean;
  onChange: () => void;
}

function ThemeToggle({ checked, onChange }: ThemeToggleProps) {
  return (
    <motion.button
      onClick={onChange}
      className={cn(
        'w-16 h-8 rounded-full transition-colors relative p-1',
        checked
          ? 'bg-gradient-to-r from-slate-700 to-slate-800'
          : 'bg-gradient-to-r from-yellow-400 to-orange-400'
      )}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <motion.div
        className="w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-md"
        animate={{ x: checked ? 32 : 0 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      >
        {checked ? (
          <Moon size={14} className="text-slate-700" />
        ) : (
          <Sun size={14} className="text-orange-500" />
        )}
      </motion.div>
    </motion.button>
  );
}

function ToggleSwitch({ defaultChecked = false, disabled = false }) {
  const [checked, setChecked] = useState(defaultChecked);

  return (
    <motion.button
      onClick={() => !disabled && setChecked(!checked)}
      className={cn(
        'w-12 h-7 rounded-full transition-colors relative p-0.5',
        checked
          ? 'bg-gradient-to-r from-warm-400 to-warm-500'
          : 'bg-gray-300 dark:bg-slate-600',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
      whileHover={!disabled ? { scale: 1.05 } : {}}
      whileTap={!disabled ? { scale: 0.95 } : {}}
    >
      <motion.div
        className="w-6 h-6 bg-white rounded-full shadow-sm"
        animate={{ x: checked ? 20 : 0 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      />
    </motion.button>
  );
}
