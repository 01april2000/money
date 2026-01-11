# Scripts

This directory contains utility scripts for the application.

## add-admin.ts

Script to create a new user with ADMIN role in the database.

### Usage

```bash
bun run scripts/add-admin.ts <email> <name> [password]
```

### Example

```bash
bun run scripts/add-admin.ts admin@example.com "Admin User"
```

**Note:** If no password is provided, the default password `admin123` will be used.

### Parameters

| Parameter | Description | Required |
|-----------|-------------|----------|
| `email`   | User's email address (must be valid format) | Yes |
| `name`    | User's full name | Yes |
| `password`| User's password (minimum 6 characters) | Yes |

### What the script does

1. Validates the input parameters (email format, password length)
2. Checks if a user with the provided email already exists
3. Generates a unique ID for the user and account
4. Hashes the password using better-auth's secure hashing
5. Creates a User record with:
   - `role`: ADMIN
   - `emailVerified`: true
6. Creates an Account record with the hashed password
7. All operations are performed in a transaction for data consistency

### Notes

- The script requires a valid `DATABASE_URL` environment variable
- The script automatically disconnects from the database after completion
- If the email already exists, the script will exit with an error
