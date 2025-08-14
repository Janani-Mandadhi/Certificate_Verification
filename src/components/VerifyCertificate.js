import React, { useState } from "react";
import { verifyCertificate } from "../utils/aptos";

export default function VerifyCertificate() {
  const [certId, setCertId] = useState("");
  const [result, setResult] = useState("");

  const handleVerify = async (e) => {
    e.preventDefault();

    try {
      if (!certId.trim()) {
        setResult("Please enter a certificate ID.");
        return;
      }

      const cert = await verifyCertificate(certId);
      setResult(`✅ Certificate Found: Name - ${cert.name}, Recipient - ${cert.recipient}`);
    } catch (err) {
      setResult(`❌ Verification failed: ${err.message}`);
    }
  };

  return (
    <div>
      <h2>Verify Certificate</h2>
      <form onSubmit={handleVerify}>
        <input
          type="text"
          value={certId}
          onChange={(e) => setCertId(e.target.value)}
          placeholder="Enter Certificate ID"
        />
        <button type="submit">Verify</button>
      </form>
      <p>{result}</p>
    </div>
  );
}
