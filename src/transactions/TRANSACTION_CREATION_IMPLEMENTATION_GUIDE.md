# Transaction Creation Implementation Guide

## Overview

This guide provides comprehensive instructions for creating transactions according to their different types in the Expense Tracker backend. The system supports six transaction types: `EXPENSE`, `INCOME`, `BILL`, `SUBSCRIPTION`, `SAVINGS`, and `REFUND`.

## Transaction Types

The system supports the following transaction types as defined in the Prisma schema:

```typescript
enum TransactionType {
  EXPENSE      // Regular expense transactions
  INCOME       // Income/earnings transactions
  BILL         // Bill payments (can have recurrence)
  SUBSCRIPTION // Subscription payments (can have recurrence)
  SAVINGS      // Savings transactions (linked to a goal)
  REFUND       // Refund transactions
}
```

## Common Transaction Fields

All transaction types share the following base fields:

- `userId` (string): Automatically set from JWT token
- `label` (string): Description of the transaction
- `date` (Date): Transaction date
- `value` (Decimal): Transaction amount (always positive)
- `type` (TransactionType): Transaction type (automatically set)
- `categoryId` (string | null): Optional category association
- `goalId` (string | null): Optional savings goal association
- `recurrence` (Recurrence | null): Optional recurrence pattern
- `isPaid` (boolean | null): Payment status
- `dueDate` (Date | null): Optional due date

---

## 1. EXPENSE Transactions

### Description
Regular expense transactions representing money spent. Can optionally be associated with a category.

### DTO: `CreateExpenseDto`

**Location:** `src/transactions/models/create-expense.dto.ts`

**Fields:**
- `label` (string, required): Expense description
- `date` (string, required): ISO 8601 date format (e.g., "2024-01-15")
- `value` (number, required): Expense amount (must be positive)
- `categoryId` (string, optional): Category ID for categorization

### Validation Rules
- `label`: Must be a non-empty string
- `date`: Must be a valid ISO 8601 date string
- `value`: Must be a valid number
- `categoryId`: If provided, must belong to the authenticated user

### Endpoint

```http
POST /transactions/expense
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

### Request Example

```json
{
  "label": "Coffee",
  "date": "2024-01-15",
  "value": 5.50,
  "categoryId": "clx789..."  // Optional
}
```

### Service Method

**Method:** `createExpense(userId: string, createExpenseDto: CreateExpenseDto): Promise<Transaction>`

**Location:** `src/transactions/transactions.service.ts` (lines 111-129)

**Implementation Details:**
1. Validates category ownership if `categoryId` is provided
2. Creates transaction with type `TransactionType.EXPENSE`
3. Returns the created transaction

### Response Example

```json
{
  "id": "clx123...",
  "userId": "clx456...",
  "label": "Coffee",
  "date": "2024-01-15T00:00:00.000Z",
  "value": 5.5,
  "type": "EXPENSE",
  "categoryId": "clx789...",
  "goalId": null,
  "recurrence": null,
  "isPaid": null,
  "dueDate": null,
  "createdAt": "2024-01-15T10:00:00.000Z",
  "updatedAt": "2024-01-15T10:00:00.000Z"
}
```

### Implementation Code Reference

```111:129:src/transactions/transactions.service.ts
  async createExpense(
    userId: string,
    createExpenseDto: CreateExpenseDto,
  ): Promise<Transaction> {
    if (createExpenseDto.categoryId) {
      await this.validateCategoryOwnership(userId, createExpenseDto.categoryId);
    }
    const transaction = await this.prisma.transaction.create({
      data: {
        userId,
        label: createExpenseDto.label,
        date: new Date(createExpenseDto.date),
        value: createExpenseDto.value,
        type: TransactionType.EXPENSE,
        categoryId: createExpenseDto.categoryId,
      },
    });
    return this.mapToTransactionType(transaction);
  }
```

---

## 2. INCOME Transactions

### Description
Income or earnings transactions. Can optionally have a recurrence pattern for recurring income (e.g., monthly salary).

### DTO: `CreateIncomeDto`

**Location:** `src/transactions/models/create-income.dto.ts`

**Fields:**
- `label` (string, required): Income description
- `date` (string, required): ISO 8601 date format
- `value` (number, required): Income amount
- `recurrence` (Recurrence, optional): Recurrence pattern (`DAILY`, `WEEKLY`, `MONTHLY`, `YEARLY`)

### Validation Rules
- `label`: Must be a non-empty string
- `date`: Must be a valid ISO 8601 date string
- `value`: Must be a valid number
- `recurrence`: If provided, must be a valid `Recurrence` enum value

### Endpoint

```http
POST /transactions/income
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

### Request Example

```json
{
  "label": "Salary",
  "date": "2024-01-15",
  "value": 3000.50,
  "recurrence": "MONTHLY"  // Optional
}
```

### Service Method

**Method:** `createIncome(userId: string, createIncomeDto: CreateIncomeDto): Promise<Transaction>`

**Location:** `src/transactions/transactions.service.ts` (lines 24-39)

**Implementation Details:**
1. Creates transaction with type `TransactionType.INCOME`
2. Sets recurrence if provided
3. Returns the created transaction

### Response Example

```json
{
  "id": "clx123...",
  "userId": "clx456...",
  "label": "Salary",
  "date": "2024-01-15T00:00:00.000Z",
  "value": 3000.5,
  "type": "INCOME",
  "categoryId": null,
  "goalId": null,
  "recurrence": "MONTHLY",
  "isPaid": null,
  "dueDate": null,
  "createdAt": "2024-01-15T10:00:00.000Z",
  "updatedAt": "2024-01-15T10:00:00.000Z"
}
```

### Implementation Code Reference

```24:39:src/transactions/transactions.service.ts
  async createIncome(
    userId: string,
    createIncomeDto: CreateIncomeDto,
  ): Promise<Transaction> {
    const transaction = await this.prisma.transaction.create({
      data: {
        userId,
        label: createIncomeDto.label,
        date: new Date(createIncomeDto.date),
        value: createIncomeDto.value,
        type: TransactionType.INCOME,
        recurrence: createIncomeDto.recurrence,
      },
    });
    return this.mapToTransactionType(transaction);
  }
```

---

## 3. BILL Transactions

### Description
Bill payment transactions. Can have a recurrence pattern for recurring bills (e.g., monthly utilities).

### DTO: `CreateBillDto`

**Location:** `src/transactions/models/create-bill.dto.ts`

**Fields:**
- `label` (string, required): Bill description
- `date` (string, required): ISO 8601 date format
- `value` (number, required): Bill amount
- `recurrence` (Recurrence, optional): Recurrence pattern for recurring bills

### Validation Rules
- `label`: Must be a non-empty string
- `date`: Must be a valid ISO 8601 date string
- `value`: Must be a valid number
- `recurrence`: If provided, must be a valid `Recurrence` enum value

### Endpoint

```http
POST /transactions/bill
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

### Request Example

```json
{
  "label": "Electricity Bill",
  "date": "2024-01-15",
  "value": 150.00,
  "recurrence": "MONTHLY"  // Optional
}
```

### Service Method

**Method:** `createBill(userId: string, createBillDto: CreateBillDto): Promise<Transaction>`

**Location:** `src/transactions/transactions.service.ts` (lines 41-56)

**Implementation Details:**
1. Creates transaction with type `TransactionType.BILL`
2. Sets recurrence if provided
3. Returns the created transaction

### Response Example

```json
{
  "id": "clx123...",
  "userId": "clx456...",
  "label": "Electricity Bill",
  "date": "2024-01-15T00:00:00.000Z",
  "value": 150,
  "type": "BILL",
  "categoryId": null,
  "goalId": null,
  "recurrence": "MONTHLY",
  "isPaid": null,
  "dueDate": null,
  "createdAt": "2024-01-15T10:00:00.000Z",
  "updatedAt": "2024-01-15T10:00:00.000Z"
}
```

### Implementation Code Reference

```41:56:src/transactions/transactions.service.ts
  async createBill(
    userId: string,
    createBillDto: CreateBillDto,
  ): Promise<Transaction> {
    const transaction = await this.prisma.transaction.create({
      data: {
        userId,
        label: createBillDto.label,
        date: new Date(createBillDto.date),
        value: createBillDto.value,
        type: TransactionType.BILL,
        recurrence: createBillDto.recurrence,
      },
    });
    return this.mapToTransactionType(transaction);
  }
```

---

## 4. SUBSCRIPTION Transactions

### Description
Subscription payment transactions (e.g., streaming services, software subscriptions). Can have a recurrence pattern.

### DTO: `CreateSubscriptionDto`

**Location:** `src/transactions/models/create-subscription.dto.ts`

**Fields:**
- `label` (string, required): Subscription description
- `date` (string, required): ISO 8601 date format
- `value` (number, required): Subscription amount
- `recurrence` (Recurrence, optional): Recurrence pattern (typically `MONTHLY` or `YEARLY`)

### Validation Rules
- `label`: Must be a non-empty string
- `date`: Must be a valid ISO 8601 date string
- `value`: Must be a valid number
- `recurrence`: If provided, must be a valid `Recurrence` enum value

### Endpoint

```http
POST /transactions/subscription
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

### Request Example

```json
{
  "label": "Netflix",
  "date": "2024-01-15",
  "value": 15.99,
  "recurrence": "MONTHLY"  // Optional
}
```

### Service Method

**Method:** `createSubscription(userId: string, createSubscriptionDto: CreateSubscriptionDto): Promise<Transaction>`

**Location:** `src/transactions/transactions.service.ts` (lines 58-73)

**Implementation Details:**
1. Creates transaction with type `TransactionType.SUBSCRIPTION`
2. Sets recurrence if provided
3. Returns the created transaction

### Response Example

```json
{
  "id": "clx123...",
  "userId": "clx456...",
  "label": "Netflix",
  "date": "2024-01-15T00:00:00.000Z",
  "value": 15.99,
  "type": "SUBSCRIPTION",
  "categoryId": null,
  "goalId": null,
  "recurrence": "MONTHLY",
  "isPaid": null,
  "dueDate": null,
  "createdAt": "2024-01-15T10:00:00.000Z",
  "updatedAt": "2024-01-15T10:00:00.000Z"
}
```

### Implementation Code Reference

```58:73:src/transactions/transactions.service.ts
  async createSubscription(
    userId: string,
    createSubscriptionDto: CreateSubscriptionDto,
  ): Promise<Transaction> {
    const transaction = await this.prisma.transaction.create({
      data: {
        userId,
        label: createSubscriptionDto.label,
        date: new Date(createSubscriptionDto.date),
        value: createSubscriptionDto.value,
        type: TransactionType.SUBSCRIPTION,
        recurrence: createSubscriptionDto.recurrence,
      },
    });
    return this.mapToTransactionType(transaction);
  }
```

---

## 5. SAVINGS Transactions

### Description
Savings transactions that are linked to a savings goal. Automatically updates the goal's `currentAmount` when created.

### DTO: `CreateSavingDto`

**Location:** `src/transactions/models/create-saving.dto.ts`

**Fields:**
- `goalId` (string, required): Savings goal ID (must belong to the user)
- `value` (number, required): Saving amount
- `date` (string, required): ISO 8601 date format

### Validation Rules
- `goalId`: Must be a valid savings goal ID that belongs to the authenticated user
- `value`: Must be a valid number
- `date`: Must be a valid ISO 8601 date string

### Endpoint

```http
POST /transactions/saving
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

### Request Example

```json
{
  "goalId": "clx789...",
  "value": 500.00,
  "date": "2024-01-15"
}
```

### Service Method

**Method:** `createSaving(userId: string, createSavingDto: CreateSavingDto): Promise<Transaction>`

**Location:** `src/transactions/transactions.service.ts` (lines 75-109)

**Implementation Details:**
1. Validates that the savings goal exists
2. Validates that the savings goal belongs to the authenticated user
3. Creates transaction with type `TransactionType.SAVINGS`
4. Automatically sets the label to "Saving to {goalName}"
5. Updates the savings goal's `currentAmount` by incrementing with the transaction value
6. Returns the created transaction

### Business Logic

When a savings transaction is created:
- The transaction's `label` is automatically generated: `"Saving to {goal.name}"`
- The transaction's `goalId` is set to the provided goal ID
- The savings goal's `currentAmount` is incremented by the transaction `value`
- Both operations are performed in sequence (the goal update happens after transaction creation)

### Response Example

```json
{
  "id": "clx123...",
  "userId": "clx456...",
  "label": "Saving to Vacation Fund",
  "date": "2024-01-15T00:00:00.000Z",
  "value": 500,
  "type": "SAVINGS",
  "categoryId": null,
  "goalId": "clx789...",
  "recurrence": null,
  "isPaid": null,
  "dueDate": null,
  "createdAt": "2024-01-15T10:00:00.000Z",
  "updatedAt": "2024-01-15T10:00:00.000Z"
}
```

### Implementation Code Reference

```75:109:src/transactions/transactions.service.ts
  async createSaving(
    userId: string,
    createSavingDto: CreateSavingDto,
  ): Promise<Transaction> {
    const goal = await this.prisma.savingsGoal.findUnique({
      where: { id: createSavingDto.goalId },
    });
    if (!goal) {
      throw new NotFoundException('Savings goal not found');
    }
    if (goal.userId !== userId) {
      throw new ForbiddenException(
        'You do not have access to this savings goal',
      );
    }
    const transaction = await this.prisma.transaction.create({
      data: {
        userId,
        label: `Saving to ${goal.name}`,
        date: new Date(createSavingDto.date),
        value: createSavingDto.value,
        type: TransactionType.SAVINGS,
        goalId: createSavingDto.goalId,
      },
    });
    await this.prisma.savingsGoal.update({
      where: { id: createSavingDto.goalId },
      data: {
        currentAmount: {
          increment: createSavingDto.value,
        },
      },
    });
    return this.mapToTransactionType(transaction);
  }
```

### Error Handling

- **404 Not Found**: If the savings goal doesn't exist
- **403 Forbidden**: If the savings goal doesn't belong to the authenticated user

---

## 6. REFUND Transactions

### Description
Refund transactions representing money returned. Must be associated with a category.

### DTO: `CreateRefundDto`

**Location:** `src/transactions/models/create-refund.dto.ts`

**Fields:**
- `label` (string, required): Refund description
- `date` (string, required): ISO 8601 date format
- `value` (number, required): Refund amount
- `categoryId` (string, required): Category ID (must belong to the user)

### Validation Rules
- `label`: Must be a non-empty string
- `date`: Must be a valid ISO 8601 date string
- `value`: Must be a valid number
- `categoryId`: Must be provided and must belong to the authenticated user

### Endpoint

```http
POST /transactions/refund
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

### Request Example

```json
{
  "label": "Product Return",
  "date": "2024-01-15",
  "value": 50.00,
  "categoryId": "clx789..."
}
```

### Service Method

**Method:** `createRefund(userId: string, createRefundDto: CreateRefundDto): Promise<Transaction>`

**Location:** `src/transactions/transactions.service.ts` (lines 131-147)

**Implementation Details:**
1. Validates category ownership (category must exist and belong to the user)
2. Creates transaction with type `TransactionType.REFUND`
3. Returns the created transaction

### Response Example

```json
{
  "id": "clx123...",
  "userId": "clx456...",
  "label": "Product Return",
  "date": "2024-01-15T00:00:00.000Z",
  "value": 50,
  "type": "REFUND",
  "categoryId": "clx789...",
  "goalId": null,
  "recurrence": null,
  "isPaid": null,
  "dueDate": null,
  "createdAt": "2024-01-15T10:00:00.000Z",
  "updatedAt": "2024-01-15T10:00:00.000Z"
}
```

### Implementation Code Reference

```131:147:src/transactions/transactions.service.ts
  async createRefund(
    userId: string,
    createRefundDto: CreateRefundDto,
  ): Promise<Transaction> {
    await this.validateCategoryOwnership(userId, createRefundDto.categoryId);
    const transaction = await this.prisma.transaction.create({
      data: {
        userId,
        label: createRefundDto.label,
        date: new Date(createRefundDto.date),
        value: createRefundDto.value,
        type: TransactionType.REFUND,
        categoryId: createRefundDto.categoryId,
      },
    });
    return this.mapToTransactionType(transaction);
  }
```

---

## Common Helper Methods

### Category Ownership Validation

**Method:** `validateCategoryOwnership(userId: string, categoryId: string): Promise<void>`

**Location:** `src/transactions/transactions.service.ts` (lines 149-162)

This private method validates that:
1. The category exists
2. The category belongs to the authenticated user

**Throws:**
- `NotFoundException`: If category doesn't exist
- `ForbiddenException`: If category doesn't belong to the user

```149:162:src/transactions/transactions.service.ts
  private async validateCategoryOwnership(
    userId: string,
    categoryId: string,
  ): Promise<void> {
    const category = await this.prisma.category.findUnique({
      where: { id: categoryId },
    });
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    if (category.userId !== userId) {
      throw new ForbiddenException('You do not have access to this category');
    }
  }
```

### Transaction Mapping

**Method:** `mapToTransactionType(transaction): Transaction`

**Location:** `src/transactions/transactions.service.ts` (lines 378-408)

Converts a Prisma transaction object to the `Transaction` type, ensuring proper type conversion (especially for `value` from Decimal to number).

```378:408:src/transactions/transactions.service.ts
  private mapToTransactionType(transaction: {
    id: string;
    userId: string;
    label: string;
    date: Date;
    value: any;
    type: TransactionType;
    categoryId: string | null;
    goalId: string | null;
    recurrence: any;
    isPaid: boolean | null;
    dueDate: Date | null;
    createdAt: Date;
    updatedAt: Date;
  }): Transaction {
    return {
      id: transaction.id,
      userId: transaction.userId,
      label: transaction.label,
      date: transaction.date,
      value: Number(transaction.value),
      type: transaction.type,
      categoryId: transaction.categoryId,
      goalId: transaction.goalId,
      recurrence: transaction.recurrence,
      isPaid: transaction.isPaid,
      dueDate: transaction.dueDate,
      createdAt: transaction.createdAt,
      updatedAt: transaction.updatedAt,
    };
  }
```

---

## Authentication & Authorization

All transaction creation endpoints require:

1. **JWT Authentication**: Bearer token in the Authorization header
2. **User Context**: User ID is automatically extracted from the JWT token
3. **Ownership Validation**: 
   - Categories must belong to the authenticated user
   - Savings goals must belong to the authenticated user

### Controller Guard

All endpoints are protected with `JwtAuthGuard`:

```32:33:src/transactions/transactions.controller.ts
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
```

---

## Error Handling

### Common HTTP Status Codes

- **201 Created**: Transaction successfully created
- **400 Bad Request**: Invalid request data (validation errors)
- **401 Unauthorized**: Missing or invalid JWT token
- **403 Forbidden**: User doesn't have access to the resource (category/goal)
- **404 Not Found**: Resource doesn't exist (category/goal)

### Error Response Format

```json
{
  "statusCode": 404,
  "message": "Savings goal not found",
  "error": "Not Found"
}
```

---

## Testing Examples

### cURL Examples

#### Create Expense

```bash
curl -X POST "http://localhost:3000/transactions/expense" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "label": "Coffee",
    "date": "2024-01-15",
    "value": 5.50,
    "categoryId": "clx789..."
  }'
```

#### Create Income

```bash
curl -X POST "http://localhost:3000/transactions/income" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "label": "Salary",
    "date": "2024-01-15",
    "value": 3000.50,
    "recurrence": "MONTHLY"
  }'
```

#### Create Bill

```bash
curl -X POST "http://localhost:3000/transactions/bill" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "label": "Electricity Bill",
    "date": "2024-01-15",
    "value": 150.00,
    "recurrence": "MONTHLY"
  }'
```

#### Create Subscription

```bash
curl -X POST "http://localhost:3000/transactions/subscription" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "label": "Netflix",
    "date": "2024-01-15",
    "value": 15.99,
    "recurrence": "MONTHLY"
  }'
```

#### Create Saving

```bash
curl -X POST "http://localhost:3000/transactions/saving" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "goalId": "clx789...",
    "value": 500.00,
    "date": "2024-01-15"
  }'
```

#### Create Refund

```bash
curl -X POST "http://localhost:3000/transactions/refund" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "label": "Product Return",
    "date": "2024-01-15",
    "value": 50.00,
    "categoryId": "clx789..."
  }'
```

---

## Type Comparison Table

| Type | Label Required | Category | Goal | Recurrence | Special Logic |
|------|----------------|----------|------|------------|---------------|
| **EXPENSE** | ✅ | Optional | ❌ | ❌ | Category validation if provided |
| **INCOME** | ✅ | ❌ | ❌ | Optional | None |
| **BILL** | ✅ | ❌ | ❌ | Optional | None |
| **SUBSCRIPTION** | ✅ | ❌ | ❌ | Optional | None |
| **SAVINGS** | ❌ (auto-generated) | ❌ | ✅ Required | ❌ | Updates goal's currentAmount |
| **REFUND** | ✅ | ✅ Required | ❌ | ❌ | Category validation required |

---

## Best Practices

### 1. Date Format
Always use ISO 8601 date format (YYYY-MM-DD) for date strings in requests.

### 2. Value Precision
The system uses Prisma's `Decimal` type for monetary values. Values are stored with precision but converted to JavaScript numbers in responses.

### 3. Category Association
- Use categories for expenses and refunds to enable better categorization and reporting
- Always validate category ownership before using it

### 4. Savings Goals
- Savings transactions automatically update the goal's current amount
- The transaction label is auto-generated from the goal name
- Always ensure the goal exists and belongs to the user before creating a savings transaction

### 5. Recurrence Patterns
- Use recurrence for transactions that repeat (income, bills, subscriptions)
- Common patterns: `MONTHLY` for salaries and bills, `YEARLY` for annual subscriptions

### 6. Error Handling
- Always handle validation errors (400)
- Always handle authentication errors (401)
- Always handle authorization errors (403)
- Always handle not found errors (404)

### 7. Transaction Type Selection
- **EXPENSE**: Use for regular purchases/spending
- **INCOME**: Use for earnings (salary, freelance, etc.)
- **BILL**: Use for recurring bills (utilities, rent, etc.)
- **SUBSCRIPTION**: Use for subscription services (streaming, software, etc.)
- **SAVINGS**: Use for money saved toward a specific goal
- **REFUND**: Use for money returned (product returns, refunds, etc.)

---

## File Structure

```
src/transactions/
├── transactions.controller.ts        # HTTP endpoints
├── transactions.service.ts            # Business logic
├── transactions.module.ts             # Module definition
├── models/
│   ├── create-expense.dto.ts         # Expense DTO
│   ├── create-income.dto.ts          # Income DTO
│   ├── create-bill.dto.ts            # Bill DTO
│   ├── create-subscription.dto.ts    # Subscription DTO
│   ├── create-saving.dto.ts          # Saving DTO
│   ├── create-refund.dto.ts          # Refund DTO
│   ├── transaction.type.ts           # Transaction response type
│   ├── paginated-transactions.type.ts
│   └── monthly-balance.type.ts
├── TRANSACTION_CREATION_IMPLEMENTATION_GUIDE.md  # This file
└── EXPENSES_REFUNDS_IMPLEMENTATION.md            # Expenses/Refunds query guide
```

---

## Notes

- All transaction amounts are stored as positive values in the database
- The distinction between positive and negative transactions is handled by the transaction type (e.g., EXPENSE vs INCOME)
- Date fields are stored as DateTime in the database but accepted as ISO 8601 date strings in DTOs
- The `value` field is stored as Decimal in Prisma but converted to number in responses
- Savings transactions automatically update the associated goal's `currentAmount`
- Category and goal ownership is always validated to ensure data security

---

## Related Documentation

- [Expenses and Refunds Query Implementation](./EXPENSES_REFUNDS_IMPLEMENTATION.md) - Guide for querying expenses and refunds with filtering

