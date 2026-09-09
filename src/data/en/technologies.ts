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
      'Next.js',
      'Astro',
      'Tailwind CSS',
      'Vite',
    ],
  },
  {
    label: 'Backend',
    technologies: ['Java', 'Python', 'FastAPI', 'Node.js', 'REST APIs'],
  },
  {
    label: 'Data',
    technologies: ['SQL', 'PostgreSQL', 'MySQL/MariaDB', 'BigQuery'],
  },
  {
    label: 'Tools',
    technologies: ['Git', 'GitHub', 'Docker', 'Supabase'],
  },
];
