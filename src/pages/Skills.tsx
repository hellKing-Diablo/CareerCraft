import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Plus,
  Trash2,
  Star,
  Sparkles,
  BookOpen,
  Target,
  Trophy,
  ChevronRight,
  Filter,
  Clock,
  Briefcase,
  GraduationCap,
  Zap,
  TrendingUp,
  CheckCircle,
  Cloud,
  CloudOff,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { Card, Button, Badge, Modal, ProgressBar } from '@/components/common';
import { cn } from '@/utils/cn';
import { skills, getSkillCategories, getSkillById as getCareerSkillById, type Skill as CareerSkill } from '@/data/careerData';
import { useUserStore } from '@/store/userStore';
import { useGraphStore } from '@/store/graphStore';
import { useAuthStore } from '@/store/authStore';
import { isRealBackend } from '@/services/backend';
import { SkillLevel } from '@/types';
import { SKILL_LEVELS } from '@/data/careerData/types';

type MainTab = 'my-skills' | 'browse' | 'learning-path';

const mainTabs: { id: MainTab; label: string; icon: React.ReactNode }[] = [
  { id: 'my-skills', label: 'My Skills', icon: <Star size={18} /> },
  { id: 'browse', label: 'Browse Skills', icon: <BookOpen size={18} /> },
  { id: 'learning-path', label: 'Learning Path', icon: <Target size={18} /> },
];

export function Skills() {
  const { userSkills, addSkill, updateSkillLevel, removeSkill, syncStatus } = useUserStore();
  const { gapAnalysis, updateGraph } = useGraphStore();
  const { authUser } = useAuthStore();

  const [activeTab, setActiveTab] = useState<MainTab>('my-skills');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedSkillForAdd, setSelectedSkillForAdd] = useState<CareerSkill | null>(null);

  // Determine sync status for display
  const isFirebaseMode = isRealBackend();
  const isLoggedIn = !!authUser;
  const isSyncing = syncStatus === 'syncing';
  const isSynced = syncStatus === 'synced';
  const hasError = syncStatus === 'error';

  // Get available skill categories
  const categories = useMemo(() => {
    const cats = getSkillCategories();
    return [{ id: 'all', label: 'All Categories' }, ...cats.map(c => ({ id: c, label: c }))];
  }, []);

  // Filter my skills
  const mySkillsData = useMemo(() => {
    return userSkills
      .map(us => {
        const skill = getCareerSkillById(us.skillId);
        return skill ? { userSkill: us, skill } : null;
      })
      .filter((item): item is { userSkill: typeof userSkills[0]; skill: CareerSkill } => item !== null)
      .filter(item => {
        const matchesSearch = item.skill.skillName.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || item.skill.category === selectedCategory;
        return matchesSearch && matchesCategory;
      });
  }, [userSkills, searchQuery, selectedCategory]);

  // Available skills to add (not already in user's skills)
  const availableSkills = useMemo(() => {
    return skills
      .filter(skill => {
        const alreadyHave = userSkills.some(us => us.skillId === skill.id);
        const matchesSearch = skill.skillName.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || skill.category === selectedCategory;
        return !alreadyHave && matchesSearch && matchesCategory;
      })
      .slice(0, 50); // Limit for performance
  }, [userSkills, searchQuery, selectedCategory]);

  // Learning path skills (skills from gap analysis)
  const learningPathSkills = useMemo(() => {
    if (!gapAnalysis) return [];
    return gapAnalysis.gaps.map(gap => {
      const skill = getCareerSkillById(gap.skillId);
      return { gap, skill };
    }).filter((item): item is { gap: typeof gapAnalysis.gaps[0]; skill: CareerSkill } => item.skill !== null);
  }, [gapAnalysis]);

  const handleAddSkill = (level: SkillLevel) => {
    if (selectedSkillForAdd) {
      addSkill(selectedSkillForAdd.id, level);
      setSelectedSkillForAdd(null);
      setIsAddModalOpen(false);
      setTimeout(() => updateGraph(), 100);
    }
  };

  const handleUpdateLevel = (skillId: string, level: SkillLevel) => {
    updateSkillLevel(skillId, level);
    setTimeout(() => updateGraph(), 100);
  };

  const handleRemoveSkill = (skillId: string) => {
    removeSkill(skillId);
    setTimeout(() => updateGraph(), 100);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-cream-50 font-game">Skill Inventory</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            {userSkills.length} skills • Level up to unlock your career
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Sync Status Indicator */}
          <SyncStatusBadge
            isFirebaseMode={isFirebaseMode}
            isLoggedIn={isLoggedIn}
            isSyncing={isSyncing}
            isSynced={isSynced}
            hasError={hasError}
          />
          <Button onClick={() => { setActiveTab('browse'); setIsAddModalOpen(true); }}>
            <Plus size={16} className="mr-2" /> Add Skill
          </Button>
        </div>
      </div>

      {/* Main Tabs */}
      <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
        {mainTabs.map(tab => (
          <motion.button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-semibold transition-all font-game',
              activeTab === tab.id
                ? 'bg-white dark:bg-slate-700 text-orange-500 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
            )}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {tab.icon}
            {tab.label}
          </motion.button>
        ))}
      </div>

      {/* Search and Filter */}
      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder={activeTab === 'browse' ? "Search 2000+ skills..." : "Search your skills..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-800 border border-warm-200 dark:border-slate-700 rounded-xl text-gray-800 dark:text-cream-50 placeholder-gray-400 focus:outline-none focus:border-orange-400 dark:focus:border-orange-500 focus:ring-2 focus:ring-orange-100 dark:focus:ring-orange-900/30 transition-all font-game"
          />
        </div>
        <div className="relative">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="appearance-none pl-10 pr-8 py-3 bg-white dark:bg-slate-800 border border-warm-200 dark:border-slate-700 rounded-xl text-gray-800 dark:text-cream-50 focus:outline-none focus:border-orange-400 transition-all font-game cursor-pointer"
          >
            {categories.slice(0, 20).map(cat => (
              <option key={cat.id} value={cat.id}>{cat.label}</option>
            ))}
          </select>
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        </div>
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'my-skills' && (
          <motion.div
            key="my-skills"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <MySkillsTab
              skills={mySkillsData}
              onUpdateLevel={handleUpdateLevel}
              onRemoveSkill={handleRemoveSkill}
              onAddSkill={() => { setActiveTab('browse'); setIsAddModalOpen(true); }}
            />
          </motion.div>
        )}

        {activeTab === 'browse' && (
          <motion.div
            key="browse"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <BrowseSkillsTab
              skills={availableSkills}
              onSelectSkill={(skill) => {
                setSelectedSkillForAdd(skill);
                setIsAddModalOpen(true);
              }}
              searchQuery={searchQuery}
            />
          </motion.div>
        )}

        {activeTab === 'learning-path' && (
          <motion.div
            key="learning-path"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <LearningPathTab
              skills={learningPathSkills}
              userSkills={userSkills}
              gapAnalysis={gapAnalysis}
              onAddSkill={(skill) => {
                setSelectedSkillForAdd(skill);
                setIsAddModalOpen(true);
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Skill Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setSelectedSkillForAdd(null);
        }}
        title={selectedSkillForAdd ? 'Set Your Level' : 'Add a Skill'}
        size="lg"
        variant="warm"
      >
        {selectedSkillForAdd ? (
          <div className="space-y-6">
            {/* Skill Info */}
            <div className="flex items-start gap-4 p-4 rounded-xl bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/10 border border-orange-200 dark:border-orange-800/30">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center shrink-0 shadow-lg">
                <Zap size={24} className="text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-800 dark:text-cream-50 font-game">
                  {selectedSkillForAdd.skillName}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {selectedSkillForAdd.category}
                </p>
                <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                  <span className="flex items-center gap-1">
                    <Clock size={12} /> {selectedSkillForAdd.time}
                  </span>
                  <span className="flex items-center gap-1">
                    <Briefcase size={12} /> {selectedSkillForAdd.jobs.slice(0, 2).join(', ')}
                    {selectedSkillForAdd.jobs.length > 2 && ` +${selectedSkillForAdd.jobs.length - 2}`}
                  </span>
                </div>
              </div>
            </div>

            {/* Level Selection */}
            <div>
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-4 font-game">
                What's your current proficiency level?
              </p>
              <div className="grid grid-cols-1 gap-2">
                {[1, 2, 3, 4, 5].map(level => {
                  const levelInfo = SKILL_LEVELS[level as keyof typeof SKILL_LEVELS];
                  return (
                    <motion.button
                      key={level}
                      onClick={() => handleAddSkill(level as SkillLevel)}
                      className="flex items-center gap-4 p-4 rounded-xl bg-cream-50 dark:bg-slate-800 hover:bg-gradient-to-r hover:from-orange-50 hover:to-amber-50 dark:hover:from-orange-900/20 dark:hover:to-amber-900/10 border border-warm-200 dark:border-slate-700 hover:border-orange-300 dark:hover:border-orange-700 transition-all text-left group"
                      whileHover={{ scale: 1.02, x: 4 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={16}
                            className={cn(
                              'transition-colors',
                              i < level
                                ? 'text-orange-400 fill-orange-400'
                                : 'text-gray-300 dark:text-gray-600'
                            )}
                          />
                        ))}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-800 dark:text-cream-50 font-game">
                          {levelInfo.label}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {levelInfo.description}
                        </p>
                      </div>
                      <ChevronRight size={18} className="text-gray-400 group-hover:text-orange-500 transition-colors" />
                    </motion.button>
                  );
                })}
              </div>
            </div>

            <Button
              variant="ghost"
              onClick={() => setSelectedSkillForAdd(null)}
              className="w-full"
            >
              Back to skill list
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search available skills..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-cream-50 dark:bg-slate-700 border border-warm-200 dark:border-slate-600 rounded-xl text-gray-800 dark:text-cream-50 placeholder-gray-400 focus:outline-none focus:border-orange-400 transition-all"
              />
            </div>

            <div className="max-h-[400px] overflow-y-auto space-y-2">
              {availableSkills.map((skill, index) => (
                <motion.button
                  key={skill.id}
                  onClick={() => setSelectedSkillForAdd(skill)}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.02 }}
                  className="w-full flex items-center gap-3 p-3 rounded-xl bg-cream-50 dark:bg-slate-800/50 hover:bg-orange-50 dark:hover:bg-slate-700 border border-warm-100 dark:border-slate-700 transition-colors text-left group"
                >
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-900/30 dark:to-amber-900/20 flex items-center justify-center">
                    <Zap size={18} className="text-orange-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-800 dark:text-cream-50 font-game truncate">
                        {skill.skillName}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                      <span>{skill.category}</span>
                      <span>•</span>
                      <span>{skill.time}</span>
                    </div>
                  </div>
                  <Plus size={18} className="text-gray-400 group-hover:text-orange-500 transition-colors" />
                </motion.button>
              ))}

              {availableSkills.length === 0 && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  {searchQuery ? 'No skills found matching your search' : 'No more skills available to add'}
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

// ============================================
// MY SKILLS TAB
// ============================================
interface MySkillsTabProps {
  skills: Array<{ userSkill: { id: string; skillId: string; level: SkillLevel }; skill: CareerSkill }>;
  onUpdateLevel: (skillId: string, level: SkillLevel) => void;
  onRemoveSkill: (skillId: string) => void;
  onAddSkill: () => void;
}

function MySkillsTab({ skills, onUpdateLevel, onRemoveSkill, onAddSkill }: MySkillsTabProps) {
  // Group skills by level for stats
  const skillsByLevel = useMemo(() => {
    const grouped = { beginner: 0, intermediate: 0, advanced: 0, expert: 0 };
    skills.forEach(({ userSkill }) => {
      if (userSkill.level <= 2) grouped.beginner++;
      else if (userSkill.level === 3) grouped.intermediate++;
      else if (userSkill.level === 4) grouped.advanced++;
      else grouped.expert++;
    });
    return grouped;
  }, [skills]);

  if (skills.length === 0) {
    return (
      <motion.div
        className="text-center py-16"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="w-24 h-24 mx-auto rounded-2xl bg-gradient-to-br from-orange-100 to-amber-100 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center mb-6 border border-orange-200 dark:border-slate-700 shadow-lg">
          <Sparkles size={40} className="text-orange-500" />
        </div>
        <h3 className="text-xl font-bold text-gray-800 dark:text-cream-50 mb-2 font-game">
          Your skill inventory is empty
        </h3>
        <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
          Start building your skill profile by adding skills you've learned.
          Each skill is a step toward your career goals.
        </p>
        <Button onClick={onAddSkill} size="lg">
          <Plus size={18} className="mr-2" /> Add Your First Skill
        </Button>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard
          label="Total Skills"
          value={skills.length}
          icon={<Trophy size={20} />}
          color="orange"
        />
        <StatCard
          label="Beginner"
          value={skillsByLevel.beginner}
          icon={<GraduationCap size={20} />}
          color="blue"
        />
        <StatCard
          label="Intermediate"
          value={skillsByLevel.intermediate}
          icon={<TrendingUp size={20} />}
          color="green"
        />
        <StatCard
          label="Expert"
          value={skillsByLevel.advanced + skillsByLevel.expert}
          icon={<Star size={20} />}
          color="purple"
        />
      </div>

      {/* Skills Grid */}
      <div className="grid grid-cols-2 gap-4">
        <AnimatePresence mode="popLayout">
          {skills.map(({ userSkill, skill }, index) => (
            <motion.div
              key={userSkill.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: index * 0.03 }}
            >
              <Card hover className="h-full">
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-900/30 dark:to-amber-900/20 flex items-center justify-center shrink-0 border border-orange-200 dark:border-orange-800/30">
                    <Zap size={24} className="text-orange-500" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-gray-800 dark:text-cream-50 truncate font-game">
                        {skill.skillName}
                      </h3>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                      {skill.category} • {skill.time}
                    </p>

                    {/* Level selector */}
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Level:</span>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map(level => (
                          <motion.button
                            key={level}
                            onClick={() => onUpdateLevel(skill.id, level as SkillLevel)}
                            className={cn(
                              'w-8 h-8 rounded-lg text-xs font-bold transition-all',
                              userSkill.level >= level
                                ? 'bg-gradient-to-br from-orange-400 to-amber-500 text-white shadow-sm'
                                : 'bg-gray-100 dark:bg-slate-700 text-gray-400 dark:text-gray-500 hover:bg-gray-200 dark:hover:bg-slate-600'
                            )}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            {level}
                          </motion.button>
                        ))}
                      </div>
                      <motion.button
                        onClick={() => onRemoveSkill(skill.id)}
                        className="ml-auto p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-100 dark:hover:bg-red-500/10 transition-colors"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Trash2 size={16} />
                      </motion.button>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ============================================
// BROWSE SKILLS TAB
// ============================================
interface BrowseSkillsTabProps {
  skills: CareerSkill[];
  onSelectSkill: (skill: CareerSkill) => void;
  searchQuery: string;
}

function BrowseSkillsTab({ skills, onSelectSkill, searchQuery }: BrowseSkillsTabProps) {
  if (skills.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center mb-4 border border-blue-200 dark:border-slate-700">
          <Search size={32} className="text-blue-500" />
        </div>
        <h3 className="text-xl font-bold text-gray-800 dark:text-cream-50 mb-2 font-game">
          {searchQuery ? 'No skills found' : 'You\'ve added all available skills!'}
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          {searchQuery ? 'Try adjusting your search or filter' : 'Keep leveling up your existing skills'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Showing {skills.length} skills • Click to add to your inventory
      </p>

      <div className="grid grid-cols-3 gap-3">
        {skills.map((skill, index) => (
          <motion.button
            key={skill.id}
            onClick={() => onSelectSkill(skill)}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.02 }}
            className="flex items-start gap-3 p-4 rounded-xl bg-white dark:bg-slate-800 border border-warm-200 dark:border-slate-700 hover:border-orange-300 dark:hover:border-orange-700 hover:shadow-md transition-all text-left group"
            whileHover={{ scale: 1.02, y: -2 }}
          >
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-900/30 dark:to-amber-900/20 flex items-center justify-center shrink-0">
              <Zap size={18} className="text-orange-500" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-gray-800 dark:text-cream-50 font-game text-sm truncate group-hover:text-orange-500 transition-colors">
                {skill.skillName}
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                {skill.category}
              </p>
              <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                <Clock size={10} /> {skill.time}
              </div>
            </div>
            <Plus size={16} className="text-gray-400 group-hover:text-orange-500 transition-colors shrink-0 mt-1" />
          </motion.button>
        ))}
      </div>
    </div>
  );
}

// ============================================
// LEARNING PATH TAB
// ============================================
interface LearningPathTabProps {
  skills: Array<{ gap: { skillId: string; currentLevel: SkillLevel; requiredLevel: SkillLevel; priority: string }; skill: CareerSkill }>;
  userSkills: Array<{ skillId: string; level: SkillLevel }>;
  gapAnalysis: { readinessScore: number; gaps: unknown[]; strengths: unknown[] } | null;
  onAddSkill: (skill: CareerSkill) => void;
}

function LearningPathTab({ skills, userSkills, gapAnalysis, onAddSkill }: LearningPathTabProps) {
  if (!gapAnalysis || skills.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-24 h-24 mx-auto rounded-2xl bg-gradient-to-br from-green-100 to-emerald-100 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center mb-6 border border-green-200 dark:border-slate-700 shadow-lg">
          <CheckCircle size={40} className="text-green-500" />
        </div>
        <h3 className="text-xl font-bold text-gray-800 dark:text-cream-50 mb-2 font-game">
          {gapAnalysis ? 'No skill gaps!' : 'Set a career goal first'}
        </h3>
        <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
          {gapAnalysis
            ? 'Amazing! You have all the skills needed for your target role. Keep leveling them up!'
            : 'Set a career goal in the Dashboard to see your personalized learning path.'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <Card className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/10 border-orange-200 dark:border-orange-800/30">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center shadow-lg">
            <Target size={32} className="text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-800 dark:text-cream-50 font-game mb-2">
              Career Readiness
            </h3>
            <ProgressBar value={gapAnalysis.readinessScore} size="lg" />
            <div className="flex items-center justify-between mt-2 text-sm">
              <span className="text-gray-500 dark:text-gray-400">
                {skills.length} skills to develop
              </span>
              <span className="font-bold text-orange-500">
                {gapAnalysis.readinessScore}% Ready
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Skills to Learn */}
      <div>
        <h3 className="text-lg font-bold text-gray-800 dark:text-cream-50 font-game mb-4 flex items-center gap-2">
          <Zap size={20} className="text-orange-500" />
          Priority Skills to Develop
        </h3>

        <div className="space-y-3">
          {skills.map(({ gap, skill }, index) => {
            const hasSkill = userSkills.some(us => us.skillId === skill.id);
            const currentLevel = userSkills.find(us => us.skillId === skill.id)?.level ?? 0;
            const progressPercent = Math.round((currentLevel / gap.requiredLevel) * 100);

            return (
              <motion.div
                key={skill.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center gap-4 p-4 rounded-xl bg-white dark:bg-slate-800 border border-warm-200 dark:border-slate-700 hover:border-orange-300 dark:hover:border-orange-700 transition-all group"
              >
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-900/30 text-orange-500 font-bold font-game">
                  {index + 1}
                </div>

                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-900/30 dark:to-amber-900/20 flex items-center justify-center shrink-0">
                  <Zap size={20} className="text-orange-500" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-bold text-gray-800 dark:text-cream-50 font-game truncate">
                      {skill.skillName}
                    </h4>
                    <Badge
                      size="sm"
                      variant={gap.priority === 'critical' ? 'danger' : gap.priority === 'important' ? 'warning' : 'default'}
                    >
                      {gap.priority}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                    <span>Level {currentLevel} → {gap.requiredLevel}</span>
                    <span>•</span>
                    <span>{skill.time}</span>
                  </div>
                  <div className="mt-2">
                    <ProgressBar value={progressPercent} size="sm" />
                  </div>
                </div>

                {!hasSkill ? (
                  <Button
                    size="sm"
                    onClick={() => onAddSkill(skill)}
                    className="shrink-0"
                  >
                    <Plus size={14} className="mr-1" /> Add
                  </Button>
                ) : (
                  <div className="flex items-center gap-1 text-green-500 shrink-0">
                    <CheckCircle size={16} />
                    <span className="text-xs font-medium">Added</span>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ============================================
// STAT CARD COMPONENT
// ============================================
interface StatCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: 'orange' | 'blue' | 'green' | 'purple';
}

function StatCard({ label, value, icon, color }: StatCardProps) {
  const colorClasses = {
    orange: 'from-orange-100 to-amber-100 dark:from-orange-900/30 dark:to-amber-900/20 border-orange-200 dark:border-orange-800/30 text-orange-500',
    blue: 'from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800/30 text-blue-500',
    green: 'from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/20 border-green-200 dark:border-green-800/30 text-green-500',
    purple: 'from-purple-100 to-violet-100 dark:from-purple-900/30 dark:to-violet-900/20 border-purple-200 dark:border-purple-800/30 text-purple-500',
  };

  return (
    <motion.div
      whileHover={{ y: -2, scale: 1.02 }}
      className={cn(
        'p-4 rounded-xl bg-gradient-to-br border',
        colorClasses[color]
      )}
    >
      <div className="flex items-center gap-3">
        <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', colorClasses[color].split(' ')[0])}>
          {icon}
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-800 dark:text-cream-50">{value}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
        </div>
      </div>
    </motion.div>
  );
}

// ============================================
// SYNC STATUS BADGE COMPONENT
// ============================================
interface SyncStatusBadgeProps {
  isFirebaseMode: boolean;
  isLoggedIn: boolean;
  isSyncing: boolean;
  isSynced: boolean;
  hasError: boolean;
}

function SyncStatusBadge({ isFirebaseMode, isLoggedIn, isSyncing, hasError }: SyncStatusBadgeProps) {
  if (!isFirebaseMode) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-gray-400 text-xs font-medium">
        <CloudOff size={14} />
        <span>Local Mode</span>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 text-xs font-medium">
        <AlertCircle size={14} />
        <span>Sign in to sync</span>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-medium">
        <AlertCircle size={14} />
        <span>Sync Error</span>
      </div>
    );
  }

  if (isSyncing) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-medium">
        <Loader2 size={14} className="animate-spin" />
        <span>Syncing...</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-xs font-medium">
      <Cloud size={14} />
      <span>Cloud Synced</span>
    </div>
  );
}
