#!/usr/bin/env bun
import { prisma } from '../lib/prisma';
import { auth } from '../lib/auth';
import { generateId } from 'better-auth';
import { hashPassword } from 'better-auth/crypto';

// Get command line arguments or use defaults
const args = process.argv.slice(2);
const email = args[0];
const name = args[1];
const password = args[2] || 'admin123';

// Validate inputs
if (!email || !name) {
  console.error('Usage: bun run scripts/add-admin.ts <email> <name> [password]');
  console.error('Example: bun run scripts/add-admin.ts admin@example.com "Admin User"');
  console.error('Default password: admin123');
  process.exit(1);
}

// Validate email format
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(email)) {
  console.error('Error: Invalid email format');
  process.exit(1);
}

// Validate password length
if (password.length < 6) {
  console.error('Error: Password must be at least 6 characters long');
  process.exit(1);
}

async function createAdminUser() {
  try {
    console.log('Creating admin user...');
    console.log(`Email: ${email}`);
    console.log(`Name: ${name}`);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      console.error('Error: User with this email already exists');
      process.exit(1);
    }

    // Generate ID for user and account
    const userId = generateId();
    const accountId = generateId();

    // Hash the password
    const hashedPassword = await hashPassword(password);

    // Create user and account in a transaction
    await prisma.$transaction(async (tx) => {
      // Create user with ADMIN role
      await tx.user.create({
        data: {
          id: userId,
          email,
          name,
          role: 'ADMIN',
          emailVerified: true,
        },
      });

      // Create account with password
      await tx.account.create({
        data: {
          id: accountId,
          userId,
          providerId: 'credential',
          accountId: email,
          password: hashedPassword,
        },
      });
    });

    console.log('✅ Admin user created successfully!');
    console.log(`User ID: ${userId}`);
    console.log(`Email: ${email}`);
    console.log(`Role: ADMIN`);
    console.log(`Email Verified: true`);
  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser();
