// backend/models/Certificate.js
const mongoose = require("mongoose");

const certificateSchema = new mongoose.Schema(
  {
    certHash: { type: String, required: true, unique: true, index: true },
    recipient: { type: String, required: true }, // recipient wallet/address or identifier
    issuer: { type: String, required: true }, // issuer wallet/address
    issuerUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    certificateType: {
      type: String,
      required: true,
      enum: ["degree", "certification", "license", "achievement", "other"],
    },

    title: { type: String, required: true },
    description: { type: String },

    metadataUri: { type: String, required: true }, // e.g., IPFS URI/json pointer
    ipfsHash: { type: String },

    blockchainTxHash: { type: String, required: true }, // legacy/general chain tx hash
    issueDate: { type: Date, default: Date.now },
    expiryDate: { type: Date },

    isRevoked: { type: Boolean, default: false },
    revocationReason: { type: String },
    revocationDate: { type: Date },

    tags: [{ type: String }],
    metadata: { type: mongoose.Schema.Types.Mixed },

    // NEW FIELDS requested
    moveBlockchainTxHash: { type: String },
    blockchainStatus: {
      type: String,
      enum: ["pending", "confirmed", "failed"],
      default: "pending",
    },
  },
  { timestamps: true }
);

certificateSchema.index({ recipient: 1 });
certificateSchema.index({ issuer: 1 });
certificateSchema.index({ issueDate: -1 });
certificateSchema.index({ isRevoked: 1 });

module.exports = mongoose.model("Certificate", certificateSchema);
