# Smart Campus Guardian — Implementation Plan

Status: planning only. No application source has been generated in this phase.

## Target architecture

```text
Browser (Thymeleaf / HTML / CSS / JavaScript)
        ↓
Spring MVC controllers + Spring Security
        ↓
Service layer (workflow, authorization, triage, notifications)
        ↓
Spring Data JPA repositories
        ↓
Hibernate / MySQL 8
```

The project will be a Maven application rooted at `smart-campus-guardian/`. It will separate Java code into `config`, `controller`, `service`, `repository`, `entity`, `dto`, `security`, `exception`, and `util`. Thymeleaf templates will be grouped by shared fragments, authentication, student, security, and admin views.

## Core data model

`users` is the identity root. Student-specific fields live on the user record; security-profile fields live in `security_officers`. The principal operational graph is:

```text
User (reporter) ──< Incident >── CampusZone
                       │
                       ├──< IncidentUpdate (timeline; actor User)
                       ├──< IncidentAssignment >── SecurityOfficer ── User
                       ├──< Evidence
                       ├──< Notification
                       └──< AuditLog
```

Supporting tables are `emergency_contacts`, `campus_alerts`, `safety_checkins`, `safe_walks`, `drills`, and `drill_responses`. Enumerations will cover role, account status, incident type/severity/status, zone risk, officer availability, and alert/check-in states.

## Phases

1. **Foundation:** Maven/Spring Boot baseline, database configuration, entities, repositories, schema/seed initialization, service foundation, error handling, and security skeleton.
2. **Authentication:** registration, BCrypt login, three role redirects, protected routes, logout, validation, and security tests.
3. **Student portal:** dashboard, SOS/silent SOS, incident reports/history, contacts, notifications, alerts, check-ins, safe walk, profile, and digital ID.
4. **Admin portal:** dashboards, people and officer management, incident triage/assignment, zones, alerts, analytics/risk index, clusters, drills, and audit logs.
5. **Security portal:** assigned work, accepted/responding/arrived/resolved transitions, notes, availability, notifications, and response history.
6. **Hardening and QA:** upload security, usability/responsive review, complete browser/database workflow, error review, tests, package build, and documentation.

## Verification commands

```powershell
mvn test
mvn clean test
mvn clean package
java -jar target/smart-campus-guardian-*.jar
```

For database verification, use the installed MySQL service with credentials supplied through environment variables; the MySQL command-line client is not currently discoverable on `PATH`, so service startup and connectivity will be checked through the application or by locating/configuring the client before end-to-end testing.

## Environment findings (2026-09-19)

- Java: Temurin OpenJDK 21.0.12.1 LTS.
- Maven: 3.9.16, using Java 21.
- MySQL: Windows service `MySQL84` is running; `mysql` client command is not available on `PATH`.
- Port 8080: no listener found.
- Workspace: no existing project files were found before this planning phase.
