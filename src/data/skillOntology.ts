import { Skill } from '@/types';

/**
 * Healthcare Technology Skill Ontology
 *
 * This is OUR knowledge - defined by us, not by LLM.
 * Skills are organized in tiers (1-5) representing progression complexity.
 * Prerequisites define the learning path structure.
 */
export const skillOntology: Skill[] = [
  // ============================================
  // TIER 1: FOUNDATIONAL SKILLS
  // ============================================
  {
    id: 'python_basics',
    name: 'Python Fundamentals',
    category: 'technical',
    domain: 'healthcare_tech',
    description: 'Core Python programming including data types, control flow, functions, and OOP basics.',
    prerequisites: [],
    estimatedHours: 60,
    tier: 1,
    icon: 'Code',
  },
  {
    id: 'sql_basics',
    name: 'SQL Fundamentals',
    category: 'technical',
    domain: 'healthcare_tech',
    description: 'Database querying, joins, aggregations, and basic database design.',
    prerequisites: [],
    estimatedHours: 40,
    tier: 1,
    icon: 'Database',
  },
  {
    id: 'statistics_basics',
    name: 'Statistics Fundamentals',
    category: 'technical',
    domain: 'healthcare_tech',
    description: 'Descriptive statistics, probability, distributions, hypothesis testing.',
    prerequisites: [],
    estimatedHours: 50,
    tier: 1,
    icon: 'BarChart',
  },
  {
    id: 'healthcare_basics',
    name: 'Healthcare Industry Basics',
    category: 'domain',
    domain: 'healthcare_tech',
    description: 'Understanding healthcare delivery, stakeholders, payers, providers, and basic terminology.',
    prerequisites: [],
    estimatedHours: 30,
    tier: 1,
    icon: 'Heart',
  },
  {
    id: 'data_literacy',
    name: 'Data Literacy',
    category: 'soft',
    domain: 'healthcare_tech',
    description: 'Understanding data quality, data governance, and data-driven decision making.',
    prerequisites: [],
    estimatedHours: 20,
    tier: 1,
    icon: 'FileSpreadsheet',
  },

  // ============================================
  // TIER 2: INTERMEDIATE SKILLS
  // ============================================
  {
    id: 'python_data',
    name: 'Python for Data Analysis',
    category: 'technical',
    domain: 'healthcare_tech',
    description: 'Pandas, NumPy, data manipulation, cleaning, and exploratory data analysis.',
    prerequisites: ['python_basics', 'statistics_basics'],
    estimatedHours: 80,
    tier: 2,
    icon: 'LineChart',
  },
  {
    id: 'clinical_data',
    name: 'Clinical Data Fundamentals',
    category: 'domain',
    domain: 'healthcare_tech',
    description: 'Understanding EHR data, clinical workflows, medical coding (ICD, CPT), and clinical documentation.',
    prerequisites: ['healthcare_basics', 'data_literacy'],
    estimatedHours: 60,
    tier: 2,
    icon: 'Stethoscope',
  },
  {
    id: 'hipaa_compliance',
    name: 'HIPAA Compliance',
    category: 'certification',
    domain: 'healthcare_tech',
    description: 'Privacy rules, security rules, PHI handling, breach protocols, and compliance frameworks.',
    prerequisites: ['healthcare_basics'],
    estimatedHours: 30,
    tier: 2,
    icon: 'Shield',
  },
  {
    id: 'data_visualization',
    name: 'Data Visualization',
    category: 'technical',
    domain: 'healthcare_tech',
    description: 'Creating effective visualizations, dashboards, and reports using tools like Matplotlib, Seaborn, or Tableau.',
    prerequisites: ['python_data', 'statistics_basics'],
    estimatedHours: 50,
    tier: 2,
    icon: 'PieChart',
  },
  {
    id: 'api_basics',
    name: 'API Development Basics',
    category: 'technical',
    domain: 'healthcare_tech',
    description: 'RESTful APIs, HTTP methods, JSON, authentication, and basic API design.',
    prerequisites: ['python_basics'],
    estimatedHours: 40,
    tier: 2,
    icon: 'Globe',
  },

  // ============================================
  // TIER 3: ADVANCED SKILLS
  // ============================================
  {
    id: 'ml_fundamentals',
    name: 'Machine Learning Fundamentals',
    category: 'technical',
    domain: 'healthcare_tech',
    description: 'Supervised/unsupervised learning, model training, evaluation, scikit-learn.',
    prerequisites: ['python_data', 'statistics_basics'],
    estimatedHours: 100,
    tier: 3,
    icon: 'Brain',
  },
  {
    id: 'hl7_fhir',
    name: 'HL7 & FHIR Standards',
    category: 'domain',
    domain: 'healthcare_tech',
    description: 'Healthcare data interoperability standards, FHIR resources, HL7 messaging, and data exchange.',
    prerequisites: ['clinical_data', 'api_basics'],
    estimatedHours: 70,
    tier: 3,
    icon: 'FileJson',
  },
  {
    id: 'ehr_systems',
    name: 'EHR Systems Integration',
    category: 'domain',
    domain: 'healthcare_tech',
    description: 'Working with Epic, Cerner, or other EHR systems, data extraction, and integration patterns.',
    prerequisites: ['clinical_data', 'sql_basics', 'api_basics'],
    estimatedHours: 80,
    tier: 3,
    icon: 'Monitor',
  },
  {
    id: 'healthcare_analytics',
    name: 'Healthcare Analytics',
    category: 'technical',
    domain: 'healthcare_tech',
    description: 'Population health analytics, risk stratification, quality measures, and outcomes analysis.',
    prerequisites: ['python_data', 'clinical_data', 'data_visualization'],
    estimatedHours: 90,
    tier: 3,
    icon: 'Activity',
  },
  {
    id: 'cloud_basics',
    name: 'Cloud Computing Basics',
    category: 'technical',
    domain: 'healthcare_tech',
    description: 'AWS/Azure/GCP fundamentals, cloud storage, compute, and healthcare-specific cloud services.',
    prerequisites: ['python_basics', 'api_basics'],
    estimatedHours: 60,
    tier: 3,
    icon: 'Cloud',
  },

  // ============================================
  // TIER 4: SPECIALIST SKILLS
  // ============================================
  {
    id: 'clinical_nlp',
    name: 'Clinical NLP',
    category: 'technical',
    domain: 'healthcare_tech',
    description: 'Natural language processing for clinical text, medical entity extraction, clinical note analysis.',
    prerequisites: ['ml_fundamentals', 'clinical_data'],
    estimatedHours: 100,
    tier: 4,
    icon: 'MessageSquare',
  },
  {
    id: 'medical_imaging',
    name: 'Medical Imaging AI',
    category: 'technical',
    domain: 'healthcare_tech',
    description: 'Deep learning for radiology, pathology imaging, DICOM standards, image preprocessing.',
    prerequisites: ['ml_fundamentals', 'clinical_data'],
    estimatedHours: 120,
    tier: 4,
    icon: 'Scan',
  },
  {
    id: 'predictive_modeling',
    name: 'Predictive Health Modeling',
    category: 'technical',
    domain: 'healthcare_tech',
    description: 'Building predictive models for patient outcomes, readmission risk, disease progression.',
    prerequisites: ['ml_fundamentals', 'healthcare_analytics'],
    estimatedHours: 100,
    tier: 4,
    icon: 'TrendingUp',
  },
  {
    id: 'health_informatics',
    name: 'Health Informatics',
    category: 'domain',
    domain: 'healthcare_tech',
    description: 'Clinical decision support, workflow optimization, informatics research methods.',
    prerequisites: ['ehr_systems', 'healthcare_analytics'],
    estimatedHours: 80,
    tier: 4,
    icon: 'Lightbulb',
  },
  {
    id: 'mlops_healthcare',
    name: 'MLOps for Healthcare',
    category: 'technical',
    domain: 'healthcare_tech',
    description: 'Model deployment, monitoring, versioning, and lifecycle management in healthcare context.',
    prerequisites: ['ml_fundamentals', 'cloud_basics', 'hipaa_compliance'],
    estimatedHours: 90,
    tier: 4,
    icon: 'Settings',
  },

  // ============================================
  // TIER 5: EXPERT/LEADERSHIP SKILLS
  // ============================================
  {
    id: 'fda_regulation',
    name: 'FDA SaMD Regulation',
    category: 'certification',
    domain: 'healthcare_tech',
    description: 'Software as Medical Device regulations, FDA clearance process, quality management systems.',
    prerequisites: ['health_informatics', 'hipaa_compliance'],
    estimatedHours: 60,
    tier: 5,
    icon: 'FileCheck',
  },
  {
    id: 'ai_ethics_healthcare',
    name: 'AI Ethics in Healthcare',
    category: 'soft',
    domain: 'healthcare_tech',
    description: 'Bias detection, fairness, explainability, responsible AI deployment in clinical settings.',
    prerequisites: ['ml_fundamentals', 'health_informatics'],
    estimatedHours: 40,
    tier: 5,
    icon: 'Scale',
  },
  {
    id: 'clinical_trials_data',
    name: 'Clinical Trials Data Science',
    category: 'domain',
    domain: 'healthcare_tech',
    description: 'Trial design, real-world evidence, regulatory data requirements, statistical analysis plans.',
    prerequisites: ['healthcare_analytics', 'statistics_basics'],
    estimatedHours: 100,
    tier: 5,
    icon: 'FlaskConical',
  },
  {
    id: 'healthcare_architecture',
    name: 'Healthcare System Architecture',
    category: 'technical',
    domain: 'healthcare_tech',
    description: 'Designing scalable, compliant healthcare data platforms and integration architectures.',
    prerequisites: ['ehr_systems', 'cloud_basics', 'hl7_fhir'],
    estimatedHours: 100,
    tier: 5,
    icon: 'Building',
  },
];

// Helper function to get skill by ID
export function getSkillById(id: string): Skill | undefined {
  return skillOntology.find(skill => skill.id === id);
}

// Helper function to get skills by tier
export function getSkillsByTier(tier: number): Skill[] {
  return skillOntology.filter(skill => skill.tier === tier);
}

// Helper function to get skills by category
export function getSkillsByCategory(category: string): Skill[] {
  return skillOntology.filter(skill => skill.category === category);
}

// Get all skill IDs
export function getAllSkillIds(): string[] {
  return skillOntology.map(skill => skill.id);
}
