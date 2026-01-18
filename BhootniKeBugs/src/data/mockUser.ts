import { User, UserSkill, CareerGoal, UserCourse, Project, UserAchievement, Connection } from '@/types';

/**
 * Mock User Data for Phase 1
 * This simulates a user who has some Python and data skills,
 * and is working toward becoming a Health Informatics Specialist.
 */

export const mockUser: User = {
  id: 'user_001',
  email: 'alex.chen@example.com',
  name: 'Alex Chen',
  stage: 'professional',
  hasCompletedOnboarding: true,
  createdAt: new Date('2024-01-15'),
  updatedAt: new Date(),
};

export const mockUserSkills: UserSkill[] = [
  // Strong foundational skills
  {
    id: 'us_001',
    skillId: 'python_basics',
    level: 4,
    source: 'self_reported',
    evidenceType: 'course',
    updatedAt: new Date('2024-02-01'),
  },
  {
    id: 'us_002',
    skillId: 'sql_basics',
    level: 3,
    source: 'self_reported',
    evidenceType: 'experience',
    updatedAt: new Date('2024-02-15'),
  },
  {
    id: 'us_003',
    skillId: 'statistics_basics',
    level: 3,
    source: 'self_reported',
    evidenceType: 'course',
    updatedAt: new Date('2024-01-20'),
  },
  {
    id: 'us_004',
    skillId: 'healthcare_basics',
    level: 2,
    source: 'self_reported',
    evidenceType: 'experience',
    updatedAt: new Date('2024-03-01'),
  },
  {
    id: 'us_005',
    skillId: 'data_literacy',
    level: 3,
    source: 'self_reported',
    evidenceType: 'experience',
    updatedAt: new Date('2024-02-10'),
  },

  // Intermediate skills - in progress
  {
    id: 'us_006',
    skillId: 'python_data',
    level: 3,
    source: 'self_reported',
    evidenceType: 'project',
    updatedAt: new Date('2024-03-15'),
  },
  {
    id: 'us_007',
    skillId: 'clinical_data',
    level: 1,
    source: 'self_reported',
    evidenceType: 'course',
    updatedAt: new Date('2024-04-01'),
  },
  {
    id: 'us_008',
    skillId: 'hipaa_compliance',
    level: 2,
    source: 'self_reported',
    evidenceType: 'certification',
    updatedAt: new Date('2024-03-20'),
  },
  {
    id: 'us_009',
    skillId: 'data_visualization',
    level: 2,
    source: 'self_reported',
    evidenceType: 'project',
    updatedAt: new Date('2024-03-25'),
  },
  {
    id: 'us_010',
    skillId: 'api_basics',
    level: 2,
    source: 'self_reported',
    evidenceType: 'project',
    updatedAt: new Date('2024-02-28'),
  },
];

export const mockCareerGoals: CareerGoal[] = [
  {
    id: 'cg_001',
    targetRoleId: 'health_informatics_specialist',
    timeframe: 'long',
    priority: 1,
    createdAt: new Date('2024-01-15'),
  },
  {
    id: 'cg_002',
    targetRoleId: 'health_data_analyst',
    timeframe: 'short',
    priority: 2,
    createdAt: new Date('2024-01-15'),
  },
];

export const mockUserCourses: UserCourse[] = [
  {
    id: 'uc_001',
    courseId: 'course_python_basics',
    status: 'completed',
    completedAt: new Date('2024-02-01'),
  },
  {
    id: 'uc_002',
    courseId: 'course_data_analysis',
    status: 'completed',
    completedAt: new Date('2024-03-15'),
  },
  {
    id: 'uc_003',
    courseId: 'course_hipaa',
    status: 'completed',
    completedAt: new Date('2024-03-20'),
  },
  {
    id: 'uc_004',
    courseId: 'course_clinical_data',
    status: 'in_progress',
  },
];

export const mockProjects: Project[] = [
  {
    id: 'proj_001',
    title: 'Patient Data Dashboard',
    description: 'Built an interactive dashboard to visualize patient demographics and outcomes using Python and Plotly.',
    skillsDemonstrated: ['python_data', 'data_visualization', 'sql_basics'],
    url: 'https://github.com/alexchen/patient-dashboard',
    createdAt: new Date('2024-03-10'),
  },
  {
    id: 'proj_002',
    title: 'Healthcare API Integration',
    description: 'Developed a Python service to fetch and process data from a mock FHIR API.',
    skillsDemonstrated: ['python_basics', 'api_basics'],
    url: 'https://github.com/alexchen/fhir-integration',
    createdAt: new Date('2024-02-28'),
  },
];

export const mockUserAchievements: UserAchievement[] = [
  {
    id: 'ua_001',
    achievementId: 'first_skill',
    earnedAt: new Date('2024-01-20'),
  },
  {
    id: 'ua_002',
    achievementId: 'python_intermediate',
    earnedAt: new Date('2024-02-15'),
  },
  {
    id: 'ua_003',
    achievementId: 'data_explorer',
    earnedAt: new Date('2024-03-15'),
  },
  {
    id: 'ua_004',
    achievementId: 'compliance_aware',
    earnedAt: new Date('2024-03-20'),
  },
];

export const mockConnections: Connection[] = [
  {
    id: 'conn_001',
    name: 'Dr. Sarah Martinez',
    role: 'Clinical Informatics Director',
    company: 'Metro Health System',
    sharedSkills: ['health_informatics', 'ehr_systems', 'clinical_data'],
    relevanceScore: 92,
  },
  {
    id: 'conn_002',
    name: 'James Wilson',
    role: 'Healthcare Data Engineer',
    company: 'HealthTech Solutions',
    sharedSkills: ['python_data', 'sql_basics', 'hl7_fhir'],
    relevanceScore: 85,
  },
  {
    id: 'conn_003',
    name: 'Dr. Emily Chang',
    role: 'Medical AI Researcher',
    company: 'University Medical Center',
    sharedSkills: ['ml_fundamentals', 'clinical_nlp', 'python_basics'],
    relevanceScore: 78,
  },
  {
    id: 'conn_004',
    name: 'Michael Roberts',
    role: 'EHR Integration Specialist',
    company: 'Epic Systems',
    sharedSkills: ['ehr_systems', 'hl7_fhir', 'api_basics'],
    relevanceScore: 88,
  },
  {
    id: 'conn_005',
    name: 'Lisa Thompson',
    role: 'Health Data Analyst',
    company: 'Insurance Corp',
    sharedSkills: ['healthcare_analytics', 'data_visualization', 'sql_basics'],
    relevanceScore: 81,
  },
];

// Mock courses catalog
export const mockCourses = [
  {
    id: 'course_python_basics',
    title: 'Python for Everybody',
    provider: 'coursera' as const,
    url: 'https://www.coursera.org/specializations/python',
    skillsCovered: ['python_basics'],
    estimatedHours: 60,
    difficulty: 'beginner' as const,
  },
  {
    id: 'course_data_analysis',
    title: 'Data Analysis with Python',
    provider: 'coursera' as const,
    url: 'https://www.coursera.org/learn/data-analysis-python',
    skillsCovered: ['python_data', 'statistics_basics'],
    estimatedHours: 40,
    difficulty: 'intermediate' as const,
  },
  {
    id: 'course_hipaa',
    title: 'HIPAA Training for Healthcare Professionals',
    provider: 'udemy' as const,
    url: 'https://www.udemy.com/hipaa-training',
    skillsCovered: ['hipaa_compliance'],
    estimatedHours: 8,
    difficulty: 'beginner' as const,
  },
  {
    id: 'course_clinical_data',
    title: 'Clinical Data Management Fundamentals',
    provider: 'coursera' as const,
    url: 'https://www.coursera.org/learn/clinical-data',
    skillsCovered: ['clinical_data', 'healthcare_basics'],
    estimatedHours: 30,
    difficulty: 'intermediate' as const,
  },
  {
    id: 'course_hl7_fhir',
    title: 'HL7 FHIR Fundamentals',
    provider: 'other' as const,
    url: 'https://www.hl7.org/training',
    skillsCovered: ['hl7_fhir'],
    estimatedHours: 40,
    difficulty: 'intermediate' as const,
  },
  {
    id: 'course_ehr_systems',
    title: 'EHR Systems and Integration',
    provider: 'coursera' as const,
    url: 'https://www.coursera.org/learn/ehr-systems',
    skillsCovered: ['ehr_systems', 'clinical_data'],
    estimatedHours: 50,
    difficulty: 'intermediate' as const,
  },
  {
    id: 'course_ml_healthcare',
    title: 'Machine Learning for Healthcare',
    provider: 'coursera' as const,
    url: 'https://www.coursera.org/learn/ml-healthcare',
    skillsCovered: ['ml_fundamentals', 'healthcare_analytics'],
    estimatedHours: 60,
    difficulty: 'advanced' as const,
  },
];
