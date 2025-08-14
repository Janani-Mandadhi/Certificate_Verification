import { AptosClient } from "aptos";

// Initialize Aptos client
const client = new AptosClient("https://fullnode.devnet.aptoslabs.com/v1");

// Replace with your actual contract address
const MODULE_ADDRESS = "0x1"; // Replace with your deployed contract address
const MODULE_NAME = "certificate_system"; // Replace with your module name

/**
 * Issue a new certificate
 * @param {string} recipientAddress - The address of the certificate recipient
 * @param {string} certificateData - Certificate data (can be JSON string)
 * @param {string} issuerAddress - The address of the certificate issuer
 * @param {Object} account - Wallet account object for signing
 * @returns {Object} - Transaction result
 */
export const issueCertificate = async (recipientAddress, certificateData, issuerAddress, account) => {
  try {
    const payload = {
      type: "entry_function_payload",
      function: `${MODULE_ADDRESS}::${MODULE_NAME}::issue_certificate`,
      arguments: [
        recipientAddress,
        certificateData,
        Math.floor(Date.now() / 1000).toString(), // Issue timestamp
      ],
      type_arguments: [],
    };

    const txnRequest = await client.generateTransaction(issuerAddress, payload);
    const signedTxn = await client.signTransaction(account, txnRequest);
    const transactionRes = await client.submitTransaction(signedTxn);
    await client.waitForTransaction(transactionRes.hash);

    return {
      success: true,
      transactionHash: transactionRes.hash,
      message: "Certificate issued successfully"
    };
  } catch (error) {
    console.error("Error issuing certificate:", error);
    return {
      success: false,
      error: error.message || "Failed to issue certificate"
    };
  }
};

/**
 * Verify a certificate
 * @param {string} certificateId - The ID of the certificate to verify
 * @param {string} recipientAddress - The address of the certificate recipient
 * @returns {Object} - Verification result
 */
export const verifyCertificate = async (certificateId, recipientAddress) => {
  try {
    const resourceType = `${MODULE_ADDRESS}::${MODULE_NAME}::Certificate`;
    const resource = await client.getAccountResource(
      recipientAddress,
      resourceType
    );

    if (resource && resource.data) {
      const certificate = resource.data;
      
      // Check if certificate exists and is valid
      if (certificate.id === certificateId && !certificate.revoked) {
        return {
          success: true,
          valid: true,
          certificate: certificate,
          message: "Certificate is valid"
        };
      } else if (certificate.revoked) {
        return {
          success: true,
          valid: false,
          message: "Certificate has been revoked"
        };
      }
    }

    return {
      success: true,
      valid: false,
      message: "Certificate not found"
    };
  } catch (error) {
    console.error("Error verifying certificate:", error);
    return {
      success: false,
      error: error.message || "Failed to verify certificate"
    };
  }
};

/**
 * Revoke a certificate
 * @param {string} certificateId - The ID of the certificate to revoke
 * @param {string} issuerAddress - The address of the certificate issuer
 * @param {Object} account - Wallet account object for signing
 * @returns {Object} - Transaction result
 */
export const revokeCertificate = async (certificateId, issuerAddress, account) => {
  try {
    const payload = {
      type: "entry_function_payload",
      function: `${MODULE_ADDRESS}::${MODULE_NAME}::revoke_certificate`,
      arguments: [
        certificateId,
        Math.floor(Date.now() / 1000).toString(), // Revoke timestamp
      ],
      type_arguments: [],
    };

    const txnRequest = await client.generateTransaction(issuerAddress, payload);
    const signedTxn = await client.signTransaction(account, txnRequest);
    const transactionRes = await client.submitTransaction(signedTxn);
    await client.waitForTransaction(transactionRes.hash);

    return {
      success: true,
      transactionHash: transactionRes.hash,
      message: "Certificate revoked successfully"
    };
  } catch (error) {
    console.error("Error revoking certificate:", error);
    return {
      success: false,
      error: error.message || "Failed to revoke certificate"
    };
  }
};

/**
 * Get all certificates for an address
 * @param {string} address - The address to get certificates for
 * @returns {Object} - List of certificates
 */
export const getCertificates = async (address) => {
  try {
    const resourceType = `${MODULE_ADDRESS}::${MODULE_NAME}::CertificateStore`;
    const resource = await client.getAccountResource(address, resourceType);

    if (resource && resource.data && resource.data.certificates) {
      return {
        success: true,
        certificates: resource.data.certificates
      };
    }

    return {
      success: true,
      certificates: []
    };
  } catch (error) {
    console.error("Error fetching certificates:", error);
    return {
      success: false,
      error: error.message || "Failed to fetch certificates",
      certificates: []
    };
  }
};

/**
 * Get certificate by ID
 * @param {string} certificateId - The ID of the certificate
 * @param {string} address - The address that owns the certificate
 * @returns {Object} - Certificate data
 */
export const getCertificateById = async (certificateId, address) => {
  try {
    const certificates = await getCertificates(address);
    
    if (certificates.success) {
      const certificate = certificates.certificates.find(cert => cert.id === certificateId);
      
      if (certificate) {
        return {
          success: true,
          certificate: certificate
        };
      }
    }

    return {
      success: false,
      error: "Certificate not found"
    };
  } catch (error) {
    console.error("Error fetching certificate:", error);
    return {
      success: false,
      error: error.message || "Failed to fetch certificate"
    };
  }
};

/**
 * Initialize certificate store for an account
 * @param {string} address - Account address
 * @param {Object} account - Wallet account object for signing
 * @returns {Object} - Transaction result
 */
export const initializeCertificateStore = async (address, account) => {
  try {
    const payload = {
      type: "entry_function_payload",
      function: `${MODULE_ADDRESS}::${MODULE_NAME}::initialize_store`,
      arguments: [],
      type_arguments: [],
    };

    const txnRequest = await client.generateTransaction(address, payload);
    const signedTxn = await client.signTransaction(account, txnRequest);
    const transactionRes = await client.submitTransaction(signedTxn);
    await client.waitForTransaction(transactionRes.hash);

    return {
      success: true,
      transactionHash: transactionRes.hash,
      message: "Certificate store initialized successfully"
    };
  } catch (error) {
    console.error("Error initializing certificate store:", error);
    return {
      success: false,
      error: error.message || "Failed to initialize certificate store"
    };
  }
};

/**
 * Check if an account has a certificate store initialized
 * @param {string} address - Account address to check
 * @returns {boolean} - True if store exists
 */
export const hasCertificateStore = async (address) => {
  try {
    const resourceType = `${MODULE_ADDRESS}::${MODULE_NAME}::CertificateStore`;
    const resource = await client.getAccountResource(address, resourceType);
    return !!resource;
  } catch (error) {
    return false;
  }
};

/**
 * Generate a unique certificate ID
 * @returns {string} - Unique certificate ID
 */
export const generateCertificateId = () => {
  return `cert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Format certificate data for display
 * @param {Object} certificate - Certificate object
 * @returns {Object} - Formatted certificate
 */
export const formatCertificate = (certificate) => {
  return {
    id: certificate.id,
    recipient: certificate.recipient,
    issuer: certificate.issuer,
    data: certificate.data,
    issuedAt: new Date(certificate.issued_at * 1000).toLocaleDateString(),
    revokedAt: certificate.revoked_at ? new Date(certificate.revoked_at * 1000).toLocaleDateString() : null,
    isRevoked: certificate.revoked || false,
    status: certificate.revoked ? "Revoked" : "Valid"
  };
};

// Export client for direct use if needed
export { client };

// Default export with all functions
const aptosUtils = {
  issueCertificate,
  verifyCertificate,
  revokeCertificate,
  getCertificates,
  getCertificateById,
  initializeCertificateStore,
  hasCertificateStore,
  generateCertificateId,
  formatCertificate,
  client
};

export default aptosUtils;