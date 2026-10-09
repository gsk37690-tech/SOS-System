# Smart Campus Guardian — SOS & Campus Safety System

A comprehensive student safety and campus emergency response management system featuring SOS alerts, incident tracking, officer dispatch, live triage, and safety analytics.

## Features

- **Role-Based Access Control**:
  - `ROLE_STUDENT`: 1-tap SOS with 3-second abort window, Silent SOS beacon, incident reporting with simulated photo evidence, live incident step progress tracking, Safe Walk escort companion, timed safety check-ins, and digital student safety ID pass.
  - `ROLE_SECURITY`: Dispatch queue, legal status workflow transitions (`ACKNOWLEDGED` → `RESPONDING` → `ARRIVED` → `RESOLVED`), officer duty status toggle (`AVAILABLE`, `ON_PATROL`, `RESPONDING`, `OFF_DUTY`), and on-scene resolution debriefs.
  - `ROLE_ADMIN`: Operations command center, incident triage queue with auditable severity overrides, live interactive campus radar map covering 6 zones, emergency campus broadcast transmitter, emergency safety drill simulator, risk analytics, and immutable audit logging.
- **Workflow & Rules**:
  - Sequential incident codes: `SCG-<year>-<sequence>`.
  - Rule-based triage severity with audited admin override.
  - Legal transition enforcement: `REPORTED` → `ASSIGNED` → `ACKNOWLEDGED` → `RESPONDING` → `ARRIVED` → `RESOLVED`.
  - State persistence via browser storage with one-click scenario reset and simulated beacon triggers.

## Hosting on GitHub Pages (Free)

This project is fully configured for zero-configuration hosting on **GitHub Pages**:

1. Push this repository to your GitHub account (`gsk37690-tech/SOS-System`).
2. On your GitHub repository page:
   - Click **Settings** (top tab).
   - Click **Pages** (in the left sidebar).
   - Under **Build and deployment > Source**, choose **GitHub Actions**.
3. That's it! The automated workflow in `.github/workflows/deploy.yml` will automatically build the React app and deploy it to:
   `https://<your-username>.github.io/SOS-System/`

