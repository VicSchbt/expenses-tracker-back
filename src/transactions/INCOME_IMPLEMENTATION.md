# Income API Implementation

## Overview

This document describes the implementation of endpoints for fetching income transactions with pagination and month filtering capabilities. Income transactions represent earnings or money received by the user.

## Endpoints

### 1. Get Income Transactions (Flexible Filtering)

**Endpoint:** `GET /transactions/income`

**Description:** Fetches all income transactions for the authenticated user with pagination and optional month filtering.

**Authentication:** Required (JWT Bearer Token)

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | number | No | 1 | Page number (1-indexed, minimum: 1) |
| `limit` | number | No | 20 | Number of items per page (minimum: 1, maximum: 100) |
| `year` | number | No | - | Year for filtering (minimum: 2000, maximum: 2100). If provided, `month` is required. |
| `month` | number | No | - | Month for filtering (1-12). If only `month` is provided, uses current year. If both `year` and `month` are omitted, returns all transactions. |

**Filtering Behavior:**

- **No `year` and no `month`**: Returns all income transactions (no date filtering)
- **`year` + `month`**: Filters by that specific month
- **Only `month`**: Uses current year with the specified month
- **Only `year`**: Returns 400 Bad Request (month is required when year is provided)

**Response:** `PaginatedTransactions`

```typescript
{
  data: Transaction[];           // Array of income transactions
  page: number;                  // Current page number
  limit: number;                 // Items per page
  total: number;                 // Total number of transactions
  totalPages: number;            // Total number of pages
  hasNextPage: boolean;          // Whether there is a next page
  hasPreviousPage: boolean;      // Whether there is a previous page
}
```

**Transaction Object:**

```typescript
{
  id: string;
  userId: string;
  label: string;
  date: Date;
  value: number;
  type: 'INCOME';
  categoryId: string | null;
  goalId: string | null;
  recurrence: Recurrence | null;  // Can be DAILY, WEEKLY, MONTHLY, YEARLY
  isPaid: boolean | null;
  dueDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
```

**Status Codes:**

- `200 OK`: Successfully retrieved income transactions
- `400 Bad Request`: Invalid query parameters (e.g., year without month, invalid month range)
- `401 Unauthorized`: Missing or invalid authentication token

**Example Requests:**

```bash
# Get all income transactions (first page, 20 items)
GET /transactions/income?page=1&limit=20

# Get income for November 2024
GET /transactions/income?year=2024&month=11&page=1&limit=20

# Get income for November (current year)
GET /transactions/income?month=11&page=1&limit=20

# Get second page with 50 items per page
GET /transactions/income?page=2&limit=50
```

---

### 2. Get Current Month Income Transactions

**Endpoint:** `GET /transactions/income/current-month`

**Description:** Convenience endpoint that fetches income transactions for the current month with pagination.

**Authentication:** Required (JWT Bearer Token)

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | number | No | 1 | Page number (1-indexed) |
| `limit` | number | No | 20 | Number of items per page |

**Response:** `PaginatedTransactions` (same structure as above)

**Status Codes:**

- `200 OK`: Successfully retrieved current month income transactions
- `400 Bad Request`: Invalid page or limit values
- `401 Unauthorized`: Missing or invalid authentication token

**Example Requests:**

```bash
# Get current month's income (default pagination)
GET /transactions/income/current-month

# Get current month with custom pagination
GET /transactions/income/current-month?page=1&limit=50
```

---

## Complete CRUD Operations for Income

### Create Income

**Endpoint:** `POST /transactions/income`

See [Transaction Creation Implementation Guide](./TRANSACTION_CREATION_IMPLEMENTATION_GUIDE.md#2-income-transactions) for details.

### Read Income

- `GET /transactions/income` - Get all income with filtering (this document)
- `GET /transactions/income/current-month` - Get current month income (this document)

### Update Income

**Endpoint:** `PATCH /transactions/:id`

See [Transaction Update Implementation Guide](./TRANSACTION_UPDATE_IMPLEMENTATION_GUIDE.md) for details.

### Delete Income

**Endpoint:** `DELETE /transactions/:id`

See [Transaction Update Implementation Guide](./TRANSACTION_UPDATE_IMPLEMENTATION_GUIDE.md) for details.

---

## Implementation Details

### Service Methods

#### `getIncome(userId: string, queryDto: GetIncomeQueryDto): Promise<PaginatedTransactions>`

Main service method that handles flexible filtering:

- Filters transactions by type: `INCOME` only
- Applies date filtering if `year` and `month` are provided
- Orders results by date (descending - most recent first)
- Returns paginated results with metadata

**Date Filtering Logic:**

```typescript
if (year && month) {
  const startDate = new Date(year, month - 1, 1);  // First day of month
  const endDate = new Date(year, month, 0, 23, 59, 59, 999);  // Last day of month
  whereClause.date = {
    gte: startDate,
    lte: endDate,
  };
}
```

**Location:** `src/transactions/transactions.service.ts` (lines 475-530)

#### `getCurrentMonthIncome(userId: string, page: number, limit: number): Promise<PaginatedTransactions>`

Convenience method that automatically filters for the current month:

- Uses current year and month
- Applies same filtering and pagination logic
- Returns paginated results

**Location:** `src/transactions/transactions.service.ts` (lines 536-575)

### Data Models

#### `GetIncomeQueryDto`

Located in: `src/transactions/models/get-income-query.dto.ts`

- Uses `class-validator` decorators for validation
- Uses `class-transformer` for automatic type conversion
- Includes Swagger/OpenAPI documentation

**Fields:**
- `page?: number` - Page number (default: 1, minimum: 1)
- `limit?: number` - Items per page (default: 20, minimum: 1, maximum: 100)
- `year?: number` - Year for filtering (minimum: 2000, maximum: 2100)
- `month?: number` - Month for filtering (1-12)

#### `PaginatedTransactions`

Located in: `src/transactions/models/paginated-transactions.type.ts`

- Response type for paginated transaction lists
- Includes pagination metadata
- Fully documented with Swagger decorators

### Database Queries

The implementation uses Prisma ORM with the following query structure:

```typescript
const whereClause = {
  userId,                                    // Filter by authenticated user
  type: TransactionType.INCOME,              // Filter by income type only
  // Optional date filtering
  date?: {
    gte: startDate,
    lte: endDate
  }
};

const [transactions, total] = await Promise.all([
  prisma.transaction.findMany({
    where: whereClause,
    skip: (page - 1) * limit,
    take: limit,
    orderBy: { date: 'desc' }
  }),
  prisma.transaction.count({ where: whereClause })
]);
```

### Security

- All endpoints are protected with `JwtAuthGuard`
- User ID is extracted from the JWT token
- Only transactions belonging to the authenticated user are returned
- No user can access another user's transactions

### Error Handling

**Validation Errors:**

- Invalid page number (< 1): Handled by DTO validation
- Invalid limit (< 1 or > 100): Handled by DTO validation
- Invalid month (< 1 or > 12): Handled by DTO validation
- Year without month: Returns `400 Bad Request` with message "Month is required when year is provided"

**Authentication Errors:**

- Missing token: Returns `401 Unauthorized`
- Invalid token: Returns `401 Unauthorized`

---

## Usage Examples

### Frontend Integration

```typescript
// Get all income transactions
const response = await fetch('/transactions/income?page=1&limit=20', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
const data: PaginatedTransactions = await response.json();

// Get November 2024 income
const response = await fetch('/transactions/income?year=2024&month=11&page=1&limit=20', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

// Get current month
const response = await fetch('/transactions/income/current-month?page=1&limit=20', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

### React Hook Example

```typescript
function useIncome(filters?: { year?: number; month?: number; page?: number; limit?: number }) {
  const [data, setData] = useState<PaginatedTransactions | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const params = new URLSearchParams();
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.year) params.append('year', filters.year.toString());
    if (filters?.month) params.append('month', filters.month.toString());
    
    fetch(`/transactions/income?${params}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, [filters]);
  
  return { data, loading };
}
```

---

## Testing

### Manual Testing with cURL

```bash
# Get all income transactions
curl -X GET "http://localhost:3000/transactions/income?page=1&limit=20" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Get November 2024
curl -X GET "http://localhost:3000/transactions/income?year=2024&month=11&page=1&limit=20" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Get current month
curl -X GET "http://localhost:3000/transactions/income/current-month?page=1&limit=20" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Expected Response Format

```json
{
  "data": [
    {
      "id": "clx123...",
      "userId": "clx456...",
      "label": "Monthly Salary",
      "date": "2024-11-15T10:00:00.000Z",
      "value": 3000.50,
      "type": "INCOME",
      "categoryId": null,
      "goalId": null,
      "recurrence": "MONTHLY",
      "isPaid": null,
      "dueDate": null,
      "createdAt": "2024-11-15T10:00:00.000Z",
      "updatedAt": "2024-11-15T10:00:00.000Z"
    },
    {
      "id": "clx124...",
      "userId": "clx456...",
      "label": "Freelance Project",
      "date": "2024-11-10T10:00:00.000Z",
      "value": 1500.00,
      "type": "INCOME",
      "categoryId": null,
      "goalId": null,
      "recurrence": null,
      "isPaid": null,
      "dueDate": null,
      "createdAt": "2024-11-10T10:00:00.000Z",
      "updatedAt": "2024-11-10T10:00:00.000Z"
    }
  ],
  "page": 1,
  "limit": 20,
  "total": 12,
  "totalPages": 1,
  "hasNextPage": false,
  "hasPreviousPage": false
}
```

---

## Files Modified/Created

### New Files

1. `src/transactions/models/get-income-query.dto.ts` - Query DTO with validation
2. `src/transactions/INCOME_IMPLEMENTATION.md` - This documentation

### Modified Files

1. `src/transactions/transactions.service.ts`
   - Added `getIncome()` method
   - Added `getCurrentMonthIncome()` method

2. `src/transactions/transactions.controller.ts`
   - Added `GET /transactions/income` endpoint
   - Added `GET /transactions/income/current-month` endpoint

---

## Code References

### Service Implementation

```475:530:src/transactions/transactions.service.ts
  async getIncome(
    userId: string,
    queryDto: GetIncomeQueryDto,
  ): Promise<PaginatedTransactions> {
    const page = queryDto.page ?? 1;
    const limit = queryDto.limit ?? 20;
    const skip = (page - 1) * limit;
    const now = new Date();
    let year = queryDto.year;
    let month = queryDto.month;
    if (year && !month) {
      throw new BadRequestException(
        'Month is required when year is provided',
      );
    }
    if (month && !year) {
      year = now.getFullYear();
    }
    const whereClause: any = {
      userId,
      type: TransactionType.INCOME,
    };
    if (year && month) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59, 999);
      whereClause.date = {
        gte: startDate,
        lte: endDate,
      };
    }
    const [transactions, total] = await Promise.all([
      this.prisma.transaction.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: {
          date: 'desc',
        },
      }),
      this.prisma.transaction.count({
        where: whereClause,
      }),
    ]);
    const totalPages = Math.ceil(total / limit);
    const mappedTransactions = transactions.map((transaction) =>
      this.mapToTransactionType(transaction),
    );
    return {
      data: mappedTransactions,
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    };
  }
```

### Controller Implementation

```197:244:src/transactions/transactions.controller.ts
  @Get('income')
  @ApiOperation({
    summary: 'Get income transactions',
    description:
      'Fetches all income transactions for the user with pagination. Can filter by month/year or get all transactions. If only month is provided, uses current year. If neither year nor month is provided, returns all transactions.',
  })
  @ApiResponse({
    status: 200,
    description: 'Income transactions successfully retrieved',
    type: PaginatedTransactions,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getIncome(
    @Request() req: { user: { id: string; email: string } },
    @Query() queryDto: GetIncomeQueryDto,
  ): Promise<PaginatedTransactions> {
    return this.transactionsService.getIncome(req.user.id, queryDto);
  }

  @Get('income/current-month')
  @ApiOperation({
    summary: 'Get current month income transactions',
    description:
      'Fetches income transactions for the current month with pagination.',
  })
  @ApiResponse({
    status: 200,
    description: 'Current month income transactions successfully retrieved',
    type: PaginatedTransactions,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getCurrentMonthIncome(
    @Request() req: { user: { id: string; email: string } },
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<PaginatedTransactions> {
    const pageNumber = page ? parseInt(page, 10) : 1;
    const limitNumber = limit ? parseInt(limit, 10) : 20;
    if (isNaN(pageNumber) || isNaN(limitNumber)) {
      throw new BadRequestException('Page and limit must be valid numbers');
    }
    return this.transactionsService.getCurrentMonthIncome(
      req.user.id,
      pageNumber,
      limitNumber,
    );
  }
```

---

## Notes

- Transactions are ordered by date in descending order (most recent first)
- Only `INCOME` transaction type is returned
- Date filtering is based on the transaction's `date` field
- All date comparisons are timezone-aware
- Pagination is 1-indexed (first page is page 1, not page 0)
- Maximum page size is 100 items per page to prevent performance issues
- Income transactions can have a `recurrence` field (DAILY, WEEKLY, MONTHLY, YEARLY) for recurring income like salaries
- Income transactions are not associated with categories (unlike expenses and refunds)

---

## Related Documentation

- [Transaction Creation Implementation Guide](./TRANSACTION_CREATION_IMPLEMENTATION_GUIDE.md#2-income-transactions) - Guide for creating income transactions
- [Transaction Update Implementation Guide](./TRANSACTION_UPDATE_IMPLEMENTATION_GUIDE.md) - Guide for updating and deleting transactions
- [Expenses and Refunds Query Implementation](./EXPENSES_REFUNDS_IMPLEMENTATION.md) - Similar implementation guide for expenses and refunds

---

## Use Cases

### 1. Displaying Monthly Income Summary

```typescript
// Get all income for a specific month
const incomeData = await getIncome(userId, {
  year: 2024,
  month: 11,
  page: 1,
  limit: 100
});

const totalIncome = incomeData.data.reduce((sum, transaction) => sum + transaction.value, 0);
console.log(`Total income for November 2024: $${totalIncome}`);
```

### 2. Income History with Pagination

```typescript
// Get income history page by page
async function getIncomeHistory(userId: string, page: number = 1) {
  const response = await getIncome(userId, {
    page,
    limit: 20
  });
  
  return {
    transactions: response.data,
    hasMore: response.hasNextPage,
    currentPage: response.page,
    totalPages: response.totalPages
  };
}
```

### 3. Current Month Income Dashboard

```typescript
// Quick access to current month income
const currentMonthIncome = await getCurrentMonthIncome(userId, 1, 50);
const monthlyTotal = currentMonthIncome.data.reduce(
  (sum, transaction) => sum + transaction.value, 
  0
);
```

