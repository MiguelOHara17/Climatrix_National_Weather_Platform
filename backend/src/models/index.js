const mongoose = require('mongoose');

const { Schema } = mongoose;

const EVENT_TYPES = [
  'rainfall',
  'thunderstorm',
  'flood',
  'heatwave',
  'fog',
  'dust_storm',
  'strong_wind',
  'other',
];

const REPORT_STATUSES = [
  'pending',
  'auto_verified',
  'verified',
  'rejected',
  'flagged',
  'duplicate',
];

const UserSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },
    role: {
      type: String,
      enum: ['citizen', 'admin', 'moderator'],
      default: 'citizen',
    },
    reputationScore: {
      type: Number,
      default: 50,
      min: 0,
      max: 100,
    },
    reportsSubmitted: {
      type: Number,
      default: 0,
    },
    reportsVerified: {
      type: Number,
      default: 0,
    },
    isBanned: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const IngestionSourceSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: [
        'social_media',
        'public_api',
        'website',
        'citizen_app',
        'official_feed',
      ],
      required: true,
    },
    handleOrUrl: String,
    isOfficial: {
      type: Boolean,
      default: false,
    },
    trustScore: {
      type: Number,
      default: 40,
      min: 0,
      max: 100,
    },
    totalIngested: {
      type: Number,
      default: 0,
    },
    totalFlaggedFake: {
      type: Number,
      default: 0,
    },
    lastPolledAt: Date,
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const ReportSchema = new Schema(
  {
    reportedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    source: {
      type: Schema.Types.ObjectId,
      ref: 'IngestionSource',
    },
    eventType: {
      type: String,
      enum: EVENT_TYPES,
      required: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number],
        required: true,
        validate: {
          validator: (value) =>
            Array.isArray(value) &&
            value.length === 2 &&
            value[0] >= -180 &&
            value[0] <= 180 &&
            value[1] >= -90 &&
            value[1] <= 90,
          message:
            'coordinates must be [longitude, latitude]',
        },
      },
      city: String,
      state: String,
    },
    eventDateTime: {
      type: Date,
      required: true,
    },
    media: [
      {
        url: {
          type: String,
          required: true,
        },
        type: {
          type: String,
          enum: ['photo', 'video'],
          required: true,
        },
      },
    ],
    status: {
      type: String,
      enum: REPORT_STATUSES,
      default: 'pending',
    },
    credibilityScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    corroborationCount: {
      type: Number,
      default: 0,
    },
    duplicateOf: {
      type: Schema.Types.ObjectId,
      ref: 'Report',
      default: null,
    },
    mlMeta: {
      fakeProbability: {
        type: Number,
        default: null,
      },
      duplicateSimilarity: {
        type: Number,
        default: null,
      },
      autoClassifiedEventType: {
        type: String,
        enum: [...EVENT_TYPES, null],
        default: null,
      },
      processedAt: {
        type: Date,
        default: null,
      },
    },
  },
  { timestamps: true }
);

ReportSchema.index({ location: '2dsphere' });
ReportSchema.index({
  eventDateTime: -1,
  eventType: 1,
  status: 1,
});

const AdminReviewSchema = new Schema(
  {
    report: {
      type: Schema.Types.ObjectId,
      ref: 'Report',
      required: true,
    },
    reviewer: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    decision: {
      type: String,
      enum: ['verified', 'rejected', 'flagged', 'duplicate'],
      required: true,
    },
    reason: String,
    previousStatus: {
      type: String,
      enum: REPORT_STATUSES,
    },
  },
  { timestamps: true }
);

module.exports = {
  EVENT_TYPES,
  REPORT_STATUSES,
  User: mongoose.model('User', UserSchema),
  IngestionSource: mongoose.model(
    'IngestionSource',
    IngestionSourceSchema
  ),
  Report: mongoose.model('Report', ReportSchema),
  AdminReview: mongoose.model(
    'AdminReview',
    AdminReviewSchema
  ),
};