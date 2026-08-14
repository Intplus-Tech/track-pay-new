    # Track-Pay API Reference

This is the frontend integration reference for Track-Pay API specification `1.0`, updated from the supplied Swagger document.

## Base URL and authentication

The OpenAPI document declares no server URL. Configure `NEXT_PUBLIC_API_BASE_URL` without a trailing slash and append the endpoint paths in this document.

Protected endpoints use the declared HTTP bearer scheme:

```http
Authorization: Bearer <accessToken>
```

The Swagger document applies an undeclared `bearer` security scheme to several authentication endpoints. `JWT-auth` is the only scheme defined in `components.securitySchemes`. Treat login, password recovery, and 2FA completion as unauthenticated flows; use a bearer token for `POST /auth/change-password` and `GET /auth/me`. Confirm the backend's intended enforcement before release.

## Conventions

- Request bodies are JSON unless the endpoint is explicitly `multipart/form-data`.
- Entity IDs are opaque strings. The document shows MongoDB ObjectId examples, although some endpoint text still refers to UUIDs.
- Monetary values are decimal strings, not JavaScript numbers.
- List endpoints use individual query parameters; the prior undocumented `filter` object is no longer used.
- `DELETE` responses with `204` have no body and represent soft deletion where stated.
- `PaginationResponseDto.limit` is described as the total number of pages even though the list query parameter is the page size. Preserve the raw value until the backend clarifies this inconsistency.

## Shared types

### Common entities

`Branch`, `User`, `Role`, `Permission`, and `Upload` expose `_id`, `isActive`, `isDeleted`, `createdAt`, `updatedAt`, and nullable `deletedAt` (declared as `object | null`).

### User

The backend user payload is based on `firstName`, `middleName`, and `lastName`. The app should derive the display name from those fields; the legacy `name` field is discontinued and should not be relied on. The payload also includes `employeeId`, `email`, `phoneNumber`, `twoFactorEnabled`, nullable `roleId`, nullable `branchId`, `availabilityStatus` (`ACTIVE` or `UNAVAILABLE`), `maxAssignedLoans`, `monthlyCollectionTarget`, `modulePermissions`, `photoUrl`, and nullable `photoUploadId`.

`modulePermissions` is an array of `{ module, view, manage }`, where `module` is one of `OVERVIEW`, `TRACKER`, `ACCOUNTS`, `LOAN_OFFICERS`, `TEAM`, or `SETTINGS`. `manage` implies `view`.

### Branch

`Branch` also requires `name`, `code`, `location`, `isHeadOffice`, nullable `managerId`, nullable `parentBranchId`, and `status` (`ACTIVE` or `CLOSED`).

### Upload

`Upload` additionally requires `originalName`, `mimeType`, `size`, `storageKey`, `storageDriver`, `url`, `purpose`, `status`, `checksum`, nullable `uploadedById`, nullable `branchId`, and nullable `processingResult`.

Upload purposes are `BULK_ACCOUNTS`, `RECONCILIATION_IMPORT`, `LOANEE_PHOTO`, `USER_AVATAR`, `KYC_DOCUMENT`, and `GENERAL`. Processing statuses are `AVAILABLE`, `PROCESSING`, `PROCESSED`, and `FAILED`.

## Request payloads

### Authentication

| Endpoint | Required JSON body |
| --- | --- |
| `POST /api/v1/auth/login` | `{ email, password }`; password minimum length `8` |
| `POST /api/v1/auth/forgot-password` | `{ email }` |
| `POST /api/v1/auth/reset-password` | `{ authUserId, newPassword, token }` |
| `POST /api/v1/auth/enable-2fa` | `{ authUserId, confirmEmail? }` |
| `POST /api/v1/auth/change-password` | `{ currentPassword, newPassword }` |
| `POST /api/v1/auth/2fa-login` | `{ authUserId, token }` |
| `POST /api/v1/auth/request-2fa-otp` | `{ authUserId }` |

Login returns either `{ accessToken, user }` or `{ twoFactorRequired, authUserId, message }`. The successful 2FA login response returns `{ accessToken, user }`. `enable-2fa` returns `{ twoFactorEnabled }` on `200`.

### Users and RBAC

`POST /api/v1/users` accepts `email` and `password` (both required), plus optional `firstName`, `middleName`, `lastName`, `employeeId`, `phoneNumber`, `roleId`, `roleName`, `branchId`, `modulePermissions`, `maxAssignedLoans`, `monthlyCollectionTarget`, `photoUploadId`, `isActive`, and `isDeleted`. The discontinued `name` field must not be sent. If `roleId` is omitted, `roleName` can create or select a role.

`PATCH /api/v1/users/{id}/permissions` requires `{ modulePermissions }`. `PATCH /api/v1/users/{id}/activate` and `/deactivate` accept optional `{ reason }`.

`CreateRoleDto` and `CreatePermissionDto` accept required `name` plus optional `description`, `isActive`, and `isDeleted`. Role assignment requires `{ permissionIds: string[] }`.

`UpdateUserDto`, `UpdateRoleDto`, and `UpdatePermissionDto` still define no writable fields. Do not send fields to these endpoints without backend confirmation.

### Branches

`POST /api/v1/branches` accepts `{ name, location?, isActive? }`. `PATCH /api/v1/branches/{id}/status` requires `{ status: "ACTIVE" | "CLOSED", reason? }`.

`UpdateBranchDto` has no defined properties; confirm the writable branch fields before using `PATCH /api/v1/branches/{id}`.

### Uploads and accounts

`POST /api/v1/uploads?purpose=<purpose>` is `multipart/form-data` with required binary field `file` and optional `purpose`. It returns an `Upload`. Upload a CSV before importing accounts or reconciliation data.

`POST /api/v1/accounts` requires `firstName`, `lastName`, `loanAmount`, `cycleStepAmount`, and `repaymentInterval` (`DAILY`, `WEEKLY`, `BIWEEKLY`, or `MONTHLY`). Optional fields are `loanId`, `middleName`, `email`, `phoneNumber`, `firstDueDate`, `loanOfficerId`, `branchId`, `tenureMonths`, `interestRate`, `interestType`, and `photoUploadId`. At least one of email or phone number is required by the endpoint description.

`POST /api/v1/accounts/bulk` requires `{ uploadId }` and optionally accepts `branchId`, `dryRun` (default `false`), and `continueOnError` (default `true`). It returns `{ uploadId, dryRun, totalRows, succeeded, failed, results }`; each result includes `row`, `success`, nullable `loanId`, nullable `portfolioId`, and nullable `error`.

### Loans and repayments

| Payload | Required fields | Optional fields |
| --- | --- | --- |
| `CreateLoaneeDto` | `loaneeNumber`, `firstName`, `lastName`, `email` | `middleName`, `phoneNumber`, `photoUrl` |
| `CreateLoanPortfolioDto` | `loaneeId`, `principal`, `tenureMonths`, `interestRate` | `status`, `interestType`, `loanOfficerId`, `nextDueDate` |
| `CreateLoanRepaymentDto` | `portfolioId`, `amount` | `currency` (default `NGN`), `paidAt`, `provider`, `providerReference` |
| Apply payment | `amount` | none |

Portfolio status values are `PENDING`, `APPROVED`, `REJECTED`, `PARTIAL`, `OVERDUE`, `ONTIME`, and `CLOSED`. Interest types are `FIXED`, `FLOAT`, and `REDUCING`. `UpdateLoanPortfolioDto` only defines optional `status`.

`UpdateLoaneeDto` has no defined properties; confirm it before using the loanee update endpoint.

### Loan officers and settings

`POST /api/v1/loan-officers` requires `{ firstName, lastName, email, password }` and accepts `employeeId`, `middleName`, `phoneNumber`, `branchId`, `maxAssignedLoans`, and `monthlyCollectionTarget`.

`POST /api/v1/loan-officers/{id}/reassign` requires `{ targetOfficerId, portfolioIds }` and accepts `reason`. `portfolioIds` must contain at least one item. `PATCH /api/v1/loan-officers/{id}/availability` requires `{ availabilityStatus }` and accepts `reason`.

`PUT /api/v1/settings/notifications/{branchId}` accepts any combination of `accountCreation`, `loanPaymentConfirmation`, `loanOverdueReminder`, and `all`; `all` takes precedence. `PATCH /api/v1/settings/notifications/report` requires `{ sendReport }`. Adding a report recipient requires `{ email }`.

### Reconciliation and Squad

`POST /api/v1/reconciliation/import/csv` requires `{ uploadId }` from an earlier `RECONCILIATION_IMPORT` upload and optionally accepts `provider` and three-character `currency`.

`POST /api/v1/integrations/squad/virtual-accounts` requires `{ name, email, reference }` and accepts `phone`. The Squad webhook is server-to-server only; never call it from the browser.

## Endpoint reference

Unless noted, endpoints in this section require `JWT-auth`.

### App and authentication

| Method | Path | Notes |
| --- | --- | --- |
| `GET` | `/` | Gateway homepage HTML; public |
| `GET` | `/api/v1/status` | Health status; public |
| `POST` | `/api/v1/auth/login` | Public credential login; `200` token or 2FA challenge, `401` invalid credentials |
| `POST` | `/api/v1/auth/forgot-password` | Public recovery request |
| `POST` | `/api/v1/auth/reset-password` | Public OTP password reset |
| `POST` | `/api/v1/auth/enable-2fa` | Toggle 2FA; response includes state |
| `POST` | `/api/v1/auth/change-password` | Change signed-in user's password; `400` reused password, `401` invalid current password |
| `GET` | `/api/v1/auth/me` | Current user with role, permissions, module grid, and branch |
| `POST` | `/api/v1/auth/2fa-login` | Complete a 2FA challenge |
| `POST` | `/api/v1/auth/request-2fa-otp` | Resend an OTP for the pending challenge |

### Users, roles, and permissions

| Method | Path | Notes |
| --- | --- | --- |
| `GET`, `POST` | `/api/v1/users` | Paginated directory / create user |
| `GET`, `PUT`, `DELETE` | `/api/v1/users/{id}` | User detail, update, soft delete |
| `PATCH` | `/api/v1/users/{id}/permissions` | Replace a user's module permission grid |
| `PATCH` | `/api/v1/users/{id}/deactivate` | Deactivate user; optional audit reason |
| `PATCH` | `/api/v1/users/{id}/activate` | Reinstate user; optional audit reason |
| `GET`, `POST` | `/api/v1/users/roles` | List or create/find a role |
| `PATCH`, `DELETE` | `/api/v1/users/roles/{id}` | Update or soft delete a role |
| `POST` | `/api/v1/users/roles/{roleId}/permissions` | Replace role permission IDs |
| `GET`, `POST` | `/api/v1/users/permissions` | List or create permissions |
| `PUT`, `DELETE` | `/api/v1/users/permissions/{id}` | Update or soft delete a permission |

`GET /api/v1/users` supports `total`, `page`, `limit`, `id`, `isActive`, `isDeleted`, `createdAt`, `updatedAt`, `deletedAt`, `name`, `email`, `roleId`, `branchId`, `search`, `employeeId`, and `order` (`ASC` or `DESC`).

### Branches, audit, and logs

| Method | Path | Notes |
| --- | --- | --- |
| `GET`, `POST` | `/api/v1/branches` | List or create branches |
| `GET`, `PATCH`, `DELETE` | `/api/v1/branches/{id}` | Detail, update, delete |
| `GET` | `/api/v1/branches/configuration` | Settings branch configuration table |
| `PATCH` | `/api/v1/branches/{id}/status` | Open or close a branch |
| `GET` | `/api/v1/audit-logs` | Paginated institutional audit trail |
| `GET` | `/api/v1/audit-logs/{entityType}/{entityId}` | Audit history for one entity |
| `GET` | `/api/v1/logs/{index}/search` | Search `error`, `http`, or `event` logs |

Audit-log filters are `total`, `page`, `limit`, `actorId`, `action`, `entityType`, `entityId`, `branchId`, `dateFrom`, `dateTo`, and `order` (default `DESC`). Log search accepts `service_name`, `action_name`, `type`, `user_id`, `from`, and `to`.

### Uploads, accounts, and exports

| Method | Path | Notes |
| --- | --- | --- |
| `POST`, `GET` | `/api/v1/uploads` | Multipart upload / paginated upload history |
| `GET`, `DELETE` | `/api/v1/uploads/{id}` | Upload metadata / delete stored upload |
| `GET` | `/api/v1/uploads/{id}/download` | Streams the original file |
| `GET`, `POST` | `/api/v1/accounts` | Paginated account directory / single-account creation |
| `POST` | `/api/v1/accounts/bulk` | Create accounts from prior CSV upload |
| `POST` | `/api/v1/accounts/{id}/retry-provisioning` | Retry failed virtual-account provisioning |
| `GET` | `/api/v1/exports/tracker` | Download filtered Tracker CSV |
| `GET` | `/api/v1/exports/accounts` | Download filtered accounts CSV |
| `GET` | `/api/v1/exports/loan-officers` | Download filtered loan-officers CSV |

Account filters are `total`, `page`, `limit`, `search`, `accountStatus` (`ACTIVE`, `PENDING`, `FAILED`), `branchId`, `loanOfficerId`, `dateFrom`, `dateTo`, and `order`. Upload filters are `total`, `page`, `limit`, `purpose`, `status`, `uploadedById`, `branchId`, and `order`.

### Loans, repayments, and schedules

| Method | Path | Notes |
| --- | --- | --- |
| `GET`, `POST` | `/api/v1/loan/loanees` | Paginated loanee directory / create loanee |
| `GET`, `PATCH`, `DELETE` | `/api/v1/loan/loanees/{id}` | Loanee detail, update, soft delete |
| `GET`, `POST` | `/api/v1/loan/portfolios` | Paginated portfolios / create portfolio |
| `GET`, `PATCH`, `DELETE` | `/api/v1/loan/portfolios/{id}` | Portfolio detail, update, soft delete |
| `GET` | `/api/v1/loan/portfolios/{id}/details` | Amounts, status, and payment history summary |
| `POST` | `/api/v1/loan/portfolios/{id}/apply-payment` | Apply a manual payment amount |
| `POST` | `/api/v1/loan/repayments` | Record a repayment as `RECEIVED` |
| `GET` | `/api/v1/loan/repayments/portfolio/{portfolioId}` | Repayments for a portfolio |
| `GET` | `/api/v1/loan/repayments/{id}` | One repayment |
| `PATCH` | `/api/v1/loan/repayments/{id}/apply` | Transition `RECEIVED` to `APPLIED` |
| `PATCH` | `/api/v1/loan/repayments/{id}/reverse` | Transition an applied repayment to `REVERSED` |
| `GET` | `/api/v1/loan/schedules/portfolio/{portfolioId}` | Complete instalment schedule |
| `GET` | `/api/v1/loan/schedules/portfolio/{portfolioId}/upcoming` | Upcoming unsettled instalments; `limit` defaults to `3` |
| `GET` | `/api/v1/loan/schedules/portfolio/{portfolioId}/summary` | Schedule counts, balances, next due, and overdue age |
| `POST` | `/api/v1/loan/schedules/refresh-overdue` | Mark overdue instalments; optional `branchId` |

Loanee filters are `total`, `page`, `limit`, `id`, `loaneeNumber`, `firstName`, `lastName`, `email`, `phoneNumber`, and `order`. Portfolio filters are `total`, `page`, `limit`, `id`, `loaneeId`, `loanId`, `accountNumber`, `status`, `loanOfficerId`, `branchId`, `search`, `dateFrom`, `dateTo`, and `order`.

### Loan officers and dashboard

| Method | Path | Notes |
| --- | --- | --- |
| `GET`, `POST` | `/api/v1/loan-officers` | Paginated officer directory / create officer |
| `GET` | `/api/v1/loan-officers/{id}/snapshot` | Capacity, collections, and problem-loan snapshot |
| `GET` | `/api/v1/loan-officers/{id}/loans` | Paginated book of assigned loans |
| `POST` | `/api/v1/loan-officers/{id}/reassign` | Reassign selected portfolios |
| `PATCH` | `/api/v1/loan-officers/{id}/availability` | Change officer availability |
| `GET` | `/api/v1/dashboard/overview` | KPI cards and recent loans |
| `GET` | `/api/v1/dashboard/performance-chart` | Twelve-month disbursed/collected series |
| `GET` | `/api/v1/dashboard/today` | Today's collection position |
| `GET` | `/api/v1/dashboard/search` | Loan and officer search; `q` is required |

Officer listing filters are `total`, `page`, `limit`, `search`, `branchId`, `availabilityStatus`, and `order`. Dashboard overview, chart, and today support `branchId`, `loanOfficerId`, and `recentLimit`; the chart additionally accepts `endDate`. Search accepts `q`, `type` (`all`, `loans`, `officers`), and `limit`.

### Reconciliation, Squad, and notification settings

| Method | Path | Notes |
| --- | --- | --- |
| `POST` | `/api/v1/integrations/squad/virtual-accounts` | Provision a Squad virtual account |
| `POST` | `/api/v1/integrations/squad/webhook` | Server-to-server Squad callback; HMAC header required |
| `POST` | `/api/v1/reconciliation/import/csv` | Create a run from a previous CSV upload |
| `GET` | `/api/v1/reconciliation/runs` | List reconciliation runs |
| `GET` | `/api/v1/reconciliation/runs/{id}` | Reconciliation run detail |
| `GET` | `/api/v1/reconciliation/runs/{id}/payments` | Payments for a run; optional match `status` |
| `POST` | `/api/v1/reconciliation/runs/{id}/match` | Match payments; optional `dryRun` |
| `GET` | `/api/v1/reconciliation/runs/{id}/summary` | Run counts and amounts |
| `GET` | `/api/v1/settings/notifications` | Per-branch SMS matrix; optional `branchId` |
| `PUT` | `/api/v1/settings/notifications/{branchId}` | Change one branch's SMS settings |
| `GET`, `PATCH` | `/api/v1/settings/notifications/report` | Read or toggle report delivery |
| `POST` | `/api/v1/settings/notifications/report/recipients` | Add report recipient |
| `DELETE` | `/api/v1/settings/notifications/report/recipients/{email}` | Remove report recipient |

Reconciliation payment statuses are `UNMATCHED`, `MATCHED`, `AMBIGUOUS`, `DUPLICATE`, and `ERROR`. A successful match response is `{ matchedCount, unmatchedCount, dryRun }`.

## Open questions

1. What is the production API base URL?
2. Which fields are accepted by `UpdateUserDto`, `UpdateRoleDto`, `UpdatePermissionDto`, `UpdateBranchDto`, and `UpdateLoaneeDto`?
3. Is the undeclared `bearer` security requirement on authentication routes intentional, and which authentication endpoints must actually have `JWT-auth` enforced?
4. Is `PaginationResponseDto.limit` a page size or a total-page count?
5. What exact JSON shapes are returned by list and detail endpoints whose Swagger responses only have a description?
6. Do `POST /api/v1/auth/enable-2fa`, `/2fa-login`, and `/request-2fa-otp` require a valid bearer token in production, or are they transition endpoints authenticated by their request bodies/pending login state?
