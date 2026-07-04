"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const recommendations_1 = require("../controllers/recommendations");
const auth_1 = require("../middlewares/auth");
const router = (0, express_1.Router)();
router.get("/", auth_1.requireAuth, recommendations_1.getRecommendations);
router.get("/:id", auth_1.requireAuth, recommendations_1.getRecommendationById);
exports.default = router;
