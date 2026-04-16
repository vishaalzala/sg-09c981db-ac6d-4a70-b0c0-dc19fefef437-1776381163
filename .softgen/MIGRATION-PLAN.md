# DATABASE MIGRATION PLAN
Generated: 2026-04-16

---

## MIGRATION OVERVIEW

**Source Database:** Softgen Supabase (current)
**Target Database:** Customer Supabase (kbnemkhxroawmcnjbbil.supabase.co)

**Migration Strategy:** Full schema + data replication with validation

---

## PHASE 1: PRE-MIGRATION BACKUP ✅

### 1.1 Schema Backup
- [x] Extract complete DDL from source database
- [x] Save to `supabase/migrations/BACKUP_FULL_DATABASE.sql`
- [x] Include all tables, constraints, indexes, RLS policies

### 1.2 Data Inventory
- [x] Count records in all tables
- [x] Identify dependencies
- [x] Plan data export order

### 1.3 Validation Baseline
Record current state for comparison:
- Total table count
- Total record count per table
- Foreign key relationships
- RLS policy count

---

## PHASE 2: TARGET DATABASE PREPARATION

### 2.1 Connection Setup
- [ ] Obtain Supabase project credentials:
  * Project URL: https://kbnemkhxroawmcnjbbil.supabase.co
  * Anon Key: (required from user)
  * Service Role Key: (required from user)
- [ ] Update `.env.local` with new credentials
- [ ] Test connection to target database

### 2.2 Clean Target Database
- [ ] Drop existing tables (if any)
- [ ] Ensure clean slate for migration

---

## PHASE 3: SCHEMA REPLICATION

### 3.1 Table Creation Order (Dependency-Based)
```
1. profiles (no dependencies)
2. companies (no dependencies)
3. addon_catalog (no dependencies)
4. users (→ companies)
5. branches (→ companies)
6. customers (→ companies)
7. payment_methods (→ companies)
8. reminder_templates (→ companies)
9. suppliers (→ companies)
10. inventory_items (→ companies)
11. staff (→ companies, users)
12. vehicles (→ companies, customers)
13. bookings (→ companies, customers, vehicles)
14. jobs (→ companies, customers, vehicles)
15. job_line_items (→ jobs)
16. quotes (→ companies, customers, vehicles)
17. quote_line_items (→ quotes)
18. invoices (→ companies, customers, vehicles, quotes, jobs)
19. invoice_line_items (→ invoices)
20. payments (→ companies, invoices, payment_methods)
21. wof_inspections (→ companies, vehicles, users)
22. reminders (→ companies, customers, vehicles)
23. sales_opportunities (→ companies, customers, vehicles, jobs)
24. company_addons (→ companies, addon_catalog)
25. website_settings (→ companies)
```

### 3.2 Schema Elements to Replicate
For each table:
- [x] Column definitions (name, type, nullable, default)
- [x] Primary keys
- [x] Foreign keys
- [x] Check constraints
- [x] Unique constraints
- [x] Indexes
- [x] RLS policies (enable + policies)
- [x] Triggers (if any)

---

## PHASE 4: DATA MIGRATION

### 4.1 Data Export from Source
Export in dependency order to maintain referential integrity

### 4.2 Data Import to Target
Import in same order with:
- Preserve UUIDs where possible
- Maintain foreign key relationships
- Preserve timestamps (created_at, updated_at)
- Handle soft deletes (deleted_at)

### 4.3 Special Considerations
- **auth.users**: Managed by Supabase Auth (manual setup required)
- **profiles**: Must link to auth.users.id
- **users**: Must link to auth.users.id AND companies.id
- **company_id**: Critical for multi-tenant isolation

---

## PHASE 5: POST-MIGRATION VALIDATION

### 5.1 Schema Validation
- [ ] Compare table count: source vs target
- [ ] Compare column definitions: source vs target
- [ ] Verify all foreign keys exist
- [ ] Verify all indexes exist
- [ ] Verify all RLS policies exist

### 5.2 Data Validation
- [ ] Compare record counts per table
- [ ] Verify foreign key integrity (no orphaned records)
- [ ] Spot-check sample records
- [ ] Verify company_id distribution
- [ ] Verify timestamps preserved

### 5.3 Functional Validation
- [ ] Login works
- [ ] Dashboard loads with correct data
- [ ] Add Customer works
- [ ] Add Vehicle works
- [ ] Create Job works
- [ ] Create Quote works
- [ ] Create Invoice works
- [ ] Quote → Job conversion works
- [ ] Quote → Invoice conversion works
- [ ] Copy Invoice works
- [ ] Payment recording works
- [ ] WOF workflows work

---

## PHASE 6: APPLICATION CUTOVER

### 6.1 Configuration Update
- [ ] Update `.env.local` with production credentials
- [ ] Update `src/integrations/supabase/client.ts` (if needed)
- [ ] Restart application
- [ ] Clear browser cache/storage

### 6.2 Final Testing
- [ ] Full end-to-end workflow test
- [ ] Multi-user test (if possible)
- [ ] Role-based access test

---

## PHASE 7: ROLLBACK PLAN

### 7.1 Rollback Triggers
If any of these occur, rollback immediately:
- Data loss detected (record count mismatch > 1%)
- Foreign key integrity violations
- RLS policy missing
- Application unable to connect
- Critical workflow broken

### 7.2 Rollback Procedure
1. Restore `.env.local` to original Softgen credentials
2. Restart application
3. Verify system works with original database
4. Analyze migration failure
5. Fix issues before retry

### 7.3 Backup Files
- `supabase/migrations/BACKUP_FULL_DATABASE.sql` - Full schema + data
- `.env.local.backup` - Original configuration
- Migration logs

---

## MIGRATION CHECKLIST

### Pre-Migration
- [x] Schema backup completed
- [x] Data inventory completed
- [x] Migration plan documented
- [ ] User credentials obtained
- [ ] Backup verified restorable

### Migration
- [ ] Target database connection tested
- [ ] Schema replicated
- [ ] Data migrated
- [ ] RLS policies applied
- [ ] Indexes created

### Validation
- [ ] Record counts match
- [ ] Foreign keys intact
- [ ] RLS policies active
- [ ] Application connects
- [ ] Core workflows tested

### Cutover
- [ ] Configuration updated
- [ ] Application restarted
- [ ] End-to-end test passed
- [ ] User acceptance confirmed

---

## ESTIMATED TIMELINE

**Total Duration:** 2-3 hours

- Schema replication: 30 minutes
- Data migration: 60 minutes
- Validation: 30 minutes
- Testing: 30 minutes
- Buffer: 30 minutes

---

## RISK MITIGATION

**Risk 1: Data Loss**
- Mitigation: Full backup before migration
- Validation: Record count comparison
- Rollback: Restore from backup

**Risk 2: Referential Integrity Broken**
- Mitigation: Migrate in dependency order
- Validation: Foreign key constraint checks
- Rollback: Restore from backup

**Risk 3: RLS Policies Missing**
- Mitigation: Export all policies before migration
- Validation: Policy count comparison
- Fix: Re-apply missing policies

**Risk 4: Application Downtime**
- Mitigation: Perform migration during low-traffic period
- Rollback: Quick cutover to original database

---

## NEXT STEPS

**Awaiting from User:**
1. Supabase Anon Key
2. Supabase Service Role Key
3. Confirmation to proceed

**Once Received:**
1. Update connection credentials
2. Test target database connection
3. Execute schema replication
4. Execute data migration
5. Validate results
6. Cutover application

---

## CONTACT & SUPPORT

**For Issues During Migration:**
- Review migration logs
- Check rollback procedures
- Verify backup integrity
- Contact Supabase support if infrastructure issues

---

*Migration Plan Version: 1.0*
*Created: 2026-04-16*
*Status: Awaiting Credentials*