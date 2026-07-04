"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const profile_1 = require("../controllers/profile");
const auth_1 = require("../middlewares/auth");
const router = (0, express_1.Router)();
router.get("/profile", auth_1.requireAuth, profile_1.getProfile);
router.put("/profile", auth_1.requireAuth, profile_1.updateProfile);
exports.default = router;
