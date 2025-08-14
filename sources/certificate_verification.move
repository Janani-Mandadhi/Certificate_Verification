module janani_addr::certificate_verification {
    use std::table::{Self, Table};
    use janani_addr::certificate_issuance::{CertificateStore, Certificate};

    public fun verify_certificate(owner: address, cert_id: u64): bool acquires CertificateStore {
        if (!exists<CertificateStore>(owner)) {
            return false;
        }

        let store = borrow_global<CertificateStore>(owner);
        if (!table::contains(&store.certificates, cert_id)) {
            return false;
        }

        let cert = table::borrow(&store.certificates, cert_id);
        !cert.revoked
    }
}
