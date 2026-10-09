# Smart Campus Guardian — Project Instructions

## Purpose

Build a single, database-backed Spring Boot application for student safety and emergency management. The demonstrable core flow is: student registration/login → incident or SOS creation → admin triage and assignment → security response → resolution → timeline, notification, analytics, and audit updates.

## Architecture and technology

- Java 21, Maven, Spring Boot, Spring MVC, Spring Security, Spring Data JPA/Hibernate, MySQL 8.
- Server-rendered Thymeleaf UI with HTML, CSS, and small, purposeful JavaScript; no separate React application.
- Layers: controllers → services → repositories → JPA entities. Templates never access repositories or implement business logic.
- Package layout: `config`, `controller`, `service`, `repository`, `entity`, `dto`, `security`, `exception`, and `util`.

## Coding rules

- Keep controllers thin and services cohesive. Use meaningful names, validation DTOs, transactions where data changes span entities, and centralized exception handling.
- Do not introduce fake functionality. Dashboard values, actions, timelines, notifications, and analytics must be backed by persisted data.
- Do not put secrets in source control. Read local database credentials from environment variables with safe development defaults documented in `.env.example`.
- Use fictional demo data and clearly label simulations. Never claim to contact emergency services, police, or real GPS/SMS systems.
- Preserve role boundaries: only `ROLE_STUDENT`, `ROLE_SECURITY`, and `ROLE_ADMIN` are main application roles.

## Security and data rules

- Store passwords only with BCrypt; never log, return, or seed plaintext password hashes manually.
- Enforce authorization in Spring Security and service-level ownership checks for sensitive records.
- Validate inputs on both server and form layers. Validate uploads by allowlisted media type, extension, and size; serve them through controlled endpoints.
- Use database uniqueness constraints for email, register number where applicable, and incident codes.
- Capture audit records for material operational actions. Incident status changes must produce database timeline records.

## Database and workflow rules

- Keep schema, migrations/initialization, and seed data reproducible for a fresh MySQL database.
- Generate unique incident codes in the format `SCG-<year>-<sequence>`.
- Severity is rule-based emergency triage, not AI. Preserve the specified type-to-severity defaults and permit audited admin override.
- Enforce legal incident transitions and assignment ownership: reported/triaged → assigned → acknowledged → responding → arrived → resolved, with controlled cancellation.

## Quality bar and testing

- Run `mvn test` after each major implementation phase and `mvn clean package` before handoff.
- Add tests for registration validation, authentication/authorization, severity, incident code generation, workflow transitions, assignment, and primary repository/service behavior.
- Perform the documented end-to-end workflow against MySQL before declaring database-backed features complete.
- Do not delete or weaken tests merely to make a build pass. Investigate failures, fix root causes, and rerun related tests.

## Definition of done

No feature is done until its data persistence, authorization, validation, error handling, UI behavior, and relevant tests have been verified. The core emergency workflow must remain reliable even if optional advanced modules are incomplete.

Future agents must read this file before changing the project.
