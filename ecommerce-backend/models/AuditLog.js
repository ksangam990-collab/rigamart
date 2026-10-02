const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: [true, 'Audit action identifier is required'],
      trim: true,
      uppercase: true,
      index: true
    },
    severity: {
      type: String,
      enum: {
        values: ['info', 'warning', 'critical'],
        message: '{VALUE} is not a valid audit severity'
      },
      default: 'info',
      index: true
    },
    actor: {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
      },
      email: {
        type: String,
        default: 'unauthenticated'
      },
      role: {
        type: String,
        default: 'guest'
      },
      ip: {
        type: String,
        default: 'unknown'
      },
      userAgent: {
        type: String,
        default: 'unknown'
      }
    },
    target: {
      targetType: {
        type: String,
        default: null
      },
      targetId: {
        type: String,
        default: null
      }
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    timestamp: {
      type: Date,
      default: Date.now,
      immutable: true,
      index: true
    }
  },
  {
    timestamps: false,
    versionKey: false
  }
);

// Compound indexes for high-speed admin querying and filtering
auditLogSchema.index({ timestamp: -1 });
auditLogSchema.index({ severity: 1, timestamp: -1 });
auditLogSchema.index({ action: 1, timestamp: -1 });
auditLogSchema.index({ 'actor.userId': 1, timestamp: -1 });

// Prevent in-place modifications (Append-only immutable audit ledger)
auditLogSchema.pre(['updateOne', 'updateMany', 'findOneAndUpdate', 'findByIdAndUpdate'], function (next) {
  const err = new Error('Security Audit Logs are strictly immutable and cannot be updated.');
  next(err);
});

auditLogSchema.pre(['deleteOne', 'deleteMany', 'findOneAndDelete', 'findByIdAndDelete'], function (next) {
  const err = new Error('Security Audit Logs are strictly immutable and cannot be deleted.');
  next(err);
});

const AuditLog = mongoose.model('AuditLog', auditLogSchema);
module.exports = AuditLog;
