"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = authenticate;
exports.authorize = authorize;
exports.requireRole = requireRole;
exports.generateToken = generateToken;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const types_js_1 = require("../models/types.js");
const JWT_SECRET = process.env.JWT_SECRET || 'crmq-dev-secret-change-in-production';
function authenticate(req, res, next) {
    const header = req.headers.authorization;
    const queryToken = req.query.token;
    let token;
    if (header?.startsWith('Bearer ')) {
        token = header.slice(7);
    }
    else if (queryToken) {
        token = queryToken;
    }
    if (!token) {
        res.status(401).json({ success: false, error: 'Token není poskytnut' });
        return;
    }
    try {
        const payload = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        req.user = payload;
        next();
    }
    catch {
        res.status(401).json({ success: false, error: 'Neplatný nebo expirovaný token' });
    }
}
function authorize(...permissions) {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json({ success: false, error: 'Neautorizovaný přístup' });
            return;
        }
        const userPerms = types_js_1.ROLE_PERMISSIONS[req.user.role];
        if (userPerms.includes('*')) {
            next();
            return;
        }
        const hasPermission = permissions.some(p => userPerms.includes(p));
        if (!hasPermission) {
            res.status(403).json({ success: false, error: 'Nedostatečná oprávnění' });
            return;
        }
        next();
    };
}
function requireRole(...roles) {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json({ success: false, error: 'Neautorizovaný přístup' });
            return;
        }
        if (req.user.role === 'root' || roles.includes(req.user.role)) {
            next();
            return;
        }
        res.status(403).json({ success: false, error: 'Nedostatečná oprávnění pro tuto roli' });
    };
}
function generateToken(payload) {
    return jsonwebtoken_1.default.sign(payload, JWT_SECRET, {
        expiresIn: (process.env.JWT_EXPIRES_IN || '24h'),
    });
}
//# sourceMappingURL=auth.js.map