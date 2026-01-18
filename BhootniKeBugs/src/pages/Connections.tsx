import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Star,
  ExternalLink,
  Loader2,
  Code2,
  GitFork,
  BookOpen
} from 'lucide-react';
import { Card, Button, Badge } from '@/components/common';

// 👇 1. Type Definitions (Data kevo aavshe)
interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string;
  owner: {
    login: string;
    avatar_url: string;
    html_url: string;
  };
  html_url: string; // Project Link
  stargazers_count: number; // Stars
  language: string; // Main coding language
  topics: string[]; // Tags like 'react', 'api'
}

export function Connections() {
  // 👇 2. State Management (Data store karva)
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [loading, setLoading] = useState(true);
  const [userGoal, setUserGoal] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  // 👇 3. API Logic (Backend + GitHub)
  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setLoading(true);

        // --- STEP A: BACKEND MATHI GOAL LAVO ---
        // Ahiya tamare future ma real API call mukvano
        // const userRes = await fetch('/api/user/profile');
        // const userData = await userRes.json();
        const backendGoal = "Full Stack Developer"; // 👈 Currently Hardcoded Simulation
        setUserGoal(backendGoal);

        // --- STEP B: GITHUB API CALL ---
        // Goal na basis par GitHub par sara projects shodhshe
        // "topic:beginner-friendly" add karyu che jethi sikhva mate sara projects male
        const query = encodeURIComponent(`${backendGoal} topic:beginner-friendly`);

        const githubRes = await fetch(
          `https://api.github.com/search/repositories?q=${query}&sort=stars&order=desc&per_page=8`
        );

        if (!githubRes.ok) {
          throw new Error("GitHub API limit reached. Please try again later.");
        }

        const data = await githubRes.json();
        setRepos(data.items); // GitHub 'items' array return kare che

      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Could not summon projects. The GitHub gate is closed momentarily.");
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, []);

  // 👇 4. Main UI Render
  return (
    <div className="space-y-6">
      {/* --- HEADER SECTION --- */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-cream-50 font-game">
          Quest: Master <span className="text-orange-500">{userGoal || 'Loading...'}</span>
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          We found these top-rated open source projects to help you achieve your goal.
        </p>
      </div>

      {/* --- LOADING STATE --- */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20 min-h-[400px]">
          <Loader2 className="w-12 h-12 text-orange-500 animate-spin mb-4" />
          <p className="text-gray-500 font-game animate-pulse">Scouting the multiverse for projects...</p>
        </div>
      )}

      {/* --- ERROR STATE --- */}
      {!loading && error && (
        <div className="p-6 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl border border-red-200 dark:border-red-800 text-center font-game">
          {error}
        </div>
      )}

      {/* --- DATA GRID --- */}
      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {repos.map((repo, index) => (
            <motion.div
              key={repo.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card hover className="h-full flex flex-col group">
                {/* Card Header */}
                <div className="flex items-start gap-4 mb-3">
                  {/* Owner Avatar */}
                  <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0 border border-slate-200 dark:border-slate-700">
                    <img
                      src={repo.owner.avatar_url}
                      alt={repo.owner.login}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Title & Owner */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-800 dark:text-cream-50 truncate font-game text-lg group-hover:text-orange-500 transition-colors">
                      {repo.name}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                      by @{repo.owner.login}
                    </p>
                  </div>

                  {/* Star Count Badge */}
                  <Badge variant="warning" size="sm" className="shrink-0">
                    <Star size={12} className="mr-1 fill-current" />
                    {(repo.stargazers_count / 1000).toFixed(1)}k
                  </Badge>
                </div>

                {/* Description */}
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-4 flex-1 min-h-[40px]">
                  {repo.description || "No description provided. This is a mysterious artifact."}
                </p>

                {/* Topics / Tags */}
                <div className="flex flex-wrap gap-1 mb-4">
                  {repo.topics?.slice(0, 3).map(topic => (
                    <span key={topic} className="px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-md">
                      {topic}
                    </span>
                  ))}
                </div>

                {/* Card Footer */}
                <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100 dark:border-slate-700">
                  <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                      <Code2 size={14} className="text-blue-500" />
                      <span>{repo.language || 'Code'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <GitFork size={14} />
                      <span>Open Source</span>
                    </div>
                  </div>

                  <a
                    href={repo.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button size="sm" variant="secondary" className="hover:bg-orange-100 dark:hover:bg-orange-900/30 hover:text-orange-600">
                      View Code <ExternalLink size={12} className="ml-2" />
                    </Button>
                  </a>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && repos.length === 0 && (
        <div className="text-center py-10">
          <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No projects found for this goal yet.</p>
        </div>
      )}
    </div>
  );
}