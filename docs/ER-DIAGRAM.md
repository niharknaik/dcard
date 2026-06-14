# Entity-Relationship Diagram

Rendered with Mermaid. All tables use `bigint unsigned` primary keys, `timestamps`,
and (where noted) `deleted_at` soft deletes.

```mermaid
erDiagram
    users ||--o{ cards : owns
    users ||--o{ notifications : receives
    users ||--o{ leads : "captures (via card)"
    users ||--o{ subscriptions : has
    users ||--o{ payments : makes
    users ||--o{ teams : owns
    users }o--o{ roles : "role_user"
    roles }o--o{ permissions : "permission_role"

    teams ||--o{ team_members : has
    users ||--o{ team_members : "is member"

    subscription_plans ||--o{ subscriptions : "defines"
    subscriptions ||--o{ payments : "billed by"

    cards ||--o{ social_links : has
    cards ||--o{ portfolio_items : has
    cards ||--o{ services : has
    cards ||--o{ leads : collects
    cards ||--o{ analytics_events : generates
    cards ||--o{ card_analytics_daily : "aggregated into"
    card_templates ||--o{ cards : styles

    users {
        bigint id PK
        string name
        string email UK
        string phone
        string password
        string avatar
        string status "active|suspended"
        boolean is_admin
        bigint default_card_id FK
        datetime email_verified_at
        datetime last_login_at
        datetime deleted_at
    }

    roles {
        bigint id PK
        string name UK
        string label
    }

    permissions {
        bigint id PK
        string name UK
        string label
    }

    subscription_plans {
        bigint id PK
        string name
        string slug UK
        string code "free|premium|business"
        decimal price
        string billing_period "monthly|yearly"
        json features
        int card_limit
        boolean is_active
    }

    subscriptions {
        bigint id PK
        bigint user_id FK
        bigint subscription_plan_id FK
        string status "active|expired|cancelled|pending"
        datetime starts_at
        datetime ends_at
        boolean auto_renew
    }

    payments {
        bigint id PK
        bigint user_id FK
        bigint subscription_id FK
        string razorpay_order_id
        string razorpay_payment_id
        string transaction_id UK
        decimal amount
        string currency
        string status "created|paid|failed|refunded"
        string invoice_number UK
        datetime paid_at
    }

    cards {
        bigint id PK
        bigint user_id FK
        bigint team_id FK
        bigint card_template_id FK
        string slug UK
        string full_name
        string profile_photo
        string designation
        string company
        string phone
        string whatsapp
        string email
        string website
        string address
        text about
        boolean is_published
        bigint views_count
        datetime deleted_at
    }

    social_links {
        bigint id PK
        bigint card_id FK
        string platform
        string url
        int sort_order
    }

    portfolio_items {
        bigint id PK
        bigint card_id FK
        string title
        text description
        string type "image|video|pdf|brochure|catalog"
        string media_path
        int sort_order
    }

    services {
        bigint id PK
        bigint card_id FK
        string name
        text description
        decimal price
        int sort_order
    }

    leads {
        bigint id PK
        bigint card_id FK
        string name
        string email
        string phone
        text message
        boolean is_read
    }

    analytics_events {
        bigint id PK
        bigint card_id FK
        string type "view|qr_scan|contact_save|link_click|portfolio_click"
        string visitor_hash
        string ip_address
        string country
        json metadata
        datetime created_at
    }

    card_analytics_daily {
        bigint id PK
        bigint card_id FK
        date date
        int views
        int unique_visitors
        int qr_scans
        int contact_saves
        int link_clicks
        int portfolio_clicks
    }

    notifications {
        bigint id PK
        bigint user_id FK
        string type
        string title
        text message
        json data
        boolean is_read
        datetime read_at
    }

    teams {
        bigint id PK
        bigint owner_id FK
        string name
    }

    team_members {
        bigint id PK
        bigint team_id FK
        bigint user_id FK
        string role "member|manager"
        string status "invited|active|suspended"
    }
```

## Cardinality summary

- A **user** owns many **cards**, **subscriptions**, **payments**, **notifications**, and one **team** (business plan).
- A **card** has many **social_links**, **portfolio_items**, **services**, **leads**, and **analytics_events**.
- **analytics_events** are rolled up nightly into **card_analytics_daily** for fast reporting.
- **roles ↔ permissions** and **users ↔ roles** are many-to-many (RBAC).
- A **subscription** references one **subscription_plan**; **payments** optionally reference a **subscription**.
