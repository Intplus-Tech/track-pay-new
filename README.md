## Track-Pay Frontend

Track-Pay is a Next.js dashboard for managing branches, users, loan portfolios, repayments, and payment reconciliation.

For the complete endpoint, parameter, request, response, and schema contract, see [docs/API_REFERENCE.md](docs/API_REFERENCE.md).

## Run locally

Install dependencies and start the application:

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

Create `.env.local` before connecting the UI to the backend:

```env
NEXT_PUBLIC_API_BASE_URL=https://api.example.com
```

The API specification does not provide a server URL. Set this value to the deployment's origin without a trailing slash. API routes below already include the `/api/v1` prefix.

## API integration

The backend uses JSON request bodies unless an endpoint explicitly accepts a file upload. Protected endpoints require the access token returned by login:

```ts
const response = await fetch(
	`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/users`,
	{
		headers: {
			Authorization: `Bearer ${accessToken}`,
		},
	},
);
```

Do not expose long-lived credentials or provider secrets through `NEXT_PUBLIC_*` variables. Prefer an HTTP-only session cookie or a server-side proxy for production token storage.

### Authentication flow

1. Submit `{ email, password }` to `POST /api/v1/auth/login`.
2. A normal response returns `accessToken` and `user`. Store the token using the application's chosen secure session strategy, then enter the dashboard.
3. When the response includes `twoFactorRequired: true`, retain `authUserId` only for the pending verification flow. Submit `{ authUserId, token }` to `POST /api/v1/auth/2fa-login`.
4. To resend the verification code, submit `{ authUserId }` to `POST /api/v1/auth/request-2fa-otp`.
5. For password recovery, submit `{ email }` to `POST /api/v1/auth/forgot-password`; then submit `{ authUserId, newPassword, token }` to `POST /api/v1/auth/reset-password`.

The current authentication forms are present in [app/(AUTH)/_components](app/(AUTH)/_components), but their submit handlers are placeholders. The login flow should route a 2FA-required response to the verification screen and pass the returned `authUserId`; the reset flow must similarly retain the recovery `authUserId` supplied by the backend's recovery process.

### Authentication endpoints

| Method | Path | Request body | Successful result |
| --- | --- | --- | --- |
| `POST` | `/api/v1/auth/login` | `email`, `password` | `accessToken` and user, or `twoFactorRequired` with `authUserId` |
| `POST` | `/api/v1/auth/forgot-password` | `email` | Reset verification message |
| `POST` | `/api/v1/auth/reset-password` | `authUserId`, `newPassword`, `token` | Password updated |
| `POST` | `/api/v1/auth/enable-2fa` | `authUserId` | 2FA setting updated |
| `POST` | `/api/v1/auth/2fa-login` | `authUserId`, `token` | `accessToken` and user |
| `POST` | `/api/v1/auth/request-2fa-otp` | `authUserId` | OTP resent |

## Endpoint reference

All endpoints in this section require `Authorization: Bearer <accessToken>` unless noted otherwise.

### System and branches

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/` | Render the application gateway home page. |
| `GET` | `/api/v1/status` | Service health status. |
| `GET` | `/api/v1/branches` | List branches. |
| `POST` | `/api/v1/branches` | Create a branch. Required: `name`; optional: `location`, `isActive`. |
| `GET` | `/api/v1/branches/{id}` | Get a branch. |
| `PATCH` | `/api/v1/branches/{id}` | Update a branch. |
| `DELETE` | `/api/v1/branches/{id}` | Delete a branch. |

### Users and RBAC

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/api/v1/users` | Paginated users. Supports `page`, `limit`, `name`, `email`, `roleId`, `branchId`, `isActive`, `isDeleted`, and `order`. |
| `POST` | `/api/v1/users` | Create user. Required: `name`, `email`, `password`; optional: `roleId`, `branchId`, `isActive`, `isDeleted`. |
| `GET` | `/api/v1/users/{id}` | Get a user and their role/branch details. |
| `PUT` | `/api/v1/users/{id}` | Update a user. |
| `DELETE` | `/api/v1/users/{id}` | Soft-delete a user. |
| `GET` | `/api/v1/users/roles` | List roles. |
| `POST` | `/api/v1/users/roles` | Create or retrieve a role. Required: `name`; optional: `description`, `isActive`, `isDeleted`. |
| `PATCH` | `/api/v1/users/roles/{id}` | Update a role. |
| `DELETE` | `/api/v1/users/roles/{id}` | Soft-delete a role. |
| `POST` | `/api/v1/users/roles/{roleId}/permissions` | Replace a role's permissions with `{ permissionIds: string[] }`. |
| `GET` | `/api/v1/users/permissions` | List permissions. |
| `POST` | `/api/v1/users/permissions` | Create permission. Required: `name`; optional: `description`, `isActive`, `isDeleted`. |
| `PUT` | `/api/v1/users/permissions/{id}` | Update a permission. |
| `DELETE` | `/api/v1/users/permissions/{id}` | Soft-delete a permission. |

### Loans and repayments

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` / `POST` | `/api/v1/loan/loanees` | List loanees or create one. Creation requires `loaneeNumber`, `firstName`, `lastName`, and `email`. |
| `GET` / `PATCH` / `DELETE` | `/api/v1/loan/loanees/{id}` | Retrieve, update, or soft-delete a loanee. |
| `GET` / `POST` | `/api/v1/loan/portfolios` | List portfolios or create one. Creation requires `loaneeId`, `principal`, `tenureMonths`, and `interestRate`. |
| `GET` / `PATCH` / `DELETE` | `/api/v1/loan/portfolios/{id}` | Retrieve, update, or soft-delete a portfolio. |
| `POST` | `/api/v1/loan/portfolios/{id}/apply-payment` | Apply `{ amount }` directly to a portfolio. |
| `POST` | `/api/v1/loan/repayments` | Record repayment. Required: `portfolioId`, `amount`; optional: `currency`, `paidAt`, `provider`, `providerReference`. |
| `GET` | `/api/v1/loan/repayments/portfolio/{portfolioId}` | List repayments for a portfolio. |
| `GET` | `/api/v1/loan/repayments/{id}` | Get one repayment. |
| `PATCH` | `/api/v1/loan/repayments/{id}/apply` | Change a received repayment to applied and update balances. |
| `PATCH` | `/api/v1/loan/repayments/{id}/reverse` | Reverse an applied repayment and restore balances. |

Portfolio statuses are `PENDING`, `APPROVED`, `REJECTED`, `PARTIAL`, `OVERDUE`, and `ONTIME`. Interest types are `FIXED`, `FLOAT`, and `REDUCING`. List endpoints accept pagination through `page` and `limit`; loan lists also accept a `filter` object and `order` according to the OpenAPI specification.

### Reconciliation and integrations

| Method | Path | Purpose |
| --- | --- | --- |
| `POST` | `/api/v1/reconciliation/import/csv` | Import transactions from CSV. Optional query parameters: `provider`, `currency`. Returns `runId` and `paymentsCount`. |
| `GET` | `/api/v1/reconciliation/runs` | List reconciliation runs. |
| `GET` | `/api/v1/reconciliation/runs/{id}` | Get a reconciliation run. |
| `GET` | `/api/v1/reconciliation/runs/{id}/payments` | List payments in a run; optional `status`: `UNMATCHED`, `MATCHED`, `AMBIGUOUS`, `DUPLICATE`, or `ERROR`. |
| `POST` | `/api/v1/reconciliation/runs/{id}/match` | Match payments. Optional `dryRun=true` calculates results without persisting them. |
| `GET` | `/api/v1/reconciliation/runs/{id}/summary` | Get counts, amounts, and match results for a run. |
| `POST` | `/api/v1/integrations/squad/virtual-accounts` | Create a Squad virtual account. Required: `name`, `email`, `reference`; optional: `phone`. |
| `POST` | `/api/v1/integrations/squad/webhook` | Squad callback endpoint; validates `x-squad-encrypted-body`. This endpoint is intended for Squad, not the browser. |

CSV import is specified as an upload endpoint, but the supplied OpenAPI document does not declare the multipart field name. Confirm that contract with the backend before implementing `FormData` submission.

### Logs

`GET /api/v1/logs/{index}/search` searches the `error`, `http`, or `event` log collection. It accepts optional `service_name`, `action_name`, `type`, `user_id`, `from`, and `to` query parameters. Use ISO 8601 timestamps for `from` and `to`.

## Response behavior and data conventions

- IDs are represented as strings; the specification uses both UUID-style IDs and MongoDB ObjectId examples. Treat them as opaque strings in the client.
- User lists return `PaginationResponseDto`: `data`, `total`, `page`, and `limit`.
- `DELETE` endpoints for users, roles, permissions, loanees, and portfolios are soft deletes and commonly return `204 No Content`.
- Branch deletion returns a boolean response body.
- Handle `400` as invalid input, `401` as failed authentication, `403` as insufficient permission, and `404` as a missing resource where specified.
- The OpenAPI document lists bearer security on some public authentication routes. The intended client flow is to call login, password recovery, reset, 2FA login, and OTP resend without an existing access token; confirm any gateway-specific requirement with the backend team.

## Build

```bash
npm run build
```

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
