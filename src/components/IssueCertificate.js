import React, { useState } from "react";
import { issueCertificate } from "../utils/aptos";

function IssueCertificate({ account }) {
  const [form, setForm] = useState({
    id: "",
    name: "",
    recipient: ""
  });
  const [status, setStatus] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value }); 
  };

  const handleSubmit = async () => {
    if (!form.id || !form.name || !form.recipient){
      setStatus("All fields are required.");
      return;
    }
    try {
      setStatus("Issuing certificate...");
      const txHash = await issueCertificate(account, form);
      setStatus(`✅ Certificate issued! Txn Hash: ${txHash}`);
    } catch (err) {
      setStatus(`❌ Failed to issue certificate: ${err.message}`);
    }
  };

  return (
    <div>
      <h2>Issue Certificate</h2>
      <input
        name="id"
        placeholder="Certificate ID"
        value={form.id}
        onChange={handleChange}
      />
      <input
        name="name"
        placeholder="Certificate Name"
        value={form.name}
        onChange={handleChange}
      />
      <input
        name="recipient"
        placeholder="Recipient Address"
        value={form.recipient}
        onChange={handleChange}
      />
      <button onClick={handleSubmit}>Issue</button>
      <p>{status}</p>
    </div>
  );
}

export default IssueCertificate;
