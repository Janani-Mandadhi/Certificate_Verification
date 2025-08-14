import React from "react";
import IssueCertificate from "./IssueCertificate";
import VerifyCertificate from "./VerifyCertificate";
import RevokeCertificate from "./RevokeCertificate";

function Dashboard({ account }) {
  return (
    <div>
      <h1>Certificate Dashboard</h1>
      <IssueCertificate account={account} />
      <VerifyCertificate />
      <RevokeCertificate account={account} />
    </div>
  );
}

export default Dashboard;
