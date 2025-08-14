import express from "express";
import multer from "multer";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { create } from "ipfs-http-client";
import crypto from "crypto";

// ====== Load environment variables ======
dotenv.config();
const app = express();
app.use(cors({ origin: process.env.CORS_ORIGIN || "*" }));
app.use(express.json());

// ====== ESM path fix for __dirname ======
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ====== Ensure uploads directory exists ======
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// ====== Multer config ======
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + file.originalname;
    cb(null, uniqueSuffix);
  }
});
const upload = multer({ storage });

// ====== MongoDB connect ======
mongoose
  .connect(process.env.DATABASE_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// ====== IPFS client ======
const ipfs = create({
  url: "https://ipfs.infura.io:5001/api/v0"
});

// ====== Certificate Schema ======
const certificateSchema = new mongoose.Schema({
  certHash: String,
  ipfsCid: String,
  uploadedAt: { type: Date, default: Date.now }
});
const Certificate = mongoose.model("Certificate", certificateSchema);

// ====== Upload route ======
app.post("/api/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // Calculate file hash
    const fileBuffer = fs.readFileSync(req.file.path);
    const hash = crypto.createHash("sha256").update(fileBuffer).digest("hex");

    // Upload to IPFS
    const ipfsResult = await ipfs.add(fileBuffer);

    // Save to MongoDB
    const newCert = new Certificate({
      certHash: hash,
      ipfsCid: ipfsResult.cid.toString()
    });
    await newCert.save();

    // Cleanup local file
    fs.unlinkSync(req.file.path);

    res.json({
      message: "Certificate uploaded successfully",
      certHash: hash,
      ipfsCid: ipfsResult.cid.toString()
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Upload failed" });
  }
});

// ====== Verify route ======
app.get("/api/verify/:certHash", async (req, res) => {
  try {
    const { certHash } = req.params;
    const cert = await Certificate.findOne({ certHash });

    if (!cert) {
      return res.status(404).json({ verified: false, message: "Certificate not found" });
    }

    res.json({
      verified: true,
      certHash: cert.certHash,
      ipfsCid: cert.ipfsCid,
      uploadedAt: cert.uploadedAt
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Verification failed" });
  }
});

// ====== Start server ======
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
