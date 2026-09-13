export const CAREER_VISIBILITIES = ['public', 'consumer-only'] as const;
export type CareerVisibility = (typeof CAREER_VISIBILITIES)[number];

export const PROJECT_LIFECYCLES = [
  'active',
  'completed',
  'experimental',
  'archived',
  'unknown',
] as const;
export type ProjectLifecycle = (typeof PROJECT_LIFECYCLES)[number];

export const EVIDENCE_TAGS = [
  'frontend',
  'backend',
  'full-stack',
  'java',
  'python',
  'data',
  'sql',
  'api',
  'integration',
  'ai',
  'testing',
  'qa',
  'devops',
  'deployment',
  'automation',
  'product',
  'mobile',
  'customer-support',
  'sales',
  'business',
] as const;
export type EvidenceTag = (typeof EVIDENCE_TAGS)[number];

export const SOURCE_KINDS = [
  'repository',
  'portfolio',
  'education',
  'employment',
  'event',
  'award',
  'public-link',
] as const;
export type SourceKind = (typeof SOURCE_KINDS)[number];

export const PROJECT_OWNERSHIP_TYPES = [
  'personal',
  'team',
  'professional',
  'unknown',
] as const;
export type ProjectOwnership = (typeof PROJECT_OWNERSHIP_TYPES)[number];

export const TECHNOLOGY_CATEGORIES = [
  'frontend',
  'backend',
  'data',
  'mobile',
  'tooling',
  'cloud',
  'other',
] as const;
export type TechnologyCategory = (typeof TECHNOLOGY_CATEGORIES)[number];

export const PUBLIC_LINK_KINDS = [
  'github',
  'linkedin',
  'portfolio',
  'cv',
  'email',
  'other',
] as const;
export type PublicLinkKind = (typeof PUBLIC_LINK_KINDS)[number];

export interface SourceReference {
  kind: SourceKind;
  url: string | null;
  note?: string;
}

export interface CanonicalRecordBase {
  id: string;
  visibility: CareerVisibility;
  sources: SourceReference[];
}

export interface CanonicalProfileRecord extends CanonicalRecordBase {
  fullName: string;
  location: string;
  professionalRole: string;
}

export interface CanonicalEducationRecord extends CanonicalRecordBase {
  institution: string;
  qualification: string;
  startYear: number | null;
  endYear: number | null;
  ongoing: boolean;
}

export interface CanonicalExperienceRecord extends CanonicalRecordBase {
  organization: string;
  role: string;
  startYear: number | null;
  endYear: number | null;
  ongoing: boolean;
  technologies: string[];
  evidenceTags: EvidenceTag[];
}

export interface CanonicalProjectRecord extends CanonicalRecordBase {
  name: string;
  repositoryUrl: string | null;
  liveUrl: string | null;
  lifecycle: ProjectLifecycle;
  featuredPublicly: boolean;
  applicationEvidence: boolean;
  ownership: ProjectOwnership;
  technologies: string[];
  evidenceTags: EvidenceTag[];
  awardIds: string[];
}

export interface CanonicalAchievementRecord extends CanonicalRecordBase {
  name: string;
  year: number | null;
  projectIds: string[];
}

export interface CanonicalTechnologyRecord extends CanonicalRecordBase {
  name: string;
  category: TechnologyCategory;
  evidenceIds: string[];
}

export interface CanonicalLanguageRecord extends CanonicalRecordBase {
  language: string;
  level: string;
  evidenceNote: string | null;
}

export interface CanonicalPublicLinkRecord extends CanonicalRecordBase {
  label: string;
  url: string;
  kind: PublicLinkKind;
}

export interface CareerDataSchema {
  schemaVersion: string;
  profile: CanonicalProfileRecord;
  education: CanonicalEducationRecord[];
  experience: CanonicalExperienceRecord[];
  projects: CanonicalProjectRecord[];
  achievements: CanonicalAchievementRecord[];
  technologies: CanonicalTechnologyRecord[];
  languages: CanonicalLanguageRecord[];
  publicLinks: CanonicalPublicLinkRecord[];
}
