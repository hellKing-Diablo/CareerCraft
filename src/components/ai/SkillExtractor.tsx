import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles,
  FileText,
  RefreshCw,
  AlertCircle,
  Settings,
  Check,
  Plus,
  Upload,
} from 'lucide-react';
import { Button, Badge, Modal } from '@/components/common';
import { useAIStore } from '@/store/aiStore';
import { useUserStore } from '@/store/userStore';
import { useGraphStore } from '@/store/graphStore';
import { cn } from '@/utils/cn';
import { Link } from 'react-router-dom';

interface SkillExtractorProps {
  isOpen: boolean;
  onClose: () => void;
  targetRoleId?: string;
}

export function SkillExtractor({ isOpen, onClose, targetRoleId }: SkillExtractorProps) {
  const { extractSkills, extraction, isConfigured } = useAIStore();
  const { addSkill, userSkills } = useUserStore();
  const { updateGraph } = useGraphStore();
  const [inputText, setInputText] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<Set<string>>(new Set());

  const handleExtract = async () => {
    if (!inputText.trim()) return;
    const skills = await extractSkills(inputText, targetRoleId);
    // Auto-select all extracted skills
    setSelectedSkills(new Set(skills.map(s => s.skill_id)));
  };

  const toggleSkill = (skillId: string) => {
    const newSelected = new Set(selectedSkills);
    if (newSelected.has(skillId)) {
      newSelected.delete(skillId);
    } else {
      newSelected.add(skillId);
    }
    setSelectedSkills(newSelected);
  };

  const handleAddSkills = () => {
    const skillsToAdd = extraction.skills.filter(s => selectedSkills.has(s.skill_id));

    for (const skill of skillsToAdd) {
      // Check if skill already exists
      const existing = userSkills.find(us => us.skillId === skill.skill_id);
      if (!existing) {
        addSkill(skill.skill_id, skill.level as 0 | 1 | 2 | 3 | 4 | 5, 'extracted');
      }
    }

    // Update graph after adding skills
    setTimeout(() => updateGraph(), 100);

    // Reset and close
    setInputText('');
    setSelectedSkills(new Set());
    onClose();
  };

  const handleClose = () => {
    setInputText('');
    setSelectedSkills(new Set());
    onClose();
  };

  // Not configured state
  if (!isConfigured) {
    return (
      <Modal isOpen={isOpen} onClose={handleClose} size="lg">
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-cream-50 font-game mb-2">
                AI Skill Extraction
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Configure your AI API key to extract skills from your resume, LinkedIn profile, or any text.
              </p>
              <Link to="/settings" onClick={handleClose}>
                <Button variant="primary">
                  <Settings size={16} className="mr-2" />
                  Configure AI
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="lg">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center flex-shrink-0">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-800 dark:text-cream-50 font-game">
              Extract Skills from Text
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Paste your resume, LinkedIn profile, or describe your experience
            </p>
          </div>
        </div>

        {/* Input Area */}
        <div>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Paste your resume, LinkedIn summary, or describe your skills and experience..."
            className={cn(
              'w-full h-40 p-4 rounded-xl border resize-none',
              'bg-cream-50 dark:bg-slate-800',
              'border-warm-200 dark:border-slate-700',
              'text-gray-800 dark:text-cream-50',
              'placeholder:text-gray-400 dark:placeholder:text-gray-500',
              'focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent'
            )}
            disabled={extraction.status === 'loading'}
          />
          <div className="flex justify-between items-center mt-2">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {inputText.length}/5000 characters
            </span>
            <Button
              variant="primary"
              onClick={handleExtract}
              disabled={!inputText.trim() || extraction.status === 'loading'}
            >
              {extraction.status === 'loading' ? (
                <>
                  <RefreshCw size={16} className="mr-2 animate-spin" />
                  Extracting...
                </>
              ) : (
                <>
                  <Sparkles size={16} className="mr-2" />
                  Extract Skills
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Error State */}
        {extraction.status === 'error' && (
          <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30">
            <div className="flex items-center gap-2">
              <AlertCircle size={16} className="text-red-500" />
              <span className="text-sm text-red-700 dark:text-red-300">
                {extraction.error?.message || 'Failed to extract skills'}
              </span>
            </div>
          </div>
        )}

        {/* Extracted Skills */}
        {extraction.status === 'success' && extraction.skills.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-800 dark:text-cream-50 font-game">
                Extracted Skills ({extraction.skills.length})
              </h3>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedSkills(new Set(extraction.skills.map(s => s.skill_id)))}
                >
                  Select All
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedSkills(new Set())}
                >
                  Clear
                </Button>
              </div>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
              {extraction.skills.map((skill) => {
                const isSelected = selectedSkills.has(skill.skill_id);
                const alreadyExists = userSkills.some(us => us.skillId === skill.skill_id);

                return (
                  <motion.div
                    key={skill.skill_id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                      'flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer',
                      isSelected
                        ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-300 dark:border-purple-700'
                        : 'bg-cream-50 dark:bg-slate-800 border-warm-200 dark:border-slate-700',
                      alreadyExists && 'opacity-50'
                    )}
                    onClick={() => !alreadyExists && toggleSkill(skill.skill_id)}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          'w-6 h-6 rounded-lg flex items-center justify-center transition-colors',
                          isSelected
                            ? 'bg-purple-500 text-white'
                            : 'bg-gray-200 dark:bg-slate-700'
                        )}
                      >
                        {isSelected ? (
                          <Check size={14} />
                        ) : (
                          <Plus size={14} className="text-gray-500" />
                        )}
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-800 dark:text-cream-50">
                          {skill.skill_name}
                        </span>
                        {alreadyExists && (
                          <span className="text-xs text-gray-500 ml-2">(already added)</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="info" size="sm">
                        Level {skill.level}
                      </Badge>
                      <Badge
                        variant={skill.confidence >= 0.8 ? 'success' : skill.confidence >= 0.6 ? 'warning' : 'danger'}
                        size="sm"
                      >
                        {Math.round(skill.confidence * 100)}%
                      </Badge>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Extraction Notes */}
            {extraction.notes && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 italic">
                {extraction.notes}
              </p>
            )}
          </div>
        )}

        {/* No Skills Found */}
        {extraction.status === 'success' && extraction.skills.length === 0 && (
          <div className="text-center py-6">
            <FileText size={40} className="mx-auto text-gray-300 dark:text-gray-600 mb-2" />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No skills found. Try providing more detailed text.
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Button variant="ghost" onClick={handleClose} className="flex-1">
            Cancel
          </Button>
          {extraction.status === 'success' && extraction.skills.length > 0 && (
            <Button
              variant="primary"
              onClick={handleAddSkills}
              disabled={selectedSkills.size === 0}
              className="flex-1"
            >
              <Plus size={16} className="mr-2" />
              Add {selectedSkills.size} Skill{selectedSkills.size !== 1 ? 's' : ''}
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}

// Quick button to open the extractor
interface SkillExtractorButtonProps {
  targetRoleId?: string;
  className?: string;
}

export function SkillExtractorButton({ targetRoleId, className }: SkillExtractorButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        variant="secondary"
        onClick={() => setIsOpen(true)}
        className={className}
      >
        <Upload size={16} className="mr-2" />
        Import from Resume
      </Button>
      <SkillExtractor
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        targetRoleId={targetRoleId}
      />
    </>
  );
}
