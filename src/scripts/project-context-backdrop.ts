const page = document.querySelector<HTMLElement>('.projects-page');
const backdrop = page?.querySelector<HTMLElement>('.projects-page__backdrop');

if (page && backdrop) {
  const rows = Array.from(
    page.querySelectorAll<HTMLElement>('[data-project-context]'),
  );
  const contextImages = Array.from(
    backdrop.querySelectorAll<HTMLElement>('[data-project-context-image]'),
  );

  let hoveredProject: string | null = null;
  let focusedProject: string | null = null;

  const updateContext = () => {
    const activeProject = focusedProject ?? hoveredProject;

    if (activeProject) {
      backdrop.dataset.activeProject = activeProject;
    } else {
      delete backdrop.dataset.activeProject;
    }

    for (const image of contextImages) {
      image.toggleAttribute(
        'data-active',
        image.dataset.projectContextImage === activeProject,
      );
    }
  };

  for (const row of rows) {
    const projectId = row.dataset.projectContext;
    if (!projectId) continue;

    row.addEventListener('pointerenter', () => {
      hoveredProject = projectId;
      updateContext();
    });

    row.addEventListener('pointerleave', () => {
      if (hoveredProject === projectId) {
        hoveredProject = null;
      }
      updateContext();
    });

    row.addEventListener('focusin', () => {
      focusedProject = projectId;
      updateContext();
    });

    row.addEventListener('focusout', (event) => {
      const nextTarget = event.relatedTarget;

      if (!(nextTarget instanceof Node) || !row.contains(nextTarget)) {
        if (focusedProject === projectId) {
          focusedProject = null;
        }
        updateContext();
      }
    });
  }
}
