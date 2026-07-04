"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const pdf_1 = require("../controllers/pdf");
const auth_1 = require("../middlewares/auth");
const router = (0, express_1.Router)();
router.get("/export", auth_1.requireAuth, pdf_1.exportPdf);
exports.default = router;
