// Gap Analysis
export {
  computeSkillGaps,
  categorizeGaps,
  analyzeGaps,
  computeReadinessScore,
  getCriticalGaps,
  getAlmostThereSkills,
  estimateTimeToReady,
} from './gapAnalysis';

// Node State
export {
  computeNodeState,
  computeCompletionPercent,
  getUnlockableSkills,
  getLockedSkills,
  getInProgressSkills,
  getCompletedSkills,
  wouldUnlock,
  getNextUnlockableSkills,
} from './nodeStateComputer';

// Graph Generation
export {
  generateSkillGraph,
  updateGraphNodeStates,
  generatePathToSkill,
  getGraphStats,
} from './graphGenerator';

// Achievement Checking
export {
  checkAchievementCriteria,
  getEarnedAchievements,
  checkNewAchievements,
  getAchievementProgress,
  getUpcomingAchievements,
  getAllAchievementsWithStatus,
} from './achievementChecker';
