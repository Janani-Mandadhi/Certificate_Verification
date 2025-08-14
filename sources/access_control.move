module janani_addr::access_control {
    use std::signer;
    use std::error;
    use aptos_framework::event;
    use std::table::{Self, Table};

    const ENOT_AUTHORIZED: u64 = 1;
    const EALREADY_INITIALIZED: u64 = 2;
    const ENOT_OWNER: u64 = 3;

    struct AccessControl has key {
        owner: address,
        authorized_issuers: Table<address, bool>,
        admins: Table<address, bool>,
        issuer_added_events: event::EventHandle<IssuerAddedEvent>,
        issuer_removed_events: event::EventHandle<IssuerRemovedEvent>,
        admin_added_events: event::EventHandle<AdminAddedEvent>,
        admin_removed_events: event::EventHandle<AdminRemovedEvent>,
    }

    struct IssuerAddedEvent has drop, store {
        issuer: address,
        timestamp: u64,
    }

    struct IssuerRemovedEvent has drop, store {
        issuer: address,
        timestamp: u64,
    }

    struct AdminAddedEvent has drop, store {
        admin: address,
        timestamp: u64,
    }

    struct AdminRemovedEvent has drop, store {
        admin: address,
        timestamp: u64,
    }

    public entry fun initialize(account: &signer) {
        let account_addr = signer::address_of(account);
        assert!(!exists<AccessControl>(account_addr), error::already_exists(EALREADY_INITIALIZED));

        let access_control = AccessControl {
            owner: account_addr,
            authorized_issuers: table::new(),
            admins: table::new(),
            issuer_added_events: event::new_event_handle<IssuerAddedEvent>(account),
            issuer_removed_events: event::new_event_handle<IssuerRemovedEvent>(account),
            admin_added_events: event::new_event_handle<AdminAddedEvent>(account),
            admin_removed_events: event::new_event_handle<AdminRemovedEvent>(account),
        };

        table::add(&mut access_control.admins, account_addr, true);
        move_to(account, access_control);
    }

    public entry fun add_issuer(account: &signer, issuer: address) acquires AccessControl {
        let account_addr = signer::address_of(account);
        let access_control = borrow_global_mut<AccessControl>(@certificate_system);
        
        assert!(is_admin(account_addr), error::permission_denied(ENOT_AUTHORIZED));
        
        table::upsert(&mut access_control.authorized_issuers, issuer, true);
        
        event::emit_event(&mut access_control.issuer_added_events, IssuerAddedEvent {
            issuer,
            timestamp: aptos_framework::timestamp::now_microseconds(),
        });
    }

    public entry fun remove_issuer(account: &signer, issuer: address) acquires AccessControl {
        let account_addr = signer::address_of(account);
        let access_control = borrow_global_mut<AccessControl>(@certificate_system);
        
        assert!(is_admin(account_addr), error::permission_denied(ENOT_AUTHORIZED));
        
        table::upsert(&mut access_control.authorized_issuers, issuer, false);
        
        event::emit_event(&mut access_control.issuer_removed_events, IssuerRemovedEvent {
            issuer,
            timestamp: aptos_framework::timestamp::now_microseconds(),
        });
    }

    public entry fun add_admin(account: &signer, new_admin: address) acquires AccessControl {
        let account_addr = signer::address_of(account);
        let access_control = borrow_global_mut<AccessControl>(@certificate_system);
        
        assert!(account_addr == access_control.owner, error::permission_denied(ENOT_OWNER));
        
        table::upsert(&mut access_control.admins, new_admin, true);
        
        event::emit_event(&mut access_control.admin_added_events, AdminAddedEvent {
            admin: new_admin,
            timestamp: aptos_framework::timestamp::now_microseconds(),
        });
    }

    public fun is_authorized_issuer(issuer: address): bool acquires AccessControl {
        let access_control = borrow_global<AccessControl>(@certificate_system);
        table::contains(&access_control.authorized_issuers, issuer) && 
        *table::borrow(&access_control.authorized_issuers, issuer)
    }

    public fun is_admin(admin: address): bool acquires AccessControl {
        let access_control = borrow_global<AccessControl>(@certificate_system);
        let is_owner = admin == access_control.owner;
        let is_admin_user = table::contains(&access_control.admins, admin) && 
                           *table::borrow(&access_control.admins, admin);
        is_owner || is_admin_user
    }
}