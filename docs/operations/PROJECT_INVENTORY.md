# Project and repository inventory

This document records how Daniel's owned GitHub repositories are evaluated for the canonical career-data contract.

## Audit scope

The connected GitHub account exposed **25 owned repositories** during the 2026-09-13 audit:

- **5 public repositories**;
- **20 private repositories**.

Repository visibility is treated as a disclosure boundary, not as a quality score.

## Public canonical project records

Four public repositories currently qualify as professional project evidence in the canonical inventory:

- `al-lio` — **AL-LÍO** — personal product / full-stack development — featured publicly.
- `sidn-cost-control` — **SIDN Cost Control** — team project / public case study — featured publicly.
- `feedback2action` — **Feedback2Action** — team project / public case study — featured publicly.
- `portfolio` — **Daniel García Ortega Portfolio** — personal web / quality-engineering project — canonical evidence, not a featured project card.

The remaining public repository is account/profile infrastructure rather than a distinct software project and is not included as application evidence.

## Private repository audit

The private repository set was reviewed for professional relevance. It contains several different classes of evidence, including:

- full-stack and backend applications;
- Java and web-development coursework;
- project subsystems and services that belong to a larger product;
- automation/agent/tooling repositories;
- client or commercial web work;
- research/challenge workspaces;
- experiments, duplicates/mirrors and empty or low-signal repositories.

Those repositories are **not named or copied into this public repository by default**. Their detailed evidence mapping belongs to the private `employee-searching` workflow tracked in `employee-searching#673`.

This prevents two opposite errors:

1. ignoring strong private evidence and repeatedly using only the same three featured projects;
2. exposing private repository/client details merely to make them available to an application-personalization workflow.

## Inclusion rules

A project belongs in `src/data/career/projects.ts` when all of the following are true:

- the project/repository is safe to reference publicly;
- Daniel's role or ownership context is supported by repository/public evidence;
- the project demonstrates at least one concrete capability useful in a professional context;
- its lifecycle and team/personal context can be represented without exaggeration;
- its technologies/evidence tags are supported by maintained public sources.

## Exclusion / defer rules

A repository is excluded or deferred from the public canonical inventory when it is primarily:

- account/profile infrastructure rather than a project;
- an exact or near-exact mirror of another project;
- a subsystem better represented under a parent project unless separate public positioning is intentional;
- empty, throwaway or too small to add distinct professional evidence;
- private/client work whose public disclosure has not been explicitly established;
- research/planning material without enough implemented project evidence yet.

Exclusion from the public inventory does **not** mean the work has no value. Private evidence may still be used internally under the disclosure controls defined by `employee-searching#673`.

## Featured is not complete

The existing public project grid currently contains three featured projects. That grid is a presentation choice.

The canonical inventory already adds `portfolio` as application evidence without adding another public project card. Future public-safe projects may be added to the canonical inventory with `featuredPublicly: false`.

Downstream consumers must select evidence from `canonicalProjects`, not infer the evidence universe from the homepage/project grid.

## Team-project attribution

`SIDN Cost Control` and `Feedback2Action` remain explicitly marked as `team` projects.

Their public repositories are case-study/documentation surfaces. They must not be used to imply that Daniel individually owns the complete implementation or private team repository.

## Technology freshness

Canonical project technologies are based on current maintained public evidence, not blindly copied from older portfolio copy.

For example, AL-LÍO's current public repository documents the production application around Next.js, PostgreSQL, Google OAuth/Calendar integration and Docker/VPS operations. The canonical inventory follows current repository evidence rather than preserving older technology labels merely because they appeared in a previous portfolio version.

Presentation copy may remain intentionally shorter, but it must not contradict canonical facts. Any factual mismatch discovered during this audit should be reconciled in follow-up presentation-data work rather than creating a second source of truth.

## Maintenance

When a repository materially changes:

1. verify the maintained source;
2. update the canonical project record;
3. update relevant evidence tags;
4. keep team/personal ownership explicit;
5. update presentation data only when the visible portfolio should change;
6. refresh downstream exports/snapshots after #198/#199 establish that pipeline.
