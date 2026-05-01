/**
 * Admin Audit Log Utility
 * Records all admin actions for security and compliance
 */

const prisma = require("../prisma");

/**
 * Create an audit log entry
 * @param {Object} params
 * @param {string} params.adminId - Admin user ID
 * @param {string} params.action - Action type (CREATE, UPDATE, DELETE, LOGIN, etc.)
 * @param {string} params.entityType - Entity type (restaurant, menu, user, payment, etc.)
 * @param {string} [params.entityId] - Entity ID
 * @param {Object|string} [params.details] - Additional details (stored as text)
 * @param {Object} [params.beforeData] - JSON snapshot before change
 * @param {Object} [params.afterData] - JSON snapshot after change
 * @param {string} [params.ipAddress] - Client IP address
 * @param {string} [params.userAgent] - User agent
 */
const createAuditLog = async ({
  adminId,
  action,
  entityType,
  entityId,
  details,
  beforeData,
  afterData,
  ipAddress,
  userAgent,
}) => {
  try {
    const detailsText =
      typeof details === "string"
        ? details
        : details && typeof details === "object"
          ? JSON.stringify(details)
          : null;

    await prisma.auditLog.create({
      data: {
        adminId,
        action,
        entityType,
        entityId,
        beforeData: beforeData ?? undefined,
        afterData: afterData ?? undefined,
        details: detailsText,
        ipAddress,
        userAgent,
      },
    });
  } catch (error) {
    // Log error but don't throw - audit failures shouldn't break operations
    console.error("Audit log creation failed:", error.message);
  }
};

/**
 * Get audit logs with filters
 * @param {Object} filters
 * @param {string} [filters.adminId] - Filter by admin
 * @param {string} [filters.entityType] - Filter by entity type
 * @param {string} [filters.entityId] - Filter by entity ID
 * @param {number} [filters.page=1] - Page number
 * @param {number} [filters.pageSize=20] - Items per page
 */
const getAuditLogs = async (filters = {}) => {
  const { adminId, entityType, entityId, page = 1, pageSize = 20 } = filters;
  const skip = (page - 1) * pageSize;

  const where = {};
  if (adminId) where.adminId = adminId;
  if (entityType) where.entityType = entityType;
  if (entityId) where.entityId = entityId;

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
    }),
    prisma.auditLog.count({ where }),
  ]);

  return {
    logs,
    page,
    pageSize,
    total,
    totalPages: Math.ceil(total / pageSize),
  };
};

module.exports = {
  createAuditLog,
  getAuditLogs,
};
