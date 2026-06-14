# Database Design Reference

MySQL 8 / InnoDB. UTF8MB4. Every business table carries `created_at`/`updated_at`.
Tables holding user content use **soft deletes** (`deleted_at`) so accidental loss is recoverable.

## Conventions

- PK: `id` (`bigint unsigned auto_increment`).
- FKs: `{singular}_id`, indexed, with explicit `ON DELETE` behaviour.
- Money: `decimal(10,2)`; currency code stored separately (`char(3)`, default `INR`).
- Enums: stored as short `varchar` + validated by PHP `enum` classes (portable, index-friendly).
- JSON columns for flexible/sparse data (`features`, `metadata`, `data`).
- Composite/lookup indexes added on every column used in `WHERE`/`ORDER BY` hot paths.

## Tables

### Auth & RBAC
| Table | Purpose | Key columns | Notes |
|-------|---------|-------------|-------|
| `users` | Account | `email` UK, `status`, `is_admin`, `default_card_id` | soft delete |
| `roles` | RBAC roles | `name` UK | seeded: admin, user |
| `permissions` | RBAC permissions | `name` UK | grouped by module |
| `role_user` | pivot | (`role_id`,`user_id`) UK | |
| `permission_role` | pivot | (`permission_id`,`role_id`) UK | |
| `password_reset_tokens` | reset flow | `email` PK | standard Laravel |
| `personal_access_tokens` | optional sanctum/admin | | |

### Cards & content
| Table | Purpose | Notable indexes | Delete behaviour |
|-------|---------|-----------------|------------------|
| `card_templates` | Admin-managed visual templates | `slug` UK, `is_premium` | restrict |
| `cards` | Digital card | `slug` UK, (`user_id`,`is_published`) | soft delete; FK user CASCADE |
| `social_links` | Card social links | (`card_id`,`sort_order`) | CASCADE |
| `portfolio_items` | Media items | (`card_id`,`type`) | CASCADE |
| `services` | Offered services | (`card_id`,`sort_order`) | CASCADE |

### Leads & analytics
| Table | Purpose | Notable indexes | Notes |
|-------|---------|-----------------|-------|
| `leads` | Visitor enquiries | (`card_id`,`is_read`), `created_at` | CASCADE |
| `analytics_events` | Raw event stream | (`card_id`,`type`,`created_at`), `visitor_hash` | CASCADE; partition-friendly |
| `card_analytics_daily` | Pre-aggregated stats | UK(`card_id`,`date`) | CASCADE; powers charts |

### Billing
| Table | Purpose | Notable indexes |
|-------|---------|-----------------|
| `subscription_plans` | Plan catalogue (free/premium/business) | `slug` UK, `code` UK, `is_active` |
| `subscriptions` | User ↔ plan with validity window | (`user_id`,`status`), `ends_at` |
| `payments` | Razorpay transactions + invoices | `transaction_id` UK, `invoice_number` UK, `razorpay_order_id` |

### Teams (Business plan)
| Table | Purpose | Notable indexes |
|-------|---------|-----------------|
| `teams` | Business workspace | `owner_id` |
| `team_members` | Employees | UK(`team_id`,`user_id`) |

### Notifications & CMS
| Table | Purpose | Notes |
|-------|---------|-------|
| `notifications` | In-app notification center | (`user_id`,`is_read`,`created_at`) |
| `faqs` | Help content | `is_published`, `sort_order` |
| `help_articles` | Help center | `slug` UK |
| `pages` | Terms / Privacy etc. | `slug` UK |
| `banners` | Promotional banners | `is_active`, date window |

### Framework tables
`cache`, `cache_locks`, `jobs`, `job_batches`, `failed_jobs`, `sessions` — required for
database-backed cache, queues (email/notification dispatch), and sessions.

## Plan limits (enforced in services, defined in seed)

| Plan | `card_limit` | Portfolio | Leads | Analytics | Teams |
|------|--------------|-----------|-------|-----------|-------|
| FREE | 1 | ✕ | basic | limited | ✕ |
| PREMIUM | unlimited (`0`) | ✓ | ✓ | ✓ | ✕ |
| BUSINESS | unlimited (`0`) | ✓ | ✓ | advanced | ✓ |

`card_limit = 0` means unlimited.
