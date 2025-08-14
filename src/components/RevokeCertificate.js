import React, { useState } from "react";
import { AptosAccount } from "aptos";
import { revokeCertificate } from "../utils/aptos";

export default function RevokeCertificate() {
  const [certId, setCertId] = useState("");
  const [status, setStatus] = useState("");

  const handleRevoke = async (e) => {
    e.preventDefault();

    try {
      if (!certId.trim()) {
        setStatus("Please enter a certificate ID.");
        return;
      }

      // In real app, load your account securely (wallet or stored key)
      const account = new AptosAccount(); // Placeholder — replace with real account

      const txHash = await revokeCertificate(account, certId);
      setStatus(`✅ Certificate revoked successfully. Txn hash: ${txHash}`);
    } catch (err) {
      setStatus(`❌ Error: ${err.message}`);
    }
  };

  return (
    <div>
      <h2>Revoke Certificate</h2>
      <form onSubmit={handleRevoke}>
        <input
          type="text"
          value={certId}
          onChange={(e) => setCertId(e.target.value)}
          placeholder="Enter Certificate ID"
        />
        <button type="submit">Revoke</button>
      </form>
      <p>{status}</p>
    </div>
  );
}
