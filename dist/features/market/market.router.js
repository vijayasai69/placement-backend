"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.marketRouter = void 0;
const express_1 = require("express");
const market_controller_js_1 = require("./market.controller.js");
const auth_middleware_js_1 = require("../../middleware/auth.middleware.js");
const router = (0, express_1.Router)();
exports.marketRouter = router;
router.get("/insights", auth_middleware_js_1.authMiddleware, market_controller_js_1.marketController.getMarketIntelligence);
