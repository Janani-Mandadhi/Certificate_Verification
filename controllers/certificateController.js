import fs from "fs";
import path from "path";
import crypto from "crypto";
import Certificate from "../models/Certificate.js";
import ipfs from "../utils/ipfs.js";
import { uploadsDir } from "../utils/uploadFile.js";
import { registerOnChain, getOnChainRecord, verifyOnChain } from "../utils/aptos.js";

// Helper for SHA-256
function sha256Hex(filePath) {
  const buffer = fs.readFileSync(filePath);
  return crypto.createHash("sha256").update(buffer).digest("hex");
}

// Upload + Register
export const uploadCertificate = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const certificateId = req.file.filename;
    const filePath = path.join(uploadsDir, certificateId);
    const fileHash = sha256Hex(filePath);

    // Upload to IPFS
    const fileData = fs.readFileSync(filePath);
    const added = await ipfs.add(fileData);
    const ipfsHash = added.path;

    // Register on-chain
    const blockchainTxHash = await registerOnChain(certificateId, fileHash);

    // Save to MongoDB
    const certDoc = new Certificate({
      certHash: fileHash,
      recipient: req.body.recipient,
      issuer: req.body.issuer,
      issuerUserId: req.body.issuerUserId,
      certificateType: req.body.certificateType,
      title: req.body.title,
      description: req.body.description,
      metadataUri: req.body.metadataUri,
      ipfsHash,
      blockchainTxHash,
      issueDate: req.body.issueDate ? new Date(req.body.issueDate) : new Date(),
      expiryDate: req.body.expiryDate || undefined,
      tags: req.body.tags || [],
      metadata: req.body.metadata || {}
    });

    await certDoc.save();

    res.json({
      message: "Certificate uploaded and registered successfully",
      certificateId,
      fileHash,
      ipfsHash,
      blockchainTxHash
    });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ error: err.message || "Upload failed" });
  }
};

// Verify
export const verifyCertificate = async (req, res) => {
  try {
    const { certHash } = req.params;

    // Check DB
    const certDoc = await Certificate.findOne({ certHash });
    if (!certDoc) {
      return res.json({ status: "not_found", message: "Certificate not found in DB" });
    }

    // Check IPFS
    let ipfsExists = false;
    try {
      const ipfsFile = ipfs.cat(certDoc.ipfsHash);
      for await (const chunk of ipfsFile) {
        if (chunk.length > 0) {
          ipfsExists = true;
          break;
        }
      }
    } catch {
      ipfsExists = false;
    }

    // Check blockchain
    const chain = await getOnChainRecord(certDoc.certHash);
    let chainValid = false;
    if (chain.exists) {
      chainValid = await verifyOnChain(certDoc.certHash, certDoc.certHash);
    }

    res.json({
      certDoc,
      ipfsExists,
      chain,
      chainValid,
      status:
        ipfsExists && chainValid
          ? "valid"
          : ipfsExists
          ? "ipfs_only"
          : chainValid
          ? "chain_only"
          : "db_only"
    });
  } catch (err) {
    console.error("Verification error:", err);
    res.status(500).json({ error: err.message || "Verification failed" });
  }
};
