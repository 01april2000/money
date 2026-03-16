import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";

export const auth = betterAuth({
    appURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    emailAndPassword: {
        enabled: true,
        requireEmailVerification: false,
    },
    session: {
        expiresIn: 60 * 60 * 24 * 7, // 7 days
        updateAge: 60 * 60 * 24, // 1 day
        cookieCache: {
            enabled: true,
            maxAge: 5 * 60, // 5 minutes
        },
    },
    account: {
        accountLinking: {
            enabled: true,
        },
    },
    user: {
        additionalFields: {
            role: {
                type: "string",
                required: false,
                input: false,
            },
            santriId: {
                type: "string",
                required: false,
                input: false,
            },
        },
    },
    // Custom credential handler to support both email and NIS login
    credential: {
        async authorize(data: { email: string; password: string }) {
            const { email, password } = data;
            
            // First, try to find user by email (standard flow)
            let user = await prisma.user.findUnique({
                where: { email },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    emailVerified: true,
                    image: true,
                    role: true,
                    santriId: true,
                    accounts: true,
                },
            });
            
            // If not found by email, try to find by NIS (santri username)
            if (!user) {
                const santri = await prisma.santri.findUnique({
                    where: { nis: email },
                    include: { user: { include: { accounts: true } } },
                });
                
                if (santri && santri.user) {
                    user = santri.user;
                }
            }
            
            if (!user || !user.accounts || user.accounts.length === 0) {
                return null;
            }
            
            const account = user.accounts[0];
            
            // Verify password using better-auth's verifyPassword
            const { verifyPassword } = await import("better-auth/crypto");
            const isValid = await verifyPassword({
                hash: account.password || "",
                password,
            });
            
            if (!isValid) {
                return null;
            }
            
            return {
                id: user.id,
                name: user.name,
                email: user.email,
                emailVerified: user.emailVerified,
                image: user.image,
                role: user.role,
                santriId: user.santriId,
            };
        },
    },
});