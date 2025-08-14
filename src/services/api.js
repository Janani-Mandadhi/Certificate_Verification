// frontend/src/services/api.js
const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:3001/api";

class CertificateAPI {
  async issueCertificate(payload) {
    // payload must include: certHash, title, recipient, issuerUserId, certificateType, metadataUri
    const res = await fetch(`${API_BASE_URL}/certificates/issue`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Issue failed");
    return data;
  }

  async verifyCertificate(certHash) {
    const res = await fetch(`${API_BASE_URL}/certificates/verify/${encodeURIComponent(certHash)}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Verify failed");
    return data;
    }

  async revokeCertificate(certHash, revocationReason = "") {
    const res = await fetch(`${API_BASE_URL}/certificates/revoke`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ certHash, revocationReason }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Revoke failed");
    return data;
  }

  async getAllCertificates(page = 1, limit = 10) {
    const res = await fetch(
      `${API_BASE_URL}/certificates?page=${encodeURIComponent(page)}&limit=${encodeURIComponent(
        limit
      )}`
    );
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Fetch failed");
    return data;
  }
}

export default new CertificateAPI();
