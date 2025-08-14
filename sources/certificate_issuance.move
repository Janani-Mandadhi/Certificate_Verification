module janani_addr::certificate_issuance {
    use std::signer;
    use std::error;
    use std::table::{Self, Table};
    use aptos_framework::event;
    use aptos_framework::timestamp;
    use janani_addr::access_control;

    const EUNAUTHORIZED: u64 = 100;

    struct Certificate has key {
        id: u64,
        name: vector<u8>,
        issuer: address,
        recipient: address,
        issued_at: u64,
        revoked: bool,
    }

    struct CertificateStore has key {
        certificates: Table<u64, Certificate>,
        issued_events: event::EventHandle<IssuedEvent>,
    }

    struct IssuedEvent has drop, store {
        cert_id: u64,
        issuer: address,
        recipient: address,
        timestamp: u64,
    }

    public entry fun initialize(account: &signer) {
        let addr = signer::address_of(account);
        assert!(!exists<CertificateStore>(addr), error::already_exists(1));

        let store = CertificateStore {
            certificates: table::new(),
            issued_events: event::new_event_handle<IssuedEvent>(account),
        };
        move_to(account, store);
    }

    public entry fun issue_certificate(account: &signer, cert_id: u64, name: vector<u8>, recipient: address) acquires CertificateStore, access_control::AccessControl {
        let issuer = signer::address_of(account);
        assert!(access_control::is_authorized_issuer(issuer), error::permission_denied(EUNAUTHORIZED));

        let store = borrow_global_mut<CertificateStore>(issuer);
        let cert = Certificate {
            id: cert_id,
            name,
            issuer,
            recipient,
            issued_at: timestamp::now_microseconds(),
            revoked: false,
        };
        table::add(&mut store.certificates, cert_id, cert);

        event::emit_event(&mut store.issued_events, IssuedEvent {
            cert_id,
            issuer,
            recipient,
            timestamp: timestamp::now_microseconds(),
        });
    }
}
