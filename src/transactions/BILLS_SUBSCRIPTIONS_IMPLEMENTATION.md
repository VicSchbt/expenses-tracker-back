# Bills and Subscriptions API Implementation

## Overview

This document describes the implementation of endpoints for fetching bill and subscription transactions with pagination and month filtering capabilities. Bills and subscriptions represent recurring expenses that users need to track and pay regularly.

## Endpoints

### 1. Get Bill Transactions (Flexible Filtering)

**Endpoint:** `GET /transactions/bills`

**Description:** Fetches all bill transactions for the authenticated user with pagination and optional month filtering.

**Authentication:** Required (JWT Bearer Token)

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | number | No | 1 | Page number (1-indexed, minimum: 1) |
| `limit` | number | No | 20 | Number of items per page (minimum: 1, maximum: 100) |
| `year` | number | No | - | Year for filtering (minimum: 2000, maximum: 2100). If provided, `month` is required. |
| `month` | number | No | - | Month for filtering (1-12). If only `month` is provided, uses current year. If both `year` and `month` are omitted, returns all transactions. |

**Filtering Behavior:**

- **No `year` and no `month`**: Returns all bill transactions (no date filtering)
- **`year` + `month`**: Filters by that specific month
- **Only `month`**: Uses current year with the specified month
- **Only `year`**: Returns 400 Bad Request (month is required when year is provided)

**Response:** `PaginatedTransactions`

```typescript
{
  data: Transaction[];           // Array of bill transactions
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
  type: 'BILL';
  categoryId: string | null;
  goalId: string | null;
  recurrence: Recurrence | null;  // Can be DAILY, WEEKLY, MONTHLY, YEARLY
  recurrenceEndDate: Date | null;
  parentTransactionId: string | null;
  isPaid: boolean | null;
  dueDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
```

**Status Codes:**

- `200 OK`: Successfully retrieved bill transactions
- `400 Bad Request`: Invalid query parameters (e.g., year without month, invalid month range)
- `401 Unauthorized`: Missing or invalid authentication token

**Example Requests:**

```bash
# Get all bill transactions (first page, 20 items)
GET /transactions/bills?page=1&limit=20

# Get bills for November 2024
GET /transactions/bills?year=2024&month=11&page=1&limit=20

# Get bills for November (current year)
GET /transactions/bills?month=11&page=1&limit=20

# Get second page with 50 items per page
GET /transactions/bills?page=2&limit=50
```

---

### 2. Get Current Month Bill Transactions

**Endpoint:** `GET /transactions/bills/current-month`

**Description:** Convenience endpoint that fetches bill transactions for the current month with pagination.

**Authentication:** Required (JWT Bearer Token)

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | number | No | 1 | Page number (1-indexed) |
| `limit` | number | No | 20 | Number of items per page |

**Response:** `PaginatedTransactions` (same structure as above)

**Status Codes:**

- `200 OK`: Successfully retrieved current month bill transactions
- `400 Bad Request`: Invalid page or limit values
- `401 Unauthorized`: Missing or invalid authentication token

**Example Requests:**

```bash
# Get current month's bills (default pagination)
GET /transactions/bills/current-month

# Get current month with custom pagination
GET /transactions/bills/current-month?page=1&limit=50
```

---

### 3. Get Subscription Transactions (Flexible Filtering)

**Endpoint:** `GET /transactions/subscriptions`

**Description:** Fetches all subscription transactions for the authenticated user with pagination and optional month filtering.

**Authentication:** Required (JWT Bearer Token)

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | number | No | 1 | Page number (1-indexed, minimum: 1) |
| `limit` | number | No | 20 | Number of items per page (minimum: 1, maximum: 100) |
| `year` | number | No | - | Year for filtering (minimum: 2000, maximum: 2100). If provided, `month` is required. |
| `month` | number | No | - | Month for filtering (1-12). If only `month` is provided, uses current year. If both `year` and `month` are omitted, returns all transactions. |

**Filtering Behavior:**

- **No `year` and no `month`**: Returns all subscription transactions (no date filtering)
- **`year` + `month`**: Filters by that specific month
- **Only `month`**: Uses current year with the specified month
- **Only `year`**: Returns 400 Bad Request (month is required when year is provided)

**Response:** `PaginatedTransactions`

```typescript
{
  data: Transaction[];           // Array of subscription transactions
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
  type: 'SUBSCRIPTION';
  categoryId: string | null;
  goalId: string | null;
  recurrence: Recurrence | null;  // Can be DAILY, WEEKLY, MONTHLY, YEARLY
  recurrenceEndDate: Date | null;
  parentTransactionId: string | null;
  isPaid: boolean | null;
  dueDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
```

**Status Codes:**

- `200 OK`: Successfully retrieved subscription transactions
- `400 Bad Request`: Invalid query parameters (e.g., year without month, invalid month range)
- `401 Unauthorized`: Missing or invalid authentication token

**Example Requests:**

```bash
# Get all subscription transactions (first page, 20 items)
GET /transactions/subscriptions?page=1&limit=20

# Get subscriptions for November 2024
GET /transactions/subscriptions?year=2024&month=11&page=1&limit=20

# Get subscriptions for November (current year)
GET /transactions/subscriptions?month=11&page=1&limit=20

# Get second page with 50 items per page
GET /transactions/subscriptions?page=2&limit=50
```

---

### 4. Get Current Month Subscription Transactions

**Endpoint:** `GET /transactions/subscriptions/current-month`

**Description:** Convenience endpoint that fetches subscription transactions for the current month with pagination.

**Authentication:** Required (JWT Bearer Token)

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | number | No | 1 | Page number (1-indexed) |
| `limit` | number | No | 20 | Number of items per page |

**Response:** `PaginatedTransactions` (same structure as above)

**Status Codes:**

- `200 OK`: Successfully retrieved current month subscription transactions
- `400 Bad Request`: Invalid page or limit values
- `401 Unauthorized`: Missing or invalid authentication token

**Example Requests:**

```bash
# Get current month's subscriptions (default pagination)
GET /transactions/subscriptions/current-month

# Get current month with custom pagination
GET /transactions/subscriptions/current-month?page=1&limit=50
```

---

## Complete CRUD Operations for Bills and Subscriptions

### Create Bills/Subscriptions

**Endpoints:**
- `POST /transactions/bill` - Create a bill transaction
- `POST /transactions/subscription` - Create a subscription transaction

See [Transaction Creation Implementation Guide](./TRANSACTION_CREATION_IMPLEMENTATION_GUIDE.md#3-bill-transactions) for details.

### Read Bills/Subscriptions

- `GET /transactions/bills` - Get all bills with filtering (this document)
- `GET /transactions/bills/current-month` - Get current month bills (this document)
- `GET /transactions/subscriptions` - Get all subscriptions with filtering (this document)
- `GET /transactions/subscriptions/current-month` - Get current month subscriptions (this document)

### Update Bills/Subscriptions

**Endpoint:** `PATCH /transactions/:id`

See [Transaction Update Implementation Guide](./TRANSACTION_UPDATE_IMPLEMENTATION_GUIDE.md) for details.

### Delete Bills/Subscriptions

**Endpoint:** `DELETE /transactions/:id`

See [Transaction Update Implementation Guide](./TRANSACTION_UPDATE_IMPLEMENTATION_GUIDE.md) for details.

---

## Implementation Details

### Service Methods

#### `getBills(userId: string, queryDto: GetBillsQueryDto): Promise<PaginatedTransactions>`

Main service method that handles flexible filtering for bills:

- Filters transactions by type: `BILL` only
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

**Location:** `src/transactions/transactions.service.ts`

#### `getCurrentMonthBills(userId: string, page: number, limit: number): Promise<PaginatedTransactions>`

Convenience method that automatically filters for the current month:

- Uses current year and month
- Applies same filtering and pagination logic
- Returns paginated results

**Location:** `src/transactions/transactions.service.ts`

#### `getSubscriptions(userId: string, queryDto: GetSubscriptionsQueryDto): Promise<PaginatedTransactions>`

Main service method that handles flexible filtering for subscriptions:

- Filters transactions by type: `SUBSCRIPTION` only
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

**Location:** `src/transactions/transactions.service.ts`

#### `getCurrentMonthSubscriptions(userId: string, page: number, limit: number): Promise<PaginatedTransactions>`

Convenience method that automatically filters for the current month:

- Uses current year and month
- Applies same filtering and pagination logic
- Returns paginated results

**Location:** `src/transactions/transactions.service.ts`

### Data Models

#### `GetBillsQueryDto`

Located in: `src/transactions/models/get-bills-query.dto.ts`

- Uses `class-validator` decorators for validation
- Uses `class-transformer` for automatic type conversion
- Includes Swagger/OpenAPI documentation

**Fields:**
- `page?: number` - Page number (default: 1, minimum: 1)
- `limit?: number` - Items per page (default: 20, minimum: 1, maximum: 100)
- `year?: number` - Year for filtering (minimum: 2000, maximum: 2100)
- `month?: number` - Month for filtering (1-12)

#### `GetSubscriptionsQueryDto`

Located in: `src/transactions/models/get-subscriptions-query.dto.ts`

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

**For Bills:**

```typescript
const whereClause = {
  userId,                                    // Filter by authenticated user
  type: TransactionType.BILL,               // Filter by bill type only
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

**For Subscriptions:**

```typescript
const whereClause = {
  userId,                                    // Filter by authenticated user
  type: TransactionType.SUBSCRIPTION,       // Filter by subscription type only
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
// Get all bill transactions
const billsResponse = await fetch('/transactions/bills?page=1&limit=20', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
const billsData: PaginatedTransactions = await billsResponse.json();

// Get November 2024 bills
const billsResponse = await fetch('/transactions/bills?year=2024&month=11&page=1&limit=20', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

// Get all subscription transactions
const subscriptionsResponse = await fetch('/transactions/subscriptions?page=1&limit=20', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
const subscriptionsData: PaginatedTransactions = await subscriptionsResponse.json();

// Get current month subscriptions
const currentMonthSubs = await fetch('/transactions/subscriptions/current-month?page=1&limit=20', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

### React Hook Example

```typescript
function useBills(filters?: { year?: number; month?: number; page?: number; limit?: number }) {
  const [data, setData] = useState<PaginatedTransactions | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const params = new URLSearchParams();
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.year) params.append('year', filters.year.toString());
    if (filters?.month) params.append('month', filters.month.toString());
    
    fetch(`/transactions/bills?${params}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, [filters]);
  
  return { data, loading };
}

function useSubscriptions(filters?: { year?: number; month?: number; page?: number; limit?: number }) {
  const [data, setData] = useState<PaginatedTransactions | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const params = new URLSearchParams();
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.year) params.append('year', filters.year.toString());
    if (filters?.month) params.append('month', filters.month.toString());
    
    fetch(`/transactions/subscriptions?${params}`, {
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
# Get all bill transactions
curl -X GET "http://localhost:3000/transactions/bills?page=1&limit=20" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Get bills for November 2024
curl -X GET "http://localhost:3000/transactions/bills?year=2024&month=11&page=1&limit=20" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Get current month bills
curl -X GET "http://localhost:3000/transactions/bills/current-month?page=1&limit=20" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Get all subscription transactions
curl -X GET "http://localhost:3000/transactions/subscriptions?page=1&limit=20" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Get subscriptions for November 2024
curl -X GET "http://localhost:3000/transactions/subscriptions?year=2024&month=11&page=1&limit=20" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Get current month subscriptions
curl -X GET "http://localhost:3000/transactions/subscriptions/current-month?page=1&limit=20" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Expected Response Format

**Bills Response:**

```json
{
  "data": [
    {
      "id": "clx123...",
      "userId": "clx456...",
      "label": "Electricity Bill",
      "date": "2024-11-15T10:00:00.000Z",
      "value": 150.00,
      "type": "BILL",
      "categoryId": null,
      "goalId": null,
      "recurrence": "MONTHLY",
      "recurrenceEndDate": null,
      "parentTransactionId": "clx789...",
      "isPaid": false,
      "dueDate": "2024-11-20T10:00:00.000Z",
      "createdAt": "2024-11-15T10:00:00.000Z",
      "updatedAt": "2024-11-15T10:00:00.000Z"
    }
  ],
  "page": 1,
  "limit": 20,
  "total": 5,
  "totalPages": 1,
  "hasNextPage": false,
  "hasPreviousPage": false
}
```

**Subscriptions Response:**

```json
{
  "data": [
    {
      "id": "clx124...",
      "userId": "clx456...",
      "label": "Netflix",
      "date": "2024-11-01T10:00:00.000Z",
      "value": 15.99,
      "type": "SUBSCRIPTION",
      "categoryId": null,
      "goalId": null,
      "recurrence": "MONTHLY",
      "recurrenceEndDate": null,
      "parentTransactionId": "clx790...",
      "isPaid": true,
      "dueDate": null,
      "createdAt": "2024-11-01T10:00:00.000Z",
      "updatedAt": "2024-11-01T10:00:00.000Z"
    }
  ],
  "page": 1,
  "limit": 20,
  "total": 8,
  "totalPages": 1,
  "hasNextPage": false,
  "hasPreviousPage": false
}
```

---

## Files Modified/Created

### New Files

1. `src/transactions/models/get-bills-query.dto.ts` - Query DTO with validation for bills
2. `src/transactions/models/get-subscriptions-query.dto.ts` - Query DTO with validation for subscriptions
3. `src/transactions/BILLS_SUBSCRIPTIONS_IMPLEMENTATION.md` - This documentation

### Modified Files

1. `src/transactions/transactions.service.ts`
   - Added `getBills()` method
   - Added `getCurrentMonthBills()` method
   - Added `getSubscriptions()` method
   - Added `getCurrentMonthSubscriptions()` method

2. `src/transactions/transactions.controller.ts`
   - Added `GET /transactions/bills` endpoint
   - Added `GET /transactions/bills/current-month` endpoint
   - Added `GET /transactions/subscriptions` endpoint
   - Added `GET /transactions/subscriptions/current-month` endpoint

3. `src/transactions/transactions.controller.spec.ts`
   - Added tests for bills and subscriptions GET endpoints

4. `src/transactions/transactions.service.spec.ts`
   - Added tests for bills and subscriptions service methods

---

## Code References

### Service Implementation

**getBills method:**

```typescript
async getBills(
  userId: string,
  queryDto: GetBillsQueryDto,
): Promise<PaginatedTransactions> {
  const page = queryDto.page ?? 1;
  const limit = queryDto.limit ?? 20;
  const skip = (page - 1) * limit;
  const now = new Date();
  let year = queryDto.year;
  let month = queryDto.month;
  if (year && !month) {
    throw new BadRequestException('Month is required when year is provided');
  }
  if (month && !year) {
    year = now.getFullYear();
  }
  const whereClause: any = {
    userId,
    type: TransactionType.BILL,
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

**getSubscriptions method:**

```typescript
async getSubscriptions(
  userId: string,
  queryDto: GetSubscriptionsQueryDto,
): Promise<PaginatedTransactions> {
  const page = queryDto.page ?? 1;
  const limit = queryDto.limit ?? 20;
  const skip = (page - 1) * limit;
  const now = new Date();
  let year = queryDto.year;
  let month = queryDto.month;
  if (year && !month) {
    throw new BadRequestException('Month is required when year is provided');
  }
  if (month && !year) {
    year = now.getFullYear();
  }
  const whereClause: any = {
    userId,
    type: TransactionType.SUBSCRIPTION,
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

**Bills endpoints:**

```typescript
@Get('bills')
@ApiOperation({
  summary: 'Get bill transactions',
  description:
    'Fetches all bill transactions for the user with pagination. Can filter by month/year or get all transactions. If only month is provided, uses current year. If neither year nor month is provided, returns all transactions.',
})
@ApiResponse({
  status: 200,
  description: 'Bill transactions successfully retrieved',
  type: PaginatedTransactions,
})
@ApiResponse({ status: 400, description: 'Bad request' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
async getBills(
  @Request() req: { user: { id: string; email: string } },
  @Query() queryDto: GetBillsQueryDto,
): Promise<PaginatedTransactions> {
  return this.transactionsService.getBills(req.user.id, queryDto);
}

@Get('bills/current-month')
@ApiOperation({
  summary: 'Get current month bill transactions',
  description:
    'Fetches bill transactions for the current month with pagination.',
})
@ApiResponse({
  status: 200,
  description: 'Current month bill transactions successfully retrieved',
  type: PaginatedTransactions,
})
@ApiResponse({ status: 401, description: 'Unauthorized' })
async getCurrentMonthBills(
  @Request() req: { user: { id: string; email: string } },
  @Query('page') page?: string,
  @Query('limit') limit?: string,
): Promise<PaginatedTransactions> {
  const pageNumber = page ? parseInt(page, 10) : 1;
  const limitNumber = limit ? parseInt(limit, 10) : 20;
  if (isNaN(pageNumber) || isNaN(limitNumber)) {
    throw new BadRequestException('Page and limit must be valid numbers');
  }
  return this.transactionsService.getCurrentMonthBills(
    req.user.id,
    pageNumber,
    limitNumber,
  );
}
```

**Subscriptions endpoints:**

```typescript
@Get('subscriptions')
@ApiOperation({
  summary: 'Get subscription transactions',
  description:
    'Fetches all subscription transactions for the user with pagination. Can filter by month/year or get all transactions. If only month is provided, uses current year. If neither year nor month is provided, returns all transactions.',
})
@ApiResponse({
  status: 200,
  description: 'Subscription transactions successfully retrieved',
  type: PaginatedTransactions,
})
@ApiResponse({ status: 400, description: 'Bad request' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
async getSubscriptions(
  @Request() req: { user: { id: string; email: string } },
  @Query() queryDto: GetSubscriptionsQueryDto,
): Promise<PaginatedTransactions> {
  return this.transactionsService.getSubscriptions(req.user.id, queryDto);
}

@Get('subscriptions/current-month')
@ApiOperation({
  summary: 'Get current month subscription transactions',
  description:
    'Fetches subscription transactions for the current month with pagination.',
})
@ApiResponse({
  status: 200,
  description: 'Current month subscription transactions successfully retrieved',
  type: PaginatedTransactions,
})
@ApiResponse({ status: 401, description: 'Unauthorized' })
async getCurrentMonthSubscriptions(
  @Request() req: { user: { id: string; email: string } },
  @Query('page') page?: string,
  @Query('limit') limit?: string,
): Promise<PaginatedTransactions> {
  const pageNumber = page ? parseInt(page, 10) : 1;
  const limitNumber = limit ? parseInt(limit, 10) : 20;
  if (isNaN(pageNumber) || isNaN(limitNumber)) {
    throw new BadRequestException('Page and limit must be valid numbers');
  }
  return this.transactionsService.getCurrentMonthSubscriptions(
    req.user.id,
    pageNumber,
    limitNumber,
  );
}
```

---

## Notes

- Transactions are ordered by date in descending order (most recent first)
- Only `BILL` or `SUBSCRIPTION` transaction types are returned respectively
- Date filtering is based on the transaction's `date` field
- All date comparisons are timezone-aware
- Pagination is 1-indexed (first page is page 1, not page 0)
- Maximum page size is 100 items per page to prevent performance issues
- Bills and subscriptions can have a `recurrence` field (DAILY, WEEKLY, MONTHLY, YEARLY) for recurring payments
- Bills and subscriptions support `isPaid` and `dueDate` fields for tracking payment status
- Bills and subscriptions are not associated with categories (unlike expenses and refunds)
- The recurring transactions scheduler automatically generates future instances for bills and subscriptions with recurrence patterns

---

## Related Documentation

- [Transaction Creation Implementation Guide](./TRANSACTION_CREATION_IMPLEMENTATION_GUIDE.md#3-bill-transactions) - Guide for creating bill and subscription transactions
- [Transaction Update Implementation Guide](./TRANSACTION_UPDATE_IMPLEMENTATION_GUIDE.md) - Guide for updating and deleting transactions
- [Recurring Transactions Implementation Guide](./RECURRING_TRANSACTIONS_IMPLEMENTATION_GUIDE.md) - Guide for recurring transaction functionality
- [Income API Implementation](./INCOME_IMPLEMENTATION.md) - Similar implementation guide for income transactions
- [Expenses and Refunds Query Implementation](./EXPENSES_REFUNDS_IMPLEMENTATION.md) - Similar implementation guide for expenses and refunds

---

## Use Cases

### 1. Displaying Monthly Bills Summary

```typescript
// Get all bills for a specific month
const billsData = await getBills(userId, {
  year: 2024,
  month: 11,
  page: 1,
  limit: 100
});

const totalBills = billsData.data.reduce((sum, transaction) => sum + transaction.value, 0);
const unpaidBills = billsData.data.filter(bill => !bill.isPaid);
console.log(`Total bills for November 2024: $${totalBills}`);
console.log(`Unpaid bills: ${unpaidBills.length}`);
```

### 2. Bills History with Pagination

```typescript
// Get bills history page by page
async function getBillsHistory(userId: string, page: number = 1) {
  const response = await getBills(userId, {
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

### 3. Current Month Bills Dashboard

```typescript
// Quick access to current month bills
const currentMonthBills = await getCurrentMonthBills(userId, 1, 50);
const monthlyTotal = currentMonthBills.data.reduce(
  (sum, transaction) => sum + transaction.value, 
  0
);
const unpaidCount = currentMonthBills.data.filter(bill => !bill.isPaid).length;
```

### 4. Subscription Management

```typescript
// Get all active subscriptions
const subscriptionsData = await getSubscriptions(userId, {
  page: 1,
  limit: 100
});

const activeSubscriptions = subscriptionsData.data.filter(
  sub => sub.recurrence !== null
);
const monthlySubscriptionCost = activeSubscriptions.reduce(
  (sum, sub) => sum + sub.value, 
  0
);
console.log(`Monthly subscription cost: $${monthlySubscriptionCost}`);
```

### 5. Upcoming Bills and Subscriptions

```typescript
// Get current month bills and subscriptions to see what's due
const currentMonthBills = await getCurrentMonthBills(userId, 1, 100);
const currentMonthSubs = await getCurrentMonthSubscriptions(userId, 1, 100);

const upcomingBills = currentMonthBills.data.filter(
  bill => !bill.isPaid && bill.dueDate && new Date(bill.dueDate) > new Date()
);
const upcomingSubs = currentMonthSubs.data.filter(
  sub => !sub.isPaid && sub.dueDate && new Date(sub.dueDate) > new Date()
);

console.log(`Upcoming bills: ${upcomingBills.length}`);
console.log(`Upcoming subscriptions: ${upcomingSubs.length}`);
```

---

## Differences from Income Implementation

While bills and subscriptions follow the same pattern as income, there are some key differences:

1. **Payment Tracking**: Bills and subscriptions have `isPaid` and `dueDate` fields that income does not have
2. **Recurring Nature**: Bills and subscriptions are more commonly recurring, though income can also be recurring
3. **Use Case**: Bills and subscriptions represent money going out, while income represents money coming in
4. **Monthly Balance Calculation**: Bills and subscriptions are subtracted from the balance, while income is added

---

## Future Enhancements

Potential improvements for bills and subscriptions:

1. **Filter by Payment Status**: Add ability to filter by `isPaid` status
2. **Filter by Due Date**: Add ability to filter bills/subscriptions by due date range
3. **Overdue Alerts**: Add endpoint to get overdue bills/subscriptions
4. **Upcoming Payments**: Add endpoint to get bills/subscriptions due in the next N days
5. **Category Support**: Consider adding category support for better organization
6. **Payment Reminders**: Integration with notification system for due dates

