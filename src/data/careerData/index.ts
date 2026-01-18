/**
 * Career Data Module
 * Exports domains, skills, and related types for the application
 */

import domainsData from './domains.json';
import skillsData from './skills.json';
import { Domain, Skill } from './types';

// Export typed data
export const domains: Domain[] = domainsData as Domain[];
export const skills: Skill[] = skillsData as Skill[];

// Export types
export * from './types';

// Helper functions

/**
 * Get all unique domain categories
 */
export function getDomainCategories(): string[] {
  const categories = new Set(domains.map(d => d.category));
  return Array.from(categories).sort();
}

/**
 * Get domains by category
 */
export function getDomainsByCategory(category: string): Domain[] {
  return domains.filter(d => d.category === category);
}

/**
 * Get skills by domain name
 */
export function getSkillsByDomain(domainName: string): Skill[] {
  return skills.filter(s => s.domain.includes(domainName));
}

/**
 * Get skills by multiple domains
 */
export function getSkillsByDomains(domainNames: string[]): Skill[] {
  return skills.filter(s => s.domain.some(d => domainNames.includes(d)));
}

/**
 * Get skills by category
 */
export function getSkillsByCategory(category: string): Skill[] {
  return skills.filter(s => s.category === category);
}

/**
 * Get unique skill categories
 */
export function getSkillCategories(): string[] {
  const categories = new Set(skills.map(s => s.category));
  return Array.from(categories).sort();
}

/**
 * Get all unique jobs from domains
 */
export function getAllJobs(): string[] {
  const jobs = new Set<string>();
  domains.forEach(d => d.jobs.forEach(j => jobs.add(j)));
  return Array.from(jobs).sort();
}

/**
 * Get jobs by domain
 */
export function getJobsByDomain(domainName: string): string[] {
  const domain = domains.find(d => d.domain === domainName);
  return domain?.jobs || [];
}

/**
 * Get jobs by multiple domains
 */
export function getJobsByDomains(domainNames: string[]): string[] {
  const jobs = new Set<string>();
  domainNames.forEach(name => {
    const domain = domains.find(d => d.domain === name);
    domain?.jobs.forEach(j => jobs.add(j));
  });
  return Array.from(jobs).sort();
}

/**
 * Search skills by name
 */
export function searchSkills(query: string): Skill[] {
  const lowerQuery = query.toLowerCase();
  return skills.filter(s =>
    s.skillName.toLowerCase().includes(lowerQuery) ||
    s.category.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Get a skill by ID
 */
export function getSkillById(id: string): Skill | undefined {
  return skills.find(s => s.id === id);
}

/**
 * Get a domain by ID
 */
export function getDomainById(id: string): Domain | undefined {
  return domains.find(d => d.id === id);
}

/**
 * Get domain by name
 */
export function getDomainByName(name: string): Domain | undefined {
  return domains.find(d => d.domain === name);
}
