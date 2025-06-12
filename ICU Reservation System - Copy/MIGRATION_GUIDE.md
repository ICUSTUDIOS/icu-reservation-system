# One-Wallet System Migration Guide

## Overview
This migration updates the ICU Reservation System from a two-wallet approach (separate monthly/weekend points) to a simplified one-wallet system as specified in the requirements.

## Migration Steps

### 1. Apply Database Migration
Run the migration script to update the database schema and functions:

```sql
-- Execute the migration script
\i scripts/simple-one-wallet-migration.sql
```

### 2. Updated System Features

#### **Single Wallet System**
- **40 points per month** (automatically refilled on the 1st of each month)
- **1 point = 30 minutes** of studio time
- **Weekend fairness counter** (12 weekend slots max per week)

#### **New Pricing Model**
| Time Period | Cost per 30min slot |
|-------------|-------------------|
| Monday-Thursday (all day) | 1 point |
| Friday (before 5:00 PM) | 1 point |
| Friday (5:00 PM - midnight) + Saturday + Sunday | 3 points |

#### **Weekend Fairness System**
- Maximum **12 weekend slots (6 hours)** per calendar week
- Counter resets every Monday at midnight
- Weekend bookings still deduct points from main wallet
- Counter just prevents weekend hogging

#### **Cancellation Policy**
- **≥24 hours notice**: 100% point refund
- **<24 hours notice**: 50% point refund (rounded up)

### 3. Updated Components

#### **Wallet Bar**
- Now shows single "Points" wallet instead of "Monthly/Weekend"
- Displays weekend slot counter (12 max per week)
- Interactive dialogs explain the new system

#### **Time Slot Picker**  
- Shows real-time cost calculation
- Displays weekend pricing (3 points) vs weekday pricing (1 point)
- Clear breakdown of total cost for selected time range

#### **Booking System**
- Uses new `create_booking_with_points()` function
- Automatically calculates costs based on time slots
- Enforces weekend slot limits
- Provides better error messages for insufficient points

### 4. Automatic Maintenance

#### **Monthly Refresh** (1st of each month)
```sql
SELECT refresh_monthly_points();
```

#### **Weekly Reset** (Every Monday)
```sql
SELECT reset_weekend_counters();
```

### 5. Verification

After migration, verify:

1. **Member wallets show 40 points** (existing members migrated)
2. **Weekend counters reset to 0** (fresh start)
3. **Booking cost calculation works** (test weekend vs weekday)
4. **Cancellation refunds work** (test 24h+ vs <24h)
5. **Weekend slot limiting works** (try to book 13+ weekend slots)

### 6. Key Benefits

✅ **Simpler system** - One wallet for everything  
✅ **Fair weekend access** - 6-slot weekly limit prevents hogging  
✅ **Clearer pricing** - 1 or 3 points, no complex bands  
✅ **Better UX** - Real-time cost display  
✅ **Automatic maintenance** - Monthly/weekly resets  

## Troubleshooting

### Common Issues

**Q: Migration fails with "column already exists"**  
A: The script includes `IF NOT EXISTS` checks, but if you have partial migration, manually drop conflicting columns first.

**Q: Existing bookings show 0 points cost**  
A: The migration estimates costs for existing bookings. Review and manually adjust if needed.

**Q: Weekend counter seems wrong**  
A: Run `SELECT reset_weekend_counters()` to reset all counters to 0.

### Support Commands

```sql
-- Check member wallet status
SELECT auth_id, monthly_points, weekend_slots_used, last_monthly_refresh, last_weekly_reset 
FROM members;

-- View recent point transactions
SELECT * FROM point_ledger ORDER BY created_at DESC LIMIT 20;

-- Manual point refresh (emergency)
UPDATE members SET monthly_points = 40, last_monthly_refresh = CURRENT_DATE;

-- Manual weekend reset (emergency)  
UPDATE members SET weekend_slots_used = 0, last_weekly_reset = CURRENT_DATE;
```
