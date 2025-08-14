// backend/services/moveService.js
const { AptosClient, AptosAccount, HexString } = require("aptos");

class MoveContractService {
  constructor() {
    this.client = new AptosClient(
      process.env.APTOS_NODE_URL || "https://fullnode.devnet.aptoslabs.com/v1"
    );
    // Example: 0x1234... (module address that published your Move package)
    this.moduleAddress = process.env.CONTRACT_ADDRESS; 
    if (!this.moduleAddress) {
      console.warn(
        "[moveService] CONTRACT_ADDRESS is not set. Set it in your .env as CONTRACT_ADDRESS=0x...."
      );
    }
  }

  getAdminAccount() {
    const pk = process.env.ADMIN_PRIVATE_KEY;
    if (!pk) {
      throw new Error(
        "ADMIN_PRIVATE_KEY not set in .env. Provide the Aptos private key hex (with or without 0x)."
      );
    }
    const hex = new HexString(pk);
    return new AptosAccount(hex.toUint8Array());
  }

  // Issue Certificate on Move contract
  async issueCertificate(adminAccount, certHash, title, recipientAddress) {
    if (!this.moduleAddress) {
      throw new Error("CONTRACT_ADDRESS not configured.");
    }

    const payload = {
      type: "entry_function_payload",
      function: `${this.moduleAddress}::certificate_issuance::issue_certificate`,
      type_arguments: [],
      arguments: [certHash, title, recipientAddress],
    };

    const txnRequest = await this.client.generateTransaction(
      adminAccount.address(),
      payload
    );
    const signedTxn = await this.client.signTransaction(adminAccount, txnRequest);
    const txRes = await this.client.submitTransaction(signedTxn);
    await this.client.waitForTransaction(txRes.hash);

    return { hash: txRes.hash };
  }

  // Verify (reads on-chain state; adjust to your actual resource layout)
  async verifyCertificate(certHash) {
    try {
      const resourceType = `${this.moduleAddress}::certificate_verification::Certificate`;
      const resource = await this.client.getAccountResource(
        this.moduleAddress,
        resourceType
      );
      // NOTE: Adjust this access path based on your Move resource structure
      if (resource && resource.data && resource.data.certificates) {
        return resource.data.certificates[certHash] || null;
      }
      return null;
    } catch (err) {
      // Resource may not exist or structure differs
      return null;
    }
  }

  // Revoke Certificate on Move contract
  async revokeCertificate(adminAccount, certHash) {
    if (!this.moduleAddress) {
      throw new Error("CONTRACT_ADDRESS not configured.");
    }

    const payload = {
      type: "entry_function_payload",
      function: `${this.moduleAddress}::certificate_revocation::revoke_certificate`,
      type_arguments: [],
      arguments: [certHash],
    };

    const txnRequest = await this.client.generateTransaction(
      adminAccount.address(),
      payload
    );
    const signedTxn = await this.client.signTransaction(adminAccount, txnRequest);
    const txRes = await this.client.submitTransaction(signedTxn);
    await this.client.waitForTransaction(txRes.hash);

    return { hash: txRes.hash };
  }
}

module.exports = new MoveContractService();
module.exports.MoveContractService = MoveContractService;
