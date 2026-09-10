export interface TechnologyGroup {
  label: string;
  technologies: string[];
}

export const technologyGroups: TechnologyGroup[] = [
  {
    label: 'Frontend',
    technologies: [
      'HTML5',
      'CSS3',
      'JavaScript',
      'TypeScript',
      'React',
      'Angular',
      'Next.js',
    ],
  },
  {
    label: 'Backend',
    technologies: [
      'Java',
      'Python',
      'FastAPI',
      'Node.js',
      'Laravel/PHP',
      'REST APIs',
    ],
  },
  {
    label: 'Data',
    technologies: ['SQL', 'PostgreSQL', 'MySQL/MariaDB', 'BigQuery'],
  },
  {
    label: 'Tools',
    technologies: ['Git', 'Docker'],
  },
];
