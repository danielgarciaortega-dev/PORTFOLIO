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
      'APIs REST',
    ],
  },
  {
    label: 'Datos',
    technologies: ['SQL', 'PostgreSQL', 'MySQL/MariaDB', 'BigQuery'],
  },
  {
    label: 'Herramientas',
    technologies: ['Git', 'Docker'],
  },
];
