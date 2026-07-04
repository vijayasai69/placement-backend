"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../controllers/auth");
const auth_2 = require("../middlewares/auth");
const router = (0, express_1.Router)();
router.post("/sign-up/email", auth_1.register);
router.post("/sign-in/email", auth_1.login);
router.post("/sign-out", auth_1.logout);
router.get("/get-session", auth_2.requireAuth, auth_1.getSession);
// Mock Google OAuth endpoint for compatibility
router.get("/sign-in/google", (req, res) => {
    res.send("Google authentication is mocked. Please use email and password sign in.");
});
exports.default = router;
