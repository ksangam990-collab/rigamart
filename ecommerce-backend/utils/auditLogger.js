const AuditLog = require('../models/AuditLog');

/**
 * Safely extracts client IP address accounting for proxies (Render, Cloudflare, AWS)
 */
const extractClientIp = (req) => {
  if (!req) return 'system';
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return req.ip || req.connection?.remoteAddress || req.socket?.remoteAddress || 'unknown';
};

/**
 * Logs an immutable security audit event
 *
 * @param {Object} options
 * @param {string} options.action - Uppercase action name (e.g. AUTH_LOGIN_SUCCESS, ACCOUNT_LOCKED)
 * @param {'info'|'warning'|'critical'} [options.severity='info'] - Severity level
 * @param {Object} [options.req] - Express request object (optional)
 * @param {Object} [options.user] - Authenticated or target user object (optional)
 * @param {Object} [options.target] - Target entity { targetType, targetId } (optional)
 * @param {Object} [options.details] - Arbitrary context metadata (optional)
 */
const logSecurityEvent = async ({
  action,
  severity = 'info',
  req = null,
  user = null,
  target = null,
  details = {}
}) => {
  try {
    const actorUser = user || req?.user || null;
    const ip = extractClientIp(req);
    const userAgent = req?.headers?.['user-agent'] || 'unknown';

    const actor = {
      userId: actorUser?._id || null,
      email: actorUser?.email || details?.email || req?.body?.email || 'unauthenticated',
      role: actorUser?.role || 'guest',
      ip,
      userAgent
    };

    await AuditLog.create({
      action: action.toUpperCase(),
      severity,
      actor,
      target: target ? {
        targetType: target.targetType || target.type || null,
        targetId: target.targetId ? String(target.targetId) : (target.id ? String(target.id) : null)
      } : {},
      details,
      timestamp: new Date()
    });
  } catch (err) {
    // Non-blocking: audit logging failures should never abort or crash the primary user transaction
    console.error('⚠️ [AuditLog Error]: Failed to persist audit event:', err.message);
  }
};

module.exports = {
  logSecurityEvent,
  extractClientIp
};
