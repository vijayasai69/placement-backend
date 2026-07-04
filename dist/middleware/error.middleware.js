"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorMiddleware = errorMiddleware;
const logger_js_1 = require("../utils/logger.js");
function errorMiddleware(err, req, res, next) {
    logger_js_1.logger.error(`${req.method} ${req.path} failed:`, err);
    let status = 500;
    if (typeof err.status === "number") {
        status = err.status;
    }
    else if (typeof err.statusCode === "number") {
        status = err.statusCode;
    }
    const message = err.message || "Internal Server Error";
    res.status(status).json({
        success: false,
        error: {
            message,
            status,
            details: err.errors || undefined,
        },
    });
}
