export type CareerVisibility = 'public' | 'consumer-only';

export type ProjectLifecycle =
  | 'active'
  | 'completed'
  | 'experimental'
  | 'archived'
  | 'unknown';

export type EvidenceTag =
  | 'frontend'
  | 'backend'
  | 'full-stack'
  | 'java'
  | 'python'
  | 'data'
  | 'sql'
  | 'api'
  | 'integration'
  | 'ai'
  | 'testing'
  | 'qa'
  | 'devops'
  | 'deployment'
  | 'automation'
  | 'product'
  | 'mobile'
  | 'customer-support'
  | 'sales'
  | 'business';

export interface SourceReference {
  kind:
    | 'repository'
    | 'portfolio'
    | 'education'
    | 'employment'
    | 'event'
    | 'award'
    | 'public-link';
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
  ownership: 'personal' | 'team' | 'professional' | 'unknown';
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
  category:
    | 'frontend'
    | 'backend'
    | 'data'
    | 'mobile'
    | 'tooling'
    | 'cloud'
    | 'other';
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
  kind: 'github' | 'linkedin' | 'portfolio' | 'cv' | 'email' | 'other';
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
