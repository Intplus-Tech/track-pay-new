
window.onload = function() {
  // Build a system
  let url = window.location.search.match(/url=([^&]+)/);
  if (url && url.length > 1) {
    url = decodeURIComponent(url[1]);
  } else {
    url = window.location.origin;
  }
  let options = {
  "swaggerDoc": {
    "openapi": "3.0.0",
    "paths": {
      "/": {
        "get": {
          "description": "Renders and returns the application's landing/gateway homepage HTML. Serves as the primary user-facing root entrypoint containing branding, status indications, and active documentation links.",
          "operationId": "AppController_getHome",
          "parameters": [],
          "responses": {
            "200": {
              "description": "Sleek application homepage HTML rendered successfully."
            }
          },
          "summary": "Render home page",
          "tags": [
            "App"
          ]
        }
      },
      "/api/v1/status": {
        "get": {
          "description": "Checks and returns the current operational status of the service API. Primarily used as a light-weight health check in deployment and orchestration pipelines.",
          "operationId": "AppController_getHello",
          "parameters": [],
          "responses": {
            "200": {
              "description": "Application is running correctly."
            }
          },
          "summary": "Get application status",
          "tags": [
            "App"
          ]
        }
      },
      "/api/v1/audit-logs": {
        "get": {
          "description": "Retrieves the institutional activity log: who performed which action, on which entity, when, and with what justification. Supports filtering by actor, action, entity type, entity id, branch and date range. Backs the \"View Full Logs\" link on branch detail and the compliance review of sensitive actions such as loan reassignment and account suspension.",
          "operationId": "AuditController_findAll",
          "parameters": [
            {
              "name": "total",
              "required": false,
              "in": "query",
              "description": "The total number of items",
              "schema": {
                "minimum": 0,
                "example": 100,
                "type": "number"
              }
            },
            {
              "name": "page",
              "required": false,
              "in": "query",
              "description": "The current page number",
              "schema": {
                "minimum": 1,
                "example": 1,
                "type": "number"
              }
            },
            {
              "name": "limit",
              "required": false,
              "in": "query",
              "description": "The number of items per page",
              "schema": {
                "minimum": 1,
                "example": 10,
                "type": "number"
              }
            },
            {
              "name": "actorId",
              "required": false,
              "in": "query",
              "description": "Filter by the user who performed the action",
              "schema": {
                "example": "60d5ec4b8f3a3f3b9c8b4567",
                "type": "string"
              }
            },
            {
              "name": "action",
              "required": false,
              "in": "query",
              "description": "Filter by action",
              "schema": {
                "type": "string",
                "enum": [
                  "CREATED",
                  "UPDATED",
                  "DELETED",
                  "ACTIVATED",
                  "DEACTIVATED",
                  "SUSPENDED",
                  "LOGGED_IN",
                  "LOGGED_OUT",
                  "PASSWORD_CHANGED",
                  "PASSWORD_RESET",
                  "TWO_FA_ENABLED",
                  "TWO_FA_DISABLED",
                  "ACCOUNT_CREATED",
                  "BULK_ACCOUNTS_CREATED",
                  "VIRTUAL_ACCOUNT_PROVISIONED",
                  "LOANS_REASSIGNED",
                  "OFFICER_AVAILABILITY_CHANGED",
                  "PERMISSIONS_CHANGED",
                  "MANAGER_ASSIGNED",
                  "MANAGER_UNASSIGNED",
                  "REPAYMENT_RECORDED",
                  "REPAYMENT_APPLIED",
                  "REPAYMENT_REVERSED",
                  "FILE_UPLOADED",
                  "FILE_PROCESSED",
                  "FILE_DELETED",
                  "EXPORTED"
                ]
              }
            },
            {
              "name": "entityType",
              "required": false,
              "in": "query",
              "description": "Filter by entity family",
              "schema": {
                "type": "string",
                "enum": [
                  "USER",
                  "ROLE",
                  "PERMISSION",
                  "BRANCH",
                  "LOANEE",
                  "LOAN_PORTFOLIO",
                  "LOAN_REPAYMENT",
                  "LOAN_INSTALLMENT",
                  "UPLOAD",
                  "NOTIFICATION_SETTING",
                  "RECONCILIATION_RUN",
                  "AUTH"
                ]
              }
            },
            {
              "name": "entityId",
              "required": false,
              "in": "query",
              "description": "Filter to a single affected entity",
              "schema": {
                "example": "60d5ec4b8f3a3f3b9c8b4567",
                "type": "string"
              }
            },
            {
              "name": "branchId",
              "required": false,
              "in": "query",
              "description": "Filter to a single branch",
              "schema": {
                "example": "60d5ec4b8f3a3f3b9c8b4567",
                "type": "string"
              }
            },
            {
              "name": "dateFrom",
              "required": false,
              "in": "query",
              "description": "Only include entries recorded on or after this instant",
              "schema": {
                "format": "date-time",
                "example": "2026-08-01T00:00:00.000Z",
                "type": "string"
              }
            },
            {
              "name": "dateTo",
              "required": false,
              "in": "query",
              "description": "Only include entries recorded on or before this instant",
              "schema": {
                "format": "date-time",
                "example": "2026-08-31T23:59:59.999Z",
                "type": "string"
              }
            },
            {
              "name": "order",
              "required": false,
              "in": "query",
              "description": "Sort order by record date",
              "schema": {
                "default": "DESC",
                "type": "string",
                "enum": [
                  "ASC",
                  "DESC"
                ]
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Audit entries retrieved successfully."
            },
            "403": {
              "description": "Forbidden - Lacking view audit logs permission."
            }
          },
          "security": [
            {
              "JWT-auth": []
            }
          ],
          "summary": "List audit trail entries (paginated)",
          "tags": [
            "Audit Trail"
          ]
        }
      },
      "/api/v1/audit-logs/{entityType}/{entityId}": {
        "get": {
          "description": "Retrieves the most recent audit entries recorded against a single entity, newest first. Used by detail views that show a per-record history.",
          "operationId": "AuditController_findForEntity",
          "parameters": [
            {
              "name": "entityType",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "entityId",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Entity audit trail retrieved successfully."
            }
          },
          "security": [
            {
              "JWT-auth": []
            }
          ],
          "summary": "Get the full audit trail for one entity",
          "tags": [
            "Audit Trail"
          ]
        }
      },
      "/api/v1/auth/login": {
        "post": {
          "description": "Validates email/password credentials. If Multi-Factor Authentication (2FA) is enabled, returns a instruction response containing the user ID, indicating that the client must prompt for 2FA and call `/2fa-login`. Otherwise, returns a JWT token directly.",
          "operationId": "AuthController_login",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/LoginDto"
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "Successful credentials validation. Returns JWT tokens or details 2FA requirement.",
              "content": {
                "application/json": {
                  "schema": {
                    "anyOf": [
                      {
                        "properties": {
                          "accessToken": {
                            "type": "string",
                            "example": "eyJhbGciOiJIUzI1NiIsIn..."
                          },
                          "user": {
                            "type": "object",
                            "properties": {
                              "id": {
                                "type": "string",
                                "example": "550e8400-e29b-41d4-a716-446655440000"
                              },
                              "email": {
                                "type": "string",
                                "example": "omatsolaseund@gmail.com"
                              },
                              "fullName": {
                                "type": "string",
                                "example": "John Doe"
                              },
                              "twoFactorEnabled": {
                                "type": "boolean",
                                "example": false
                              }
                            }
                          }
                        }
                      },
                      {
                        "properties": {
                          "twoFactorRequired": {
                            "type": "boolean",
                            "example": true
                          },
                          "authUserId": {
                            "type": "string",
                            "example": "550e8400-e29b-41d4-a716-446655440000"
                          },
                          "message": {
                            "type": "string",
                            "example": "Two-factor authentication is required"
                          }
                        }
                      }
                    ]
                  }
                }
              }
            },
            "401": {
              "description": "Unauthorized - Invalid email or password."
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "Log in a user",
          "tags": [
            "Authentication"
          ]
        }
      },
      "/api/v1/auth/forgot-password": {
        "post": {
          "description": "Triggers the password recovery workflow. Sends an OTP token or link to the user's registered email address if it exists in the system.",
          "operationId": "AuthController_forgotPassword",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "email"
                  ],
                  "properties": {
                    "email": {
                      "type": "string",
                      "example": "omatsolaseund@gmail.com"
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "Reset verification email dispatched."
            },
            "201": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "Request a password reset",
          "tags": [
            "Authentication"
          ]
        }
      },
      "/api/v1/auth/reset-password": {
        "post": {
          "description": "Validates the password recovery OTP token received by the user and sets the new password, completing the password recovery workflow.",
          "operationId": "AuthController_resetPassword",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "authUserId",
                    "newPassword",
                    "token"
                  ],
                  "properties": {
                    "authUserId": {
                      "type": "string",
                      "example": "550e8400-e29b-41d4-a716-446655440000"
                    },
                    "newPassword": {
                      "type": "string",
                      "example": "newSecurePassword123!"
                    },
                    "token": {
                      "type": "string",
                      "example": "123456"
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "Password reset and updated successfully."
            },
            "201": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "Reset a user password",
          "tags": [
            "Authentication"
          ]
        }
      },
      "/api/v1/auth/enable-2fa": {
        "post": {
          "description": "Flips 2FA on or off for the given account. The Settings → 2 Factor Authentication panel confirms the change by asking the user to retype their email address: pass it as `confirmEmail` and the toggle is rejected unless it matches the account. The change is written to the audit trail either way.",
          "operationId": "AuthController_enableTwoFactorAuth",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "authUserId"
                  ],
                  "properties": {
                    "authUserId": {
                      "type": "string",
                      "example": "550e8400-e29b-41d4-a716-446655440000"
                    },
                    "confirmEmail": {
                      "type": "string",
                      "example": "omatsolaseund@gmail.com",
                      "description": "Optional confirmation of the account email, as collected by the 2FA confirmation modal."
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "Two-factor configuration toggled. The resulting state is returned.",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "twoFactorEnabled": {
                        "type": "boolean",
                        "example": true
                      }
                    }
                  }
                }
              }
            },
            "201": {
              "description": ""
            },
            "401": {
              "description": "Unauthorized - The confirmation email does not match the account."
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "Toggle two-factor authentication",
          "tags": [
            "Authentication"
          ]
        }
      },
      "/api/v1/auth/change-password": {
        "post": {
          "description": "Backs the Settings → Update Password form. Unlike `/reset-password`, which is the forgotten-password flow and proves identity with an emailed OTP, this proves it with the current password. The new password is rejected if it matches the current one or any previously used password; the old hash is archived and a confirmation email is sent. The change is audited.",
          "operationId": "AuthController_changePassword",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "currentPassword",
                    "newPassword"
                  ],
                  "properties": {
                    "currentPassword": {
                      "type": "string",
                      "example": "MyOldPassw0rd!"
                    },
                    "newPassword": {
                      "type": "string",
                      "example": "MyNewPassw0rd!"
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "Password changed successfully."
            },
            "400": {
              "description": "Bad Request - The new password matches the current one or a previously used password."
            },
            "401": {
              "description": "Unauthorized - The current password is incorrect."
            }
          },
          "security": [
            {
              "bearer": []
            },
            {
              "JWT-auth": []
            }
          ],
          "summary": "Change your own password",
          "tags": [
            "Authentication"
          ]
        }
      },
      "/api/v1/auth/me": {
        "get": {
          "description": "Returns the current user with their role, permissions, per-module access grid and branch resolved. Called on app load to decide which navigation items and actions to render.",
          "operationId": "AuthController_me",
          "parameters": [],
          "responses": {
            "200": {
              "description": "Current user retrieved successfully.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/User"
                  }
                }
              }
            },
            "401": {
              "description": "Unauthorized - No valid token supplied."
            }
          },
          "security": [
            {
              "bearer": []
            },
            {
              "JWT-auth": []
            }
          ],
          "summary": "Get the signed-in user",
          "tags": [
            "Authentication"
          ]
        }
      },
      "/api/v1/auth/2fa-login": {
        "post": {
          "description": "Processes the second phase of 2FA login. Verifies the sent OTP token against the pending session, and generates authorization JWT tokens upon success.",
          "operationId": "AuthController_loginWithTwoFactorAuth",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "authUserId",
                    "token"
                  ],
                  "properties": {
                    "authUserId": {
                      "type": "string",
                      "example": "550e8400-e29b-41d4-a716-446655440000"
                    },
                    "token": {
                      "type": "string",
                      "example": "123456"
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "Logged in successfully via 2FA.",
              "content": {
                "application/json": {
                  "schema": {
                    "properties": {
                      "accessToken": {
                        "type": "string",
                        "example": "eyJhbGciOiJIUzI1NiIsIn..."
                      },
                      "user": {
                        "type": "object",
                        "properties": {
                          "id": {
                            "type": "string",
                            "example": "550e8400-e29b-41d4-a716-446655440000"
                          },
                          "email": {
                            "type": "string",
                            "example": "omatsolaseund@gmail.com"
                          },
                          "fullName": {
                            "type": "string",
                            "example": "John Doe"
                          },
                          "twoFactorEnabled": {
                            "type": "boolean",
                            "example": true
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            "201": {
              "description": "",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object"
                  }
                }
              }
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "Login with two-factor authentication",
          "tags": [
            "Authentication"
          ]
        }
      },
      "/api/v1/auth/request-2fa-otp": {
        "post": {
          "description": "Requests a new 2FA OTP SMS/Email code to complete an in-progress authentication attempt. Used when the initial OTP has expired.",
          "operationId": "AuthController_requestTwoFactorAuthOtp",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "authUserId"
                  ],
                  "properties": {
                    "authUserId": {
                      "type": "string",
                      "example": "550e8400-e29b-41d4-a716-446655440000"
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "2FA OTP code re-sent successfully."
            },
            "201": {
              "description": ""
            },
            "400": {
              "description": "Bad Request."
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "Request a 2FA OTP for login",
          "tags": [
            "Authentication"
          ]
        }
      },
      "/api/v1/users": {
        "post": {
          "description": "Registers a new user profile in the system under the specified role and branch. Roles must be one of: ADMIN, MANAGER, AUDITOR, LOAN_OFFICER, HR_MANAGER, CONFIGURATION_MANAGER. Part of the user onboarding workflow.",
          "operationId": "UsersController_create",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/CreateUserDto"
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": "User created successfully.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/User"
                  }
                }
              }
            },
            "403": {
              "description": "Forbidden - Lacking required administrator or HR manager permissions."
            }
          },
          "security": [
            {
              "JWT-auth": []
            }
          ],
          "summary": "Create a new user",
          "tags": [
            "Users & RBAC"
          ]
        },
        "get": {
          "description": "Retrieves a paginated list of users filtered by search criteria (name, email, role ID, branch ID). If the calling user lacks VIEW_ALL_BRANCHES_DATA permission, they are restricted to users within their own branch. Part of user audit/directory workflow.",
          "operationId": "UsersController_findAll",
          "parameters": [
            {
              "name": "total",
              "required": false,
              "in": "query",
              "description": "The total number of items",
              "schema": {
                "minimum": 0,
                "example": 100,
                "type": "number"
              }
            },
            {
              "name": "page",
              "required": false,
              "in": "query",
              "description": "The current page number",
              "schema": {
                "minimum": 1,
                "example": 1,
                "type": "number"
              }
            },
            {
              "name": "limit",
              "required": false,
              "in": "query",
              "description": "The number of items per page",
              "schema": {
                "minimum": 1,
                "example": 10,
                "type": "number"
              }
            },
            {
              "name": "id",
              "required": false,
              "in": "query",
              "description": "Filter by entity ID",
              "schema": {
                "example": "60d5ec4b8f3a3f3b9c8b4567",
                "type": "string"
              }
            },
            {
              "name": "isActive",
              "required": false,
              "in": "query",
              "description": "Filter by active status",
              "schema": {
                "example": true,
                "type": "boolean"
              }
            },
            {
              "name": "isDeleted",
              "required": false,
              "in": "query",
              "description": "Filter by deleted status",
              "schema": {
                "example": false,
                "type": "boolean"
              }
            },
            {
              "name": "dateFrom",
              "required": false,
              "in": "query",
              "description": "Start of the creation-date range, inclusive. May be given without dateTo.",
              "schema": {
                "format": "date-time",
                "example": "2024-01-01T00:00:00.000Z",
                "type": "string"
              }
            },
            {
              "name": "dateTo",
              "required": false,
              "in": "query",
              "description": "End of the creation-date range, inclusive. May be given without dateFrom.",
              "schema": {
                "format": "date-time",
                "example": "2024-01-31T23:59:59.999Z",
                "type": "string"
              }
            },
            {
              "name": "fullName",
              "required": false,
              "in": "query",
              "description": "Filter by full name. Matched as a partial, case-insensitive search.",
              "schema": {
                "example": "John",
                "type": "string"
              }
            },
            {
              "name": "email",
              "required": false,
              "in": "query",
              "description": "Filter by email address. Matched as a partial, case-insensitive search, so a fragment such as \"john\" is accepted.",
              "schema": {
                "example": "john@example.com",
                "type": "string"
              }
            },
            {
              "name": "roleId",
              "required": false,
              "in": "query",
              "description": "Filter by role ID",
              "schema": {
                "example": "60d5ec4b8f3a3f3b9c8b4567",
                "type": "string"
              }
            },
            {
              "name": "branchId",
              "required": false,
              "in": "query",
              "description": "Filter by branch ID",
              "schema": {
                "example": "60d5ec4b8f3a3f3b9c8b4567",
                "type": "string"
              }
            },
            {
              "name": "search",
              "required": false,
              "in": "query",
              "description": "Free-text search across full name, employee ID and email. Backs the \"Search officer\" box on the Team screen.",
              "schema": {
                "example": "Adeola",
                "type": "string"
              }
            },
            {
              "name": "employeeId",
              "required": false,
              "in": "query",
              "description": "Filter by staff identifier",
              "schema": {
                "example": "LN-9723",
                "type": "string"
              }
            },
            {
              "name": "order",
              "required": false,
              "in": "query",
              "description": "Sort order for results",
              "schema": {
                "default": "ASC",
                "example": "ASC",
                "type": "string",
                "enum": [
                  "ASC",
                  "DESC"
                ]
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Users retrieved successfully.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/PaginationResponseDto"
                  }
                }
              }
            },
            "403": {
              "description": "Forbidden - Lacking view user list permission."
            },
            "404": {
              "description": "Not Found - The requesting user's profile could not be verified."
            },
            "500": {
              "description": "Internal Server Error - An unexpected database error occurred."
            }
          },
          "security": [
            {
              "JWT-auth": []
            }
          ],
          "summary": "Get all users",
          "tags": [
            "Users & RBAC"
          ]
        }
      },
      "/api/v1/users/{id}/permissions": {
        "patch": {
          "description": "Backs the \"View/Edit Permission\" row action on the Team screen. Takes the complete View/Manage grid from the permission matrix; modules omitted are treated as no access, and Manage always implies View. The previous and new grids are both written to the audit trail.",
          "operationId": "UsersController_updateModulePermissions",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/UpdateModulePermissionsDto"
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "Module permissions updated successfully.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/User"
                  }
                }
              }
            },
            "404": {
              "description": "Not Found - User does not exist."
            }
          },
          "security": [
            {
              "JWT-auth": []
            }
          ],
          "summary": "Replace a team member's per-module access grid",
          "tags": [
            "Users & RBAC"
          ]
        }
      },
      "/api/v1/users/{id}/deactivate": {
        "patch": {
          "description": "Backs the \"Deactivate\" row action on the Team screen. Withdraws sign-in and new assignments while keeping every record the member is attached to — distinct from deletion. The change and its reason are audited.",
          "operationId": "UsersController_deactivate",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/SetUserActiveDto"
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "User deactivated successfully.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/User"
                  }
                }
              }
            },
            "400": {
              "description": "Bad Request - The user is already deactivated."
            }
          },
          "security": [
            {
              "JWT-auth": []
            }
          ],
          "summary": "Deactivate a team member",
          "tags": [
            "Users & RBAC"
          ]
        }
      },
      "/api/v1/users/{id}/activate": {
        "patch": {
          "description": "Restores sign-in and assignment for a previously deactivated account. The change and its reason are audited.",
          "operationId": "UsersController_activate",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/SetUserActiveDto"
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "User reinstated successfully.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/User"
                  }
                }
              }
            },
            "400": {
              "description": "Bad Request - The user is already active."
            }
          },
          "security": [
            {
              "JWT-auth": []
            }
          ],
          "summary": "Reinstate a deactivated team member",
          "tags": [
            "Users & RBAC"
          ]
        }
      },
      "/api/v1/users/roles": {
        "get": {
          "description": "Retrieves all roles currently registered in the database. Used to list roles for assignment or auditing within RBAC settings.",
          "operationId": "UsersController_findAllRoles",
          "parameters": [],
          "responses": {
            "200": {
              "description": "List of roles retrieved successfully.",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "array",
                    "items": {
                      "$ref": "#/components/schemas/Role"
                    }
                  }
                }
              }
            }
          },
          "security": [
            {
              "JWT-auth": []
            }
          ],
          "summary": "Get all roles",
          "tags": [
            "Users & RBAC"
          ]
        },
        "post": {
          "description": "Creates a new RBAC role definition if it doesn't exist, otherwise returns the existing role details matching the specified name. Part of setup config workflow.",
          "operationId": "UsersController_findOrCreateRole",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/CreateRoleDto"
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": "Role created or retrieved successfully.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/Role"
                  }
                }
              }
            }
          },
          "security": [
            {
              "JWT-auth": []
            }
          ],
          "summary": "Create or find an existing role",
          "tags": [
            "Users & RBAC"
          ]
        }
      },
      "/api/v1/users/roles/{id}": {
        "patch": {
          "description": "Updates properties (like name or details) of an existing role definition by its ID. Part of role maintenance.",
          "operationId": "UsersController_updateRoleById",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/UpdateRoleDto"
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "Role updated successfully.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/Role"
                  }
                }
              }
            }
          },
          "security": [
            {
              "JWT-auth": []
            }
          ],
          "summary": "Update a role by ID",
          "tags": [
            "Users & RBAC"
          ]
        },
        "delete": {
          "description": "Marks a role definition as deleted (soft delete) based on its ID. Prevents assigning this role to new users. Part of cleanup flow.",
          "operationId": "UsersController_deleteRoleById",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "204": {
              "description": "Role soft-deleted successfully."
            }
          },
          "security": [
            {
              "JWT-auth": []
            }
          ],
          "summary": "Delete a role by ID (soft delete)",
          "tags": [
            "Users & RBAC"
          ]
        }
      },
      "/api/v1/users/roles/{roleId}/permissions": {
        "post": {
          "description": "Updates the role definition with an array of permission IDs, replacing the old permission map. Part of permissions assignment / RBAC setup flow.",
          "operationId": "UsersController_assignPermissionsToRole",
          "parameters": [
            {
              "name": "roleId",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "permissionIds"
                  ],
                  "properties": {
                    "permissionIds": {
                      "type": "array",
                      "items": {
                        "type": "string"
                      },
                      "example": [
                        "550e8400-e29b-41d4-a716-446655440001",
                        "550e8400-e29b-41d4-a716-446655440002"
                      ]
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "Permissions successfully mapped/assigned to the role.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/Role"
                  }
                }
              }
            },
            "201": {
              "description": "",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/Role"
                  }
                }
              }
            }
          },
          "security": [
            {
              "JWT-auth": []
            }
          ],
          "summary": "Assign permissions to a role",
          "tags": [
            "Users & RBAC"
          ]
        }
      },
      "/api/v1/users/permissions": {
        "post": {
          "description": "Registers a new system permission rule in the database. Used to expand available RBAC options. Part of setup config workflow.",
          "operationId": "UsersController_createPermission",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/CreatePermissionDto"
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": "Permission created successfully.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/Permission"
                  }
                }
              }
            }
          },
          "security": [
            {
              "JWT-auth": []
            }
          ],
          "summary": "Create a new permission",
          "tags": [
            "Users & RBAC"
          ]
        },
        "get": {
          "description": "Retrieves a list of all permissions registered in the system. Used during RBAC configuration auditing.",
          "operationId": "UsersController_findAllPermissions",
          "parameters": [],
          "responses": {
            "200": {
              "description": "Permissions list retrieved successfully.",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "array",
                    "items": {
                      "$ref": "#/components/schemas/Permission"
                    }
                  }
                }
              }
            }
          },
          "security": [
            {
              "JWT-auth": []
            }
          ],
          "summary": "Get all permissions",
          "tags": [
            "Users & RBAC"
          ]
        }
      },
      "/api/v1/users/permissions/{id}": {
        "put": {
          "description": "Updates properties of a permission rule by its ID. Part of setup maintenance.",
          "operationId": "UsersController_updatePermissionById",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/UpdatePermissionDto"
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "Permission updated successfully.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/Permission"
                  }
                }
              }
            }
          },
          "security": [
            {
              "JWT-auth": []
            }
          ],
          "summary": "Update a permission by ID",
          "tags": [
            "Users & RBAC"
          ]
        },
        "delete": {
          "description": "Soft-deletes a permission rule by its ID. Prevent assignments to roles. Part of cleanup workflow.",
          "operationId": "UsersController_deletePermissionById",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "204": {
              "description": "Permission soft-deleted successfully."
            }
          },
          "security": [
            {
              "JWT-auth": []
            }
          ],
          "summary": "Delete a permission by ID (soft delete)",
          "tags": [
            "Users & RBAC"
          ]
        }
      },
      "/api/v1/users/{id}": {
        "get": {
          "description": "Retrieves a specific user profile including role and branch details. A member may always read their own profile with VIEW_SELF_USER_DETAILS; reading anyone else's additionally requires VIEW_USERS_DETAILS (or the ADMIN role).",
          "operationId": "UsersController_findOneById",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "User details retrieved successfully.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/User"
                  }
                }
              }
            },
            "403": {
              "description": "Forbidden - Lacking permission to view another user's profile."
            },
            "404": {
              "description": "Not Found - User does not exist."
            }
          },
          "security": [
            {
              "JWT-auth": []
            }
          ],
          "summary": "Get a user by ID",
          "tags": [
            "Users & RBAC"
          ]
        },
        "put": {
          "description": "Modifies user profile details. A member editing their own profile needs only UPDATE_SELF_USER and may change how they are identified and reached — name, first/middle/last name, phone number and profile photo. Editing anyone else, or changing role, branch, employee ID, permissions, targets or active state, requires UPDATE_USER (or the ADMIN role). Passwords are changed through POST /auth/change-password, which proves the current password.",
          "operationId": "UsersController_update",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/UpdateUserDto"
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "User updated successfully.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/User"
                  }
                }
              }
            },
            "403": {
              "description": "Forbidden - Lacking permission to update this user, or attempting to change a field outside your own profile."
            },
            "404": {
              "description": "Not Found - User does not exist."
            }
          },
          "security": [
            {
              "JWT-auth": []
            }
          ],
          "summary": "Update a user by ID",
          "tags": [
            "Users & RBAC"
          ]
        },
        "delete": {
          "description": "Soft-deletes a user account. A member may delete their own account with DELETE_SELF_USER; deleting anyone else requires DELETE_USER (or the ADMIN role). Part of user termination / account removal workflow.",
          "operationId": "UsersController_remove",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "204": {
              "description": "User account soft-deleted successfully."
            },
            "403": {
              "description": "Forbidden - Lacking permission to delete this user."
            },
            "404": {
              "description": "Not Found - User does not exist."
            }
          },
          "security": [
            {
              "JWT-auth": []
            }
          ],
          "summary": "Delete a user by ID (soft delete)",
          "tags": [
            "Users & RBAC"
          ]
        }
      },
      "/api/v1/logs/{index}/search": {
        "get": {
          "description": "Queries elasticsearch/database log indices. The parameter `index` specifies the collection to search (e.g., \"error\", \"http\", \"event\"). Query filters allow narrowing logs by service, action, type, user, and date range. Part of system administrative debugging and auditing workflow.",
          "operationId": "LoggingController_searchLogs",
          "parameters": [
            {
              "name": "index",
              "required": true,
              "in": "path",
              "description": "The log index or collection name to query. Possible values: \"error\", \"http\", \"event\".",
              "schema": {
                "example": "event",
                "type": "string"
              }
            },
            {
              "name": "service_name",
              "required": false,
              "in": "query",
              "description": "Name of the service/controller generating the logs",
              "schema": {
                "example": "BranchesController",
                "type": "string"
              }
            },
            {
              "name": "action_name",
              "required": false,
              "in": "query",
              "description": "The specific operation or handler method that logged the event",
              "schema": {
                "example": "BranchesController:create",
                "type": "string"
              }
            },
            {
              "name": "type",
              "required": false,
              "in": "query",
              "description": "The log classification category/type",
              "schema": {
                "example": "event",
                "type": "string",
                "enum": [
                  "http",
                  "event",
                  "error"
                ]
              }
            },
            {
              "name": "user_id",
              "required": false,
              "in": "query",
              "description": "UUID of the user associated with the log event",
              "schema": {
                "example": "550e8400-e29b-41d4-a716-446655440000",
                "type": "string"
              }
            },
            {
              "name": "from",
              "required": false,
              "in": "query",
              "description": "Search range start timestamp (ISO 8601)",
              "schema": {
                "format": "date-time",
                "example": "2026-07-10T00:00:00.000Z",
                "type": "string"
              }
            },
            {
              "name": "to",
              "required": false,
              "in": "query",
              "description": "Search range end timestamp (ISO 8601)",
              "schema": {
                "format": "date-time",
                "example": "2026-07-13T23:59:59.000Z",
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Logs matching criteria retrieved successfully.",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "total": {
                        "type": "number",
                        "example": 1
                      },
                      "logs": {
                        "type": "array",
                        "items": {
                          "type": "object",
                          "properties": {
                            "service_name": {
                              "type": "string",
                              "example": "BranchesController"
                            },
                            "action_name": {
                              "type": "string",
                              "example": "BranchesController:create"
                            },
                            "date": {
                              "type": "string",
                              "example": "2026-07-13T09:27:00.000Z"
                            },
                            "payload": {
                              "type": "string",
                              "example": "{\"name\":\"Main Branch\"}"
                            },
                            "response": {
                              "type": "string",
                              "example": "{\"id\":\"uuid\",\"name\":\"Main Branch\"}"
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            "403": {
              "description": "Forbidden - Lacking required JWT authorization."
            }
          },
          "security": [
            {
              "JWT-auth": []
            }
          ],
          "summary": "Search logs by index/collection name",
          "tags": [
            "Logs"
          ]
        }
      },
      "/api/v1/uploads": {
        "post": {
          "description": "The single entry point for every file in the system. Validates size and MIME type against the declared purpose, commits the bytes to the configured storage driver, and returns an Upload record. Feature endpoints (bulk account creation, reconciliation import, avatars, KYC documents) accept the returned `id` rather than raw multipart, so validation, storage and retention stay in one place and every file is auditable and re-processable.",
          "operationId": "UploadsController_create",
          "parameters": [
            {
              "name": "purpose",
              "required": false,
              "in": "query",
              "description": "What the file is for. Determines the accepted MIME types and which feature endpoint may later consume it.",
              "schema": {
                "enum": [
                  "BULK_ACCOUNTS",
                  "RECONCILIATION_IMPORT",
                  "LOANEE_PHOTO",
                  "USER_AVATAR",
                  "KYC_DOCUMENT",
                  "GENERAL"
                ],
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "multipart/form-data": {
                "schema": {
                  "$ref": "#/components/schemas/CreateUploadDto"
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": "File stored successfully.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/Upload"
                  }
                }
              }
            },
            "400": {
              "description": "Bad Request - No file supplied or file empty."
            },
            "413": {
              "description": "Payload Too Large - File exceeds the configured maximum size."
            },
            "415": {
              "description": "Unsupported Media Type - MIME type is not accepted for the declared purpose."
            }
          },
          "security": [
            {
              "JWT-auth": []
            }
          ],
          "summary": "Upload a file",
          "tags": [
            "Uploads"
          ]
        },
        "get": {
          "description": "Retrieves stored files with optional filtering by purpose, processing status, uploader and branch. Backs the batch upload history shown on ledger screens.",
          "operationId": "UploadsController_findAll",
          "parameters": [
            {
              "name": "total",
              "required": false,
              "in": "query",
              "description": "The total number of items",
              "schema": {
                "minimum": 0,
                "example": 100,
                "type": "number"
              }
            },
            {
              "name": "page",
              "required": false,
              "in": "query",
              "description": "The current page number",
              "schema": {
                "minimum": 1,
                "example": 1,
                "type": "number"
              }
            },
            {
              "name": "limit",
              "required": false,
              "in": "query",
              "description": "The number of items per page",
              "schema": {
                "minimum": 1,
                "example": 10,
                "type": "number"
              }
            },
            {
              "name": "purpose",
              "required": false,
              "in": "query",
              "description": "Filter by what the file is for",
              "schema": {
                "type": "string",
                "enum": [
                  "BULK_ACCOUNTS",
                  "RECONCILIATION_IMPORT",
                  "LOANEE_PHOTO",
                  "USER_AVATAR",
                  "KYC_DOCUMENT",
                  "GENERAL"
                ]
              }
            },
            {
              "name": "status",
              "required": false,
              "in": "query",
              "description": "Filter by processing lifecycle state",
              "schema": {
                "type": "string",
                "enum": [
                  "AVAILABLE",
                  "PROCESSING",
                  "PROCESSED",
                  "FAILED"
                ]
              }
            },
            {
              "name": "uploadedById",
              "required": false,
              "in": "query",
              "description": "Filter by the user who uploaded the file",
              "schema": {
                "example": "60d5ec4b8f3a3f3b9c8b4567",
                "type": "string"
              }
            },
            {
              "name": "branchId",
              "required": false,
              "in": "query",
              "description": "Filter by the branch the upload was made from",
              "schema": {
                "example": "60d5ec4b8f3a3f3b9c8b4567",
                "type": "string"
              }
            },
            {
              "name": "order",
              "required": false,
              "in": "query",
              "description": "Sort order by upload date",
              "schema": {
                "default": "DESC",
                "type": "string",
                "enum": [
                  "ASC",
                  "DESC"
                ]
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Uploads retrieved successfully."
            }
          },
          "security": [
            {
              "JWT-auth": []
            }
          ],
          "summary": "List uploaded files (paginated)",
          "tags": [
            "Uploads"
          ]
        }
      },
      "/api/v1/uploads/{id}": {
        "get": {
          "description": "Retrieves the metadata for a stored file, including its processing status and the result recorded by whichever feature consumed it.",
          "operationId": "UploadsController_findOne",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Upload record retrieved successfully.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/Upload"
                  }
                }
              }
            },
            "404": {
              "description": "Not Found - Upload does not exist."
            }
          },
          "security": [
            {
              "JWT-auth": []
            }
          ],
          "summary": "Get an upload record by ID",
          "tags": [
            "Uploads"
          ]
        },
        "delete": {
          "description": "Soft-deletes the upload record and removes the stored bytes. The audit entry for the original upload is retained.",
          "operationId": "UploadsController_remove",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "204": {
              "description": "Upload deleted successfully."
            }
          },
          "security": [
            {
              "JWT-auth": []
            }
          ],
          "summary": "Delete an uploaded file",
          "tags": [
            "Uploads"
          ]
        }
      },
      "/api/v1/uploads/{id}/download": {
        "get": {
          "description": "Streams the stored bytes back with the original filename and MIME type.",
          "operationId": "UploadsController_download",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "File contents returned."
            },
            "404": {
              "description": "Not Found - Upload record or its bytes are unavailable."
            }
          },
          "security": [
            {
              "JWT-auth": []
            }
          ],
          "summary": "Download a stored file",
          "tags": [
            "Uploads"
          ]
        }
      },
      "/api/v1/branches": {
        "post": {
          "description": "The Create New Branch action on the Branch Matrix. Takes the Branch Identity form — name, address, regional zone, coordinates and type — and allocates a unique BR-#### system identifier. Open the branch in PENDING_ACTIVATION to stand it up before it trades. Creating a branch does not appoint a manager; use PATCH /branches/:id/manager for that.",
          "operationId": "BranchesController_create",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/CreateBranchDto"
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": "Branch created successfully.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/Branch"
                  }
                }
              }
            },
            "403": {
              "description": "Forbidden - Lacking admin roles or create branch permissions."
            }
          },
          "security": [
            {
              "JWT-auth": []
            }
          ],
          "summary": "Create a new branch",
          "tags": [
            "Branches"
          ]
        },
        "get": {
          "description": "Every branch record, with its manager and parent branch resolved. Cached under the branches namespace, so any write through this controller drops the cached copy rather than leaving a stale list behind.",
          "operationId": "BranchesController_findAll",
          "parameters": [],
          "responses": {
            "200": {
              "description": "Branches retrieved successfully.",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "array",
                    "items": {
                      "$ref": "#/components/schemas/Branch"
                    }
                  }
                }
              }
            }
          },
          "security": [
            {
              "JWT-auth": []
            }
          ],
          "summary": "Get all branches",
          "tags": [
            "Branches"
          ]
        }
      },
      "/api/v1/branches/configuration": {
        "get": {
          "description": "Backs both the Branch Matrix card grid and the Settings → Branch Configuration table. Each row carries the branch code, address, regional zone, manager name, staff count, active loan count, total exposure, collection rate and operating status. Every per-branch figure comes from two grouped aggregations, so the response costs the same whether there are three branches or three hundred. An empty managerName is the \"[Unassigned - Send Invite Email]\" state.",
          "operationId": "BranchesController_findConfiguration",
          "parameters": [],
          "responses": {
            "200": {
              "description": "Branch figures retrieved successfully.",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "array",
                    "items": {
                      "$ref": "#/components/schemas/BranchSummaryDto"
                    }
                  }
                }
              }
            }
          },
          "security": [
            {
              "JWT-auth": []
            }
          ],
          "summary": "Get every branch with its live figures",
          "tags": [
            "Branches"
          ]
        }
      },
      "/api/v1/branches/{id}/status": {
        "patch": {
          "description": "Backs the Branch Status toggle under Settings → Branch Configuration and the Suspend Operations button on the branch detail header. Nothing here deletes data: a branch that is not ACTIVE keeps every record it owns and only stops accepting new accounts, which is why this is separate from deletion. SUSPENDED is reversible; CLOSED is not meant to be. The change and its reason are written to the audit trail.",
          "operationId": "BranchesController_setStatus",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/UpdateBranchStatusDto"
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "Branch status updated successfully.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/Branch"
                  }
                }
              }
            },
            "404": {
              "description": "Not Found - Branch does not exist."
            }
          },
          "security": [
            {
              "JWT-auth": []
            }
          ],
          "summary": "Open, suspend or close a branch",
          "tags": [
            "Branches"
          ]
        }
      },
      "/api/v1/branches/{id}/overview": {
        "get": {
          "description": "Backs the whole Branch Matrix detail view in one call: the header identity (name, system identifier, regional zone and the status/type badge), the four headline metrics (total liquidity with its month-on-month movement, active loans with average size, collection rate, and the officer count split into field and admin), the Location Visualization card, the Branch Leadership panel including its unassigned empty state, and the opening page of the Recent Transaction feed. Assembled server-side rather than left to the client to stitch together from five calls, because every figure on the screen has to describe the same branch at the same moment.",
          "operationId": "BranchesController_overview",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Branch overview retrieved successfully.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/BranchOverviewDto"
                  }
                }
              }
            },
            "404": {
              "description": "Not Found - Branch does not exist."
            }
          },
          "security": [
            {
              "JWT-auth": []
            }
          ],
          "summary": "Get everything the branch detail screen renders",
          "tags": [
            "Branches"
          ]
        }
      },
      "/api/v1/branches/{id}/transactions": {
        "get": {
          "description": "The Recent Transaction table and its \"View Full Logs\" link. Merges two sources: settled instalments give the repayments and the loans themselves give the disbursements, both read through their denormalised branch id so neither is a join. Rows are returned newest first. The design also shows a Fee Payment row; nothing records a fee separately from a repayment yet, so none is emitted — the type exists on the enum so adding a fee ledger later will not change this contract.",
          "operationId": "BranchesController_transactions",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "total",
              "required": false,
              "in": "query",
              "description": "The total number of items",
              "schema": {
                "minimum": 0,
                "example": 100,
                "type": "number"
              }
            },
            {
              "name": "page",
              "required": false,
              "in": "query",
              "description": "The current page number",
              "schema": {
                "minimum": 1,
                "example": 1,
                "type": "number"
              }
            },
            {
              "name": "limit",
              "required": false,
              "in": "query",
              "description": "The number of items per page",
              "schema": {
                "minimum": 1,
                "example": 10,
                "type": "number"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Branch transactions retrieved successfully.",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "array",
                    "items": {
                      "$ref": "#/components/schemas/BranchTransactionRowDto"
                    }
                  }
                }
              }
            },
            "404": {
              "description": "Not Found - Branch does not exist."
            }
          },
          "security": [
            {
              "JWT-auth": []
            }
          ],
          "summary": "Page through a branch transaction feed",
          "tags": [
            "Branches"
          ]
        }
      },
      "/api/v1/branches/{id}/manager": {
        "patch": {
          "description": "Designates an existing user as the manager of this branch, filling the Branch Leadership panel. The user must exist, not be deactivated, and hold a role that may manage a branch (MANAGER or ADMIN). The caller must be allowed to act on this branch — a branch-scoped administrator cannot appoint into someone else's branch. A user already posted elsewhere is refused unless `transferFromCurrentBranch` is set, and a user already managing another branch is refused unless `allowMultipleBranches` is set, so neither happens as a side effect. The branch's managerId and the user's branch membership are written in one transaction so they can never disagree, and the appointment — with the outgoing manager — is recorded on the audit trail. Re-sending the same appointment is a no-op rather than a second audit entry.",
          "operationId": "BranchesController_assignManager",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/AssignBranchManagerDto"
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "Branch manager assigned successfully.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/Branch"
                  }
                }
              }
            },
            "400": {
              "description": "Bad Request - User is deactivated, holds an ineligible role, belongs to another branch, or already manages one."
            },
            "403": {
              "description": "Forbidden - Caller may only manage the leadership of their own branch."
            },
            "404": {
              "description": "Not Found - Branch or user does not exist."
            }
          },
          "security": [
            {
              "JWT-auth": []
            }
          ],
          "summary": "Assign a branch manager",
          "tags": [
            "Branches"
          ]
        },
        "delete": {
          "description": "Stands the current manager down, returning the branch to the \"Unassigned — operations are overseen by Regional Admin\" state the design shows. The outgoing manager keeps their branch membership by default, since losing the title is not the same as leaving the branch; pass `removeFromBranch` to clear that too. Unassigning a branch that has no manager is a no-op rather than an error. The change is recorded on the audit trail.",
          "operationId": "BranchesController_unassignManager",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/UnassignBranchManagerDto"
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "Branch manager unassigned successfully.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/Branch"
                  }
                }
              }
            },
            "403": {
              "description": "Forbidden - Caller may only manage the leadership of their own branch."
            },
            "404": {
              "description": "Not Found - Branch does not exist."
            }
          },
          "security": [
            {
              "JWT-auth": []
            }
          ],
          "summary": "Unassign the branch manager",
          "tags": [
            "Branches"
          ]
        }
      },
      "/api/v1/branches/{id}": {
        "get": {
          "description": "The raw branch record with its manager and parent branch resolved. For the figures, map card and transaction feed the detail screen renders, use GET /branches/:id/overview instead.",
          "operationId": "BranchesController_findOne",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Branch retrieved successfully.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/Branch"
                  }
                }
              }
            },
            "404": {
              "description": "Not Found - Branch does not exist."
            }
          },
          "security": [
            {
              "JWT-auth": []
            }
          ],
          "summary": "Get a branch record by ID",
          "tags": [
            "Branches"
          ]
        },
        "patch": {
          "description": "The Update Branch modal. Writes only the identity fields actually present on the request, so a partial form never blanks what it did not display. Operating state is deliberately not accepted here — it goes through PATCH /branches/:id/status so the change reaches the audit trail. The caller needs UPDATE_ANY_BRANCH to modify a branch other than their own.",
          "operationId": "BranchesController_update",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/UpdateBranchDto"
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "Branch updated successfully.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/Branch"
                  }
                }
              }
            },
            "400": {
              "description": "Bad Request - Invalid input parameters or missing authority."
            },
            "403": {
              "description": "Forbidden - Lacking required administrative permissions."
            },
            "404": {
              "description": "Not Found - Branch with the given ID does not exist."
            }
          },
          "security": [
            {
              "JWT-auth": []
            }
          ],
          "summary": "Update a branch by ID",
          "tags": [
            "Branches"
          ]
        },
        "delete": {
          "description": "Soft-deletes a branch, removing it from every directory. To stop a branch trading while keeping it and its records, use PATCH /branches/:id/status instead.",
          "operationId": "BranchesController_remove",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Branch deleted successfully.",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "boolean"
                  }
                }
              }
            },
            "404": {
              "description": "Not Found - Branch does not exist."
            }
          },
          "security": [
            {
              "JWT-auth": []
            }
          ],
          "summary": "Delete a branch by ID",
          "tags": [
            "Branches"
          ]
        }
      },
      "/api/v1/loan/loanees": {
        "post": {
          "description": "Registers a new loanee profile containing personal information (first name, last name, email, phone number, and branch association). Part of the customer/loanee onboarding workflow.",
          "operationId": "LoaneeController_create",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/CreateLoaneeDto"
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": "Loanee profile successfully created."
            }
          },
          "security": [
            {
              "JWT-auth": []
            }
          ],
          "summary": "Create a new loanee",
          "tags": [
            "Loan - Loanees"
          ]
        },
        "get": {
          "description": "Retrieves a paginated list of loanees, supporting sorting (ASC/DESC) and filters (id, loaneeNumber, names, email, phone). All query parameters are optional. Part of the administrator directory workflow.",
          "operationId": "LoaneeController_findAll",
          "parameters": [
            {
              "name": "total",
              "required": false,
              "in": "query",
              "description": "The total number of items",
              "schema": {
                "minimum": 0,
                "example": 100,
                "type": "number"
              }
            },
            {
              "name": "page",
              "required": false,
              "in": "query",
              "description": "The current page number",
              "schema": {
                "minimum": 1,
                "example": 1,
                "type": "number"
              }
            },
            {
              "name": "limit",
              "required": false,
              "in": "query",
              "description": "The number of items per page",
              "schema": {
                "minimum": 1,
                "example": 10,
                "type": "number"
              }
            },
            {
              "name": "id",
              "required": false,
              "in": "query",
              "description": "Filter by loanee UUID",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "loaneeNumber",
              "required": false,
              "in": "query",
              "description": "Filter by loanee number",
              "schema": {
                "minimum": 1,
                "example": 1001,
                "type": "number"
              }
            },
            {
              "name": "firstName",
              "required": false,
              "in": "query",
              "description": "Search by first name (partial match)",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "lastName",
              "required": false,
              "in": "query",
              "description": "Search by last name (partial match)",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "email",
              "required": false,
              "in": "query",
              "description": "Filter by email",
              "schema": {
                "format": "email",
                "type": "string"
              }
            },
            {
              "name": "phoneNumber",
              "required": false,
              "in": "query",
              "description": "Filter by phone number",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "order",
              "required": false,
              "in": "query",
              "description": "Sort order for results",
              "schema": {
                "default": "ASC",
                "example": "ASC",
                "type": "string",
                "enum": [
                  "ASC",
                  "DESC"
                ]
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Loanees retrieved successfully."
            }
          },
          "security": [
            {
              "JWT-auth": []
            }
          ],
          "summary": "List all loanees (paginated)",
          "tags": [
            "Loan - Loanees"
          ]
        }
      },
      "/api/v1/loan/loanees/{id}": {
        "get": {
          "description": "Fetches detailed profile information for a specific loanee identified by their ID. Part of loanee detail inspection workflow.",
          "operationId": "LoaneeController_findOne",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Loanee profile retrieved successfully."
            },
            "404": {
              "description": "Not Found - Loanee profile not found."
            }
          },
          "security": [
            {
              "JWT-auth": []
            }
          ],
          "summary": "Get a loanee by ID",
          "tags": [
            "Loan - Loanees"
          ]
        },
        "patch": {
          "description": "Updates specified fields on an existing loanee profile (such as contact info or name details) using their ID. Part of profile management workflow.",
          "operationId": "LoaneeController_update",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/UpdateLoaneeDto"
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "Loanee profile updated successfully."
            }
          },
          "security": [
            {
              "JWT-auth": []
            }
          ],
          "summary": "Update a loanee",
          "tags": [
            "Loan - Loanees"
          ]
        },
        "delete": {
          "description": "Marks a loanee record as deleted (soft delete) using their ID, removing them from active directories. Part of customer offboarding workflow.",
          "operationId": "LoaneeController_remove",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "204": {
              "description": "Loanee profile soft-deleted successfully."
            }
          },
          "security": [
            {
              "JWT-auth": []
            }
          ],
          "summary": "Soft-delete a loanee",
          "tags": [
            "Loan - Loanees"
          ]
        }
      },
      "/api/v1/loan/portfolios": {
        "post": {
          "description": "Registers a new loan contract under a loanee. Specifies principal, tenure in months, interest rate, interest type (FIXED, FLOAT, REDUCING), and assigned loan officer. Part of the loan disbursement workflow.",
          "operationId": "LoanPortfolioController_create",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/CreateLoanPortfolioDto"
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": "Loan portfolio successfully created."
            }
          },
          "security": [
            {
              "JWT-auth": []
            }
          ],
          "summary": "Create a new loan portfolio",
          "tags": [
            "Loan - Portfolios"
          ]
        },
        "get": {
          "description": "Retrieves a paginated list of loan portfolios, with optional filtering options (id, loaneeId, loanId, accountNumber, status, loanOfficerId). All query parameters are optional. Portfolio status values: PENDING, APPROVED, REJECTED, PARTIAL, OVERDUE, ONTIME. Part of administrative reporting workflow.",
          "operationId": "LoanPortfolioController_findAll",
          "parameters": [
            {
              "name": "total",
              "required": false,
              "in": "query",
              "description": "The total number of items",
              "schema": {
                "minimum": 0,
                "example": 100,
                "type": "number"
              }
            },
            {
              "name": "page",
              "required": false,
              "in": "query",
              "description": "The current page number",
              "schema": {
                "minimum": 1,
                "example": 1,
                "type": "number"
              }
            },
            {
              "name": "limit",
              "required": false,
              "in": "query",
              "description": "The number of items per page",
              "schema": {
                "minimum": 1,
                "example": 10,
                "type": "number"
              }
            },
            {
              "name": "id",
              "required": false,
              "in": "query",
              "description": "Filter by portfolio ID",
              "schema": {
                "example": "60d5ec4b8f3a3f3b9c8b4567",
                "type": "string"
              }
            },
            {
              "name": "loaneeId",
              "required": false,
              "in": "query",
              "description": "Filter by loanee ID",
              "schema": {
                "example": "60d5ec4b8f3a3f3b9c8b4567",
                "type": "string"
              }
            },
            {
              "name": "loanId",
              "required": false,
              "in": "query",
              "description": "Filter by loan ID (e.g. LN-1234)",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "accountNumber",
              "required": false,
              "in": "query",
              "description": "Filter by account number",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "status",
              "required": false,
              "in": "query",
              "description": "Filter by status",
              "schema": {
                "type": "string",
                "enum": [
                  "PENDING",
                  "APPROVED",
                  "REJECTED",
                  "PARTIAL",
                  "OVERDUE",
                  "ONTIME",
                  "CLOSED"
                ]
              }
            },
            {
              "name": "loanOfficerId",
              "required": false,
              "in": "query",
              "description": "Filter by loan officer ID",
              "schema": {
                "example": "60d5ec4b8f3a3f3b9c8b4567",
                "type": "string"
              }
            },
            {
              "name": "branchId",
              "required": false,
              "in": "query",
              "description": "Filter by branch. Backs the \"All Branches\" selector on the Tracker. Ignored for callers already confined to a branch.",
              "schema": {
                "example": "60d5ec4b8f3a3f3b9c8b4567",
                "type": "string"
              }
            },
            {
              "name": "search",
              "required": false,
              "in": "query",
              "description": "Free-text search across loan reference, account number and loanee name. Backs the \"Search Loans\" box.",
              "schema": {
                "example": "Adeola",
                "type": "string"
              }
            },
            {
              "name": "dateFrom",
              "required": false,
              "in": "query",
              "description": "Only loans with activity on or after this instant. Backs the \"Last 24 Hours\" time selector.",
              "schema": {
                "format": "date-time",
                "example": "2026-08-06T00:00:00.000Z",
                "type": "string"
              }
            },
            {
              "name": "dateTo",
              "required": false,
              "in": "query",
              "description": "Only loans with activity on or before this instant",
              "schema": {
                "format": "date-time",
                "example": "2026-08-07T23:59:59.999Z",
                "type": "string"
              }
            },
            {
              "name": "order",
              "required": false,
              "in": "query",
              "description": "Sort order for results",
              "schema": {
                "default": "ASC",
                "example": "ASC",
                "type": "string",
                "enum": [
                  "ASC",
                  "DESC"
                ]
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Loan portfolios retrieved successfully."
            }
          },
          "security": [
            {
              "JWT-auth": []
            }
          ],
          "summary": "List all loan portfolios (paginated)",
          "tags": [
            "Loan - Portfolios"
          ]
        }
      },
      "/api/v1/loan/portfolios/{id}/details": {
        "get": {
          "description": "Backs the Loan Details popover on the Tracker: the original amount repayable, the total paid to date, the outstanding balance, the instalment schedule summary, and every payment recorded against the loan newest first.",
          "operationId": "LoanPortfolioController_findDetails",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Loan details retrieved successfully.",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "loanId": {
                        "type": "string",
                        "example": "LN-2045"
                      },
                      "loaneeName": {
                        "type": "string",
                        "example": "Adeola Bello"
                      },
                      "originalAmount": {
                        "type": "string",
                        "example": "150000.00"
                      },
                      "paidToDate": {
                        "type": "string",
                        "example": "142500.00"
                      },
                      "outstanding": {
                        "type": "string",
                        "example": "7500.00"
                      },
                      "status": {
                        "type": "string",
                        "example": "ONTIME"
                      },
                      "payments": {
                        "type": "array",
                        "items": {
                          "type": "object",
                          "properties": {
                            "date": {
                              "type": "string",
                              "example": "2026-08-07T10:15:00.000Z"
                            },
                            "amount": {
                              "type": "string",
                              "example": "47500.00"
                            },
                            "status": {
                              "type": "string",
                              "example": "APPLIED"
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          "security": [
            {
              "JWT-auth": []
            }
          ],
          "summary": "Get the loan details summary for a portfolio",
          "tags": [
            "Loan - Portfolios"
          ]
        }
      },
      "/api/v1/loan/portfolios/{id}": {
        "get": {
          "description": "Fetches details of a specific loan portfolio contract by its unique ID. Part of loan detail inspection.",
          "operationId": "LoanPortfolioController_findOne",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Loan portfolio details retrieved successfully."
            }
          },
          "security": [
            {
              "JWT-auth": []
            }
          ],
          "summary": "Get a loan portfolio by ID",
          "tags": [
            "Loan - Portfolios"
          ]
        },
        "patch": {
          "description": "Updates parameters on an active or pending loan portfolio (e.g. status, interest type, or next due date). Status values: PENDING, APPROVED, REJECTED, PARTIAL, OVERDUE, ONTIME. Interest types: FIXED, FLOAT, REDUCING. Part of contract adjustments workflow.",
          "operationId": "LoanPortfolioController_update",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/UpdateLoanPortfolioDto"
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "Loan portfolio updated successfully."
            }
          },
          "security": [
            {
              "JWT-auth": []
            }
          ],
          "summary": "Update a loan portfolio",
          "tags": [
            "Loan - Portfolios"
          ]
        },
        "delete": {
          "description": "Marks a loan portfolio record as deleted (soft delete) using its ID, removing it from active lists. Part of contract cleanup workflow.",
          "operationId": "LoanPortfolioController_remove",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "204": {
              "description": "Loan portfolio soft-deleted successfully."
            }
          },
          "security": [
            {
              "JWT-auth": []
            }
          ],
          "summary": "Soft-delete a loan portfolio",
          "tags": [
            "Loan - Portfolios"
          ]
        }
      },
      "/api/v1/loan/portfolios/{id}/apply-payment": {
        "post": {
          "description": "Decrements the outstanding interest/principal balance on a portfolio by manually applying the specified payment amount. Part of loan manual repayment flow.",
          "operationId": "LoanPortfolioController_applyPayment",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "amount"
                  ],
                  "properties": {
                    "amount": {
                      "type": "string",
                      "example": "10000.00"
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": "Payment successfully applied, balance decremented."
            }
          },
          "security": [
            {
              "JWT-auth": []
            }
          ],
          "summary": "Manually apply a payment amount to a loan portfolio",
          "tags": [
            "Loan - Portfolios"
          ]
        }
      },
      "/api/v1/loan/repayments": {
        "post": {
          "description": "Registers a new raw repayment entry under a loan portfolio. When recorded manually, it defaults to status: RECEIVED. Part of manual repayment record-keeping flow.",
          "operationId": "LoanRepaymentController_create",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/CreateLoanRepaymentDto"
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": "Repayment record registered in the system (status: RECEIVED)."
            }
          },
          "security": [
            {
              "JWT-auth": []
            }
          ],
          "summary": "Record a manual loan repayment",
          "tags": [
            "Loan - Repayments"
          ]
        }
      },
      "/api/v1/loan/repayments/portfolio/{portfolioId}": {
        "get": {
          "description": "Retrieves all payment history items associated with a specific loan portfolio ID. Part of the transaction history lookup workflow.",
          "operationId": "LoanRepaymentController_findForPortfolio",
          "parameters": [
            {
              "name": "portfolioId",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Repayment history list retrieved successfully."
            }
          },
          "security": [
            {
              "JWT-auth": []
            }
          ],
          "summary": "List all repayments for a loan portfolio",
          "tags": [
            "Loan - Repayments"
          ]
        }
      },
      "/api/v1/loan/repayments/{id}": {
        "get": {
          "description": "Retrieves a single loan repayment record by its unique ID. Part of details review workflow.",
          "operationId": "LoanRepaymentController_findOne",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Repayment record details retrieved successfully."
            }
          },
          "security": [
            {
              "JWT-auth": []
            }
          ],
          "summary": "Get a single repayment by ID",
          "tags": [
            "Loan - Repayments"
          ]
        }
      },
      "/api/v1/loan/repayments/{id}/apply": {
        "patch": {
          "description": "Applies a pending payment entry (changing status from RECEIVED to APPLIED) and automatically updates/decreases the outstanding principal and interest balances on the associated loan portfolio. Part of the payment clearance workflow.",
          "operationId": "LoanRepaymentController_apply",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Repayment successfully applied and portfolio balances updated."
            }
          },
          "security": [
            {
              "JWT-auth": []
            }
          ],
          "summary": "Apply a repayment (RECEIVED → APPLIED) and update portfolio balances",
          "tags": [
            "Loan - Repayments"
          ]
        }
      },
      "/api/v1/loan/repayments/{id}/reverse": {
        "patch": {
          "description": "Reverses a previously applied payment (reverting status to REVERSED) and rolls back/increases the loan portfolio outstanding balances to reflect the pre-payment state. Part of the chargeback or manual correction workflow.",
          "operationId": "LoanRepaymentController_reverse",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Repayment successfully reversed and portfolio balances restored."
            }
          },
          "security": [
            {
              "JWT-auth": []
            }
          ],
          "summary": "Reverse an applied repayment (APPLIED → REVERSED) and roll back portfolio balances",
          "tags": [
            "Loan - Repayments"
          ]
        }
      },
      "/api/v1/loan/schedules/portfolio/{portfolioId}": {
        "get": {
          "description": "Returns every instalment on the loan in sequence, with its due date, scheduled amount, amount settled so far and settlement state. Backs the repayment schedule view on the loan detail screen.",
          "operationId": "LoanScheduleController_findForPortfolio",
          "parameters": [
            {
              "name": "portfolioId",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Instalment schedule retrieved successfully."
            }
          },
          "security": [
            {
              "JWT-auth": []
            }
          ],
          "summary": "Get the full instalment schedule for a loan portfolio",
          "tags": [
            "Loan - Schedules"
          ]
        }
      },
      "/api/v1/loan/schedules/portfolio/{portfolioId}/upcoming": {
        "get": {
          "description": "Returns the next few instalments that are not yet fully settled, oldest first. Backs the \"Upcoming Schedule\" panel on the loanee profile.",
          "operationId": "LoanScheduleController_findUpcoming",
          "parameters": [
            {
              "name": "portfolioId",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "limit",
              "required": false,
              "in": "query",
              "description": "How many upcoming instalments to return. Defaults to 3.",
              "schema": {
                "type": "number"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Upcoming instalments retrieved successfully."
            }
          },
          "security": [
            {
              "JWT-auth": []
            }
          ],
          "summary": "Get the next unsettled instalments for a loan portfolio",
          "tags": [
            "Loan - Schedules"
          ]
        }
      },
      "/api/v1/loan/schedules/portfolio/{portfolioId}/summary": {
        "get": {
          "description": "Returns instalment counts, the \"paid/total\" progress label and percentage, total due, total paid, total outstanding, the next due date and amount, and how many days the oldest unsettled instalment is overdue. Backs the repayment progress bar and the overdue ageing shown on collection screens.",
          "operationId": "LoanScheduleController_summarise",
          "parameters": [
            {
              "name": "portfolioId",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Schedule summary retrieved successfully.",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "totalInstallments": {
                        "type": "number",
                        "example": 12
                      },
                      "paidInstallments": {
                        "type": "number",
                        "example": 8
                      },
                      "remainingInstallments": {
                        "type": "number",
                        "example": 4
                      },
                      "overdueInstallments": {
                        "type": "number",
                        "example": 1
                      },
                      "progressLabel": {
                        "type": "string",
                        "example": "8/12"
                      },
                      "progressPercent": {
                        "type": "number",
                        "example": 66
                      },
                      "totalDue": {
                        "type": "string",
                        "example": "450000.00"
                      },
                      "totalPaid": {
                        "type": "string",
                        "example": "300000.00"
                      },
                      "totalOutstanding": {
                        "type": "string",
                        "example": "150000.00"
                      },
                      "nextDueDate": {
                        "type": "string",
                        "example": "2026-09-15T00:00:00.000Z"
                      },
                      "nextDueAmount": {
                        "type": "string",
                        "example": "15000.00"
                      },
                      "overdueDays": {
                        "type": "number",
                        "example": 3
                      }
                    }
                  }
                }
              }
            }
          },
          "security": [
            {
              "JWT-auth": []
            }
          ],
          "summary": "Summarise a loan portfolio schedule",
          "tags": [
            "Loan - Schedules"
          ]
        }
      },
      "/api/v1/loan/schedules/refresh-overdue": {
        "post": {
          "description": "Sweeps unsettled instalments with a due date in the past and marks them OVERDUE. Intended to run on a schedule; exposed here so it can also be triggered on demand after a bulk import.",
          "operationId": "LoanScheduleController_refreshOverdue",
          "parameters": [
            {
              "name": "branchId",
              "required": false,
              "in": "query",
              "description": "Restrict the sweep to a single branch.",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "201": {
              "description": "Sweep completed.",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "updated": {
                        "type": "number",
                        "example": 14
                      }
                    }
                  }
                }
              }
            }
          },
          "security": [
            {
              "JWT-auth": []
            }
          ],
          "summary": "Flag instalments whose due date has passed as overdue",
          "tags": [
            "Loan - Schedules"
          ]
        }
      },
      "/api/v1/accounts": {
        "get": {
          "description": "Backs the Accounts screen for every role. Results are automatically scoped to what the caller may see: administrators and auditors see all branches, a branch manager sees their own branch, and a loan officer sees only accounts assigned to them. Supports free-text search across loanee name, loan reference and account number, plus filtering by provisioning status, branch, officer and creation date range. Each row is returned with its loanee, assigned officer and branch resolved.",
          "operationId": "AccountsController_findAll",
          "parameters": [
            {
              "name": "total",
              "required": false,
              "in": "query",
              "description": "The total number of items",
              "schema": {
                "minimum": 0,
                "example": 100,
                "type": "number"
              }
            },
            {
              "name": "page",
              "required": false,
              "in": "query",
              "description": "The current page number",
              "schema": {
                "minimum": 1,
                "example": 1,
                "type": "number"
              }
            },
            {
              "name": "limit",
              "required": false,
              "in": "query",
              "description": "The number of items per page",
              "schema": {
                "minimum": 1,
                "example": 10,
                "type": "number"
              }
            },
            {
              "name": "search",
              "required": false,
              "in": "query",
              "description": "Free-text search across loanee name, loan reference and account number. Backs the \"Search Loanee\" box.",
              "schema": {
                "example": "Adeola",
                "type": "string"
              }
            },
            {
              "name": "accountStatus",
              "required": false,
              "in": "query",
              "description": "Filter by virtual account provisioning state",
              "schema": {
                "type": "string",
                "enum": [
                  "ACTIVE",
                  "PENDING",
                  "FAILED"
                ]
              }
            },
            {
              "name": "branchId",
              "required": false,
              "in": "query",
              "description": "Restrict to one branch",
              "schema": {
                "example": "60d5ec4b8f3a3f3b9c8b4567",
                "type": "string"
              }
            },
            {
              "name": "loanOfficerId",
              "required": false,
              "in": "query",
              "description": "Restrict to accounts assigned to one loan officer",
              "schema": {
                "example": "60d5ec4b8f3a3f3b9c8b4567",
                "type": "string"
              }
            },
            {
              "name": "dateFrom",
              "required": false,
              "in": "query",
              "description": "Only accounts created on or after this instant",
              "schema": {
                "format": "date-time",
                "example": "2026-08-01T00:00:00.000Z",
                "type": "string"
              }
            },
            {
              "name": "dateTo",
              "required": false,
              "in": "query",
              "description": "Only accounts created on or before this instant",
              "schema": {
                "format": "date-time",
                "example": "2026-08-31T23:59:59.999Z",
                "type": "string"
              }
            },
            {
              "name": "order",
              "required": false,
              "in": "query",
              "description": "Sort order by creation date",
              "schema": {
                "default": "DESC",
                "type": "string",
                "enum": [
                  "ASC",
                  "DESC"
                ]
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Accounts retrieved successfully."
            }
          },
          "security": [
            {
              "JWT-auth": []
            }
          ],
          "summary": "List accounts (paginated)",
          "tags": [
            "Accounts"
          ]
        },
        "post": {
          "description": "The Create Single Account modal. In one call this registers the loanee, opens the loan portfolio, generates the full instalment schedule from the loan amount, cycle amount and repayment period, and requests a virtual collection account from the payment provider. The loanee, portfolio and schedule are written in a single transaction. Virtual account provisioning runs after it: if the provider fails, the account is still created and lands in FAILED with the reason recorded, ready for the retry action.",
          "operationId": "AccountsController_createSingle",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/CreateAccountDto"
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": "Account created. `portfolio.accountStatus` reports whether the virtual account was provisioned (ACTIVE), is still awaited (PENDING) or failed (FAILED)."
            },
            "400": {
              "description": "Bad Request - Amounts are not positive, the loan reference is taken, or the loanee contact details are already registered."
            }
          },
          "security": [
            {
              "JWT-auth": []
            }
          ],
          "summary": "Create a single account",
          "tags": [
            "Accounts"
          ]
        }
      },
      "/api/v1/accounts/bulk": {
        "post": {
          "description": "The Create Bulk Accounts modal. Upload the file first via `POST /uploads?purpose=BULK_ACCOUNTS`, then pass the returned id here. Each row is processed independently so one bad row does not abandon the rest, and every row's outcome is reported back. Set `dryRun` to validate the file without writing. The tally is recorded on the upload record, which is what the batch upload history displays. Accepted columns (case-insensitive, common aliases tolerated): firstName, middleName, lastName, email, phoneNumber, loanAmount, cycleStepAmount, repaymentInterval, firstDueDate, tenureMonths, interestRate, loanId.",
          "operationId": "AccountsController_createBulk",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/CreateBulkAccountsDto"
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": "Import completed. Per-row outcomes are included.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/BulkAccountsResultDto"
                  }
                }
              }
            },
            "400": {
              "description": "Bad Request - The upload could not be parsed as CSV or contained no data rows."
            }
          },
          "security": [
            {
              "JWT-auth": []
            }
          ],
          "summary": "Create accounts in bulk from an uploaded CSV",
          "tags": [
            "Accounts"
          ]
        }
      },
      "/api/v1/accounts/{id}/retry-provisioning": {
        "post": {
          "description": "Re-requests a virtual collection account for an account whose provisioning previously failed. Backs the Retry action on the batch upload log and the Accounts screen row menu.",
          "operationId": "AccountsController_retryProvisioning",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "201": {
              "description": "Provisioning retried. The resulting accountStatus is returned."
            },
            "400": {
              "description": "Bad Request - The account already has a virtual account."
            },
            "404": {
              "description": "Not Found - Account does not exist."
            }
          },
          "security": [
            {
              "JWT-auth": []
            }
          ],
          "summary": "Retry virtual account provisioning",
          "tags": [
            "Accounts"
          ]
        }
      },
      "/api/v1/integrations/squad/virtual-accounts": {
        "post": {
          "description": "Requests the Squad payment gateway to generate a dedicated virtual bank account number for a specific loanee profile. Part of the loanee automated onboarding flow.",
          "operationId": "SquadController_createVirtualAccount",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/CreateVirtualAccountDto"
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": "Virtual account successfully provisioned by Squad.",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean",
                        "example": true
                      },
                      "message": {
                        "type": "string",
                        "example": "Virtual account created successfully"
                      },
                      "data": {
                        "type": "object",
                        "properties": {
                          "account_number": {
                            "type": "string",
                            "example": "9912345678"
                          },
                          "bank_name": {
                            "type": "string",
                            "example": "Squad Co"
                          },
                          "account_name": {
                            "type": "string",
                            "example": "Track-Pay - John Doe"
                          },
                          "contract_code": {
                            "type": "string",
                            "example": "CON-123"
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          "security": [
            {
              "JWT-auth": []
            }
          ],
          "summary": "Create a virtual account (SQUAD)",
          "tags": [
            "Integrations - Squad"
          ]
        }
      },
      "/api/v1/integrations/squad/webhook": {
        "post": {
          "description": "Callback endpoint exposed to the Squad payment gateway. Receives real-time deposit/credit event notifications. Validates Squad signature using HMAC-SHA512. If signature matches and the event is a deposit/credit, automatically creates an IncomingPayment record to be matched during reconciliation. Part of automated payment ingestion flow.",
          "operationId": "SquadController_handleWebhook",
          "parameters": [
            {
              "name": "x-squad-encrypted-body",
              "required": true,
              "in": "header",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Webhook received and processed correctly.",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "received": {
                        "type": "boolean",
                        "example": true
                      },
                      "processed": {
                        "type": "boolean",
                        "example": true
                      },
                      "reference": {
                        "type": "string",
                        "example": "SQ-TRX-998877"
                      }
                    }
                  }
                }
              }
            },
            "400": {
              "description": "Bad Request - Missing signature header or raw request body."
            },
            "401": {
              "description": "Unauthorized - Webhook signature mismatch validation failed."
            }
          },
          "security": [
            {
              "JWT-auth": []
            }
          ],
          "summary": "Receive Squad payment webhook and create an IncomingPayment for reconciliation",
          "tags": [
            "Integrations - Squad"
          ]
        }
      },
      "/api/v1/reconciliation/import/csv": {
        "post": {
          "description": "Creates a ReconciliationRun and ingests IncomingPayment records from a CSV that was uploaded beforehand. Upload the file first via `POST /uploads?purpose=RECONCILIATION_IMPORT`, then pass the returned id here. Keeping the transfer separate means the bytes stay addressable after the run, so a failed import can be retried against the same stored file, and file validation stays in one place. The run records the uploadId, and the outcome is written back onto the upload. Part of the manual reconciliation flow.",
          "operationId": "ReconciliationController_importCsv",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ImportRepaymentsCsvDto"
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": "CSV data processed and ingested successfully.",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "_id": {
                        "type": "string",
                        "example": "60d5ec4b8f3a3f3b9c8b4567"
                      },
                      "uploadId": {
                        "type": "string",
                        "example": "60d5ec4b8f3a3f3b9c8b4568"
                      },
                      "filename": {
                        "type": "string",
                        "example": "deposits_july.csv"
                      },
                      "totalRows": {
                        "type": "number",
                        "example": 15
                      },
                      "importedRows": {
                        "type": "number",
                        "example": 15
                      },
                      "status": {
                        "type": "string",
                        "example": "IMPORTED"
                      }
                    }
                  }
                }
              }
            },
            "400": {
              "description": "Bad Request - The upload is empty, is not a reconciliation import, or could not be parsed as CSV."
            },
            "404": {
              "description": "Not Found - No upload exists with the supplied id."
            }
          },
          "security": [
            {
              "JWT-auth": []
            }
          ],
          "summary": "Import repayment transactions from an uploaded CSV",
          "tags": [
            "Reconciliation"
          ]
        }
      },
      "/api/v1/reconciliation/runs": {
        "get": {
          "description": "Retrieves all historical and active reconciliation runs configured in the system. Part of the reconciliation audit flow.",
          "operationId": "ReconciliationController_listRuns",
          "parameters": [],
          "responses": {
            "200": {
              "description": "Reconciliation runs list retrieved successfully."
            }
          },
          "security": [
            {
              "JWT-auth": []
            }
          ],
          "summary": "List all reconciliation runs",
          "tags": [
            "Reconciliation"
          ]
        }
      },
      "/api/v1/reconciliation/runs/{id}": {
        "get": {
          "description": "Retrieves metadata details of a specific reconciliation run identified by its unique ID. Part of the reconciliation detail lookup flow.",
          "operationId": "ReconciliationController_getRun",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Reconciliation run details retrieved successfully."
            }
          },
          "security": [
            {
              "JWT-auth": []
            }
          ],
          "summary": "Get a reconciliation run by ID",
          "tags": [
            "Reconciliation"
          ]
        }
      },
      "/api/v1/reconciliation/runs/{id}/payments": {
        "get": {
          "description": "Retrieves payments ingested under a specific run, with optional filtering by matching status. Status values can be one of: UNMATCHED, MATCHED, AMBIGUOUS, DUPLICATE, ERROR. Part of the manual correction / lookup workflow.",
          "operationId": "ReconciliationController_listRunPayments",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "status",
              "required": false,
              "in": "query",
              "description": "Filter payments by match status",
              "schema": {
                "type": "string",
                "enum": [
                  "UNMATCHED",
                  "MATCHED",
                  "AMBIGUOUS",
                  "DUPLICATE",
                  "ERROR"
                ]
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Incoming payment records list retrieved successfully."
            }
          },
          "security": [
            {
              "JWT-auth": []
            }
          ],
          "summary": "List payments for a reconciliation run",
          "tags": [
            "Reconciliation"
          ]
        }
      },
      "/api/v1/reconciliation/runs/{id}/match": {
        "post": {
          "description": "Executes automated matching rules against ingested payments for the run (extracting loan IDs, checking for duplicates, matching amounts). Supports a dry-run flag to inspect matches without saving state. Core part of the reconciliation workflow.",
          "operationId": "ReconciliationController_matchRun",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "dryRun",
              "required": false,
              "in": "query",
              "description": "If true, computes matches but does not persist updates",
              "schema": {
                "default": false,
                "type": "boolean"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Matching process executed successfully.",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "matchedCount": {
                        "type": "number",
                        "example": 10
                      },
                      "unmatchedCount": {
                        "type": "number",
                        "example": 5
                      },
                      "dryRun": {
                        "type": "boolean",
                        "example": false
                      }
                    }
                  }
                }
              }
            },
            "201": {
              "description": ""
            }
          },
          "security": [
            {
              "JWT-auth": []
            }
          ],
          "summary": "Attempt to match incoming payments",
          "tags": [
            "Reconciliation"
          ]
        }
      },
      "/api/v1/reconciliation/runs/{id}/summary": {
        "get": {
          "description": "Retrieves high-level summary metrics (counts, amounts, match rates) for a specific reconciliation run. Part of reporting dashboard flow.",
          "operationId": "ReconciliationController_getRunSummary",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Run summary metrics retrieved successfully.",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "runId": {
                        "type": "string",
                        "example": "60d5ec4b8f3a3f3b9c8b4567"
                      },
                      "totalPayments": {
                        "type": "number",
                        "example": 15
                      },
                      "matched": {
                        "type": "number",
                        "example": 10
                      },
                      "unmatched": {
                        "type": "number",
                        "example": 5
                      },
                      "duplicates": {
                        "type": "number",
                        "example": 0
                      },
                      "ambiguous": {
                        "type": "number",
                        "example": 0
                      },
                      "errors": {
                        "type": "number",
                        "example": 0
                      },
                      "totalAmount": {
                        "type": "string",
                        "example": "150000.00"
                      },
                      "matchedAmount": {
                        "type": "string",
                        "example": "100000.00"
                      }
                    }
                  }
                }
              }
            }
          },
          "security": [
            {
              "JWT-auth": []
            }
          ],
          "summary": "Get reconciliation run summary",
          "tags": [
            "Reconciliation"
          ]
        }
      },
      "/api/v1/settings/notifications": {
        "get": {
          "description": "Backs the Notification (SMS) table under Settings. Returns one row per branch with the Account Creation, Loan Payment Confirmation and Loan Overdue Reminder flags, plus an \"all\" field that is true when every type is enabled. Branches that have never been configured appear with everything switched off rather than being omitted.",
          "operationId": "NotificationSettingsController_findAll",
          "parameters": [
            {
              "name": "branchId",
              "required": false,
              "in": "query",
              "description": "Return the row for a single branch instead of the whole matrix.",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Notification matrix retrieved successfully."
            }
          },
          "security": [
            {
              "JWT-auth": []
            }
          ],
          "summary": "Get the per-branch SMS notification matrix",
          "tags": [
            "Settings - Notifications"
          ]
        }
      },
      "/api/v1/settings/notifications/{branchId}": {
        "put": {
          "description": "Sets the notification flags for a single branch, creating the record on first use. Send only the flags that changed. Passing `all` sets every type at once and takes precedence over the individual flags — that is the \"All\" column. The change is audited.",
          "operationId": "NotificationSettingsController_update",
          "parameters": [
            {
              "name": "branchId",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/UpdateNotificationSettingDto"
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "Branch notification settings updated successfully."
            },
            "404": {
              "description": "Not Found - Branch does not exist."
            }
          },
          "security": [
            {
              "JWT-auth": []
            }
          ],
          "summary": "Update one branch's SMS notification settings",
          "tags": [
            "Settings - Notifications"
          ]
        }
      },
      "/api/v1/settings/notifications/report": {
        "get": {
          "description": "Backs the Email panel under Settings: whether the report is sent at all, the recipient list, and when it was last dispatched.",
          "operationId": "NotificationSettingsController_getReportSetting",
          "parameters": [],
          "responses": {
            "200": {
              "description": "Report settings retrieved successfully."
            }
          },
          "security": [
            {
              "JWT-auth": []
            }
          ],
          "summary": "Get the periodic report email settings",
          "tags": [
            "Settings - Notifications"
          ]
        },
        "patch": {
          "description": "The \"Send Report\" toggle. The change is audited.",
          "operationId": "NotificationSettingsController_updateReportSetting",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/UpdateReportSettingDto"
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "Report setting updated successfully."
            }
          },
          "security": [
            {
              "JWT-auth": []
            }
          ],
          "summary": "Turn the periodic report on or off",
          "tags": [
            "Settings - Notifications"
          ]
        }
      },
      "/api/v1/settings/notifications/report/recipients": {
        "post": {
          "description": "The \"Add New Email\" action. The change is audited.",
          "operationId": "NotificationSettingsController_addRecipient",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/AddReportRecipientDto"
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": "Recipient added successfully."
            },
            "400": {
              "description": "Bad Request - The address is already on the list."
            }
          },
          "security": [
            {
              "JWT-auth": []
            }
          ],
          "summary": "Add an email address to the report distribution list",
          "tags": [
            "Settings - Notifications"
          ]
        }
      },
      "/api/v1/settings/notifications/report/recipients/{email}": {
        "delete": {
          "description": "The \"Remove email\" action. The change is audited.",
          "operationId": "NotificationSettingsController_removeRecipient",
          "parameters": [
            {
              "name": "email",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Recipient removed successfully."
            },
            "404": {
              "description": "Not Found - The address is not on the list."
            }
          },
          "security": [
            {
              "JWT-auth": []
            }
          ],
          "summary": "Remove an email address from the report distribution list",
          "tags": [
            "Settings - Notifications"
          ]
        }
      },
      "/api/v1/loan-officers": {
        "get": {
          "description": "Backs the Loan Officers screen. Each row carries the officer's employee ID, name, branch, active loan count, collection rate and outstanding overdue balance, plus their availability. Figures are computed in a single grouped aggregation, so the cost does not grow with the size of the roster. Branch managers are automatically restricted to their own branch.",
          "operationId": "LoanOfficersController_findAll",
          "parameters": [
            {
              "name": "total",
              "required": false,
              "in": "query",
              "description": "The total number of items",
              "schema": {
                "minimum": 0,
                "example": 100,
                "type": "number"
              }
            },
            {
              "name": "page",
              "required": false,
              "in": "query",
              "description": "The current page number",
              "schema": {
                "minimum": 1,
                "example": 1,
                "type": "number"
              }
            },
            {
              "name": "limit",
              "required": false,
              "in": "query",
              "description": "The number of items per page",
              "schema": {
                "minimum": 1,
                "example": 10,
                "type": "number"
              }
            },
            {
              "name": "search",
              "required": false,
              "in": "query",
              "description": "Free-text search across officer name, employee ID and email. Backs the \"Search officer\" box.",
              "schema": {
                "example": "Adeola",
                "type": "string"
              }
            },
            {
              "name": "branchId",
              "required": false,
              "in": "query",
              "description": "Restrict to one branch",
              "schema": {
                "example": "60d5ec4b8f3a3f3b9c8b4567",
                "type": "string"
              }
            },
            {
              "name": "availabilityStatus",
              "required": false,
              "in": "query",
              "description": "Filter by whether the officer is taking new assignments",
              "schema": {
                "type": "string",
                "enum": [
                  "ACTIVE",
                  "UNAVAILABLE"
                ]
              }
            },
            {
              "name": "order",
              "required": false,
              "in": "query",
              "description": "Sort order by officer name",
              "schema": {
                "default": "ASC",
                "type": "string",
                "enum": [
                  "ASC",
                  "DESC"
                ]
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Loan officers retrieved successfully."
            }
          },
          "security": [
            {
              "JWT-auth": []
            }
          ],
          "summary": "List loan officers with portfolio figures (paginated)",
          "tags": [
            "Loan Officers"
          ]
        },
        "post": {
          "description": "The \"Add New Officer\" action. Creates a user account under the LOAN_OFFICER role, posted to the given branch (or the creator's branch), with a loan capacity and monthly collection target that drive the portfolio snapshot figures.",
          "operationId": "LoanOfficersController_create",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/CreateLoanOfficerDto"
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": "Loan officer created successfully."
            },
            "400": {
              "description": "Bad Request - Email already registered, or the LOAN_OFFICER role is not configured."
            }
          },
          "security": [
            {
              "JWT-auth": []
            }
          ],
          "summary": "Add a new loan officer",
          "tags": [
            "Loan Officers"
          ]
        }
      },
      "/api/v1/loan-officers/{id}/snapshot": {
        "get": {
          "description": "Backs the Portfolio Snapshot modal: assigned loans against capacity (\"72/75\" and the percentage), this month's collection against the officer's target, and the problem loans needing attention — overdue loans with days past due, and loans sitting on a partial payment with the balance outstanding.",
          "operationId": "LoanOfficersController_snapshot",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Portfolio snapshot retrieved successfully."
            },
            "404": {
              "description": "Not Found - Officer does not exist."
            }
          },
          "security": [
            {
              "JWT-auth": []
            }
          ],
          "summary": "Get an officer's portfolio snapshot",
          "tags": [
            "Loan Officers"
          ]
        }
      },
      "/api/v1/loan-officers/{id}/loans": {
        "get": {
          "description": "Backs the loan table inside the Reassign Loans modal. Returns the officer's book with each loan's reference, loanee, principal, amount paid, next due date and status, so rows can be ticked for transfer.",
          "operationId": "LoanOfficersController_findLoans",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "total",
              "required": false,
              "in": "query",
              "description": "The total number of items",
              "schema": {
                "minimum": 0,
                "example": 100,
                "type": "number"
              }
            },
            {
              "name": "page",
              "required": false,
              "in": "query",
              "description": "The current page number",
              "schema": {
                "minimum": 1,
                "example": 1,
                "type": "number"
              }
            },
            {
              "name": "limit",
              "required": false,
              "in": "query",
              "description": "The number of items per page",
              "schema": {
                "minimum": 1,
                "example": 10,
                "type": "number"
              }
            },
            {
              "name": "search",
              "required": false,
              "in": "query",
              "description": "Free-text search across loan reference, account number and loanee name.",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Assigned loans retrieved successfully."
            }
          },
          "security": [
            {
              "JWT-auth": []
            }
          ],
          "summary": "List the loans currently assigned to an officer",
          "tags": [
            "Loan Officers"
          ]
        }
      },
      "/api/v1/loan-officers/{id}/reassign": {
        "post": {
          "description": "The \"Reassign Loans\" action. Moves the ticked loans from this officer to the target officer inside a transaction, keeping the denormalised officer and branch on each instalment in step so collection figures stay correct. Refuses to transfer to an officer marked unavailable. The move, the reason and the affected loan references are written to the audit trail.",
          "operationId": "LoanOfficersController_reassign",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ReassignLoansDto"
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": "Loans reassigned successfully.",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "reassigned": {
                        "type": "number",
                        "example": 23
                      },
                      "targetOfficerId": {
                        "type": "string",
                        "example": "60d5ec4b8f3a3f3b9c8b4567"
                      }
                    }
                  }
                }
              }
            },
            "400": {
              "description": "Bad Request - Same officer, target unavailable, or none of the loans belong to this officer."
            }
          },
          "security": [
            {
              "JWT-auth": []
            }
          ],
          "summary": "Reassign selected loans to another officer",
          "tags": [
            "Loan Officers"
          ]
        }
      },
      "/api/v1/loan-officers/{id}/availability": {
        "patch": {
          "description": "The \"Mark as Unavailable\" row action. An unavailable officer keeps their existing book but cannot receive reassigned loans. The change and its reason are audited.",
          "operationId": "LoanOfficersController_updateAvailability",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/UpdateOfficerAvailabilityDto"
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "Availability updated successfully."
            }
          },
          "security": [
            {
              "JWT-auth": []
            }
          ],
          "summary": "Mark an officer available or unavailable",
          "tags": [
            "Loan Officers"
          ]
        }
      },
      "/api/v1/dashboard/overview": {
        "get": {
          "description": "Backs the Overview screen for every role. Returns the Overall Loan, Active Loan and Overdue cards — each with its current value, the equivalent figure at the end of last month and the percentage movement between them, which is the \"than last month\" pill — plus the recent activity table beneath the chart. Results are scoped automatically: administrators and auditors see all branches, a branch manager sees their own branch, and a loan officer sees only their own book.",
          "operationId": "DashboardController_overview",
          "parameters": [
            {
              "name": "branchId",
              "required": false,
              "in": "query",
              "description": "Restrict figures to one branch. Ignored for callers already confined to a branch.",
              "schema": {
                "example": "60d5ec4b8f3a3f3b9c8b4567",
                "type": "string"
              }
            },
            {
              "name": "loanOfficerId",
              "required": false,
              "in": "query",
              "description": "Restrict figures to one loan officer",
              "schema": {
                "example": "60d5ec4b8f3a3f3b9c8b4567",
                "type": "string"
              }
            },
            {
              "name": "recentLimit",
              "required": false,
              "in": "query",
              "description": "How many rows to include in the recent activity table",
              "schema": {
                "minimum": 1,
                "default": 5,
                "example": 4,
                "type": "number"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Overview retrieved successfully.",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "overallLoan": {
                        "type": "object",
                        "properties": {
                          "value": {
                            "type": "string",
                            "example": "230221100.45"
                          },
                          "previousValue": {
                            "type": "string",
                            "example": "227940000.00"
                          },
                          "changePercent": {
                            "type": "number",
                            "example": 1
                          },
                          "count": {
                            "type": "number",
                            "example": 434
                          }
                        }
                      },
                      "activeLoan": {
                        "type": "object"
                      },
                      "overdue": {
                        "type": "object"
                      },
                      "recentLoans": {
                        "type": "array",
                        "items": {
                          "type": "object",
                          "properties": {
                            "time": {
                              "type": "string",
                              "example": "2026-08-07T10:15:00.000Z"
                            },
                            "loanId": {
                              "type": "string",
                              "example": "LN-8589"
                            },
                            "loaneeName": {
                              "type": "string",
                              "example": "Adeola Bello"
                            },
                            "branchName": {
                              "type": "string",
                              "example": "Lagos Mainland"
                            },
                            "officerName": {
                              "type": "string",
                              "example": "Akin Gbola"
                            },
                            "amountPaid": {
                              "type": "string",
                              "example": "42500.00"
                            },
                            "outstandingLoan": {
                              "type": "string",
                              "example": "420500.00"
                            },
                            "status": {
                              "type": "string",
                              "example": "ONTIME"
                            },
                            "statusLabel": {
                              "type": "string",
                              "example": "On-Time"
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          "security": [
            {
              "JWT-auth": []
            }
          ],
          "summary": "Get the dashboard overview",
          "tags": [
            "Dashboard"
          ]
        }
      },
      "/api/v1/dashboard/performance-chart": {
        "get": {
          "description": "Backs the Loan Performance chart. Returns twelve points ending with the current month (or `endDate`), each carrying the amount disbursed and the amount collected in that month — the two lines on the chart. Months with no activity are returned as zero rather than omitted, so the axis stays complete.",
          "operationId": "DashboardController_performanceChart",
          "parameters": [
            {
              "name": "branchId",
              "required": false,
              "in": "query",
              "description": "Restrict figures to one branch. Ignored for callers already confined to a branch.",
              "schema": {
                "example": "60d5ec4b8f3a3f3b9c8b4567",
                "type": "string"
              }
            },
            {
              "name": "loanOfficerId",
              "required": false,
              "in": "query",
              "description": "Restrict figures to one loan officer",
              "schema": {
                "example": "60d5ec4b8f3a3f3b9c8b4567",
                "type": "string"
              }
            },
            {
              "name": "recentLimit",
              "required": false,
              "in": "query",
              "description": "How many rows to include in the recent activity table",
              "schema": {
                "minimum": 1,
                "default": 5,
                "example": 4,
                "type": "number"
              }
            },
            {
              "name": "endDate",
              "required": false,
              "in": "query",
              "description": "Last month to include. Defaults to the current month.",
              "schema": {
                "format": "date-time",
                "example": "2026-08-31T23:59:59.999Z",
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Chart series retrieved successfully.",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "array",
                    "items": {
                      "type": "object",
                      "properties": {
                        "label": {
                          "type": "string",
                          "example": "AUG"
                        },
                        "monthStart": {
                          "type": "string",
                          "example": "2026-08-01T00:00:00.000Z"
                        },
                        "disbursed": {
                          "type": "string",
                          "example": "5000000.00"
                        },
                        "collected": {
                          "type": "string",
                          "example": "3200000.00"
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          "security": [
            {
              "JWT-auth": []
            }
          ],
          "summary": "Get the twelve-month loan performance series",
          "tags": [
            "Dashboard"
          ]
        }
      },
      "/api/v1/dashboard/today": {
        "get": {
          "description": "Backs the officer field dashboard cards: total amount due today, amount collected today, how many distinct clients have an instalment due today, and how many accounts are currently overdue. Scoped to the caller.",
          "operationId": "DashboardController_today",
          "parameters": [
            {
              "name": "branchId",
              "required": false,
              "in": "query",
              "description": "Restrict figures to one branch. Ignored for callers already confined to a branch.",
              "schema": {
                "example": "60d5ec4b8f3a3f3b9c8b4567",
                "type": "string"
              }
            },
            {
              "name": "loanOfficerId",
              "required": false,
              "in": "query",
              "description": "Restrict figures to one loan officer",
              "schema": {
                "example": "60d5ec4b8f3a3f3b9c8b4567",
                "type": "string"
              }
            },
            {
              "name": "recentLimit",
              "required": false,
              "in": "query",
              "description": "How many rows to include in the recent activity table",
              "schema": {
                "minimum": 1,
                "default": 5,
                "example": 4,
                "type": "number"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Today's figures retrieved successfully.",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "totalDueToday": {
                        "type": "string",
                        "example": "142500000.00"
                      },
                      "collectedToday": {
                        "type": "string",
                        "example": "2500000.00"
                      },
                      "clientsDueToday": {
                        "type": "number",
                        "example": 14
                      },
                      "overdueAccounts": {
                        "type": "number",
                        "example": 4
                      }
                    }
                  }
                }
              }
            }
          },
          "security": [
            {
              "JWT-auth": []
            }
          ],
          "summary": "Get today's collection position",
          "tags": [
            "Dashboard"
          ]
        }
      },
      "/api/v1/dashboard/search": {
        "get": {
          "description": "Backs the \"Find loans/officers instantly\" header box. Matches loan references, virtual account numbers and loanee names on the loans side, and officer names, employee IDs and email addresses on the officers side. Restrict to one kind with `type`. Results respect the caller's branch scope.",
          "operationId": "DashboardController_search",
          "parameters": [
            {
              "name": "q",
              "required": true,
              "in": "query",
              "description": "What to look for — a loanee name, loan reference, account number or officer.",
              "schema": {
                "example": "LN-8589",
                "type": "string"
              }
            },
            {
              "name": "type",
              "required": false,
              "in": "query",
              "description": "Restrict the search to one kind of record",
              "schema": {
                "default": "all",
                "type": "string",
                "enum": [
                  "all",
                  "loans",
                  "officers"
                ]
              }
            },
            {
              "name": "limit",
              "required": false,
              "in": "query",
              "description": "Maximum results per kind",
              "schema": {
                "minimum": 1,
                "default": 10,
                "example": 5,
                "type": "number"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Search results retrieved successfully.",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "loans": {
                        "type": "array",
                        "items": {
                          "type": "object",
                          "properties": {
                            "portfolioId": {
                              "type": "string",
                              "example": "60d5ec4b8f3a3f3b9c8b4567"
                            },
                            "loanId": {
                              "type": "string",
                              "example": "LN-8589"
                            },
                            "loaneeName": {
                              "type": "string",
                              "example": "Adeola Bello"
                            },
                            "accountNumber": {
                              "type": "string",
                              "example": "9912345678"
                            },
                            "status": {
                              "type": "string",
                              "example": "ONTIME"
                            }
                          }
                        }
                      },
                      "officers": {
                        "type": "array",
                        "items": {
                          "type": "object",
                          "properties": {
                            "officerId": {
                              "type": "string",
                              "example": "60d5ec4b8f3a3f3b9c8b4567"
                            },
                            "employeeId": {
                              "type": "string",
                              "example": "LN-9723"
                            },
                            "fullName": {
                              "type": "string",
                              "example": "Akin Gbola"
                            },
                            "branchName": {
                              "type": "string",
                              "example": "Lagos Mainland"
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          "security": [
            {
              "JWT-auth": []
            }
          ],
          "summary": "Search loans and officers",
          "tags": [
            "Dashboard"
          ]
        }
      },
      "/api/v1/exports/tracker": {
        "get": {
          "description": "The Export button on the Tracker. Accepts the same filters as the table (branch, officer, status, search, date range) and returns the matching rows as a CSV download. Results are confined to the caller's scope, so an export can never contain rows the table would have withheld. The export is recorded on the audit trail.",
          "operationId": "ExportsController_exportTracker",
          "parameters": [
            {
              "name": "id",
              "required": false,
              "in": "query",
              "description": "Filter by portfolio ID",
              "schema": {
                "example": "60d5ec4b8f3a3f3b9c8b4567",
                "type": "string"
              }
            },
            {
              "name": "loaneeId",
              "required": false,
              "in": "query",
              "description": "Filter by loanee ID",
              "schema": {
                "example": "60d5ec4b8f3a3f3b9c8b4567",
                "type": "string"
              }
            },
            {
              "name": "loanId",
              "required": false,
              "in": "query",
              "description": "Filter by loan ID (e.g. LN-1234)",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "accountNumber",
              "required": false,
              "in": "query",
              "description": "Filter by account number",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "status",
              "required": false,
              "in": "query",
              "description": "Filter by status",
              "schema": {
                "type": "string",
                "enum": [
                  "PENDING",
                  "APPROVED",
                  "REJECTED",
                  "PARTIAL",
                  "OVERDUE",
                  "ONTIME",
                  "CLOSED"
                ]
              }
            },
            {
              "name": "loanOfficerId",
              "required": false,
              "in": "query",
              "description": "Filter by loan officer ID",
              "schema": {
                "example": "60d5ec4b8f3a3f3b9c8b4567",
                "type": "string"
              }
            },
            {
              "name": "branchId",
              "required": false,
              "in": "query",
              "description": "Filter by branch. Backs the \"All Branches\" selector on the Tracker. Ignored for callers already confined to a branch.",
              "schema": {
                "example": "60d5ec4b8f3a3f3b9c8b4567",
                "type": "string"
              }
            },
            {
              "name": "search",
              "required": false,
              "in": "query",
              "description": "Free-text search across loan reference, account number and loanee name. Backs the \"Search Loans\" box.",
              "schema": {
                "example": "Adeola",
                "type": "string"
              }
            },
            {
              "name": "dateFrom",
              "required": false,
              "in": "query",
              "description": "Only loans with activity on or after this instant. Backs the \"Last 24 Hours\" time selector.",
              "schema": {
                "format": "date-time",
                "example": "2026-08-06T00:00:00.000Z",
                "type": "string"
              }
            },
            {
              "name": "dateTo",
              "required": false,
              "in": "query",
              "description": "Only loans with activity on or before this instant",
              "schema": {
                "format": "date-time",
                "example": "2026-08-07T23:59:59.999Z",
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "CSV file returned."
            }
          },
          "security": [
            {
              "JWT-auth": []
            }
          ],
          "summary": "Export the Tracker as CSV",
          "tags": [
            "Exports"
          ]
        }
      },
      "/api/v1/exports/accounts": {
        "get": {
          "description": "The Export button on the Accounts screen. Accepts the same filters as the table and returns the matching accounts, including virtual account number, bank, principal, total due and provisioning status. Scoped to the caller and audited.",
          "operationId": "ExportsController_exportAccounts",
          "parameters": [
            {
              "name": "search",
              "required": false,
              "in": "query",
              "description": "Free-text search across loanee name, loan reference and account number. Backs the \"Search Loanee\" box.",
              "schema": {
                "example": "Adeola",
                "type": "string"
              }
            },
            {
              "name": "accountStatus",
              "required": false,
              "in": "query",
              "description": "Filter by virtual account provisioning state",
              "schema": {
                "type": "string",
                "enum": [
                  "ACTIVE",
                  "PENDING",
                  "FAILED"
                ]
              }
            },
            {
              "name": "branchId",
              "required": false,
              "in": "query",
              "description": "Restrict to one branch",
              "schema": {
                "example": "60d5ec4b8f3a3f3b9c8b4567",
                "type": "string"
              }
            },
            {
              "name": "loanOfficerId",
              "required": false,
              "in": "query",
              "description": "Restrict to accounts assigned to one loan officer",
              "schema": {
                "example": "60d5ec4b8f3a3f3b9c8b4567",
                "type": "string"
              }
            },
            {
              "name": "dateFrom",
              "required": false,
              "in": "query",
              "description": "Only accounts created on or after this instant",
              "schema": {
                "format": "date-time",
                "example": "2026-08-01T00:00:00.000Z",
                "type": "string"
              }
            },
            {
              "name": "dateTo",
              "required": false,
              "in": "query",
              "description": "Only accounts created on or before this instant",
              "schema": {
                "format": "date-time",
                "example": "2026-08-31T23:59:59.999Z",
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "CSV file returned."
            }
          },
          "security": [
            {
              "JWT-auth": []
            }
          ],
          "summary": "Export the Accounts screen as CSV",
          "tags": [
            "Exports"
          ]
        }
      },
      "/api/v1/exports/loan-officers": {
        "get": {
          "description": "The Export button on the Loan Officers screen. Returns each officer with their branch, active loan count against capacity, collection rate, overdue exposure and availability. Scoped to the caller and audited.",
          "operationId": "ExportsController_exportLoanOfficers",
          "parameters": [
            {
              "name": "search",
              "required": false,
              "in": "query",
              "description": "Free-text search across officer name, employee ID and email. Backs the \"Search officer\" box.",
              "schema": {
                "example": "Adeola",
                "type": "string"
              }
            },
            {
              "name": "branchId",
              "required": false,
              "in": "query",
              "description": "Restrict to one branch",
              "schema": {
                "example": "60d5ec4b8f3a3f3b9c8b4567",
                "type": "string"
              }
            },
            {
              "name": "availabilityStatus",
              "required": false,
              "in": "query",
              "description": "Filter by whether the officer is taking new assignments",
              "schema": {
                "type": "string",
                "enum": [
                  "ACTIVE",
                  "UNAVAILABLE"
                ]
              }
            }
          ],
          "responses": {
            "200": {
              "description": "CSV file returned."
            }
          },
          "security": [
            {
              "JWT-auth": []
            }
          ],
          "summary": "Export the Loan Officers screen as CSV",
          "tags": [
            "Exports"
          ]
        }
      }
    },
    "info": {
      "title": "Track-Pay API Documentation",
      "description": "API description",
      "version": "1.0",
      "contact": {
        "name": "Developer",
        "url": "https://seun-daniel-omatsola.com",
        "email": "seundanielomatsola@gmail.com"
      },
      "license": {
        "name": "MIT",
        "url": "https://opensource.org/licenses/MIT"
      },
      "termsOfService": "https://track-pay.com/terms"
    },
    "tags": [
      {
        "name": "App",
        "description": "Core application utilities, landing page, and system health status."
      },
      {
        "name": "Authentication",
        "description": "Handles user login, two-factor (2FA) authentication, OTP requests, and password reset recovery flows."
      },
      {
        "name": "Users & RBAC",
        "description": "User accounts, Role-Based Access Control (RBAC), roles management, and permission assignments."
      },
      {
        "name": "Reconciliation",
        "description": "Transaction ingestion, reconciliation runs, matching payments, and run summaries."
      },
      {
        "name": "Logs",
        "description": "Search log records including application logs, event logs, and error logs."
      },
      {
        "name": "Integrations - Squad",
        "description": "Squad payment gateway integration, loanee virtual accounts, and real-time webhook parsing."
      },
      {
        "name": "Loan - Loanees",
        "description": "Loanee onboarding, profile tracking, and branch relations."
      },
      {
        "name": "Loan - Portfolios",
        "description": "Loan accounts, principal and interest details, and status updates."
      },
      {
        "name": "Loan - Repayments",
        "description": "Repayment records, state transitions (RECEIVED, APPLIED, REVERSED), and balance rollbacks."
      },
      {
        "name": "Loan - Schedules",
        "description": "Instalment schedules: generation, upcoming instalments, progress summaries, and overdue sweeps."
      },
      {
        "name": "Branches",
        "description": "Physical/virtual institution branch profiles, caching, and admin branch event logs."
      },
      {
        "name": "Dashboard",
        "description": "Overview cards with month-over-month movement, the twelve-month performance chart, today's collection position, and global loan/officer search."
      },
      {
        "name": "Accounts",
        "description": "Single and bulk account creation — loanee, loan portfolio, instalment schedule and virtual collection account — plus the Accounts directory."
      },
      {
        "name": "Loan Officers",
        "description": "Officer directory with portfolio figures, portfolio snapshots, loan reassignment, and availability."
      },
      {
        "name": "Uploads",
        "description": "The single entry point for every file in the system. Feature endpoints consume an uploadId rather than raw multipart."
      },
      {
        "name": "Audit Trail",
        "description": "The institutional activity log: who did what, to which record, when, and why."
      },
      {
        "name": "Settings - Notifications",
        "description": "Per-branch SMS notification matrix and the periodic report email distribution list."
      },
      {
        "name": "Exports",
        "description": "CSV downloads for the Tracker, Accounts and Loan Officers screens, scoped to the caller."
      }
    ],
    "servers": [],
    "components": {
      "securitySchemes": {
        "JWT-auth": {
          "scheme": "bearer",
          "bearerFormat": "JWT",
          "type": "http",
          "name": "Authorization",
          "in": "header"
        }
      },
      "schemas": {
        "LoginDto": {
          "type": "object",
          "properties": {
            "email": {
              "type": "string",
              "format": "email",
              "example": "omatsolaseund@gmail.com",
              "description": "User email"
            },
            "password": {
              "type": "string",
              "minLength": 8,
              "example": "superadminpassword",
              "description": "User password"
            }
          },
          "required": [
            "email",
            "password"
          ]
        },
        "ModulePermission": {
          "type": "object",
          "properties": {
            "module": {
              "type": "string",
              "description": "The application module this row grants access to",
              "enum": [
                "OVERVIEW",
                "TRACKER",
                "ACCOUNTS",
                "LOAN_OFFICERS",
                "TEAM",
                "SETTINGS"
              ],
              "example": "ACCOUNTS"
            },
            "view": {
              "type": "boolean",
              "description": "Whether the member can view this module",
              "example": true
            },
            "manage": {
              "type": "boolean",
              "description": "Whether the member can add and edit within this module. Implies view.",
              "example": false
            }
          },
          "required": [
            "module",
            "view",
            "manage"
          ]
        },
        "User": {
          "type": "object",
          "properties": {
            "_id": {
              "type": "string",
              "description": "The unique MongoDB ObjectId identifier",
              "example": "60d5ec4b8f3a3f3b9c8b4567"
            },
            "isActive": {
              "type": "boolean",
              "description": "Indicates if the entity is active",
              "example": true
            },
            "isDeleted": {
              "type": "boolean",
              "description": "Indicates if the entity has been deleted",
              "example": false
            },
            "createdAt": {
              "format": "date-time",
              "type": "string",
              "description": "The date and time this entity was created",
              "example": "2026-07-13T10:00:00.000Z"
            },
            "updatedAt": {
              "format": "date-time",
              "type": "string",
              "description": "The date and time this entity was last updated",
              "example": "2026-07-13T10:00:00.000Z"
            },
            "deletedAt": {
              "type": "object",
              "description": "The date and time this entity was deleted",
              "example": null,
              "nullable": true
            },
            "fullName": {
              "type": "string",
              "description": "The full display name of the user. Kept in step with the first/middle/last parts on every write, and stored rather than derived so a multi-word search such as \"Ada Bello\" can match a single field.",
              "example": "John Doe"
            },
            "firstName": {
              "type": "string",
              "description": "First name of the user",
              "example": "John"
            },
            "middleName": {
              "type": "string",
              "description": "Middle name of the user",
              "example": "Arthur"
            },
            "lastName": {
              "type": "string",
              "description": "Last name of the user",
              "example": "Doe"
            },
            "employeeId": {
              "type": "string",
              "description": "Human-readable staff identifier shown as the Employee ID column on the Team and Loan Officers screens",
              "example": "LN-9723"
            },
            "email": {
              "type": "string",
              "description": "The email address of the user",
              "example": "omatsolaseund@gmail.com"
            },
            "phoneNumber": {
              "type": "string",
              "description": "Contact phone number",
              "example": "+2348012345678"
            },
            "twoFactorEnabled": {
              "type": "boolean",
              "description": "Indicates if two-factor authentication is enabled",
              "example": false
            },
            "roleId": {
              "type": "string",
              "description": "The role ID assigned to the user",
              "example": "60d5ec4b8f3a3f3b9c8b4567",
              "nullable": true
            },
            "branchId": {
              "type": "string",
              "description": "The branch ID associated with the user",
              "example": "60d5ec4b8f3a3f3b9c8b4567",
              "nullable": true
            },
            "availabilityStatus": {
              "type": "string",
              "description": "Whether this officer is taking new assignments. Toggled by the \"Mark as Unavailable\" row action on the Loan Officers screen.",
              "enum": [
                "ACTIVE",
                "UNAVAILABLE"
              ],
              "example": "ACTIVE"
            },
            "maxAssignedLoans": {
              "type": "number",
              "description": "Maximum loans this officer may hold. Drives the \"72/75 (96% capacity)\" figure on the portfolio snapshot.",
              "example": 75
            },
            "monthlyCollectionTarget": {
              "type": "string",
              "description": "Monthly collection target for this officer, against which collected-to-date is measured on the portfolio snapshot.",
              "example": "3000000.00"
            },
            "modulePermissions": {
              "description": "Per-module View/Manage access grid set on the Add New Team Member modal. Supplements the role-level permission list.",
              "type": "array",
              "items": {
                "$ref": "#/components/schemas/ModulePermission"
              }
            },
            "photoUrl": {
              "type": "string",
              "description": "URL of the profile photo",
              "example": "https://example.com/photos/avatar.png"
            },
            "photoUploadId": {
              "type": "string",
              "description": "ID of the Upload record holding the profile photo",
              "example": "60d5ec4b8f3a3f3b9c8b4567",
              "nullable": true
            }
          },
          "required": [
            "_id",
            "isActive",
            "isDeleted",
            "createdAt",
            "updatedAt",
            "deletedAt",
            "fullName",
            "firstName",
            "middleName",
            "lastName",
            "employeeId",
            "email",
            "phoneNumber",
            "twoFactorEnabled",
            "roleId",
            "branchId",
            "availabilityStatus",
            "maxAssignedLoans",
            "monthlyCollectionTarget",
            "modulePermissions",
            "photoUrl",
            "photoUploadId"
          ]
        },
        "CreateUserDto": {
          "type": "object",
          "properties": {
            "fullName": {
              "type": "string",
              "description": "Full display name. Composed from the first, middle and last names when omitted, and recomposed whenever any of those parts is edited.",
              "example": "John Doe"
            },
            "firstName": {
              "type": "string",
              "description": "First name of the user",
              "example": "John"
            },
            "middleName": {
              "type": "string",
              "description": "Middle name of the user",
              "example": "Arthur"
            },
            "lastName": {
              "type": "string",
              "description": "Last name of the user",
              "example": "Doe"
            },
            "employeeId": {
              "type": "string",
              "minLength": 1,
              "maxLength": 64,
              "description": "Staff identifier shown as the Employee ID column. Generated in the LN-#### format when omitted.",
              "example": "LN-9723"
            },
            "email": {
              "type": "string",
              "format": "email",
              "description": "Email address of the user",
              "example": "johndoe@example.com"
            },
            "phoneNumber": {
              "type": "string",
              "minLength": 0,
              "maxLength": 20,
              "description": "Contact phone number",
              "example": "+2348012345678"
            },
            "password": {
              "type": "string",
              "minLength": 8,
              "description": "Password for the user account",
              "example": "P@ssw0rd!"
            },
            "roleId": {
              "type": "string",
              "description": "ID of the role assigned to the user",
              "example": "60d5ec4b8f3a3f3b9c8b4567"
            },
            "roleName": {
              "type": "string",
              "description": "Role by name, as typed into the \"Role\" field on the Add New Team Member modal. The role is created if it does not exist. Ignored when roleId is supplied.",
              "example": "Business Development Manager"
            },
            "branchId": {
              "type": "string",
              "description": "ID of the branch associated with the user",
              "example": "60d5ec4b8f3a3f3b9c8b4567"
            },
            "modulePermissions": {
              "description": "Per-module View/Manage access grid from the permission matrix. Modules left out default to no access.",
              "type": "array",
              "items": {
                "$ref": "#/components/schemas/ModulePermission"
              }
            },
            "maxAssignedLoans": {
              "type": "number",
              "description": "Maximum loans this user may hold, when they are a loan officer",
              "example": 75
            },
            "monthlyCollectionTarget": {
              "type": "string",
              "description": "Monthly collection target, when this user is a loan officer",
              "example": "3000000.00"
            },
            "photoUploadId": {
              "type": "string",
              "description": "ID of an uploaded profile photo, from POST /uploads with purpose USER_AVATAR",
              "example": "60d5ec4b8f3a3f3b9c8b4567"
            },
            "isActive": {
              "type": "boolean",
              "description": "Indicates if the user is active",
              "example": true
            },
            "isDeleted": {
              "type": "boolean",
              "description": "Indicates if the user is deleted",
              "example": false
            }
          },
          "required": [
            "email",
            "password"
          ]
        },
        "UpdateModulePermissionsDto": {
          "type": "object",
          "properties": {
            "modulePermissions": {
              "description": "The complete View/Manage grid. Modules omitted are treated as no access, and Manage always implies View.",
              "type": "array",
              "items": {
                "$ref": "#/components/schemas/ModulePermission"
              }
            }
          },
          "required": [
            "modulePermissions"
          ]
        },
        "SetUserActiveDto": {
          "type": "object",
          "properties": {
            "reason": {
              "type": "string",
              "description": "Why the account was deactivated or reinstated",
              "example": "Left the organisation on 31 August"
            }
          }
        },
        "PaginationResponseDto": {
          "type": "object",
          "properties": {
            "data": {
              "type": "array",
              "description": "The data being paginated"
            },
            "total": {
              "type": "number",
              "description": "The total number of items",
              "example": 100,
              "minimum": 0
            },
            "page": {
              "type": "number",
              "description": "The current page number",
              "example": 1,
              "minimum": 1
            },
            "limit": {
              "type": "number",
              "description": "The total number of pages",
              "example": 10
            }
          },
          "required": [
            "data",
            "total",
            "page",
            "limit"
          ]
        },
        "Role": {
          "type": "object",
          "properties": {
            "_id": {
              "type": "string",
              "description": "The unique MongoDB ObjectId identifier",
              "example": "60d5ec4b8f3a3f3b9c8b4567"
            },
            "isActive": {
              "type": "boolean",
              "description": "Indicates if the entity is active",
              "example": true
            },
            "isDeleted": {
              "type": "boolean",
              "description": "Indicates if the entity has been deleted",
              "example": false
            },
            "createdAt": {
              "format": "date-time",
              "type": "string",
              "description": "The date and time this entity was created",
              "example": "2026-07-13T10:00:00.000Z"
            },
            "updatedAt": {
              "format": "date-time",
              "type": "string",
              "description": "The date and time this entity was last updated",
              "example": "2026-07-13T10:00:00.000Z"
            },
            "deletedAt": {
              "type": "object",
              "description": "The date and time this entity was deleted",
              "example": null,
              "nullable": true
            },
            "name": {
              "type": "string",
              "description": "The name of the role",
              "example": "ADMIN"
            },
            "description": {
              "type": "string",
              "description": "A description of what the role can do",
              "example": "Administrator role with full access"
            },
            "permissionIds": {
              "description": "Mapped permissions for this role",
              "example": [
                "60d5ec4b8f3a3f3b9c8b4567"
              ],
              "type": "array",
              "items": {
                "type": "string"
              }
            }
          },
          "required": [
            "_id",
            "isActive",
            "isDeleted",
            "createdAt",
            "updatedAt",
            "deletedAt",
            "name",
            "description",
            "permissionIds"
          ]
        },
        "CreateRoleDto": {
          "type": "object",
          "properties": {
            "name": {
              "type": "string"
            },
            "description": {
              "type": "string"
            },
            "isActive": {
              "type": "boolean"
            },
            "isDeleted": {
              "type": "boolean"
            }
          },
          "required": [
            "name"
          ]
        },
        "UpdateRoleDto": {
          "type": "object",
          "properties": {}
        },
        "CreatePermissionDto": {
          "type": "object",
          "properties": {
            "name": {
              "type": "string"
            },
            "description": {
              "type": "string"
            },
            "isActive": {
              "type": "boolean"
            },
            "isDeleted": {
              "type": "boolean"
            }
          },
          "required": [
            "name"
          ]
        },
        "Permission": {
          "type": "object",
          "properties": {
            "_id": {
              "type": "string",
              "description": "The unique MongoDB ObjectId identifier",
              "example": "60d5ec4b8f3a3f3b9c8b4567"
            },
            "isActive": {
              "type": "boolean",
              "description": "Indicates if the entity is active",
              "example": true
            },
            "isDeleted": {
              "type": "boolean",
              "description": "Indicates if the entity has been deleted",
              "example": false
            },
            "createdAt": {
              "format": "date-time",
              "type": "string",
              "description": "The date and time this entity was created",
              "example": "2026-07-13T10:00:00.000Z"
            },
            "updatedAt": {
              "format": "date-time",
              "type": "string",
              "description": "The date and time this entity was last updated",
              "example": "2026-07-13T10:00:00.000Z"
            },
            "deletedAt": {
              "type": "object",
              "description": "The date and time this entity was deleted",
              "example": null,
              "nullable": true
            },
            "name": {
              "type": "string",
              "description": "The unique key name of the permission",
              "example": "CREATE_USER"
            },
            "description": {
              "type": "string",
              "description": "The description of what the permission enables",
              "example": "Allow creating new user accounts"
            }
          },
          "required": [
            "_id",
            "isActive",
            "isDeleted",
            "createdAt",
            "updatedAt",
            "deletedAt",
            "name",
            "description"
          ]
        },
        "UpdatePermissionDto": {
          "type": "object",
          "properties": {}
        },
        "UpdateUserDto": {
          "type": "object",
          "properties": {}
        },
        "CreateUploadDto": {
          "type": "object",
          "properties": {
            "file": {
              "type": "string",
              "description": "The file to store",
              "format": "binary"
            },
            "purpose": {
              "enum": [
                "BULK_ACCOUNTS",
                "RECONCILIATION_IMPORT",
                "LOANEE_PHOTO",
                "USER_AVATAR",
                "KYC_DOCUMENT",
                "GENERAL"
              ],
              "type": "string",
              "description": "What the file is for. Determines which MIME types are accepted and which feature endpoint may consume it.",
              "default": "GENERAL"
            }
          },
          "required": [
            "file"
          ]
        },
        "Upload": {
          "type": "object",
          "properties": {
            "_id": {
              "type": "string",
              "description": "The unique MongoDB ObjectId identifier",
              "example": "60d5ec4b8f3a3f3b9c8b4567"
            },
            "isActive": {
              "type": "boolean",
              "description": "Indicates if the entity is active",
              "example": true
            },
            "isDeleted": {
              "type": "boolean",
              "description": "Indicates if the entity has been deleted",
              "example": false
            },
            "createdAt": {
              "format": "date-time",
              "type": "string",
              "description": "The date and time this entity was created",
              "example": "2026-07-13T10:00:00.000Z"
            },
            "updatedAt": {
              "format": "date-time",
              "type": "string",
              "description": "The date and time this entity was last updated",
              "example": "2026-07-13T10:00:00.000Z"
            },
            "deletedAt": {
              "type": "object",
              "description": "The date and time this entity was deleted",
              "example": null,
              "nullable": true
            },
            "originalName": {
              "type": "string",
              "description": "Original filename as supplied by the client",
              "example": "ikeja-accounts-oct.csv"
            },
            "mimeType": {
              "type": "string",
              "description": "Detected MIME type of the stored file",
              "example": "text/csv"
            },
            "size": {
              "type": "number",
              "description": "Size of the stored file in bytes",
              "example": 20480
            },
            "storageKey": {
              "type": "string",
              "description": "Opaque key identifying the object within the active storage driver",
              "example": "2026/08/8f3a3f3b-9c8b-4567-a716-446655440000.csv"
            },
            "storageDriver": {
              "type": "string",
              "description": "Name of the storage driver that holds the bytes",
              "enum": [
                "cloudinary",
                "s3",
                "local"
              ],
              "example": "cloudinary"
            },
            "url": {
              "type": "string",
              "description": "Directly usable URL for the file. A CDN URL when the storage driver serves one, otherwise the absolute API download route. Safe to put straight into an <img src> or a link.",
              "example": "https://res.cloudinary.com/demo/image/upload/trackpay/user-avatar/2026/08/8f3a3f3b-9c8b-4567-a716-446655440000.jpg"
            },
            "purpose": {
              "type": "string",
              "description": "What this file is for",
              "enum": [
                "BULK_ACCOUNTS",
                "RECONCILIATION_IMPORT",
                "LOANEE_PHOTO",
                "USER_AVATAR",
                "KYC_DOCUMENT",
                "GENERAL"
              ],
              "example": "BULK_ACCOUNTS"
            },
            "status": {
              "type": "string",
              "description": "Processing lifecycle state of the file",
              "enum": [
                "AVAILABLE",
                "PROCESSING",
                "PROCESSED",
                "FAILED"
              ],
              "example": "AVAILABLE"
            },
            "checksum": {
              "type": "string",
              "description": "SHA-256 checksum of the stored bytes, for de-duplication",
              "example": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
            },
            "uploadedById": {
              "type": "string",
              "description": "ID of the user who uploaded the file",
              "example": "60d5ec4b8f3a3f3b9c8b4567",
              "nullable": true
            },
            "branchId": {
              "type": "string",
              "description": "Branch the uploading user belonged to at upload time",
              "example": "60d5ec4b8f3a3f3b9c8b4567",
              "nullable": true
            },
            "processingResult": {
              "type": "object",
              "description": "Free-form detail recorded by whichever feature consumed the file (row counts, failure reason, resulting run id).",
              "example": {
                "rowCount": 42,
                "succeeded": 40,
                "failed": 2
              },
              "nullable": true
            }
          },
          "required": [
            "_id",
            "isActive",
            "isDeleted",
            "createdAt",
            "updatedAt",
            "deletedAt",
            "originalName",
            "mimeType",
            "size",
            "storageKey",
            "storageDriver",
            "url",
            "purpose",
            "status",
            "checksum",
            "uploadedById",
            "branchId",
            "processingResult"
          ]
        },
        "CreateBranchDto": {
          "type": "object",
          "properties": {
            "name": {
              "type": "string",
              "description": "Branch name",
              "example": "Ibadan Hub Central"
            },
            "location": {
              "type": "string",
              "description": "Street address of the branch",
              "example": "Suite 402, Ring Road"
            },
            "addressLabel": {
              "type": "string",
              "description": "Building or complex the branch occupies",
              "example": "Ibadan Central Plaza"
            },
            "city": {
              "type": "string",
              "description": "City",
              "example": "Ibadan"
            },
            "state": {
              "type": "string",
              "description": "State or province",
              "example": "Oyo State"
            },
            "country": {
              "type": "string",
              "description": "Country",
              "example": "Nigeria"
            },
            "latitude": {
              "type": "number",
              "description": "Latitude for the Location Visualization pin",
              "example": 7.3775
            },
            "longitude": {
              "type": "number",
              "description": "Longitude for the Location Visualization pin",
              "example": 3.947
            },
            "regionalZone": {
              "type": "string",
              "description": "Operating region this branch rolls up to",
              "example": "Western Hub A"
            },
            "type": {
              "enum": [
                "PHYSICAL",
                "VIRTUAL"
              ],
              "type": "string",
              "description": "Staffed location or book-only entity",
              "example": "PHYSICAL"
            },
            "status": {
              "enum": [
                "ACTIVE",
                "PENDING_ACTIVATION",
                "SUSPENDED",
                "CLOSED"
              ],
              "type": "string",
              "description": "Operating state to open the branch in. Defaults to ACTIVE; pass PENDING_ACTIVATION to stand a branch up before it starts trading.",
              "example": "PENDING_ACTIVATION"
            },
            "parentBranchId": {
              "type": "string",
              "description": "Parent branch, when this is a sub-branch",
              "example": "60d5ec4b8f3a3f3b9c8b4567"
            },
            "isHeadOffice": {
              "type": "boolean",
              "description": "Whether this branch is the head office",
              "example": false
            },
            "isActive": {
              "type": "boolean",
              "description": "Legacy activity flag. Kept in step with `status` — prefer PATCH /branches/:id/status to open or close a branch.",
              "example": true
            }
          },
          "required": [
            "name"
          ]
        },
        "Branch": {
          "type": "object",
          "properties": {
            "_id": {
              "type": "string",
              "description": "The unique MongoDB ObjectId identifier",
              "example": "60d5ec4b8f3a3f3b9c8b4567"
            },
            "isActive": {
              "type": "boolean",
              "description": "Indicates if the entity is active",
              "example": true
            },
            "isDeleted": {
              "type": "boolean",
              "description": "Indicates if the entity has been deleted",
              "example": false
            },
            "createdAt": {
              "format": "date-time",
              "type": "string",
              "description": "The date and time this entity was created",
              "example": "2026-07-13T10:00:00.000Z"
            },
            "updatedAt": {
              "format": "date-time",
              "type": "string",
              "description": "The date and time this entity was last updated",
              "example": "2026-07-13T10:00:00.000Z"
            },
            "deletedAt": {
              "type": "object",
              "description": "The date and time this entity was deleted",
              "example": null,
              "nullable": true
            },
            "name": {
              "type": "string",
              "description": "The name of the branch",
              "example": "Ibadan Hub Central"
            },
            "code": {
              "type": "string",
              "description": "Human-readable branch identifier, shown as \"System Identifier\" on the branch detail header and as the Branch ID column under Settings → Branch Configuration.",
              "example": "BR-9912"
            },
            "location": {
              "type": "string",
              "description": "Street address of the branch, rendered under the pin on the Location Visualization card.",
              "example": "Suite 402, Ring Road"
            },
            "addressLabel": {
              "type": "string",
              "description": "Name of the building or complex the branch occupies. Rendered as the bold first line of the map address card.",
              "example": "Ibadan Central Plaza"
            },
            "city": {
              "type": "string",
              "description": "City the branch sits in",
              "example": "Ibadan"
            },
            "state": {
              "type": "string",
              "description": "State or province",
              "example": "Oyo State"
            },
            "country": {
              "type": "string",
              "description": "Country",
              "example": "Nigeria"
            },
            "latitude": {
              "type": "object",
              "description": "Latitude used to drop the pin on the Location Visualization map. Null when the branch has not been geocoded, in which case the client falls back to the text address.",
              "example": 7.3775,
              "nullable": true
            },
            "longitude": {
              "type": "object",
              "description": "Longitude used to drop the pin on the map",
              "example": 3.947,
              "nullable": true
            },
            "regionalZone": {
              "type": "string",
              "description": "Operating region this branch rolls up to, shown beside the system identifier on the detail header.",
              "example": "Western Hub A"
            },
            "type": {
              "type": "string",
              "description": "Whether the branch is a staffed location or a book-only entity. Paired with the status in the header badge (\"ACTIVE · PHYSICAL\").",
              "enum": [
                "PHYSICAL",
                "VIRTUAL"
              ],
              "example": "PHYSICAL"
            },
            "isHeadOffice": {
              "type": "boolean",
              "description": "Indicates if this branch is the head office",
              "example": true
            },
            "managerId": {
              "type": "string",
              "description": "The user ID of the designated branch manager. Null is a real state, not missing data: the Branch Leadership panel renders it as \"Unassigned — operations are overseen by Regional Admin\".",
              "example": "60d5ec4b8f3a3f3b9c8b4567",
              "nullable": true
            },
            "parentBranchId": {
              "type": "string",
              "description": "The parent branch ID if this is a sub-branch",
              "example": "60d5ec4b8f3a3f3b9c8b4567",
              "nullable": true
            },
            "status": {
              "type": "string",
              "description": "Operating state of the branch, toggled from Settings → Branch Configuration. A closed branch keeps its records but stops accepting new accounts.",
              "enum": [
                "ACTIVE",
                "PENDING_ACTIVATION",
                "SUSPENDED",
                "CLOSED"
              ],
              "example": "ACTIVE"
            }
          },
          "required": [
            "_id",
            "isActive",
            "isDeleted",
            "createdAt",
            "updatedAt",
            "deletedAt",
            "name",
            "code",
            "location",
            "addressLabel",
            "city",
            "state",
            "country",
            "latitude",
            "longitude",
            "regionalZone",
            "type",
            "isHeadOffice",
            "managerId",
            "parentBranchId",
            "status"
          ]
        },
        "BranchSummaryDto": {
          "type": "object",
          "properties": {
            "id": {
              "type": "string",
              "example": "60d5ec4b8f3a3f3b9c8b4567"
            },
            "branchId": {
              "type": "string",
              "description": "The human-readable branch code",
              "example": "BR-9912"
            },
            "name": {
              "type": "string",
              "example": "Ibadan Hub Central"
            },
            "location": {
              "type": "string",
              "example": "Suite 402, Ring Road, Ibadan, Oyo State, Nigeria"
            },
            "regionalZone": {
              "type": "string",
              "example": "Western Hub A"
            },
            "type": {
              "enum": [
                "PHYSICAL",
                "VIRTUAL"
              ],
              "type": "string",
              "example": "PHYSICAL"
            },
            "managerId": {
              "type": "string",
              "nullable": true,
              "example": "60d5ec4b8f3a3f3b9c8b4567"
            },
            "managerName": {
              "type": "string",
              "description": "Empty when unassigned, which the card renders as \"[Unassigned - Send Invite Email]\".",
              "example": "Oluwaseun Adewale"
            },
            "activeOfficers": {
              "type": "number",
              "description": "Staff posted to the branch",
              "example": 24
            },
            "activeLoans": {
              "type": "number",
              "example": 894
            },
            "totalExposure": {
              "type": "string",
              "description": "Outstanding across the branch book — the card's Total Exposure figure.",
              "example": "84200000.00"
            },
            "collectionRate": {
              "type": "number",
              "example": 98.1
            },
            "status": {
              "enum": [
                "ACTIVE",
                "PENDING_ACTIVATION",
                "SUSPENDED",
                "CLOSED"
              ],
              "type": "string",
              "example": "ACTIVE"
            },
            "statusLabel": {
              "type": "string",
              "example": "Active"
            }
          },
          "required": [
            "id",
            "branchId",
            "name",
            "location",
            "regionalZone",
            "type",
            "managerId",
            "managerName",
            "activeOfficers",
            "activeLoans",
            "totalExposure",
            "collectionRate",
            "status",
            "statusLabel"
          ]
        },
        "UpdateBranchStatusDto": {
          "type": "object",
          "properties": {
            "status": {
              "enum": [
                "ACTIVE",
                "PENDING_ACTIVATION",
                "SUSPENDED",
                "CLOSED"
              ],
              "type": "string",
              "description": "New operating state. Nothing here deletes data — a branch that is not ACTIVE keeps its records and only stops accepting new accounts. SUSPENDED backs the Suspend Operations action and is reversible; CLOSED is the end of the line.",
              "example": "SUSPENDED"
            },
            "reason": {
              "type": "string",
              "description": "Why the branch status changed. Recorded on the audit trail.",
              "example": "Consolidating operations into Lagos Mainland"
            }
          },
          "required": [
            "status"
          ]
        },
        "BranchLocationDto": {
          "type": "object",
          "properties": {
            "addressLabel": {
              "type": "string",
              "description": "Building or complex",
              "example": "Ibadan Central Plaza"
            },
            "addressLine": {
              "type": "string",
              "description": "Street address",
              "example": "Suite 402, Ring Road"
            },
            "city": {
              "type": "string",
              "example": "Ibadan"
            },
            "state": {
              "type": "string",
              "example": "Oyo State"
            },
            "country": {
              "type": "string",
              "example": "Nigeria"
            },
            "fullAddress": {
              "type": "string",
              "description": "The address as one line, in the order the map card renders it.",
              "example": "Suite 402, Ring Road, Ibadan, Oyo State, Nigeria"
            },
            "latitude": {
              "type": "number",
              "nullable": true,
              "description": "Null when the branch has not been geocoded.",
              "example": 7.3775
            },
            "longitude": {
              "type": "number",
              "nullable": true,
              "example": 3.947
            },
            "isMappable": {
              "type": "boolean",
              "description": "True when latitude and longitude are both present, i.e. the map can drop a pin rather than falling back to the text address.",
              "example": true
            }
          },
          "required": [
            "addressLabel",
            "addressLine",
            "city",
            "state",
            "country",
            "fullAddress",
            "latitude",
            "longitude",
            "isMappable"
          ]
        },
        "BranchMetricsDto": {
          "type": "object",
          "properties": {
            "totalLiquidity": {
              "type": "string",
              "description": "Outstanding balance across every open loan booked to this branch — the \"Total Liquidity\" figure, and the same number the Branch Matrix card calls Total Exposure.",
              "example": "142800000.00"
            },
            "totalLiquidityChangePercent": {
              "type": "number",
              "description": "Month-on-month movement in total liquidity, as a percentage. Compares the figure as it stands now against the same figure computed over loans that existed at the end of last month, which is what the \"↑ 4.2% MoM\" pill reports.",
              "example": 4.2
            },
            "activeLoans": {
              "type": "number",
              "description": "Loans on the branch book that are not closed",
              "example": 1204
            },
            "averageLoanSize": {
              "type": "string",
              "description": "Total liquidity divided by active loans — the \"Avg. size\" line.",
              "example": "118605.48"
            },
            "collectionRate": {
              "type": "number",
              "description": "Percentage of everything scheduled against this branch that has actually been collected, rounded to one decimal place.",
              "example": 91.2
            },
            "officerCount": {
              "type": "number",
              "description": "Everyone posted to the branch",
              "example": 24
            },
            "fieldOfficerCount": {
              "type": "number",
              "description": "Staff holding the LOAN_OFFICER role — the \"18 Field\" half of the split.",
              "example": 18
            },
            "adminOfficerCount": {
              "type": "number",
              "description": "Everyone else posted to the branch — the \"6 Admin\" half.",
              "example": 6
            }
          },
          "required": [
            "totalLiquidity",
            "totalLiquidityChangePercent",
            "activeLoans",
            "averageLoanSize",
            "collectionRate",
            "officerCount",
            "fieldOfficerCount",
            "adminOfficerCount"
          ]
        },
        "BranchLeadershipDto": {
          "type": "object",
          "properties": {
            "isAssigned": {
              "type": "boolean",
              "description": "False renders the \"Unassigned — operations are overseen by Regional Admin\" empty state and the Invite Branch Manager action.",
              "example": false
            },
            "managerId": {
              "type": "string",
              "nullable": true,
              "example": "60d5ec4b8f3a3f3b9c8b4567"
            },
            "managerName": {
              "type": "string",
              "example": "Oluwaseun Adewale"
            },
            "managerEmployeeId": {
              "type": "string",
              "example": "LN-9723"
            },
            "managerEmail": {
              "type": "string",
              "example": "oluwaseun@institution.com"
            },
            "managerPhone": {
              "type": "string",
              "example": "+2348012345678"
            },
            "managerPhotoUrl": {
              "type": "string",
              "example": "https://example.com/photos/avatar.png"
            },
            "assignedAt": {
              "format": "date-time",
              "type": "string",
              "nullable": true,
              "description": "When the current manager was appointed, taken from the audit trail.",
              "example": "2026-07-13T10:00:00.000Z"
            }
          },
          "required": [
            "isAssigned",
            "managerId",
            "managerName",
            "managerEmployeeId",
            "managerEmail",
            "managerPhone",
            "managerPhotoUrl",
            "assignedAt"
          ]
        },
        "BranchTransactionRowDto": {
          "type": "object",
          "properties": {
            "id": {
              "type": "string",
              "example": "60d5ec4b8f3a3f3b9c8b4567"
            },
            "timestamp": {
              "format": "date-time",
              "type": "string",
              "example": "2026-08-15T10:15:00.000Z"
            },
            "type": {
              "enum": [
                "REPAYMENT",
                "DISBURSEMENT",
                "FEE_PAYMENT"
              ],
              "type": "string",
              "example": "REPAYMENT"
            },
            "typeLabel": {
              "type": "string",
              "description": "Display wording for the type",
              "example": "Repayment"
            },
            "loaneeName": {
              "type": "string",
              "example": "Adebayo O."
            },
            "loanId": {
              "type": "string",
              "example": "LN-9922"
            },
            "portfolioId": {
              "type": "string",
              "example": "60d5ec4b8f3a3f3b9c8b4567"
            },
            "amount": {
              "type": "string",
              "example": "45000.00"
            },
            "status": {
              "enum": [
                "COMPLETED",
                "PENDING"
              ],
              "type": "string",
              "example": "COMPLETED"
            },
            "statusLabel": {
              "type": "string",
              "description": "Display wording for the status",
              "example": "Completed"
            }
          },
          "required": [
            "id",
            "timestamp",
            "type",
            "typeLabel",
            "loaneeName",
            "loanId",
            "portfolioId",
            "amount",
            "status",
            "statusLabel"
          ]
        },
        "BranchOverviewDto": {
          "type": "object",
          "properties": {
            "id": {
              "type": "string",
              "example": "60d5ec4b8f3a3f3b9c8b4567"
            },
            "code": {
              "type": "string",
              "description": "The \"System Identifier\" line",
              "example": "BR-9912"
            },
            "name": {
              "type": "string",
              "example": "Ibadan Hub Central"
            },
            "status": {
              "enum": [
                "ACTIVE",
                "PENDING_ACTIVATION",
                "SUSPENDED",
                "CLOSED"
              ],
              "type": "string",
              "example": "ACTIVE"
            },
            "statusLabel": {
              "type": "string",
              "example": "Active"
            },
            "type": {
              "enum": [
                "PHYSICAL",
                "VIRTUAL"
              ],
              "type": "string",
              "example": "PHYSICAL"
            },
            "typeLabel": {
              "type": "string",
              "example": "Physical"
            },
            "badge": {
              "type": "string",
              "description": "The header badge, status and type combined as the design renders it.",
              "example": "ACTIVE · PHYSICAL"
            },
            "regionalZone": {
              "type": "string",
              "example": "Western Hub A"
            },
            "isHeadOffice": {
              "type": "boolean",
              "example": false
            },
            "parentBranchId": {
              "type": "string",
              "nullable": true,
              "example": "60d5ec4b8f3a3f3b9c8b4567"
            },
            "parentBranchName": {
              "type": "string",
              "example": "Lagos HQ"
            },
            "location": {
              "$ref": "#/components/schemas/BranchLocationDto"
            },
            "metrics": {
              "$ref": "#/components/schemas/BranchMetricsDto"
            },
            "leadership": {
              "$ref": "#/components/schemas/BranchLeadershipDto"
            },
            "recentTransactions": {
              "description": "The most recent movements on the branch book, newest first. Capped — \"View Full Logs\" pages through GET /branches/:id/transactions.",
              "type": "array",
              "items": {
                "$ref": "#/components/schemas/BranchTransactionRowDto"
              }
            }
          },
          "required": [
            "id",
            "code",
            "name",
            "status",
            "statusLabel",
            "type",
            "typeLabel",
            "badge",
            "regionalZone",
            "isHeadOffice",
            "parentBranchId",
            "parentBranchName",
            "location",
            "metrics",
            "leadership",
            "recentTransactions"
          ]
        },
        "AssignBranchManagerDto": {
          "type": "object",
          "properties": {
            "userId": {
              "type": "string",
              "description": "The user to designate as branch manager",
              "example": "60d5ec4b8f3a3f3b9c8b4567"
            },
            "transferFromCurrentBranch": {
              "type": "boolean",
              "description": "Allow moving a user who currently belongs to a different branch. Their branch membership is transferred to this branch. Without it, a cross-branch assignment is refused.",
              "example": false,
              "default": false
            },
            "allowMultipleBranches": {
              "type": "boolean",
              "description": "Allow a user to manage this branch while still managing another. Without it, a user who already manages a branch is refused, so nobody ends up running two branches by accident.",
              "example": false,
              "default": false
            },
            "reason": {
              "type": "string",
              "description": "Why the manager was appointed. Recorded on the audit trail.",
              "example": "Permanent appointment following Q3 restructure"
            }
          },
          "required": [
            "userId"
          ]
        },
        "UnassignBranchManagerDto": {
          "type": "object",
          "properties": {
            "removeFromBranch": {
              "type": "boolean",
              "description": "Also remove the outgoing manager from this branch entirely, clearing their branch membership. Off by default: losing the manager title does not normally mean leaving the branch.",
              "example": false,
              "default": false
            },
            "reason": {
              "type": "string",
              "description": "Why the manager was stood down. Recorded on the audit trail.",
              "example": "Transferred to Lagos HQ"
            }
          }
        },
        "UpdateBranchDto": {
          "type": "object",
          "properties": {
            "name": {
              "type": "string",
              "description": "Branch name",
              "example": "Ibadan Hub Central"
            },
            "location": {
              "type": "string",
              "description": "Street address of the branch",
              "example": "Suite 402, Ring Road"
            },
            "addressLabel": {
              "type": "string",
              "description": "Building or complex the branch occupies",
              "example": "Ibadan Central Plaza"
            },
            "city": {
              "type": "string",
              "description": "City",
              "example": "Ibadan"
            },
            "state": {
              "type": "string",
              "description": "State or province",
              "example": "Oyo State"
            },
            "country": {
              "type": "string",
              "description": "Country",
              "example": "Nigeria"
            },
            "latitude": {
              "type": "number",
              "description": "Latitude for the Location Visualization pin",
              "example": 7.3775
            },
            "longitude": {
              "type": "number",
              "description": "Longitude for the Location Visualization pin",
              "example": 3.947
            },
            "regionalZone": {
              "type": "string",
              "description": "Operating region this branch rolls up to",
              "example": "Western Hub A"
            },
            "type": {
              "enum": [
                "PHYSICAL",
                "VIRTUAL"
              ],
              "type": "string",
              "description": "Staffed location or book-only entity",
              "example": "PHYSICAL"
            },
            "status": {
              "enum": [
                "ACTIVE",
                "PENDING_ACTIVATION",
                "SUSPENDED",
                "CLOSED"
              ],
              "type": "string",
              "description": "Operating state to open the branch in. Defaults to ACTIVE; pass PENDING_ACTIVATION to stand a branch up before it starts trading.",
              "example": "PENDING_ACTIVATION"
            },
            "parentBranchId": {
              "type": "string",
              "description": "Parent branch, when this is a sub-branch",
              "example": "60d5ec4b8f3a3f3b9c8b4567"
            },
            "isHeadOffice": {
              "type": "boolean",
              "description": "Whether this branch is the head office",
              "example": false
            },
            "isActive": {
              "type": "boolean",
              "description": "Legacy activity flag. Kept in step with `status` — prefer PATCH /branches/:id/status to open or close a branch.",
              "example": true
            }
          }
        },
        "CreateLoaneeDto": {
          "type": "object",
          "properties": {
            "loaneeNumber": {
              "type": "number",
              "minimum": 1,
              "description": "Unique loanee number",
              "example": 1001
            },
            "firstName": {
              "type": "string",
              "minLength": 1,
              "maxLength": 255,
              "description": "First name of the loanee",
              "example": "Jane"
            },
            "lastName": {
              "type": "string",
              "minLength": 1,
              "maxLength": 255,
              "description": "Last name of the loanee",
              "example": "Doe"
            },
            "middleName": {
              "type": "string",
              "minLength": 0,
              "maxLength": 255,
              "description": "Middle name of the loanee",
              "example": "Adaeze"
            },
            "email": {
              "type": "string",
              "format": "email",
              "description": "Email address of the loanee",
              "example": "jane@example.com"
            },
            "phoneNumber": {
              "type": "string",
              "minLength": 0,
              "maxLength": 20,
              "description": "Phone number of the loanee",
              "example": "+2348012345678"
            },
            "photoUrl": {
              "type": "string",
              "description": "URL to loanee photo",
              "example": "https://cdn.example.com/photo.jpg"
            }
          },
          "required": [
            "loaneeNumber",
            "firstName",
            "lastName",
            "email"
          ]
        },
        "UpdateLoaneeDto": {
          "type": "object",
          "properties": {}
        },
        "CreateLoanPortfolioDto": {
          "type": "object",
          "properties": {
            "loaneeId": {
              "type": "string",
              "description": "ID of the loanee",
              "example": "60d5ec4b8f3a3f3b9c8b4567"
            },
            "principal": {
              "type": "string",
              "description": "Principal loan amount",
              "example": "50000.00"
            },
            "status": {
              "enum": [
                "PENDING",
                "APPROVED",
                "REJECTED",
                "PARTIAL",
                "OVERDUE",
                "ONTIME",
                "CLOSED"
              ],
              "type": "string",
              "description": "Loan status",
              "default": "PENDING"
            },
            "tenureMonths": {
              "type": "number",
              "minimum": 1,
              "description": "Tenure in months",
              "example": 12
            },
            "interestRate": {
              "type": "string",
              "description": "Interest rate (percentage)",
              "example": "5.5000"
            },
            "interestType": {
              "enum": [
                "FIXED",
                "FLOAT",
                "REDUCING"
              ],
              "type": "string",
              "description": "Interest type",
              "default": "FIXED"
            },
            "loanOfficerId": {
              "type": "string",
              "description": "ID of the assigned loan officer",
              "example": "60d5ec4b8f3a3f3b9c8b4567"
            },
            "nextDueDate": {
              "type": "string",
              "description": "Next repayment due date (ISO string)",
              "example": "2026-04-01T00:00:00.000Z"
            }
          },
          "required": [
            "loaneeId",
            "principal",
            "tenureMonths",
            "interestRate"
          ]
        },
        "UpdateLoanPortfolioDto": {
          "type": "object",
          "properties": {
            "status": {
              "enum": [
                "PENDING",
                "APPROVED",
                "REJECTED",
                "PARTIAL",
                "OVERDUE",
                "ONTIME",
                "CLOSED"
              ],
              "type": "string",
              "description": "Loan status override"
            }
          }
        },
        "CreateLoanRepaymentDto": {
          "type": "object",
          "properties": {
            "portfolioId": {
              "type": "string",
              "description": "ID of the loan portfolio",
              "example": "60d5ec4b8f3a3f3b9c8b4567"
            },
            "amount": {
              "type": "string",
              "description": "Repayment amount",
              "example": "5000.00"
            },
            "currency": {
              "type": "string",
              "minLength": 3,
              "maxLength": 3,
              "description": "Currency code (3 chars)",
              "example": "NGN",
              "default": "NGN"
            },
            "paidAt": {
              "type": "string",
              "description": "Date payment was made (ISO string)",
              "example": "2026-03-01T10:00:00.000Z"
            },
            "provider": {
              "type": "string",
              "description": "Payment provider name",
              "example": "SQUAD"
            },
            "providerReference": {
              "type": "string",
              "description": "Provider transaction reference",
              "example": "TXN-ABC123"
            }
          },
          "required": [
            "portfolioId",
            "amount"
          ]
        },
        "CreateAccountDto": {
          "type": "object",
          "properties": {
            "loanId": {
              "type": "string",
              "minLength": 1,
              "maxLength": 64,
              "description": "Loan reference to use. Generated in the LN-#### format when omitted.",
              "example": "LN-8589"
            },
            "firstName": {
              "type": "string",
              "minLength": 1,
              "maxLength": 255,
              "description": "First name of the loanee",
              "example": "Adeola"
            },
            "middleName": {
              "type": "string",
              "minLength": 0,
              "maxLength": 255,
              "description": "Middle name of the loanee",
              "example": "Ada"
            },
            "lastName": {
              "type": "string",
              "minLength": 1,
              "maxLength": 255,
              "description": "Last name of the loanee",
              "example": "Bello"
            },
            "email": {
              "type": "string",
              "format": "email",
              "description": "Email address. Required unless a phone number is supplied — the payment provider needs at least one contact to issue a virtual account.",
              "example": "adeola.bello@example.com"
            },
            "phoneNumber": {
              "type": "string",
              "minLength": 1,
              "maxLength": 20,
              "description": "Phone number. Required unless an email address is supplied. Also used for repayment SMS notifications.",
              "example": "+2348012345678"
            },
            "loanAmount": {
              "type": "string",
              "description": "Principal advanced to the loanee (\"Loan Amount\")",
              "example": "420500.00"
            },
            "cycleStepAmount": {
              "type": "string",
              "description": "Amount due per repayment cycle (\"Amount\"). The schedule is built by dividing the total repayable by this figure.",
              "example": "20000.00"
            },
            "repaymentInterval": {
              "enum": [
                "DAILY",
                "WEEKLY",
                "BIWEEKLY",
                "MONTHLY"
              ],
              "type": "string",
              "description": "How often a repayment falls due (\"Repayment Period\")",
              "example": "WEEKLY"
            },
            "firstDueDate": {
              "type": "string",
              "description": "Date the first repayment falls due. Defaults to one interval from today.",
              "example": "2026-09-01T00:00:00.000Z"
            },
            "loanOfficerId": {
              "type": "string",
              "description": "Loan officer to assign the account to",
              "example": "60d5ec4b8f3a3f3b9c8b4567"
            },
            "branchId": {
              "type": "string",
              "description": "Branch that owns the account. Defaults to the branch of the user creating it.",
              "example": "60d5ec4b8f3a3f3b9c8b4567"
            },
            "tenureMonths": {
              "type": "number",
              "minimum": 1,
              "description": "Loan tenure in months",
              "example": 12,
              "default": 12
            },
            "interestRate": {
              "type": "string",
              "description": "Annual interest rate as a percentage",
              "example": "5.5000",
              "default": "0"
            },
            "interestType": {
              "enum": [
                "FIXED",
                "FLOAT",
                "REDUCING"
              ],
              "type": "string",
              "description": "Interest calculation method",
              "default": "FIXED"
            },
            "photoUploadId": {
              "type": "string",
              "description": "ID of an uploaded photo for the loanee, obtained from POST /uploads with purpose LOANEE_PHOTO",
              "example": "60d5ec4b8f3a3f3b9c8b4567"
            }
          },
          "required": [
            "firstName",
            "lastName",
            "loanAmount",
            "cycleStepAmount",
            "repaymentInterval"
          ]
        },
        "CreateBulkAccountsDto": {
          "type": "object",
          "properties": {
            "uploadId": {
              "type": "string",
              "description": "ID of a previously uploaded CSV, from POST /uploads with purpose BULK_ACCOUNTS",
              "example": "60d5ec4b8f3a3f3b9c8b4567"
            },
            "branchId": {
              "type": "string",
              "description": "Branch to attribute every row to. Defaults to the branch of the user running the import.",
              "example": "60d5ec4b8f3a3f3b9c8b4567"
            },
            "dryRun": {
              "type": "boolean",
              "description": "Parse and validate every row, reporting what would happen, without writing anything.",
              "example": false,
              "default": false
            },
            "continueOnError": {
              "type": "boolean",
              "description": "Continue past rows that fail validation instead of aborting the whole import. Failures are reported per row either way.",
              "example": true,
              "default": true
            }
          },
          "required": [
            "uploadId"
          ]
        },
        "BulkAccountRowResultDto": {
          "type": "object",
          "properties": {
            "row": {
              "type": "number",
              "description": "1-based row number in the source file",
              "example": 7
            },
            "success": {
              "type": "boolean",
              "description": "Whether the row produced an account",
              "example": true
            },
            "loanId": {
              "type": "string",
              "nullable": true,
              "description": "Loan reference of the created account",
              "example": "LN-8589"
            },
            "portfolioId": {
              "type": "string",
              "nullable": true,
              "description": "ID of the created loan portfolio",
              "example": "60d5ec4b8f3a3f3b9c8b4567"
            },
            "error": {
              "type": "string",
              "nullable": true,
              "description": "Why the row was rejected, when it was",
              "example": "A loanee with this email already exists"
            }
          },
          "required": [
            "row",
            "success",
            "loanId",
            "portfolioId",
            "error"
          ]
        },
        "BulkAccountsResultDto": {
          "type": "object",
          "properties": {
            "uploadId": {
              "type": "string",
              "description": "ID of the source upload",
              "example": "60d5ec4b8f3a3f3b9c8b4567"
            },
            "dryRun": {
              "type": "boolean",
              "description": "Whether the import ran without writing",
              "example": false
            },
            "totalRows": {
              "type": "number",
              "description": "Number of data rows read",
              "example": 42
            },
            "succeeded": {
              "type": "number",
              "description": "Rows that produced an account",
              "example": 40
            },
            "failed": {
              "type": "number",
              "description": "Rows that were rejected",
              "example": 2
            },
            "results": {
              "type": "array",
              "items": {
                "$ref": "#/components/schemas/BulkAccountRowResultDto"
              }
            }
          },
          "required": [
            "uploadId",
            "dryRun",
            "totalRows",
            "succeeded",
            "failed",
            "results"
          ]
        },
        "CreateVirtualAccountDto": {
          "type": "object",
          "properties": {
            "name": {
              "type": "string",
              "example": "Jane Doe"
            },
            "email": {
              "type": "string",
              "format": "email",
              "example": "jane@example.com"
            },
            "phone": {
              "type": "string",
              "example": "+2348012345678"
            },
            "reference": {
              "type": "string",
              "example": "LOANEE-12345"
            }
          },
          "required": [
            "name",
            "email",
            "reference"
          ]
        },
        "ImportRepaymentsCsvDto": {
          "type": "object",
          "properties": {
            "uploadId": {
              "type": "string",
              "description": "ID of a previously uploaded CSV, from POST /uploads with purpose RECONCILIATION_IMPORT. The file is transferred separately so a failed run can be re-imported against the same stored file without re-uploading it.",
              "example": "60d5ec4b8f3a3f3b9c8b4567"
            },
            "provider": {
              "type": "string",
              "description": "A label for the source/provider of the CSV (e.g. SQUAD, BANK).",
              "example": "SQUAD"
            },
            "currency": {
              "type": "string",
              "minLength": 3,
              "maxLength": 3,
              "description": "Currency ISO code for amounts when not present in CSV.",
              "example": "NGN"
            }
          },
          "required": [
            "uploadId"
          ]
        },
        "UpdateNotificationSettingDto": {
          "type": "object",
          "properties": {
            "accountCreation": {
              "type": "boolean",
              "description": "Text the loanee when their account is created",
              "example": true
            },
            "loanPaymentConfirmation": {
              "type": "boolean",
              "description": "Text the loanee to confirm a repayment was received",
              "example": true
            },
            "loanOverdueReminder": {
              "type": "boolean",
              "description": "Text the loanee when an instalment falls overdue",
              "example": true
            },
            "all": {
              "type": "boolean",
              "description": "The \"All\" column. Sets every notification type for this branch at once and overrides the individual flags.",
              "example": true
            }
          }
        },
        "UpdateReportSettingDto": {
          "type": "object",
          "properties": {
            "sendReport": {
              "type": "boolean",
              "description": "Whether the periodic report is emailed",
              "example": true
            }
          },
          "required": [
            "sendReport"
          ]
        },
        "AddReportRecipientDto": {
          "type": "object",
          "properties": {
            "email": {
              "type": "string",
              "format": "email",
              "description": "Email address to add to the report distribution list",
              "example": "fatima.yusuf@example.com"
            }
          },
          "required": [
            "email"
          ]
        },
        "CreateLoanOfficerDto": {
          "type": "object",
          "properties": {
            "employeeId": {
              "type": "string",
              "minLength": 1,
              "maxLength": 64,
              "description": "Staff identifier. Generated when omitted.",
              "example": "LN-9723"
            },
            "firstName": {
              "type": "string",
              "description": "First name",
              "example": "Adeola"
            },
            "middleName": {
              "type": "string",
              "description": "Middle name",
              "example": "Ada"
            },
            "lastName": {
              "type": "string",
              "description": "Last name",
              "example": "Bello"
            },
            "email": {
              "type": "string",
              "description": "Work email address",
              "example": "a.bello@example.com"
            },
            "phoneNumber": {
              "type": "string",
              "description": "Contact phone number",
              "example": "+2348012345678"
            },
            "password": {
              "type": "string",
              "minLength": 8,
              "description": "Initial password for the officer account",
              "example": "S3cure-Passw0rd!"
            },
            "branchId": {
              "type": "string",
              "description": "Branch to post the officer to. Defaults to the creator's branch.",
              "example": "60d5ec4b8f3a3f3b9c8b4567"
            },
            "maxAssignedLoans": {
              "type": "number",
              "description": "Maximum loans this officer may hold, shown as the capacity figure on the portfolio snapshot.",
              "example": 75,
              "default": 75
            },
            "monthlyCollectionTarget": {
              "type": "string",
              "description": "Monthly collection target for this officer",
              "example": "3000000.00"
            }
          },
          "required": [
            "firstName",
            "lastName",
            "email",
            "password"
          ]
        },
        "ReassignLoansDto": {
          "type": "object",
          "properties": {
            "targetOfficerId": {
              "type": "string",
              "description": "Officer to transfer the selected loans to",
              "example": "60d5ec4b8f3a3f3b9c8b4567"
            },
            "portfolioIds": {
              "minItems": 1,
              "description": "Portfolios to transfer, matching the rows ticked in the modal. Pass every loan id to transfer the whole book.",
              "example": [
                "60d5ec4b8f3a3f3b9c8b4567",
                "60d5ec4b8f3a3f3b9c8b4568"
              ],
              "type": "array",
              "items": {
                "type": "string"
              }
            },
            "reason": {
              "type": "string",
              "description": "Justification for the transfer. Recorded on the audit trail alongside the actor and the affected loans.",
              "example": "Previous officer on extended leave"
            }
          },
          "required": [
            "targetOfficerId",
            "portfolioIds"
          ]
        },
        "UpdateOfficerAvailabilityDto": {
          "type": "object",
          "properties": {
            "availabilityStatus": {
              "enum": [
                "ACTIVE",
                "UNAVAILABLE"
              ],
              "type": "string",
              "description": "New availability state",
              "example": "UNAVAILABLE"
            },
            "reason": {
              "type": "string",
              "description": "Why the officer was marked unavailable",
              "example": "On medical leave until 30 September"
            }
          },
          "required": [
            "availabilityStatus"
          ]
        }
      }
    }
  },
  "customOptions": {
    "docExpansion": "none"
  }
};
  url = options.swaggerUrl || url
  let urls = options.swaggerUrls
  let customOptions = options.customOptions
  let spec1 = options.swaggerDoc
  let swaggerOptions = {
    spec: spec1,
    url: url,
    urls: urls,
    dom_id: '#swagger-ui',
    deepLinking: true,
    presets: [
      SwaggerUIBundle.presets.apis,
      SwaggerUIStandalonePreset
    ],
    plugins: [
      SwaggerUIBundle.plugins.DownloadUrl
    ],
    layout: "StandaloneLayout"
  }
  for (let attrname in customOptions) {
    swaggerOptions[attrname] = customOptions[attrname];
  }
  let ui = SwaggerUIBundle(swaggerOptions)

  if (customOptions.initOAuth) {
    ui.initOAuth(customOptions.initOAuth)
  }

  if (customOptions.authAction) {
    ui.authActions.authorize(customOptions.authAction)
  }
  
  window.ui = ui
}
