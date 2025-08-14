// backend/routes/certificates.js
const express = require("express");
const router = express.Router();
const Certificate = require("../models/Certificate");
const moveService = require("../services/moveService");
const { HexString } = require("aptos");

// Prepare admin account once (throws if missing)
let adminAccount;
try {
  adminAccount = moveService.getAdminAccount();
} catch (e) {
  console.warn("[certificates] Admin account not initialized:", e.message);
}

// POST /api/certificates/issue
// Required body: certHash, title, recipient (address), issuerUserId, certificateType, metadataUri
router.post("/issue", async (req, res) => {
  try {
    const {
      certHash,
      title,
      recipient,
      issuerUserId,
      certificateType,
      metadataUri,
      description,
      ipfsHash,
      tags,
      metadata,
    } = req.body;

    if (
      !certHash ||
      !title ||
      !recipient ||
      !issuerUserId ||
      !certificateType ||
      !metadataUri
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Missing required fields: certHash, title, recipient, issuerUserId, certificateType, metadataUri",
      });
    }

    const exists = await Certificate.findOne({ certHash });
    if (exists) {
      return res.status(409).json({
        success: false,
        message: "Certificate with this certHash already exists",
      });
    }

    if (!adminAccount) {
      return res.status(500).json({
        success: false,
        message:
          "Admin account not configured. Check ADMIN_PRIVATE_KEY in backend .env",
      });
    }

    // 1) Call Move contract (issue)
    const chain = await moveService.issueCertificate(
      adminAccount,
      certHash,
      title,
      recipient
    );

    // 2) Save in Mongo
    const doc = await Certificate.create({
      certHash,
      title,
      recipient,
      issuer: adminAccount.address().hex(),
      issuerUserId, // ObjectId from your Users collection
      certificateType,
      metadataUri,
      description: description || "",
      ipfsHash: ipfsHash || undefined,
      blockchainTxHash: chain.hash, // general chain tx
      moveBlockchainTxHash: chain.hash, // Move tx
      blockchainStatus: "confirmed",
      tags: Array.isArray(tags) ? tags : [],
      metadata: metadata || {},
      isRevoked: false,
    });

    return res.json({
      success: true,
      message: "Certificate issued successfully",
      transactionHash: chain.hash,
      certHash,
      id: doc._id,
    });
  } catch (error) {
    console.error("Issue certificate error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to issue certificate",
      error: error.message,
    });
  }
});

// GET /api/certificates/verify/:certHash
router.get("/verify/:certHash", async (req, res) => {
  try {
    const { certHash } = req.params;

    const doc = await Certificate.findOne({ certHash });
    if (!doc) {
      return res.status(404).json({ success: false, message: "Not found" });
    }

    if (doc.isRevoked) {
      return res.json({
        success: true,
        message: "Certificate is revoked",
        certificate: {
          certHash,
          title: doc.title,
          recipient: doc.recipient,
          issuer: doc.issuer,
          issueDate: doc.issueDate,
          status: "Revoked",
          revocationReason: doc.revocationReason || null,
          revocationDate: doc.revocationDate || doc.updatedAt || null,
          blockchainTxHash: doc.blockchainTxHash,
          moveBlockchainTxHash: doc.moveBlockchainTxHash || null,
        },
      });
    }

    // Optionally cross-check on-chain (non-fatal if it fails)
    let onchain = null;
    try {
      onchain = await moveService.verifyCertificate(certHash);
    } catch {}

    return res.json({
      success: true,
      message: "Certificate is valid",
      certificate: {
        certHash,
        title: doc.title,
        recipient: doc.recipient,
        issuer: doc.issuer,
        issueDate: doc.issueDate,
        status: "Valid",
        blockchainTxHash: doc.blockchainTxHash,
        moveBlockchainTxHash: doc.moveBlockchainTxHash || null,
        blockchainStatus: doc.blockchainStatus,
        onchain: onchain || undefined,
      },
    });
  } catch (error) {
    console.error("Verify certificate error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to verify certificate",
      error: error.message,
    });
  }
});

// POST /api/certificates/revoke
// body: certHash, revocationReason (optional)
router.post("/revoke", async (req, res) => {
  try {
    const { certHash, revocationReason } = req.body;
    if (!certHash) {
      return res
        .status(400)
        .json({ success: false, message: "certHash is required" });
    }

    const doc = await Certificate.findOne({ certHash });
    if (!doc) {
      return res.status(404).json({ success: false, message: "Not found" });
    }
    if (doc.isRevoked) {
      return res
        .status(409)
        .json({ success: false, message: "Already revoked" });
    }

    if (!adminAccount) {
      return res.status(500).json({
        success: false,
        message:
          "Admin account not configured. Check ADMIN_PRIVATE_KEY in backend .env",
      });
    }

    // 1) Revoke on-chain
    const chain = await moveService.revokeCertificate(adminAccount, certHash);

    // 2) Update DB
    doc.isRevoked = true;
    doc.revocationReason = revocationReason || "";
    doc.revocationDate = new Date();
    doc.blockchainStatus = "confirmed";
    doc.moveBlockchainTxHash = chain.hash;
    await doc.save();

    return res.json({
      success: true,
      message: "Certificate revoked successfully",
      transactionHash: chain.hash,
      certHash,
    });
  } catch (error) {
    console.error("Revoke certificate error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to revoke certificate",
      error: error.message,
    });
  }
});

// GET /api/certificates
router.get("/", async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 10, 1), 100);
    const skip = (page - 1) * limit;

    const [certificates, total] = await Promise.all([
      Certificate.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
      Certificate.countDocuments(),
    ]);

    return res.json({
      success: true,
      certificates,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get certificates error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch certificates",
      error: error.message,
    });
  }
});

module.exports = router;