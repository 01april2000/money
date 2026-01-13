# Scripts

This directory contains utility scripts for the application.

## seed.ts

Script to seed the database with initial data. This is useful for setting up a fresh database or resetting the database with sample data.

### Usage

```bash
bun run scripts/seed.ts
```

### What the script does

1. Clears all existing data from the database (transactions, santri, sessions, accounts, users)
2. Creates 9 users:
   - 1 Admin user
   - 3 Bendahara users (SMK, SMP, Pondok)
   - 5 Santri users
3. Creates 9 accounts with hashed passwords for authentication
4. Creates 5 santri records linked to their respective users
5. Creates 10 sample transactions (SPP, Syahriah, Uang Saku, Laundry)

### Default Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@pondok.com | admin123 |
| Bendahara SMK | bendahara.smk@pondok.com | bendahara123 |
| Bendahara SMP | bendahara.smp@pondok.com | bendahara123 |
| Bendahara Pondok | bendahara.pondok@pondok.com | bendahara123 |
| Santri | ahmad@pondok.com | santri123 |
| Santri | budi@pondok.com | santri123 |
| Santri | citra@pondok.com | santri123 |
| Santri | doni@pondok.com | santri123 |
| Santri | eka@pondok.com | santri123 |

### Notes

- All passwords are securely hashed using better-auth's `hashPassword` function
- The script requires a valid `DATABASE_URL` environment variable
- The script automatically disconnects from the database after completion
- Running this script will delete all existing data in the database

---

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
| `password`| User's password (minimum 6 characters) | No |

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
