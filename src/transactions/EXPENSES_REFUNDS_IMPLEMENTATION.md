# Expenses and Refunds API Implementation

## Overview

This document describes the implementation of endpoints for fetching expenses and refunds with pagination and month filtering capabilities.

## Endpoints

### 1. Get Expenses and Refunds (Flexible Filtering)

**Endpoint:** `GET /transactions/expenses-refunds`

**Description:** Fetches all expenses and refunds for the authenticated user with pagination and optional month filtering.

**Authentication:** Required (JWT Bearer Token)

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | number | No | 1 | Page number (1-indexed, minimum: 1) |
| `limit` | number | No | 20 | Number of items per page (minimum: 1, maximum: 100) |
| `year` | number | No | - | Year for filtering (minimum: 2000, maximum: 2100). If provided, `month` is required. |
| `month` | number | No | - | Month for filtering (1-12). If only `month` is provided, uses current year. If both `year` and `month` are omitted, returns all transactions. |

**Filtering Behavior:**

- **No `year` and no `month`**: Returns all expenses and refunds (no date filtering)
- **`year` + `month`**: Filters by that specific month
- **Only `month`**: Uses current year with the specified month
- **Only `year`**: Returns 400 Bad Request (month is required when year is provided)

**Response:** `PaginatedTransactions`

```typescript
{
  data: Transaction[];           // Array of expense and refund transactions
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
  type: 'EXPENSE' | 'REFUND';
  categoryId: string | null;
  goalId: string | null;
  recurrence: Recurrence | null;
  isPaid: boolean | null;
  dueDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
```

**Status Codes:**

- `200 OK`: Successfully retrieved expenses and refunds
- `400 Bad Request`: Invalid query parameters (e.g., year without month, invalid month range)
- `401 Unauthorized`: Missing or invalid authentication token

**Example Requests:**

```bash
# Get all expenses and refunds (first page, 20 items)
GET /transactions/expenses-refunds?page=1&limit=20

# Get expenses/refunds for November 2024
GET /transactions/expenses-refunds?year=2024&month=11&page=1&limit=20

# Get expenses/refunds for November (current year)
GET /transactions/expenses-refunds?month=11&page=1&limit=20

# Get second page with 50 items per page
GET /transactions/expenses-refunds?page=2&limit=50
```

---

### 2. Get Current Month Expenses and Refunds

**Endpoint:** `GET /transactions/expenses-refunds/current-month`

**Description:** Convenience endpoint that fetches expenses and refunds for the current month with pagination.

**Authentication:** Required (JWT Bearer Token)

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | number | No | 1 | Page number (1-indexed) |
| `limit` | number | No | 20 | Number of items per page |

**Response:** `PaginatedTransactions` (same structure as above)

**Status Codes:**

- `200 OK`: Successfully retrieved current month expenses and refunds
- `400 Bad Request`: Invalid page or limit values
- `401 Unauthorized`: Missing or invalid authentication token

**Example Requests:**

```bash
# Get current month's expenses and refunds (default pagination)
GET /transactions/expenses-refunds/current-month

# Get current month with custom pagination
GET /transactions/expenses-refunds/current-month?page=1&limit=50
```

---

## Implementation Details

### Service Methods

#### `getExpensesAndRefunds(userId: string, queryDto: GetExpensesRefundsQueryDto): Promise<PaginatedTransactions>`

Main service method that handles flexible filtering:

- Filters transactions by type: `EXPENSE` or `REFUND` only
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

#### `getCurrentMonthExpensesAndRefunds(userId: string, page: number, limit: number): Promise<PaginatedTransactions>`

Convenience method that automatically filters for the current month:

- Uses current year and month
- Applies same filtering and pagination logic
- Returns paginated results

### Data Models

#### `GetExpensesRefundsQueryDto`

Located in: `src/transactions/models/get-expenses-refunds-query.dto.ts`

- Uses `class-validator` decorators for validation
- Uses `class-transformer` for automatic type conversion
- Includes Swagger/OpenAPI documentation

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
  type: {
    in: [TransactionType.EXPENSE, TransactionType.REFUND]
  },
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
// Get all expenses and refunds
const response = await fetch('/transactions/expenses-refunds?page=1&limit=20', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
const data: PaginatedTransactions = await response.json();

// Get November 2024 expenses and refunds
const response = await fetch('/transactions/expenses-refunds?year=2024&month=11&page=1&limit=20', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

// Get current month
const response = await fetch('/transactions/expenses-refunds/current-month?page=1&limit=20', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

### React Hook Example

```typescript
function useExpensesAndRefunds(filters?: { year?: number; month?: number; page?: number; limit?: number }) {
  const [data, setData] = useState<PaginatedTransactions | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const params = new URLSearchParams();
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.year) params.append('year', filters.year.toString());
    if (filters?.month) params.append('month', filters.month.toString());
    
    fetch(`/transactions/expenses-refunds?${params}`, {
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
# Get all expenses and refunds
curl -X GET "http://localhost:3000/transactions/expenses-refunds?page=1&limit=20" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Get November 2024
curl -X GET "http://localhost:3000/transactions/expenses-refunds?year=2024&month=11&page=1&limit=20" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Get current month
curl -X GET "http://localhost:3000/transactions/expenses-refunds/current-month?page=1&limit=20" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Expected Response Format

```json
{
  "data": [
    {
      "id": "clx123...",
      "userId": "clx456...",
      "label": "Grocery Shopping",
      "date": "2024-11-15T10:00:00.000Z",
      "value": 125.50,
      "type": "EXPENSE",
      "categoryId": "clx789...",
      "goalId": null,
      "recurrence": null,
      "isPaid": null,
      "dueDate": null,
      "createdAt": "2024-11-15T10:00:00.000Z",
      "updatedAt": "2024-11-15T10:00:00.000Z"
    }
  ],
  "page": 1,
  "limit": 20,
  "total": 45,
  "totalPages": 3,
  "hasNextPage": true,
  "hasPreviousPage": false
}
```

---

## Files Modified/Created

### New Files

1. `src/transactions/models/get-expenses-refunds-query.dto.ts` - Query DTO with validation
2. `src/transactions/models/paginated-transactions.type.ts` - Response type
3. `src/transactions/EXPENSES_REFUNDS_IMPLEMENTATION.md` - This documentation

### Modified Files

1. `src/transactions/transactions.service.ts`
   - Added `getExpensesAndRefunds()` method
   - Added `getCurrentMonthExpensesAndRefunds()` method

2. `src/transactions/transactions.controller.ts`
   - Added `GET /transactions/expenses-refunds` endpoint
   - Added `GET /transactions/expenses-refunds/current-month` endpoint

---

## Notes

- Transactions are ordered by date in descending order (most recent first)
- Only `EXPENSE` and `REFUND` transaction types are returned
- Date filtering is based on the transaction's `date` field
- All date comparisons are timezone-aware
- Pagination is 1-indexed (first page is page 1, not page 0)
- Maximum page size is 100 items per page to prevent performance issues

