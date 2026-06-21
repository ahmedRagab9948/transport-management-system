# Database Schema
## Transport Management System (TMS)

Database:
- PostgreSQL

ORM:
- Prisma ORM

Architecture:
- Relational Database Design
- Normalized Structure
- Audit-Friendly
- Scalable

---

# Naming Conventions

Tables:
- snake_case
- plural names

Examples:
- users
- trips
- vehicles

Columns:
- snake_case

Primary Keys:
- id (UUID)

Timestamps:
- created_at
- updated_at

Soft Delete:
- deleted_at (nullable)

---

# Core Tables

---

# users

Represents system employees/users.

## Columns

- id
- full_name
- email
- password_hash
- phone
- role_id
- is_active
- otp_enabled
- last_login_at
- created_at
- updated_at
- deleted_at

## Relationships

- belongs to roles
- has many audit_logs
- has many trip_status_histories

---

# roles

Represents employee roles.

## Columns

- id
- name
- description
- created_at
- updated_at

## Relationships

- has many users
- many-to-many with permissions

---

# permissions

Represents granular system permissions.

## Columns

- id
- key
- description
- created_at

Examples:
- CREATE_TRIP
- DELETE_TRIP
- VIEW_REPORTS

---

# role_permissions

Pivot table between roles and permissions.

## Columns

- role_id
- permission_id

---

# drivers

Represents vehicle drivers.

## Columns

- id
- full_name
- national_id
- phone
- address
- license_number
- license_type
- license_expiry_date
- status
- notes
- created_at
- updated_at
- deleted_at

## Relationships

- has many trips
- has many vehicle_assignments

---

# sectors

Represents operational sectors/categories.

## Columns

- id
- name
- description
- created_at

Examples:
- Logistics
- Cement
- Food Transport

---

# vehicles

Represents all vehicles.

## Columns

- id
- vehicle_code
- type
- plate_number
- status
- sector_id
- manufacturer
- model
- production_year
- capacity
- current_driver_id
- notes
- created_at
- updated_at
- deleted_at

## Vehicle Types

- TRAILER_HEAD
- TRAILER_UNIT
- JUMBO

## Vehicle Status

- AVAILABLE
- BUSY
- MAINTENANCE
- OUT_OF_SERVICE

## Relationships

- belongs to sectors
- belongs to drivers
- has many trips
- has many maintenance_records

---

# trailer_connections

Represents head + trailer combinations.

## Columns

- id
- trailer_head_id
- trailer_unit_id
- connected_at
- disconnected_at

## Relationships

- belongs to vehicles

Purpose:
Allows flexible trailer assignment.

---

# vehicle_assignments

Tracks driver assignment history.

## Columns

- id
- vehicle_id
- driver_id
- assigned_at
- unassigned_at
- assigned_by

## Relationships

- belongs to vehicles
- belongs to drivers
- belongs to users

Purpose:
Track historical driver changes.

---

# clients

Represents client companies.

## Columns

- id
- company_name
- contact_person
- phone
- email
- address
- tax_number
- notes
- created_at
- updated_at
- deleted_at

## Relationships

- has many contracts
- has many trips

---

# contracts

Represents agreements with clients.

## Columns

- id
- client_id
- contract_type
- start_date
- end_date
- monthly_price
- trip_price
- status
- notes
- created_at
- updated_at

## Contract Types

- MONTHLY
- PER_TRIP

## Contract Status

- ACTIVE
- EXPIRED
- CANCELLED

---

# trips

Represents transportation trips.

## Columns

- id
- trip_number
- client_id
- vehicle_id
- driver_id
- contract_id
- trip_type
- status
- from_location
- to_location
- cargo_description
- start_date
- end_date
- actual_end_date
- price
- notes
- created_by
- created_at
- updated_at
- deleted_at

## Trip Types

- PER_TRIP
- MONTHLY

## Trip Status

- PENDING
- ASSIGNED
- IN_PROGRESS
- COMPLETED
- CANCELLED

## Relationships

- belongs to clients
- belongs to vehicles
- belongs to drivers
- belongs to contracts
- belongs to users

---

# trip_status_histories

Tracks trip status changes.

## Columns

- id
- trip_id
- old_status
- new_status
- changed_by
- changed_at
- notes

## Relationships

- belongs to trips
- belongs to users

Purpose:
Audit trip lifecycle changes.

---

# maintenance_records

Represents vehicle maintenance operations.

## Columns

- id
- vehicle_id
- maintenance_type
- maintenance_date
- cost
- notes
- created_at

## Relationships

- belongs to vehicles

Examples:
- Oil Change
- Tire Replacement
- Engine Repair

---

# documents

Represents uploaded documents/files.

## Columns

- id
- file_name
- file_url
- document_type
- related_entity_type
- related_entity_id
- expiry_date
- uploaded_by
- created_at

## Document Types

- VEHICLE_LICENSE
- DRIVER_LICENSE
- INSURANCE
- CONTRACT
- NATIONAL_ID

Purpose:
Centralized file management.

---

# notifications

Represents system notifications.

## Columns

- id
- title
- message
- type
- is_read
- user_id
- created_at

## Notification Types

- WARNING
- INFO
- SUCCESS
- ERROR

---

# audit_logs

Tracks all sensitive system actions.

## Columns

- id
- user_id
- action
- entity_type
- entity_id
- old_values
- new_values
- ip_address
- user_agent
- created_at

Examples:
- CREATE_TRIP
- DELETE_DRIVER
- UPDATE_VEHICLE

Purpose:
Enterprise-level auditing.

---

# otp_verifications

Stores OTP verification records.

## Columns

- id
- user_id
- otp_code
- expires_at
- verified_at
- created_at

Purpose:
Secure login verification.

---

# Relationship Summary

## users
- belongs to roles
- has many audit_logs

## roles
- many-to-many permissions

## drivers
- has many trips
- has many vehicle_assignments

## vehicles
- belongs to sectors
- has many trips
- has many maintenance_records

## clients
- has many contracts
- has many trips

## trips
- belongs to clients
- belongs to vehicles
- belongs to drivers
- belongs to contracts

---

# Database Rules

## Soft Delete

Critical entities should use:
- deleted_at

Instead of permanent deletion.

---

# UUID Usage

All primary keys should use:
- UUID

Reason:
- Better scalability
- Safer public exposure

---

# Audit Requirements

The following actions must be logged:
- Deletes
- Status changes
- Vehicle assignment changes
- Permission changes

---

# Indexing Strategy

Important indexed columns:

- email
- plate_number
- national_id
- trip_number
- status
- created_at

---

# Future Scalability

Future planned tables:

- gps_tracking
- trip_expenses
- fuel_records
- invoices
- payments
- warehouses
- route_history
- live_tracking

---

# Database Design Goals

The database should be:
- Highly scalable
- Enterprise-grade
- Auditable
- Secure
- Reporting-friendly
- Optimized for filtering and search