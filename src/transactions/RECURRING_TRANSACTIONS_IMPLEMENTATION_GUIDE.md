# Recurring Transactions Implementation Guide

## Overview

This document describes the implementation of recurring transactions in the Expense Tracker API. Recurring transactions allow users to create transactions that automatically generate future instances based on a recurrence pattern (DAILY, WEEKLY, MONTHLY, YEARLY).

## Key Features

- **Automatic Generation**: When creating a transaction with recurrence, the system automatically generates up to 12 future instances
- **Month-End Handling**: Handles edge cases where the original date doesn't exist in the target month (e.g., Jan 31 → Feb 28/29)
- **End Date Support**: Optional `recurrenceEndDate` to automatically stop recurrence at a specific date
- **Flexible Updates**: Update individual instances, current and future instances, or all instances
- **Flexible Deletion**: Delete individual instances, current and future instances, or all instances
- **Scheduled Generation**: Daily cron job ensures future instances are always generated up to 12 months ahead

## Recurrence Patterns

The following recurrence patterns are supported:

- `DAILY`: Transaction repeats every day
- `WEEKLY`: Transaction repeats every week
- `MONTHLY`: Transaction repeats every month
- `YEARLY`: Transaction repeats every year

## Transaction Types That Support Recurrence

The following transaction types can have recurrence:

- `INCOME`: Recurring income (e.g., monthly salary)
- `BILL`: Recurring bills (e.g., monthly utilities)
- `SUBSCRIPTION`: Recurring subscriptions (e.g., streaming services)

**Note**: `EXPENSE`, `REFUND`, and `SAVINGS` transactions do not support recurrence.

## Creating Recurring Transactions

### Endpoint

- `POST /transactions/income`
- `POST /transactions/bill`
- `POST /transactions/subscription`

### Request Body

```typescript
{
  label: string;                    // Required: Transaction label
  date: string;                      // Required: ISO 8601 date (e.g., "2024-01-15")
  value: number;                     // Required: Transaction amount
  recurrence?: Recurrence;           // Optional: DAILY, WEEKLY, MONTHLY, YEARLY
  recurrenceEndDate?: string;        // Optional: ISO 8601 date when recurrence should stop
}
```

### Behavior

When you create a transaction with `recurrence`:

1. **Parent Transaction**: A parent transaction is created with the specified date and recurrence pattern
2. **Future Instances**: The system automatically generates up to 12 future instances based on the recurrence pattern
3. **End Date Respect**: If `recurrenceEndDate` is provided, instances are only generated up to that date
4. **Month-End Handling**: For MONTHLY recurrence, if the original date is the last day of the month (e.g., Jan 31), future instances will use the last day of the target month (e.g., Feb 28/29)

### Example: Create Monthly Income

```bash
POST /transactions/income
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "label": "Monthly Salary",
  "date": "2024-01-31",
  "value": 5000,
  "recurrence": "MONTHLY"
}
```

**What happens:**
- Creates a parent transaction on Jan 31, 2024
- Automatically generates 12 future instances:
  - Feb 29, 2024 (leap year) or Feb 28, 2024
  - Mar 31, 2024
  - Apr 30, 2024 (last day of April)
  - ... and so on for 12 months

### Example: Create Monthly Bill with End Date

```bash
POST /transactions/bill
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "label": "Electricity Bill",
  "date": "2024-01-15",
  "value": 150,
  "recurrence": "MONTHLY",
  "recurrenceEndDate": "2024-12-31"
}
```

**What happens:**
- Creates a parent transaction on Jan 15, 2024
- Generates instances up to Dec 15, 2024 (respecting the end date)
- No instances are created after Dec 31, 2024

### Month-End Date Handling

The system intelligently handles month-end dates:

**Example 1: Jan 31 → February**
- Original: Jan 31, 2024
- Next occurrence: Feb 29, 2024 (leap year) or Feb 28, 2024 (non-leap year)

**Example 2: Jan 30 → February**
- Original: Jan 30, 2024
- Next occurrence: Feb 29, 2024 (leap year) or Feb 28, 2024 (non-leap year)

**Example 3: Jan 29 → February**
- Original: Jan 29, 2024
- Next occurrence: Feb 29, 2024 (leap year) or Feb 28, 2024 (non-leap year)

**Example 4: Jan 15 → February**
- Original: Jan 15, 2024
- Next occurrence: Feb 15, 2024 (normal case)

The system uses the **last day of the target month** when the original day doesn't exist in that month.

## Updating Recurring Transactions

### Endpoint

`PATCH /transactions/:id`

### Request Body

```typescript
{
  label?: string;
  date?: string;
  value?: number;
  categoryId?: string;
  recurrence?: Recurrence;
  recurrenceEndDate?: string;
  isPaid?: boolean;
  dueDate?: string;
  recurrenceScope?: RecurrenceScope;  // NEW: Controls which instances to update
}
```

### Recurrence Scope Options

When updating a recurring transaction, you can specify `recurrenceScope` to control which instances are updated:

- `CURRENT_ONLY` (default): Updates only the selected transaction instance
- `CURRENT_AND_FUTURE`: Updates the selected transaction and all future instances
- `ALL`: Updates all instances (past, current, and future)

### Example 1: Update Only Current Instance

```bash
PATCH /transactions/transaction-id
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "value": 5500,
  "recurrenceScope": "CURRENT_ONLY"
}
```

**What happens:**
- Only the selected transaction instance is updated
- All other instances remain unchanged

### Example 2: Update Current and Future Instances

```bash
PATCH /transactions/transaction-id
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "value": 5500,
  "recurrenceScope": "CURRENT_AND_FUTURE"
}
```

**What happens:**
- The selected transaction instance is updated
- All future instances (based on the transaction's date) are updated
- Past instances remain unchanged

### Example 3: Update All Instances

```bash
PATCH /transactions/transaction-id
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "value": 5500,
  "recurrenceScope": "ALL"
}
```

**What happens:**
- All instances in the recurring series are updated (parent + all children)
- This includes past, current, and future instances

### Example 4: Update Recurrence End Date

```bash
PATCH /transactions/transaction-id
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "recurrenceEndDate": "2025-06-30",
  "recurrenceScope": "ALL"
}
```

**What happens:**
- Updates the `recurrenceEndDate` for all instances
- Future instances beyond the new end date will not be generated

## Deleting Recurring Transactions

### Endpoint

`DELETE /transactions/:id?recurrenceScope=CURRENT_ONLY`

### Query Parameters

- `recurrenceScope` (optional): Controls which instances to delete
  - `CURRENT_ONLY` (default): Deletes only the selected transaction instance
  - `CURRENT_AND_FUTURE`: Deletes the selected transaction and all future instances
  - `ALL`: Deletes all instances (past, current, and future)

### Example 1: Delete Only Current Instance

```bash
DELETE /transactions/transaction-id?recurrenceScope=CURRENT_ONLY
Authorization: Bearer YOUR_JWT_TOKEN
```

**What happens:**
- Only the selected transaction instance is deleted
- All other instances remain

### Example 2: Delete Current and Future Instances

```bash
DELETE /transactions/transaction-id?recurrenceScope=CURRENT_AND_FUTURE
Authorization: Bearer YOUR_JWT_TOKEN
```

**What happens:**
- The selected transaction instance is deleted
- All future instances (based on the transaction's date) are deleted
- Past instances remain

### Example 3: Delete All Instances

```bash
DELETE /transactions/transaction-id?recurrenceScope=ALL
Authorization: Bearer YOUR_JWT_TOKEN
```

**What happens:**
- All instances in the recurring series are deleted (parent + all children)
- This includes past, current, and future instances

## Scheduled Task

A scheduled task runs daily at midnight to ensure recurring transactions always have future instances generated up to 12 months ahead.

### How It Works

1. **Finds Parent Transactions**: Identifies all transactions with recurrence that don't have a parent (i.e., they are parent transactions)
2. **Checks Last Instance**: Finds the last generated child instance for each parent
3. **Generates Missing Instances**: Generates future instances up to 12 months ahead or until `recurrenceEndDate`
4. **Prevents Duplicates**: Checks for existing instances before creating new ones

### Benefits

- Ensures users always see future recurring transactions
- Handles cases where the system was offline during creation
- Automatically generates instances as time progresses

## Database Schema

### Transaction Model

```prisma
model Transaction {
  id                  String    @id @default(cuid())
  userId              String
  label               String
  date                DateTime
  value               Decimal
  type                TransactionType
  recurrence          Recurrence?
  recurrenceEndDate   DateTime?
  parentTransactionId String?
  parentTransaction   Transaction? @relation("RecurringTransactions", fields: [parentTransactionId], references: [id], onDelete: Cascade)
  childTransactions    Transaction[] @relation("RecurringTransactions")
  // ... other fields
}
```

### Key Fields

- `recurrence`: The recurrence pattern (DAILY, WEEKLY, MONTHLY, YEARLY)
- `recurrenceEndDate`: Optional end date for recurrence
- `parentTransactionId`: Links child instances to their parent (null for parent transactions)
- `parentTransaction`: Self-referential relation to parent transaction
- `childTransactions`: Array of child transaction instances

## Implementation Details

### Date Calculation Utility

The system uses a utility function `calculateNextRecurrenceDate()` to calculate the next occurrence date:

```typescript
calculateNextRecurrenceDate(
  baseDate: Date,
  recurrence: Recurrence,
  occurrenceNumber: number = 1
): Date
```

**Month-End Handling Logic:**
```typescript
case Recurrence.MONTHLY:
  const originalDay = baseDate.getDate();
  result.setMonth(result.getMonth() + occurrenceNumber);
  const lastDayOfMonth = new Date(
    result.getFullYear(),
    result.getMonth() + 1,
    0
  ).getDate();
  if (originalDay > lastDayOfMonth) {
    result.setDate(lastDayOfMonth);  // Use last day of month
  } else {
    result.setDate(originalDay);     // Use original day
  }
  break;
```

### Service Methods

#### `createIncome()`, `createBill()`, `createSubscription()`

1. Creates parent transaction with recurrence info
2. If recurrence is provided:
   - Calculates future occurrence dates using `generateFutureOccurrenceDates()`
   - Creates child transactions with `parentTransactionId` set
3. Returns the parent transaction

#### `updateTransaction()`

1. Finds the transaction and checks if it's part of a recurring series
2. Determines the parent transaction ID
3. Based on `recurrenceScope`:
   - `CURRENT_ONLY`: Updates only the selected transaction
   - `CURRENT_AND_FUTURE`: Updates selected + all future instances
   - `ALL`: Updates all instances (parent + all children)
4. Handles savings goal updates for savings transactions

#### `removeTransaction()`

1. Finds the transaction and checks if it's part of a recurring series
2. Determines the parent transaction ID
3. Based on `recurrenceScope`:
   - `CURRENT_ONLY`: Deletes only the selected transaction
   - `CURRENT_AND_FUTURE`: Deletes selected + all future instances
   - `ALL`: Deletes all instances (parent + all children)
4. Handles savings goal updates for savings transactions

## Use Cases

### Use Case 1: Monthly Salary

**Scenario**: User receives a monthly salary on the last day of each month.

```bash
POST /transactions/income
{
  "label": "Monthly Salary",
  "date": "2024-01-31",
  "value": 5000,
  "recurrence": "MONTHLY"
}
```

**Result**: Creates 12 future monthly instances, automatically handling month-end dates.

### Use Case 2: Quarterly Subscription

**Scenario**: User has a quarterly subscription that ends in 6 months.

```bash
POST /transactions/subscription
{
  "label": "Quarterly Magazine",
  "date": "2024-01-01",
  "value": 30,
  "recurrence": "MONTHLY",
  "recurrenceEndDate": "2024-06-30"
}
```

**Result**: Creates instances for Jan, Feb, Mar, Apr, May, Jun (respecting end date).

### Use Case 3: Salary Increase

**Scenario**: User's salary increases starting from next month.

```bash
PATCH /transactions/parent-transaction-id
{
  "value": 5500,
  "recurrenceScope": "CURRENT_AND_FUTURE"
}
```

**Result**: Updates all future salary instances to the new amount, keeping past instances unchanged.

### Use Case 4: Cancel Subscription

**Scenario**: User cancels a subscription starting from next month.

```bash
DELETE /transactions/transaction-id?recurrenceScope=CURRENT_AND_FUTURE
```

**Result**: Deletes the current and all future subscription instances, keeping past instances for historical records.

### Use Case 5: Fix Mistake in All Instances

**Scenario**: User realizes they entered the wrong amount for a recurring bill and wants to fix all instances.

```bash
PATCH /transactions/transaction-id
{
  "value": 175,
  "recurrenceScope": "ALL"
}
```

**Result**: Updates all instances (past, current, and future) to the correct amount.

## API Response Format

### Transaction Object

```typescript
{
  id: string;
  userId: string;
  label: string;
  date: Date;
  value: number;
  type: TransactionType;
  categoryId: string | null;
  goalId: string | null;
  recurrence: Recurrence | null;
  recurrenceEndDate: Date | null;      // NEW
  parentTransactionId: string | null;  // NEW
  isPaid: boolean | null;
  dueDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
```

## Error Handling

### Common Errors

1. **Invalid Recurrence Pattern**
   - Status: `400 Bad Request`
   - Message: Validation error from class-validator

2. **Invalid Date Format**
   - Status: `400 Bad Request`
   - Message: Validation error for date fields

3. **Transaction Not Found**
   - Status: `404 Not Found`
   - Message: "Transaction not found"

4. **Unauthorized Access**
   - Status: `403 Forbidden`
   - Message: "You do not have access to this transaction"

## Best Practices

1. **Use End Dates**: Always set `recurrenceEndDate` for temporary recurring transactions (e.g., subscriptions with trial periods)

2. **Choose Appropriate Scope**: 
   - Use `CURRENT_ONLY` for one-time corrections
   - Use `CURRENT_AND_FUTURE` for changes going forward
   - Use `ALL` only when you need to correct historical data

3. **Month-End Dates**: Be aware that transactions created on month-end dates (28-31) will use the last day of each target month

4. **Parent vs Child**: When updating/deleting, you can target either the parent transaction or any child instance - the system handles it correctly

## Testing

### Manual Testing Examples

```bash
# Create monthly income
curl -X POST "http://localhost:3000/transactions/income" \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "label": "Salary",
    "date": "2024-01-31",
    "value": 5000,
    "recurrence": "MONTHLY"
  }'

# Update current and future
curl -X PATCH "http://localhost:3000/transactions/TRANSACTION_ID" \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "value": 5500,
    "recurrenceScope": "CURRENT_AND_FUTURE"
  }'

# Delete all instances
curl -X DELETE "http://localhost:3000/transactions/TRANSACTION_ID?recurrenceScope=ALL" \
  -H "Authorization: Bearer TOKEN"
```

## Related Documentation

- [Transaction Creation Implementation Guide](./TRANSACTION_CREATION_IMPLEMENTATION_GUIDE.md) - General transaction creation
- [Transaction Update Implementation Guide](./TRANSACTION_UPDATE_IMPLEMENTATION_GUIDE.md) - General transaction updates
- [Income Implementation](./INCOME_IMPLEMENTATION.md) - Income-specific endpoints

## Code References

### Service Implementation

- `src/transactions/transactions.service.ts` - Main service with create/update/delete methods
- `src/transactions/utils/recurrence-date.util.ts` - Date calculation utilities
- `src/transactions/recurring-transactions.scheduler.ts` - Scheduled task for generating future instances

### Models

- `src/transactions/models/create-income.dto.ts` - Income creation DTO
- `src/transactions/models/create-bill.dto.ts` - Bill creation DTO
- `src/transactions/models/create-subscription.dto.ts` - Subscription creation DTO
- `src/transactions/models/update-transaction.dto.ts` - Update DTO with recurrenceScope
- `src/transactions/models/delete-transaction-query.dto.ts` - Delete query DTO
- `src/transactions/models/recurrence-scope.enum.ts` - RecurrenceScope enum

### Database

- `prisma/schema.prisma` - Database schema with recurring transaction fields
- `prisma/migrations/20250101000000_add_recurring_transaction_fields/migration.sql` - Migration file

---

## Summary

The recurring transactions feature provides a powerful way to manage repeating financial transactions. Key capabilities include:

✅ Automatic generation of future instances  
✅ Intelligent month-end date handling  
✅ Flexible update and delete options  
✅ Optional end dates for recurring series  
✅ Scheduled task ensures future instances are always available  

This implementation follows NestJS best practices and maintains clean separation of concerns between service logic, utilities, and scheduled tasks.

