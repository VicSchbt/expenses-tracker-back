# Transaction Update and Deletion Implementation Guide

## Overview

This guide documents how **updating** and **deleting** transactions works in the Expense Tracker backend.  
It covers:
- The `UpdateTransactionDto`
- The `PATCH /transactions/:id` endpoint
- The `DELETE /transactions/:id` endpoint
- Ownership checks and category validation
- Special logic for **savings transactions** and their linked savings goals

---

## 1. Data Model Recap

Transactions are defined in Prisma as:

```typescript
model Transaction {
  id     String @id @default(cuid())
  user   User   @relation(fields: [userId], references: [id])
  userId String

  label String
  date  DateTime
  value Decimal
  type  TransactionType

  category   Category?   @relation(fields: [categoryId], references: [id])
  categoryId String?

  goal   SavingsGoal? @relation(fields: [goalId], references: [id])
  goalId String?

  recurrence Recurrence?
  isPaid     Boolean?    @default(false)
  dueDate    DateTime?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

Key points:
- Transactions are **user-scoped** via `userId`.
- Some fields are nullable and can be updated independently (e.g. `categoryId`, `recurrence`, `isPaid`, `dueDate`).
- Savings transactions (`type === SAVINGS`) are linked to a `SavingsGoal` through `goalId`.

---

## 2. DTO: `UpdateTransactionDto`

**Location:** `src/transactions/models/update-transaction.dto.ts`

### Purpose

Represents a **partial update** of a transaction. All fields are optional; only provided fields will be updated.

### Fields

- `label?: string`  
  - New transaction label.

- `date?: string`  
  - New transaction date in ISO 8601 format (e.g. `"2025-01-20"`).

- `value?: number`  
  - New transaction amount (positive number).

- `categoryId?: string`  
  - New category ID. If provided, ownership is validated.

- `recurrence?: Recurrence`  
  - New recurrence pattern (`DAILY`, `WEEKLY`, `MONTHLY`, `YEARLY`).

- `isPaid?: boolean`  
  - New payment status.

- `dueDate?: string`  
  - New due date in ISO 8601 format.

### Validation

Implemented with `class-validator` and documented with Swagger:

- All fields are **optional** (`@IsOptional()`).
- Type-specific decorators ensure correct types:
  - `@IsString()` for text fields
  - `@IsDateString()` for dates
  - `@IsNumber()` for amounts
  - `@IsEnum(Recurrence)` for recurrence
  - `@IsBoolean()` for `isPaid`

---

## 3. Update Transaction Endpoint

### Endpoint

```http
PATCH /transactions/:id
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

### Path Parameters

- `id` (string, required): Transaction ID.

### Request Examples

**Update label and value:**

```json
{
  "label": "Updated transaction label",
  "value": 120.75
}
```

**Update only category:**

```json
{
  "categoryId": "123e4567-e89b-12d3-a456-426614174000"
}
```

**Update recurrence and due date:**

```json
{
  "recurrence": "MONTHLY",
  "dueDate": "2025-02-10"
}
```

### Controller Endpoint

**Location:** `src/transactions/transactions.controller.ts`

```221:244:src/transactions/transactions.controller.ts
  @Patch(':id')
  @ApiOperation({
    summary: 'Update a transaction',
    description:
      'Updates an existing transaction. All fields are optional; only provided fields will be updated.',
  })
  @ApiParam({ name: 'id', description: 'Transaction ID' })
  @ApiResponse({
    status: 200,
    description: 'Transaction successfully updated',
    type: Transaction,
  })
  @ApiResponse({ status: 404, description: 'Transaction not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async updateTransaction(
    @Request() req: { user: { id: string; email: string } },
    @Param('id') id: string,
    @Body() updateTransactionDto: UpdateTransactionDto,
  ): Promise<Transaction> {
    return this.transactionsService.updateTransaction(
      req.user.id,
      id,
      updateTransactionDto,
    );
  }
```

### Service Method

**Location:** `src/transactions/transactions.service.ts`

**Method:**  
`updateTransaction(userId: string, id: string, updateTransactionDto: UpdateTransactionDto): Promise<Transaction>`

**Implementation Details:**

```204:260:src/transactions/transactions.service.ts
  async updateTransaction(
    userId: string,
    id: string,
    updateTransactionDto: UpdateTransactionDto,
  ): Promise<Transaction> {
    const existingTransaction = await this.prisma.transaction.findUnique({
      where: { id },
    });
    if (!existingTransaction) {
      throw new NotFoundException('Transaction not found');
    }
    if (existingTransaction.userId !== userId) {
      throw new ForbiddenException('You do not have access to this transaction');
    }
    if (updateTransactionDto.categoryId) {
      await this.validateCategoryOwnership(userId, updateTransactionDto.categoryId);
    }
    const data: any = {};
    if (updateTransactionDto.label !== undefined) {
      data.label = updateTransactionDto.label;
    }
    if (updateTransactionDto.date !== undefined) {
      data.date = new Date(updateTransactionDto.date);
    }
    if (updateTransactionDto.value !== undefined) {
      data.value = updateTransactionDto.value;
    }
    if (updateTransactionDto.categoryId !== undefined) {
      data.categoryId = updateTransactionDto.categoryId;
    }
    if (updateTransactionDto.recurrence !== undefined) {
      data.recurrence = updateTransactionDto.recurrence;
    }
    if (updateTransactionDto.isPaid !== undefined) {
      data.isPaid = updateTransactionDto.isPaid;
    }
    if (updateTransactionDto.dueDate !== undefined) {
      data.dueDate = new Date(updateTransactionDto.dueDate);
    }
    if (
      existingTransaction.type === TransactionType.SAVINGS &&
      updateTransactionDto.value !== undefined &&
      existingTransaction.goalId
    ) {
      const existingValue = Number(existingTransaction.value);
      const difference = updateTransactionDto.value - existingValue;
      if (difference !== 0) {
        await this.prisma.savingsGoal.update({
          where: { id: existingTransaction.goalId },
          data: {
            currentAmount: {
              increment: difference,
            },
          },
        });
      }
    }
    const updatedTransaction = await this.prisma.transaction.update({
      where: { id },
      data,
    });
    return this.mapToTransactionType(updatedTransaction);
  }
```

#### Behavior Summary

1. **Ownership Check**
   - Loads the transaction by `id`.
   - Throws `404 Not Found` if no transaction exists.
   - Ensures `transaction.userId === userId`; otherwise throws `403 Forbidden`.

2. **Category Validation**
   - If `categoryId` is provided, uses `validateCategoryOwnership` to ensure:
     - Category exists.
     - Category belongs to the same user.

3. **Partial Update**
   - Builds a `data` object only with fields that are **explicitly provided**.
   - Date strings (`date`, `dueDate`) are converted to `Date` instances.

4. **Savings Goals Adjustment**
   - If the transaction is of type `SAVINGS` and `value` is updated:
     - Computes `difference = newValue - oldValue`.
     - Updates the linked goal’s `currentAmount` by `increment: difference`.

5. **Response**
   - Returns the updated transaction mapped to the public `Transaction` type.

### Error Handling

- **401 Unauthorized**: Missing or invalid JWT token.
- **403 Forbidden**: Transaction exists but belongs to another user.
- **404 Not Found**: Transaction does not exist.
- **400 Bad Request**: Validation errors on the DTO (handled by NestJS pipes).

---

## 4. Delete Transaction Endpoint

### Endpoint

```http
DELETE /transactions/:id
Authorization: Bearer <JWT_TOKEN>
```

### Path Parameters

- `id` (string, required): Transaction ID.

### Response Example

```json
{
  "message": "Transaction deleted successfully"
}
```

### Controller Endpoint

**Location:** `src/transactions/transactions.controller.ts`

```246:267:src/transactions/transactions.controller.ts
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a transaction' })
  @ApiParam({ name: 'id', description: 'Transaction ID' })
  @ApiResponse({
    status: 200,
    description: 'Transaction successfully deleted',
  })
  @ApiResponse({ status: 404, description: 'Transaction not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async removeTransaction(
    @Request() req: { user: { id: string; email: string } },
    @Param('id') id: string,
  ): Promise<{ message: string }> {
    await this.transactionsService.removeTransaction(req.user.id, id);
    return { message: 'Transaction deleted successfully' };
  }
```

### Service Method

**Location:** `src/transactions/transactions.service.ts`

**Method:**  
`removeTransaction(userId: string, id: string): Promise<void>`

**Implementation Details:**

```262:291:src/transactions/transactions.service.ts
  async removeTransaction(userId: string, id: string): Promise<void> {
    const existingTransaction = await this.prisma.transaction.findUnique({
      where: { id },
    });
    if (!existingTransaction) {
      throw new NotFoundException('Transaction not found');
    }
    if (existingTransaction.userId !== userId) {
      throw new ForbiddenException('You do not have access to this transaction');
    }
    if (
      existingTransaction.type === TransactionType.SAVINGS &&
      existingTransaction.goalId
    ) {
      const existingValue = Number(existingTransaction.value);
      await this.prisma.savingsGoal.update({
        where: { id: existingTransaction.goalId },
        data: {
          currentAmount: {
            increment: -existingValue,
          },
        },
      });
    }
    await this.prisma.transaction.delete({
      where: { id },
    });
  }
```

#### Behavior Summary

1. **Ownership Check**
   - Loads the transaction by `id`.
   - Throws `404 Not Found` if it does not exist.
   - Verifies `transaction.userId === userId`; otherwise throws `403 Forbidden`.

2. **Savings Goals Adjustment (for SAVINGS transactions)**
   - If the transaction is of type `SAVINGS` and has a `goalId`:
     - Converts the transaction `value` to a number.
     - Decrements the linked savings goal’s `currentAmount` by that value (negative increment).

3. **Deletion**
   - Deletes the transaction from the database with `prisma.transaction.delete`.

### Error Handling

- **401 Unauthorized**: Missing or invalid JWT token.
- **403 Forbidden**: Transaction belongs to another user.
- **404 Not Found**: Transaction does not exist.

---

## 5. Category Ownership Validation

Update logic reuses the existing category ownership validation helper.

**Location:** `src/transactions/transactions.service.ts`

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

This ensures that users cannot assign their transactions to categories they do not own.

---

## 6. Special Considerations for Savings Transactions

Savings transactions (`type === SAVINGS`) are tightly coupled with savings goals:

- **On Create:**  
  The goal’s `currentAmount` is **incremented** by the transaction `value`.  
  (Documented in `TRANSACTION_CREATION_IMPLEMENTATION_GUIDE.md`.)

- **On Update (value change):**  
  The goal’s `currentAmount` is adjusted by the **difference** between the new and old values.

- **On Delete:**  
  The goal’s `currentAmount` is **decremented** by the transaction’s `value`.

This keeps the savings goal totals consistent over the full lifecycle of a savings transaction.

---

## 7. Example cURL Commands

### Update a Transaction

```bash
curl -X PATCH "http://localhost:3000/transactions/<TRANSACTION_ID>" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "label": "Updated label",
    "value": 200,
    "isPaid": true
  }'
```

### Delete a Transaction

```bash
curl -X DELETE "http://localhost:3000/transactions/<TRANSACTION_ID>" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 8. Files Involved

```
src/transactions/
├── transactions.controller.ts                 # PATCH /:id, DELETE /:id endpoints
├── transactions.service.ts                    # updateTransaction, removeTransaction logic
├── models/
│   ├── update-transaction.dto.ts             # DTO for partial updates
│   └── transaction.type.ts                   # Transaction response type
├── TRANSACTION_CREATION_IMPLEMENTATION_GUIDE.md
├── EXPENSES_REFUNDS_IMPLEMENTATION.md
└── TRANSACTION_UPDATE_IMPLEMENTATION_GUIDE.md # This file
```

---

## 9. Notes & Best Practices

- Always perform **ownership checks** (`userId`) before updating or deleting.
- Use **PATCH** for partial updates; only send fields that should change.
- When updating `categoryId`, be sure the category belongs to the same user.
- For savings transactions:
  - Keep in mind the side effects on the associated savings goal.
  - Make sure tests cover creation, update, and deletion flows together.


