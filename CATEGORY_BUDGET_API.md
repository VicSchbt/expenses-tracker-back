# Category Budget API Documentation

This document provides frontend developers with information about the budget feature for categories.

## Base URL

All endpoints are prefixed with `/categories` and require JWT authentication.

**Authentication**: All endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

---

## TypeScript Types

```typescript
// Category type (response)
interface Category {
  id: string;
  userId: string;
  label: string;
  icon?: string | null;
  color?: string | null;
  budget?: number | null; // Budget amount in your currency unit
}

// Create category request
interface CreateCategoryDto {
  label: string; // Required
  icon?: string; // Optional
  color?: string; // Optional
  budget?: number; // Optional - Budget amount
}

// Update category request
interface UpdateCategoryDto {
  label?: string; // Optional
  icon?: string; // Optional
  color?: string; // Optional
  budget?: number | null; // Optional - Set to null to clear budget
}
```

---

## Endpoints

### 1. GET Budget (Get Category with Budget)

**Endpoint**: `GET /categories/:id`

**Description**: Retrieves a single category including its budget value.

**Response**:

```json
{
  "id": "cat123",
  "userId": "user123",
  "label": "Groceries",
  "icon": "shopping-cart",
  "color": "#FF5733",
  "budget": 500.0
}
```

**Example**:

```typescript
// Fetch category with budget
const response = await fetch('/categories/cat123', {
  method: 'GET',
  headers: {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
});
const category: Category = await response.json();
console.log(category.budget); // 500.0 or null if not set
```

---

### 2. GET All Categories with Budgets

**Endpoint**: `GET /categories`

**Description**: Retrieves all categories for the authenticated user, including budget values.

**Response**:

```json
[
  {
    "id": "cat123",
    "userId": "user123",
    "label": "Groceries",
    "icon": "shopping-cart",
    "color": "#FF5733",
    "budget": 500.0
  },
  {
    "id": "cat456",
    "userId": "user123",
    "label": "Entertainment",
    "icon": "movie",
    "color": "#33FF57",
    "budget": null
  }
]
```

**Example**:

```typescript
const response = await fetch('/categories', {
  method: 'GET',
  headers: {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
});
const categories: Category[] = await response.json();

// Filter categories with budgets
const categoriesWithBudget = categories.filter((cat) => cat.budget !== null);
```

---

### 3. SET Budget (Create Category with Budget)

**Endpoint**: `POST /categories`

**Description**: Creates a new category with an optional budget value.

**Request Body**:

```json
{
  "label": "Groceries",
  "icon": "shopping-cart",
  "color": "#FF5733",
  "budget": 500.0
}
```

**Response**: Returns the created category with budget included.

**Example**:

```typescript
// Create category with budget
const createCategory = async (label: string, budget?: number) => {
  const response = await fetch('/categories', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      label,
      budget, // Optional: include if you want to set a budget
    }),
  });
  return (await response.json()) as Category;
};

// Usage
const category = await createCategory('Groceries', 500.0);
// or without budget
const categoryWithoutBudget = await createCategory('Entertainment');
```

---

### 4. UPDATE Budget (Update Category Budget)

**Endpoint**: `PATCH /categories/:id`

**Description**: Updates a category's budget. You can:

- Update to a new value
- Clear the budget by setting it to `null`
- Leave budget unchanged by omitting the field

**Request Body Examples**:

**Update budget to a new value**:

```json
{
  "budget": 750.0
}
```

**Clear/remove budget** (set to null):

```json
{
  "budget": null
}
```

**Update budget along with other fields**:

```json
{
  "label": "Groceries & Food",
  "budget": 800.0
}
```

**Example**:

```typescript
// Update budget to a new value
const updateBudget = async (categoryId: string, newBudget: number) => {
  const response = await fetch(`/categories/${categoryId}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      budget: newBudget,
    }),
  });
  return (await response.json()) as Category;
};

// Clear/remove budget
const clearBudget = async (categoryId: string) => {
  const response = await fetch(`/categories/${categoryId}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      budget: null, // Explicitly set to null to clear
    }),
  });
  return (await response.json()) as Category;
};

// Update budget along with other fields
const updateCategoryWithBudget = async (
  categoryId: string,
  updates: { label?: string; budget?: number | null },
) => {
  const response = await fetch(`/categories/${categoryId}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updates),
  });
  return (await response.json()) as Category;
};
```

---

## Important Notes

### Budget Field Behavior

1. **Budget is Optional**:
   - When creating a category, you can omit the `budget` field entirely
   - The budget will default to `null` if not provided

2. **Budget Value Type**:
   - Budget is a `number` (decimal value, e.g., `500.0`, `99.99`)
   - Can be `null` if no budget is set
   - Can be `0` (zero is a valid budget amount)

3. **Updating Budget**:
   - To **update** budget: Send `{ "budget": <number> }`
   - To **clear** budget: Send `{ "budget": null }`
   - To **leave unchanged**: Don't include `budget` field in the update request

4. **Validation**:
   - Budget must be a valid number when provided (not null)
   - Validation is automatically handled by the API

### Error Handling

**Status Codes**:

- `200` - Success (GET, PATCH)
- `201` - Created (POST)
- `400` - Bad Request (invalid data format)
- `401` - Unauthorized (missing or invalid token)
- `404` - Category not found
- `403` - Forbidden (trying to access another user's category)

**Example Error Response**:

```json
{
  "statusCode": 400,
  "message": ["budget must be a number"],
  "error": "Bad Request"
}
```

---

## Complete Example: Budget Management Component

```typescript
interface Category {
  id: string;
  userId: string;
  label: string;
  icon?: string | null;
  color?: string | null;
  budget?: number | null;
}

class CategoryService {
  private baseUrl = '/categories';
  private token: string;

  constructor(token: string) {
    this.token = token;
  }

  private getHeaders() {
    return {
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    };
  }

  // Get all categories with budgets
  async getAllCategories(): Promise<Category[]> {
    const response = await fetch(this.baseUrl, {
      headers: this.getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch categories');
    return response.json();
  }

  // Get single category
  async getCategory(id: string): Promise<Category> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      headers: this.getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch category');
    return response.json();
  }

  // Create category with optional budget
  async createCategory(data: {
    label: string;
    icon?: string;
    color?: string;
    budget?: number;
  }): Promise<Category> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create category');
    return response.json();
  }

  // Update budget
  async updateBudget(
    categoryId: string,
    budget: number | null,
  ): Promise<Category> {
    const response = await fetch(`${this.baseUrl}/${categoryId}`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify({ budget }),
    });
    if (!response.ok) throw new Error('Failed to update budget');
    return response.json();
  }

  // Clear budget (set to null)
  async clearBudget(categoryId: string): Promise<Category> {
    return this.updateBudget(categoryId, null);
  }
}

// Usage example
const categoryService = new CategoryService(userToken);

// Create category with budget
const newCategory = await categoryService.createCategory({
  label: 'Groceries',
  budget: 500.0,
});

// Update budget
const updated = await categoryService.updateBudget(newCategory.id, 750.0);

// Clear budget
const cleared = await categoryService.clearBudget(newCategory.id);
```

---

## Summary

| Operation           | Method | Endpoint          | Budget Field                 |
| ------------------- | ------ | ----------------- | ---------------------------- |
| **GET** budget      | GET    | `/categories/:id` | Included in response         |
| **GET** all budgets | GET    | `/categories`     | Included in each category    |
| **SET** budget      | POST   | `/categories`     | `budget?: number` (optional) |
| **UPDATE** budget   | PATCH  | `/categories/:id` | `budget?: number \| null`    |
| **CLEAR** budget    | PATCH  | `/categories/:id` | `budget: null`               |

All endpoints require JWT authentication via Bearer token in the Authorization header.
