export const PROJECT_BACKDROP_DURATION_SECONDS = 48;
export const PROJECT_BACKDROP_STEP_SECONDS = 8;
export const PROJECT_BACKDROP_INITIAL_OFFSET_SECONDS = -2;

export const projectMoments = [
  {
    number: '01',
    desktopPosition: 'center 38%',
    mobilePosition: '50% center',
    loading: 'eager',
    fetchPriority: 'high',
  },
  {
    number: '02',
    desktopPosition: 'center 42%',
    mobilePosition: '50% center',
    loading: 'eager',
    fetchPriority: 'auto',
  },
  {
    number: '03',
    desktopPosition: 'center 36%',
    mobilePosition: '44% center',
    loading: 'lazy',
    fetchPriority: 'auto',
  },
  {
    number: '04',
    desktopPosition: 'center 42%',
    mobilePosition: '34% center',
    loading: 'lazy',
    fetchPriority: 'auto',
  },
  {
    number: '05',
    desktopPosition: 'center 40%',
    mobilePosition: '38% center',
    loading: 'lazy',
    fetchPriority: 'auto',
  },
  {
    number: '06',
    desktopPosition: 'center 55%',
    mobilePosition: '50% center',
    loading: 'lazy',
    fetchPriority: 'auto',
  },
] as const;
