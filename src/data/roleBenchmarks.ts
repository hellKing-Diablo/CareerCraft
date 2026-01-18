import { RoleBenchmark } from '@/types';

/**
 * Role Benchmarks for Healthcare Technology
 *
 * These are DETERMINISTIC requirements - defined by us based on industry standards.
 * Each role has specific skill requirements at specific levels.
 * This drives the gap analysis and readiness scoring.
 */
export const roleBenchmarks: RoleBenchmark[] = [
  // ============================================
  // ENTRY LEVEL ROLES
  // ============================================
  {
    id: 'health_data_analyst',
    roleName: 'Health Data Analyst',
    domain: 'healthcare_tech',
    seniorityLevel: 'entry',
    description: 'Analyze healthcare data to support clinical and operational decisions. Extract insights from EHR data and create reports.',
    icon: 'BarChart',
    requiredSkills: [
      { skillId: 'python_basics', minimumLevel: 3, priority: 'critical' },
      { skillId: 'sql_basics', minimumLevel: 3, priority: 'critical' },
      { skillId: 'statistics_basics', minimumLevel: 3, priority: 'critical' },
      { skillId: 'healthcare_basics', minimumLevel: 2, priority: 'critical' },
      { skillId: 'data_literacy', minimumLevel: 3, priority: 'important' },
      { skillId: 'python_data', minimumLevel: 2, priority: 'important' },
      { skillId: 'data_visualization', minimumLevel: 2, priority: 'important' },
      { skillId: 'hipaa_compliance', minimumLevel: 2, priority: 'critical' },
    ],
  },
  {
    id: 'clinical_data_coordinator',
    roleName: 'Clinical Data Coordinator',
    domain: 'healthcare_tech',
    seniorityLevel: 'entry',
    description: 'Manage clinical data quality, coordinate data collection, and ensure compliance with data standards.',
    icon: 'ClipboardList',
    requiredSkills: [
      { skillId: 'healthcare_basics', minimumLevel: 3, priority: 'critical' },
      { skillId: 'clinical_data', minimumLevel: 3, priority: 'critical' },
      { skillId: 'data_literacy', minimumLevel: 3, priority: 'critical' },
      { skillId: 'sql_basics', minimumLevel: 2, priority: 'important' },
      { skillId: 'hipaa_compliance', minimumLevel: 3, priority: 'critical' },
    ],
  },

  // ============================================
  // MID LEVEL ROLES
  // ============================================
  {
    id: 'health_informatics_specialist',
    roleName: 'Health Informatics Specialist',
    domain: 'healthcare_tech',
    seniorityLevel: 'mid',
    description: 'Bridge clinical workflows and technology systems. Optimize EHR usage, implement clinical decision support, and improve data quality.',
    icon: 'Lightbulb',
    requiredSkills: [
      { skillId: 'python_basics', minimumLevel: 3, priority: 'important' },
      { skillId: 'sql_basics', minimumLevel: 3, priority: 'critical' },
      { skillId: 'healthcare_basics', minimumLevel: 4, priority: 'critical' },
      { skillId: 'clinical_data', minimumLevel: 4, priority: 'critical' },
      { skillId: 'hipaa_compliance', minimumLevel: 3, priority: 'critical' },
      { skillId: 'ehr_systems', minimumLevel: 3, priority: 'critical' },
      { skillId: 'hl7_fhir', minimumLevel: 3, priority: 'important' },
      { skillId: 'healthcare_analytics', minimumLevel: 2, priority: 'important' },
      { skillId: 'health_informatics', minimumLevel: 3, priority: 'critical' },
    ],
  },
  {
    id: 'healthcare_data_engineer',
    roleName: 'Healthcare Data Engineer',
    domain: 'healthcare_tech',
    seniorityLevel: 'mid',
    description: 'Build and maintain data pipelines for healthcare data. Ensure data quality, security, and accessibility.',
    icon: 'Database',
    requiredSkills: [
      { skillId: 'python_basics', minimumLevel: 4, priority: 'critical' },
      { skillId: 'sql_basics', minimumLevel: 4, priority: 'critical' },
      { skillId: 'python_data', minimumLevel: 3, priority: 'critical' },
      { skillId: 'api_basics', minimumLevel: 3, priority: 'critical' },
      { skillId: 'cloud_basics', minimumLevel: 3, priority: 'critical' },
      { skillId: 'clinical_data', minimumLevel: 2, priority: 'important' },
      { skillId: 'hipaa_compliance', minimumLevel: 3, priority: 'critical' },
      { skillId: 'hl7_fhir', minimumLevel: 3, priority: 'important' },
      { skillId: 'ehr_systems', minimumLevel: 2, priority: 'important' },
    ],
  },
  {
    id: 'clinical_data_scientist',
    roleName: 'Clinical Data Scientist',
    domain: 'healthcare_tech',
    seniorityLevel: 'mid',
    description: 'Apply machine learning and statistical methods to clinical data. Build predictive models and generate insights.',
    icon: 'Brain',
    requiredSkills: [
      { skillId: 'python_basics', minimumLevel: 4, priority: 'critical' },
      { skillId: 'python_data', minimumLevel: 4, priority: 'critical' },
      { skillId: 'statistics_basics', minimumLevel: 4, priority: 'critical' },
      { skillId: 'ml_fundamentals', minimumLevel: 3, priority: 'critical' },
      { skillId: 'healthcare_basics', minimumLevel: 3, priority: 'important' },
      { skillId: 'clinical_data', minimumLevel: 3, priority: 'critical' },
      { skillId: 'hipaa_compliance', minimumLevel: 3, priority: 'critical' },
      { skillId: 'data_visualization', minimumLevel: 3, priority: 'important' },
      { skillId: 'healthcare_analytics', minimumLevel: 3, priority: 'important' },
    ],
  },

  // ============================================
  // SENIOR LEVEL ROLES
  // ============================================
  {
    id: 'medical_ai_engineer',
    roleName: 'Medical AI Engineer',
    domain: 'healthcare_tech',
    seniorityLevel: 'senior',
    description: 'Design and deploy AI systems for clinical applications. Work on medical imaging, NLP, and predictive models.',
    icon: 'Cpu',
    requiredSkills: [
      { skillId: 'python_basics', minimumLevel: 5, priority: 'critical' },
      { skillId: 'python_data', minimumLevel: 4, priority: 'critical' },
      { skillId: 'ml_fundamentals', minimumLevel: 4, priority: 'critical' },
      { skillId: 'clinical_data', minimumLevel: 3, priority: 'critical' },
      { skillId: 'hipaa_compliance', minimumLevel: 3, priority: 'critical' },
      { skillId: 'clinical_nlp', minimumLevel: 3, priority: 'important' },
      { skillId: 'medical_imaging', minimumLevel: 3, priority: 'important' },
      { skillId: 'predictive_modeling', minimumLevel: 4, priority: 'critical' },
      { skillId: 'mlops_healthcare', minimumLevel: 3, priority: 'important' },
      { skillId: 'cloud_basics', minimumLevel: 3, priority: 'important' },
      { skillId: 'ai_ethics_healthcare', minimumLevel: 3, priority: 'important' },
    ],
  },
  {
    id: 'healthcare_integration_architect',
    roleName: 'Healthcare Integration Architect',
    domain: 'healthcare_tech',
    seniorityLevel: 'senior',
    description: 'Design enterprise healthcare data architectures. Lead integration initiatives and ensure interoperability.',
    icon: 'Building',
    requiredSkills: [
      { skillId: 'python_basics', minimumLevel: 4, priority: 'important' },
      { skillId: 'sql_basics', minimumLevel: 4, priority: 'critical' },
      { skillId: 'api_basics', minimumLevel: 4, priority: 'critical' },
      { skillId: 'clinical_data', minimumLevel: 4, priority: 'critical' },
      { skillId: 'hl7_fhir', minimumLevel: 4, priority: 'critical' },
      { skillId: 'ehr_systems', minimumLevel: 4, priority: 'critical' },
      { skillId: 'cloud_basics', minimumLevel: 4, priority: 'critical' },
      { skillId: 'hipaa_compliance', minimumLevel: 4, priority: 'critical' },
      { skillId: 'healthcare_architecture', minimumLevel: 4, priority: 'critical' },
      { skillId: 'health_informatics', minimumLevel: 3, priority: 'important' },
    ],
  },

  // ============================================
  // LEAD LEVEL ROLES
  // ============================================
  {
    id: 'chief_health_informatics_officer',
    roleName: 'Chief Health Informatics Officer',
    domain: 'healthcare_tech',
    seniorityLevel: 'lead',
    description: 'Lead health informatics strategy across the organization. Drive digital transformation and innovation.',
    icon: 'Crown',
    requiredSkills: [
      { skillId: 'healthcare_basics', minimumLevel: 5, priority: 'critical' },
      { skillId: 'clinical_data', minimumLevel: 4, priority: 'critical' },
      { skillId: 'health_informatics', minimumLevel: 5, priority: 'critical' },
      { skillId: 'ehr_systems', minimumLevel: 4, priority: 'critical' },
      { skillId: 'healthcare_analytics', minimumLevel: 4, priority: 'important' },
      { skillId: 'hipaa_compliance', minimumLevel: 4, priority: 'critical' },
      { skillId: 'fda_regulation', minimumLevel: 3, priority: 'important' },
      { skillId: 'ai_ethics_healthcare', minimumLevel: 4, priority: 'important' },
      { skillId: 'healthcare_architecture', minimumLevel: 4, priority: 'important' },
    ],
  },
  {
    id: 'healthcare_ai_director',
    roleName: 'Healthcare AI Director',
    domain: 'healthcare_tech',
    seniorityLevel: 'lead',
    description: 'Lead AI strategy and implementation in healthcare. Manage AI teams and ensure responsible AI deployment.',
    icon: 'Sparkles',
    requiredSkills: [
      { skillId: 'ml_fundamentals', minimumLevel: 5, priority: 'critical' },
      { skillId: 'clinical_data', minimumLevel: 4, priority: 'critical' },
      { skillId: 'predictive_modeling', minimumLevel: 4, priority: 'critical' },
      { skillId: 'clinical_nlp', minimumLevel: 3, priority: 'important' },
      { skillId: 'medical_imaging', minimumLevel: 3, priority: 'important' },
      { skillId: 'mlops_healthcare', minimumLevel: 4, priority: 'critical' },
      { skillId: 'fda_regulation', minimumLevel: 4, priority: 'critical' },
      { skillId: 'ai_ethics_healthcare', minimumLevel: 5, priority: 'critical' },
      { skillId: 'hipaa_compliance', minimumLevel: 4, priority: 'critical' },
      { skillId: 'healthcare_architecture', minimumLevel: 3, priority: 'important' },
    ],
  },
];

// Helper function to get role by ID
export function getRoleById(id: string): RoleBenchmark | undefined {
  return roleBenchmarks.find(role => role.id === id);
}

// Helper function to get roles by seniority
export function getRolesBySeniority(level: string): RoleBenchmark[] {
  return roleBenchmarks.filter(role => role.seniorityLevel === level);
}

// Get all role IDs
export function getAllRoleIds(): string[] {
  return roleBenchmarks.map(role => role.id);
}
