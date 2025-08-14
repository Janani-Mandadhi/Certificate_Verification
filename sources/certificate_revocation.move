module janani_addr::certificate_revocation {
    use std::signer;
    use std::error;
    use std::table::{Self, Table};
    use aptos_framework::event;
    use aptos_framework::timestamp;
    use janani_addr::certificate_issuance::{CertificateStore, Certificate};
    use janani_addr::access_control;

    const EUNAUTHORIZED: u64 = 200;
    const ENOT_FOUND: u64 = 201;

    struct RevokedEvent has drop, store {
        cert_id: u64,
        revoked_by: address,
        timestamp: u64,
    }

    struct RevocationStore has key {
        revoked_events: event::EventHandle<RevokedEvent>,
    }

    public entry fun initialize(account: &signer) {
        let addr = signer::address_of(account);
        assert!(!exists<RevocationStore>(addr), error::already_exists(1));

        let store = RevocationStore {
            revoked_events: event::new_event_handle<RevokedEvent>(account),
        };
        move_to(account, store);
    }

    public entry fun revoke_certificate(account: &signer, cert_id: u64) acquires CertificateStore, RevocationStore, access_control::AccessControl {
        let caller = signer::address_of(account);
        assert!(access_control::is_admin(caller), error::permission_denied(EUNAUTHORIZED));

        let cert_store = borrow_global_mut<CertificateStore>(caller);
        let cert = table::borrow_mut(&mut cert_store.certificates, cert_id);
        cert.revoked = true;

        let revoke_store = borrow_global_mut<RevocationStore>(caller);
        event::emit_event(&mut revoke_store.revoked_events, RevokedEvent {
            cert_id,
            revoked_by: caller,
            timestamp: timestamp::now_microseconds(),
        });
    }
}
