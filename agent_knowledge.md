# MarianResearch Portal System Documentation (Agent Knowledge)

This file contains core architecture details, routing conventions, user roles, and implementation details for the MarianResearch Portal, specifically written for future AI agents to verify and maintain system state.

---

## 👥 Roles & Sidebar Navigation

The portal currently supports 6 distinct roles. Navigation configurations are maintained in `data/roleNav.ts`.

1. **Scholar** (`/scholar`)
   - Dashboard, My Submissions, My Portfolio, Leave Applications, My Approvals.
2. **Faculty** (`/faculty`)
   - Dashboard, Submissions, Approvals, Incentives.
   - *Note: The "Scholars" option has been removed from the Faculty role.*
3. **Research Guide** (`/research-guide`)
   - Dashboard, Scholars, Submissions, Approvals, Portfolio Reviews, Leave Reviews, Reports, Incentives, Profile.
4. **Research Center Coordinator** (`/coordinator`)
   - Dashboard, Research Centers, Submissions, Approvals, Scholar Portfolios, Leaves, Reports, Profile.
5. **Administrator** (`/admin`)
   - Dashboard, Users, Coordinators, Research Centers, Submissions, Approvals, Scholar Portfolios, Overall Leaves, Reports, Incentives, Settings.
6. **Library** (`/library`)
   - Dashboard, Incentives Verification.

---

## 🔐 Authentication & Sign-up Flow

- **Intelligent Auto-Resolution Login**: Form input fields are optional for quick testing. Selecting a role from the login dropdown auto-resolves the user session via `components/AuthProvider.tsx`.
- **Library Role Security**: The "Library" role is non-registrable. There is only one global library credential. It is accessed by selecting "Library" directly from the login dropdown (and bypassing registration).
- **Registration Form**: 
  - The "Research Center" field is optional.
  - The label has been updated to remove any reference to "Department" (only "Research Center (Optional)" is shown).

---

## 🪙 Faculty Incentive Management Module

A custom frontend-only incentives workflow has been integrated. It utilizes `localStorage` via helper methods in `lib/mockIncentives.ts` to persist state across role switches and page reloads.

### 1. Categories & Fields
- **Publication Incentive**:
  - Details: Publication Title, Journal Name, Status (Accepted / Indexed, Published), DOI Link, Amount.
- **Patent Incentive**:
  - Details: Patent Title, Patent Number, Status (Filed, Published, Granted), Amount.
- **Registration Fee Reimbursement**:
  - Details: Event Name, Event Type (Conference, Workshop, FDP, Seminar), Amount.
- **Supporting Document**:
  - Faculty can upload an image file (Base64) as proof of application, which is stored and previewable system-wide.

### 2. Status Tracking & Approval Workflow
Applications proceed sequentially through the following statuses:
```
[Applied] -> Pending Library -> Pending Guide -> Pending Admin -> Pending Principal -> Approved -> Paid
```

- **Library Role (`/library/incentives`)**: Reviews applications with status `Pending Library`. Verifying forwards to `Pending Guide`. Rejecting sets status to `Rejected`.
- **Research Guide Role (`/research-guide/incentives`)**: Reviews applications with status `Pending Guide`. Approving forwards to `Pending Admin`. Rejecting sets status to `Rejected`.
- **Admin Role (`/admin/incentives`)**:
  - **Admin Verification tab**: Reviews `Pending Admin` applications. Approving forwards them to the Principal (`Pending Principal`).
  - **Principal tab**: A separate tab inside the Admin Incentives page specifically for the Principal role (who logs in using the Admin account). Approving sets status to `Approved`.
  - **Final Processing tab**: Displays `Approved` or `Paid` incentives. Allows marking approved items as `Paid` (which calculates toward the faculty's total received amount).
