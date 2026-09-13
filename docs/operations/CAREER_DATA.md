# Canonical career data

This document defines the professional-data contract owned by `PORTFOLIO` and consumed by repositories such as `employee-searching`.

## Purpose

The public website is intentionally curated. Its project pages, CV and homepage should not be treated as a complete machine-readable inventory of Daniel's professional evidence.

`PORTFOLIO` therefore owns two related layers:

1. **Canonical career data** — complete factual professional records with stable identifiers and provenance.
2. **Presentation data** — localized, recruiter-facing copy and the subset of records intentionally rendered on the public site.

A record may be canonical and useful to another workflow without being featured on the website.

## Ownership

This repository owns public professional facts such as:

- profile and professional positioning;
- education;
- employment and technical experience;
- technologies with evidence context;
- languages when documented;
- achievements, awards and programmes;
- relevant projects/repositories;
- public professional links.

Job-search-only private or sensitive eligibility data is not automatically part of this contract. A consuming repository may own workflow-specific constraints separately.

## Schema

The TypeScript contract is defined in `src/data/career/types.ts`.

The top-level model contains:

- `profile`;
- `education`;
- `experience`;
- `projects`;
- `achievements`;
- `technologies`;
- `languages`;
- `publicLinks`.

Each canonical record has:

- a stable `id`;
- a `visibility` classification;
- source/provenance references.

Project records additionally distinguish:

- lifecycle;
- personal/team/professional ownership context;
- whether the project is intentionally featured publicly;
- whether it is suitable as job-application evidence;
- demonstrated technologies;
- evidence tags used for role matching.

## Stable identifiers

IDs are durable cross-repository references. Once consumed externally, an ID should not change because a display title changes.

Examples of the intended shape:

- `education:daw-foc`;
- `experience:salunox-2026`;
- `project:al-lio`;
- `achievement:gen-ai-arena-2026`.

Exact IDs are assigned when the canonical inventory is built in #197.

## Localization policy

The existing bilingual architecture remains authoritative for translated presentation copy:

- Spanish editable copy stays under `src/data/es/`;
- English editable copy stays under `src/data/en/`.

Canonical shared records should contain factual/non-localized metadata wherever practical. Localized descriptions may reference the same stable IDs from the existing ES/EN data layer.

Do not create a third translation namespace merely for the export.

## Presentation vs canonical inventory

`featuredPublicly` is a presentation decision, not an inclusion rule for canonical data.

For example, the current public projects page can continue to show a small selected set while the canonical project inventory contains additional repositories that demonstrate Java, backend, deployment, automation or other useful evidence.

External consumers must not interpret the public project grid as the complete evidence universe.

## Technology evidence

Technology records should be evidence-backed rather than a detached skills wishlist.

A technology may reference one or more canonical evidence records such as:

- a project where it is implemented;
- an employment record where it was used;
- another maintained public source.

The canonical contract must not add technologies merely because they are common for a target role.

## Provenance

`SourceReference` records identify why a canonical claim exists. Sources may include:

- owned repositories;
- maintained portfolio/CV data;
- education records already represented by this repository;
- employment records;
- public award/event pages;
- maintained public professional links.

The future generated export in #198 will also carry export-level provenance including schema version and source revision.

## Visibility and repository privacy

`public` means the fact is appropriate for the public professional profile/export.

`consumer-only` means the record may be useful to an approved professional consumer without being rendered in the public website UI. It is a **presentation/export classification, not a secrecy boundary**.

`PORTFOLIO` is a public GitHub repository. Any record committed here — including a `consumer-only` record — is visible in the repository history. Therefore:

- private repository names, private client names, private URLs or confidential implementation details must not be committed here merely because they are useful evidence;
- private repositories may be inspected as evidence by an authorized workflow, but only facts already approved as public professional information may be normalized into this public canonical repository;
- a downstream private repository may keep a separately sourced private evidence overlay when it needs details that cannot safely be published here;
- sensitive job-search eligibility data remains outside this repository unless Daniel explicitly changes that policy.

The inventory work in #197 must record the distinction between **professional relevance** and **safe public canonicalization**. A relevant private repository can support a decision without automatically becoming a public canonical project record.

## Consumer contract

Consumers such as `employee-searching` should:

1. consume the generated contract introduced by #198 rather than scrape pages;
2. retain the schema/source revision of their cached snapshot;
3. use stable record IDs when selecting evidence;
4. choose projects from the complete **public-safe canonical inventory**, not only featured projects;
5. keep workflow-specific facts and any authorized private evidence overlay separate from canonical public facts.

The detailed external-consumer/versioning contract is tracked in #199.

## Migration boundary

#196 defines the schema and ownership model only. It does not change the visible website or populate a complete project inventory.

Next steps:

- #197 audits the complete owned repository/project set and populates the public-safe canonical project inventory;
- #198 generates the stable external export;
- #199 documents/tests consumer compatibility;
- `employee-searching` #660 consumes that export, retires its competing hand-maintained project catalog and may maintain an explicitly separate private evidence overlay where necessary.
