"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.auth = void 0;
const better_auth_1 = require("better-auth");
const prisma_1 = require("better-auth/adapters/prisma");
const prisma_js_1 = require("./prisma.js");
const env_js_1 = require("./env.js");
exports.auth = (0, better_auth_1.betterAuth)({
    database: (0, prisma_1.prismaAdapter)(prisma_js_1.prisma, {
        provider: "postgresql",
    }),
    baseURL: env_js_1.env.BETTER_AUTH_URL,
    secret: env_js_1.env.BETTER_AUTH_SECRET,
    emailAndPassword: {
        enabled: true,
    },
    socialProviders: {
        google: {
            clientId: env_js_1.env.GOOGLE_CLIENT_ID || "",
            clientSecret: env_js_1.env.GOOGLE_CLIENT_SECRET || "",
        },
        github: {
            clientId: env_js_1.env.GITHUB_CLIENT_ID || "",
            clientSecret: env_js_1.env.GITHUB_CLIENT_SECRET || "",
        },
    },
    trustedOrigins: [env_js_1.env.BETTER_AUTH_URL, "http://localhost:5173"],
    advanced: {
        crossSubDomainCookies: {
            enabled: false,
        },
        defaultCookieAttributes: {
            sameSite: "lax",
            httpOnly: true,
            secure: false,
        },
    },
});
