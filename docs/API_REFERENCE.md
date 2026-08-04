# Track-Pay API Reference

This document is the frontend integration reference for the Track-Pay API specification, version `1.0`. It records the API contract exactly where it is defined and explicitly calls out missing definitions so that implementation does not rely on guesses.

## Base URL and authentication

The supplied OpenAPI document declares no server URL. Configure the deployment origin in `NEXT_PUBLIC_API_BASE_URL` without a trailing slash, then append the paths in this document.

Protected endpoints use the declared `JWT-auth` HTTP bearer scheme:

```http
Authorization: Bearer <accessToken>
```

The specification applies an undeclared `bearer` scheme to authentication routes. Treat login and recovery routes as unauthenticated unless the backend gateway requires otherwise; confirm this before release.

## Conventions and gaps

- All request bodies are `application/json` unless noted otherwise.
- IDs are strings. The specification uses both UUID and MongoDB ObjectId examples, so clients must treat them as opaque strings.
- Fields marked **required** are required by the supplied schema.
- `DELETE` operations that return `204` are soft deletes with no response body.
- A response marked **not specified** has a status code and description in the OpenAPI document but no JSON body schema.
- `UpdateBranchDto`, `UpdateRoleDto`, `UpdatePermissionDto`, `UpdateUserDto`, and `UpdateLoaneeDto` contain no defined properties. Do not assume their writable fields without backend confirmation.
- CSV import is described as a file upload, but no `multipart/form-data` body or file field name is defined.

## Shared types

### Common entity fields

`Branch`, `User`, `Role`, and `Permission` include the following required fields:

| Field | Type | Notes |
| --- | --- | --- |
| `_id` | string | MongoDB ObjectId example |
| `isActive` | boolean | Active state |
| `isDeleted` | boolean | Soft-delete state |
| `createdAt` | string, date-time | Creation timestamp |
| `updatedAt` | string, date-time | Last update timestamp |
| `deletedAt` | object or `null` | Declared as nullable `object` in the specification |

### Branch

All common entity fields and the following fields are required:

| Field | Type | Nullable | Example |
| --- | --- | --- | --- |
| `name` | string | No | `Main Branch` |
| `code` | string | No | `MB-001` |
| `location` | string | No | `New York, USA` |
| `isHeadOffice` | boolean | No | `true` |
| `managerId` | string | Yes | MongoDB ObjectId |
| `parentBranchId` | string | Yes | MongoDB ObjectId |

### User

All common entity fields and the following fields are required:

| Field | Type | Nullable | Example |
| --- | --- | --- | --- |
| `name` | string | No | `John Doe` |
| `email` | string | No | `omatsolaseund@gmail.com` |
| `twoFactorEnabled` | boolean | No | `false` |
| `roleId` | string | Yes | MongoDB ObjectId |
| `branchId` | string | Yes | MongoDB ObjectId |

### Role

All common entity fields and the following fields are required:

| Field | Type | Example |
| --- | --- | --- |
| `name` | string | `ADMIN` |
| `description` | string | `Administrator role with full access` |
| `permissionIds` | string[] | MongoDB ObjectId values |

### Permission

All common entity fields and the following fields are required:

| Field | Type | Example |
| --- | --- | --- |
| `name` | string | `CREATE_USER` |
| `description` | string | `Allow creating new user accounts` |

### PaginationResponseDto

| Field | Type | Required | Constraints |
| --- | --- | --- | --- |
| `data` | array | Yes | Item type is not defined |
| `total` | number | Yes | Minimum `0` |
| `page` | number | Yes | Minimum `1` |
| `limit` | number | Yes | Described as total pages; example `10` |

## Request schemas

### CreateBranchDto

| Field | Type | Required |
| --- | --- | --- |
| `name` | string | Yes |
| `location` | string | No |
| `isActive` | boolean | No |

### CreateUserDto

| Field | Type | Required | Constraints |
| --- | --- | --- | --- |
| `name` | string | Yes | |
| `email` | string | Yes | Email format |
| `password` | string | Yes | Minimum length `8` |
| `roleId` | string | No | UUID format |
| `branchId` | string | No | |
| `isActive` | boolean | No | |
| `isDeleted` | boolean | No | |

### CreateRoleDto and CreatePermissionDto

| Field | Type | Required |
| --- | --- | --- |
| `name` | string | Yes |
| `description` | string | No |
| `isActive` | boolean | No |
| `isDeleted` | boolean | No |

### LoginDto

| Field | Type | Required | Constraints |
| --- | --- | --- | --- |
| `email` | string | Yes | Email format |
| `password` | string | Yes | Minimum length `8` |

### CreateLoaneeDto

| Field | Type | Required | Constraints |
| --- | --- | --- | --- |
| `loaneeNumber` | number | Yes | Minimum `1` |
| `firstName` | string | Yes | 1-255 characters |
| `lastName` | string | Yes | 1-255 characters |
| `middleName` | string | No | 0-255 characters |
| `email` | string | Yes | Email format |
| `phoneNumber` | string | No | 0-20 characters |
| `photoUrl` | string | No | URL is described but no `uri` format is declared |

### CreateLoanPortfolioDto

| Field | Type | Required | Values / default |
| --- | --- | --- | --- |
| `loaneeId` | string | Yes | UUID format |
| `principal` | string | Yes | Decimal represented as a string, example `50000.00` |
| `status` | string | No | `PENDING`, `APPROVED`, `REJECTED`, `PARTIAL`, `OVERDUE`, `ONTIME`; default `PENDING` |
| `tenureMonths` | number | Yes | Minimum `1` |
| `interestRate` | string | Yes | Example `5.5000` |
| `interestType` | string | No | `FIXED`, `FLOAT`, `REDUCING`; default `FIXED` |
| `loanOfficerId` | string | No | UUID format |
| `nextDueDate` | string | No | ISO timestamp example |

### CreateLoanRepaymentDto

| Field | Type | Required | Values / default |
| --- | --- | --- | --- |
| `portfolioId` | string | Yes | UUID format |
| `amount` | string | Yes | Decimal represented as a string, example `5000.00` |
| `currency` | string | No | 3 characters; default `NGN` |
| `paidAt` | string | No | ISO timestamp example |
| `provider` | string | No | Example `SQUAD` |
| `providerReference` | string | No | Example `TXN-ABC123` |

### CreateVirtualAccountDto

| Field | Type | Required | Constraints |
| --- | --- | --- | --- |
| `name` | string | Yes | |
| `email` | string | Yes | Email format |
| `phone` | string | No | |
| `reference` | string | Yes | |

### Filter schemas

`LoaneeFilterDto` accepts optional `id` (string), `loaneeNumber` (number, minimum `1`), `firstName` (string partial match), `lastName` (string partial match), `email` (email string), and `phoneNumber` (string).

`LoanPortfolioFilterDto` accepts optional `id` (UUID string), `loaneeId` (UUID string), `loanId` (string), `accountNumber` (string), `status` (`PENDING`, `APPROVED`, `REJECTED`, `PARTIAL`, `OVERDUE`, or `ONTIME`), and `loanOfficerId` (UUID string).

`UpdateLoanPortfolioDto` accepts optional `status` with the same six portfolio statuses. No other update DTO fields are specified.

## Endpoint reference

### App

#### `GET /`

Renders the gateway home page. No parameters, authorization, or response body schema are specified.

| Status | Response |
| --- | --- |
| `200` | HTML rendered successfully; body schema not specified |

#### `GET /api/v1/status`

Returns service health. No parameters, authorization, or response body schema are specified.

| Status | Response |
| --- | --- |
| `200` | Application is running; body schema not specified |

### Branches

#### `POST /api/v1/branches`

Authorization: `JWT-auth`. Request body: [CreateBranchDto](#createbranchdto).

| Status | Response |
| --- | --- |
| `201` | [Branch](#branch) |
| `403` | Missing admin role or create-branch permission |

#### `GET /api/v1/branches`

Authorization: `JWT-auth`. No parameters.

| Status | Response |
| --- | --- |
| `200` | `Branch[]` |

#### `GET /api/v1/branches/{id}`

Authorization: `JWT-auth`.

| Parameter | In | Required | Type |
| --- | --- | --- | --- |
| `id` | path | Yes | string |

| Status | Response |
| --- | --- |
| `200` | [Branch](#branch) |

#### `PATCH /api/v1/branches/{id}`

Authorization: `JWT-auth`. Path parameter `id` is a required string. Request body: `UpdateBranchDto` (object with no defined properties).

| Status | Response |
| --- | --- |
| `200` | [Branch](#branch) |
| `400` | Invalid input or missing authority |
| `403` | Missing administrative permission |
| `404` | Branch does not exist |
| `500` | Unexpected update error |

#### `DELETE /api/v1/branches/{id}`

Authorization: `JWT-auth`. Path parameter `id` is a required string.

| Status | Response |
| --- | --- |
| `200` | boolean |
| `400` | Deletion failed |

### Users and RBAC

#### `POST /api/v1/users`

Authorization: `JWT-auth`. Request body: [CreateUserDto](#createuserdto).

| Status | Response |
| --- | --- |
| `201` | [User](#user) |
| `403` | Missing administrator or HR manager permission |

#### `GET /api/v1/users`

Authorization: `JWT-auth`.

| Parameter | In | Required | Type / values |
| --- | --- | --- | --- |
| `total` | query | No | number, minimum `0` |
| `page` | query | No | number, minimum `1` |
| `limit` | query | No | number, minimum `1` |
| `id` | query | No | UUID string |
| `isActive` | query | No | boolean |
| `isDeleted` | query | No | boolean |
| `createdAt` | query | No | ISO date string |
| `updatedAt` | query | No | ISO date string |
| `deletedAt` | query | No | ISO date string |
| `name` | query | No | string |
| `email` | query | No | email string |
| `roleId` | query | No | UUID string |
| `branchId` | query | No | UUID string |
| `order` | query | No | `ASC` or `DESC`; default `ASC` |

| Status | Response |
| --- | --- |
| `200` | [PaginationResponseDto](#paginationresponsedto) |
| `403` | Missing view-user-list permission |
| `404` | Requesting user could not be verified |
| `500` | Database error |

#### `GET /api/v1/users/{id}`

Authorization: `JWT-auth`. Required path parameter: `id` (string).

| Status | Response |
| --- | --- |
| `200` | [User](#user) |

#### `PUT /api/v1/users/{id}`

Authorization: `JWT-auth`. Required path parameter: `id` (string). Request body: `UpdateUserDto` (object with no defined properties).

| Status | Response |
| --- | --- |
| `200` | [User](#user) |
| `403` | Cannot update this user |

#### `DELETE /api/v1/users/{id}`

Authorization: `JWT-auth`. Required path parameter: `id` (string).

| Status | Response |
| --- | --- |
| `204` | User soft-deleted; no body |

#### Roles

| Method and path | Request | Success response |
| --- | --- | --- |
| `GET /api/v1/users/roles` | No parameters | `200` `Role[]` |
| `POST /api/v1/users/roles` | [CreateRoleDto](#createroledto-and-createpermissiondto) | `201` [Role](#role) |
| `PATCH /api/v1/users/roles/{id}` | Required string `id`; `UpdateRoleDto` has no defined properties | `200` [Role](#role) |
| `DELETE /api/v1/users/roles/{id}` | Required string `id` | `204` no body |
| `POST /api/v1/users/roles/{roleId}/permissions` | Required string `roleId`; JSON `{ "permissionIds": string[] }`, `permissionIds` required | `200` or `201` [Role](#role) |

All role endpoints require `JWT-auth`.

#### Permissions

| Method and path | Request | Success response |
| --- | --- | --- |
| `GET /api/v1/users/permissions` | No parameters | `200` `Permission[]` |
| `POST /api/v1/users/permissions` | [CreatePermissionDto](#createroledto-and-createpermissiondto) | `201` [Permission](#permission) |
| `PUT /api/v1/users/permissions/{id}` | Required string `id`; `UpdatePermissionDto` has no defined properties | `200` [Permission](#permission) |
| `DELETE /api/v1/users/permissions/{id}` | Required string `id` | `204` no body |

All permission endpoints require `JWT-auth`.

### Authentication

The document references the undeclared `bearer` security scheme for every authentication endpoint.

#### `POST /api/v1/auth/login`

Request body: [LoginDto](#logindto).

| Status | Response |
| --- | --- |
| `200` | Either `{ accessToken: string, user: { id: string, email: string, name: string, twoFactorEnabled: boolean } }` or `{ twoFactorRequired: boolean, authUserId: string, message: string }` |
| `401` | Invalid email or password |

#### Recovery and 2FA

| Method and path | Required JSON body | Success response | Other responses |
| --- | --- | --- | --- |
| `POST /api/v1/auth/forgot-password` | `{ email: string }` | `200` or `201`; body not specified | |
| `POST /api/v1/auth/reset-password` | `{ authUserId: string, newPassword: string, token: string }` | `200` or `201`; body not specified | |
| `POST /api/v1/auth/enable-2fa` | `{ authUserId: string }` | `200` or `201`; body not specified | |
| `POST /api/v1/auth/2fa-login` | `{ authUserId: string, token: string }` | `200` `{ accessToken, user: { id, email, name, twoFactorEnabled } }`; `201` unspecified object | |
| `POST /api/v1/auth/request-2fa-otp` | `{ authUserId: string }` | `200` or `201`; body not specified | `400` bad request |

### Logs

#### `GET /api/v1/logs/{index}/search`

Authorization: `JWT-auth`.

| Parameter | In | Required | Type / values |
| --- | --- | --- | --- |
| `index` | path | Yes | string; intended values `error`, `http`, `event` |
| `service_name` | query | No | string |
| `action_name` | query | No | string |
| `type` | query | No | `http`, `event`, or `error` |
| `user_id` | query | No | string |
| `from` | query | No | ISO 8601 date-time |
| `to` | query | No | ISO 8601 date-time |

| Status | Response |
| --- | --- |
| `200` | `{ total: number, logs: Array<{ service_name: string, action_name: string, date: string, payload: string, response: string }> }` |
| `403` | Missing JWT authorization |

### Loan - Loanees

#### `POST /api/v1/loan/loanees`

Authorization: `JWT-auth`. Request body: [CreateLoaneeDto](#createloaneedto).

| Status | Response |
| --- | --- |
| `201` | Body not specified |

#### `GET /api/v1/loan/loanees`

Authorization: `JWT-auth`.

| Parameter | In | Required | Type / values |
| --- | --- | --- | --- |
| `total` | query | No | number, minimum `0` |
| `page` | query | No | number, minimum `1` |
| `limit` | query | No | number, minimum `1` |
| `filter` | query | Yes | [LoaneeFilterDto](#filter-schemas) object serialization is not defined |
| `order` | query | Yes | string; description specifies `ASC` or `DESC` |

| Status | Response |
| --- | --- |
| `200` | Body not specified |

#### Loanee by ID

All routes below require `JWT-auth` and a required string path parameter `id`.

| Method and path | Request | Responses |
| --- | --- | --- |
| `GET /api/v1/loan/loanees/{id}` | None | `200` body not specified; `404` not found |
| `PATCH /api/v1/loan/loanees/{id}` | `UpdateLoaneeDto` with no defined properties | `200` body not specified |
| `DELETE /api/v1/loan/loanees/{id}` | None | `204` no body |

### Loan - Portfolios

#### `POST /api/v1/loan/portfolios`

Authorization: `JWT-auth`. Request body: [CreateLoanPortfolioDto](#createloanportfoliodto).

| Status | Response |
| --- | --- |
| `201` | Body not specified |

#### `GET /api/v1/loan/portfolios`

Authorization: `JWT-auth`.

| Parameter | In | Required | Type / values |
| --- | --- | --- | --- |
| `total` | query | No | number, minimum `0` |
| `page` | query | No | number, minimum `1` |
| `limit` | query | No | number, minimum `1` |
| `filter` | query | Yes | [LoanPortfolioFilterDto](#filter-schemas) object serialization is not defined |
| `order` | query | Yes | string |

| Status | Response |
| --- | --- |
| `200` | Body not specified |

#### Portfolio by ID and payment

All routes below require `JWT-auth` and a required string path parameter `id`.

| Method and path | Request | Responses |
| --- | --- | --- |
| `GET /api/v1/loan/portfolios/{id}` | None | `200` body not specified |
| `PATCH /api/v1/loan/portfolios/{id}` | [UpdateLoanPortfolioDto](#filter-schemas) | `200` body not specified |
| `DELETE /api/v1/loan/portfolios/{id}` | None | `204` no body |
| `POST /api/v1/loan/portfolios/{id}/apply-payment` | `{ amount: string }`, required; example `10000.00` | `201` body not specified |

### Loan - Repayments

#### `POST /api/v1/loan/repayments`

Authorization: `JWT-auth`. Request body: [CreateLoanRepaymentDto](#createloanrepaymentdto).

| Status | Response |
| --- | --- |
| `201` | Body not specified; created repayment begins in `RECEIVED` status |

#### Repayment lookup and state changes

All routes below require `JWT-auth`.

| Method and path | Required path parameter | Request | Responses |
| --- | --- | --- | --- |
| `GET /api/v1/loan/repayments/portfolio/{portfolioId}` | `portfolioId`: string | None | `200` body not specified |
| `GET /api/v1/loan/repayments/{id}` | `id`: string | None | `200` body not specified |
| `PATCH /api/v1/loan/repayments/{id}/apply` | `id`: string | None | `200` body not specified; changes `RECEIVED` to `APPLIED` and lowers balances |
| `PATCH /api/v1/loan/repayments/{id}/reverse` | `id`: string | None | `200` body not specified; changes payment to `REVERSED` and restores balances |

### Reconciliation

#### `POST /api/v1/reconciliation/import/csv`

Authorization: `JWT-auth`. Described as a CSV file upload, but the request content type and field name are not specified.

| Parameter | In | Required | Type / constraints |
| --- | --- | --- | --- |
| `provider` | query | No | string, example `SQUAD` |
| `currency` | query | No | 3-character string, example `NGN` |

| Status | Response |
| --- | --- |
| `201` | `{ success: boolean, message: string, runId: string, paymentsCount: number }` |

#### Runs

All routes require `JWT-auth`.

| Method and path | Parameters | Success response |
| --- | --- | --- |
| `GET /api/v1/reconciliation/runs` | None | `200` body not specified |
| `GET /api/v1/reconciliation/runs/{id}` | Required string path `id` | `200` body not specified |
| `GET /api/v1/reconciliation/runs/{id}/payments` | Required string path `id`; optional query `status`: `UNMATCHED`, `MATCHED`, `AMBIGUOUS`, `DUPLICATE`, `ERROR` | `200` body not specified |
| `POST /api/v1/reconciliation/runs/{id}/match` | Required string path `id`; optional boolean query `dryRun`, default `false` | `200` `{ matchedCount: number, unmatchedCount: number, dryRun: boolean }`; `201` body not specified |
| `GET /api/v1/reconciliation/runs/{id}/summary` | Required string path `id` | `200` `{ runId: string, totalPayments: number, matched: number, unmatched: number, duplicates: number, ambiguous: number, errors: number, totalAmount: string, matchedAmount: string }` |

### Integrations - Squad

#### `POST /api/v1/integrations/squad/virtual-accounts`

Authorization: `JWT-auth`. Request body: [CreateVirtualAccountDto](#createvirtualaccountdto).

| Status | Response |
| --- | --- |
| `201` | `{ success: boolean, message: string, data: { account_number: string, bank_name: string, account_name: string, contract_code: string } }` |

#### `POST /api/v1/integrations/squad/webhook`

This is a server-to-server callback endpoint. Do not call it from the browser. The OpenAPI document applies `JWT-auth`, although the description says it validates Squad HMAC-SHA512 data.

| Parameter | In | Required | Type |
| --- | --- | --- | --- |
| `x-squad-encrypted-body` | header | Yes | string |

| Status | Response |
| --- | --- |
| `200` | `{ received: boolean, processed: boolean, reference: string }` |
| `400` | Missing signature header or raw request body |
| `401` | Signature validation failed |

## Implementation questions to resolve

1. What is the production API base URL?
2. Which fields are accepted by each empty update DTO?
3. How are `filter` objects encoded in loan-list query strings?
4. What request content type and form field name does CSV import require?
5. What body shapes do endpoints marked as unspecified return?
6. Are authentication endpoints deliberately protected, and should their security scheme be `JWT-auth` or removed?