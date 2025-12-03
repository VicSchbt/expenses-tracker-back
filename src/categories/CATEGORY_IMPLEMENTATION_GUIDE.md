# Category Implementation Guide

## Overview

This guide provides comprehensive instructions for managing categories in the Expense Tracker backend. Categories are user-specific entities that can be used to organize and categorize transactions (primarily expenses and refunds).

## Category Model

Categories have the following structure:

```typescript
{
  id: string;          // Unique category identifier (auto-generated)
  userId: string;      // Owner user ID (automatically set from JWT)
  label: string;       // Category name (required)
  icon?: string | null; // Optional icon identifier
  color?: string | null; // Optional color code (e.g., "#FF5733")
}
```

### Database Schema

From Prisma schema (`prisma/schema.prisma`):

```typescript
model Category {
  id     String  @id @default(cuid())
  user   User    @relation(fields: [userId], references: [id])
  userId String
  label  String
  color  String?
  icon   String?

  transactions Transaction[]
}
```

### Key Characteristics

- **User-Scoped**: Each category belongs to a specific user
- **Unique Label per User**: Each user can only have one category with a given label (enforced by unique constraint)
- **Optional Metadata**: Icon and color are optional fields for UI customization
- **Transaction Association**: Categories can be linked to transactions (expenses and refunds)
- **Cascade Delete**: If a user is deleted, all their categories are deleted
- **Soft References**: If a category is deleted, associated transactions have their `categoryId` set to null (not deleted)

---

## 1. Create Category

### Description
Creates a new category for the authenticated user. The category label must be unique for that user.

### DTO: `CreateCategoryDto`

**Location:** `src/categories/models/create-category.dto.ts`

**Fields:**
- `label` (string, required): Category name/description
- `icon` (string, optional): Icon identifier (e.g., "shopping-cart", "food", "transport")
- `color` (string, optional): Color code in hex format (e.g., "#FF5733")

### Validation Rules
- `label`: Must be a non-empty string
- `icon`: If provided, must be a valid string
- `color`: If provided, must be a valid string (typically hex color code)

### Endpoint

```http
POST /categories
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

### Request Example

```json
{
  "label": "Groceries",
  "icon": "shopping-cart",
  "color": "#FF5733"
}
```

**Minimal Request (only required fields):**

```json
{
  "label": "Groceries"
}
```

### Service Method

**Method:** `create(userId: string, createCategoryDto: CreateCategoryDto): Promise<Category>`

**Location:** `src/categories/categories.service.ts` (lines 15-28)

**Implementation Details:**
1. Automatically sets `userId` from authenticated user
2. Creates category with provided fields
3. Returns the created category

**Note:** Prisma will enforce the unique constraint on `(userId, label)`. If a duplicate label is attempted for the same user, Prisma will throw a unique constraint violation error.

### Response Example

```json
{
  "id": "clx123...",
  "userId": "clx456...",
  "label": "Groceries",
  "icon": "shopping-cart",
  "color": "#FF5733"
}
```

### Implementation Code Reference

```15:28:src/categories/categories.service.ts
  async create(
    userId: string,
    createCategoryDto: CreateCategoryDto,
  ): Promise<Category> {
    const category = await this.prisma.category.create({
      data: {
        userId,
        label: createCategoryDto.label,
        icon: createCategoryDto.icon,
        color: createCategoryDto.color,
      },
    });
    return this.mapToCategoryType(category);
  }
```

### Controller Endpoint

```32:46:src/categories/categories.controller.ts
  @Post()
  @ApiOperation({ summary: 'Create a new category' })
  @ApiResponse({
    status: 201,
    description: 'Category successfully created',
    type: Category,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async create(
    @Request() req: { user: { id: string; email: string } },
    @Body() createCategoryDto: CreateCategoryDto,
  ): Promise<Category> {
    return this.categoriesService.create(req.user.id, createCategoryDto);
  }
```

### Error Handling

- **400 Bad Request**: Invalid request data (validation errors, duplicate label)
- **401 Unauthorized**: Missing or invalid JWT token

---

## 2. Get All Categories

### Description
Retrieves all categories belonging to the authenticated user.

### Endpoint

```http
GET /categories
Authorization: Bearer <JWT_TOKEN>
```

### Service Method

**Method:** `findAll(userId: string): Promise<Category[]>`

**Location:** `src/categories/categories.service.ts` (lines 30-35)

**Implementation Details:**
1. Filters categories by `userId`
2. Returns array of categories for the authenticated user
3. Categories are returned in database order (no specific ordering)

### Response Example

```json
[
  {
    "id": "clx123...",
    "userId": "clx456...",
    "label": "Groceries",
    "icon": "shopping-cart",
    "color": "#FF5733"
  },
  {
    "id": "clx789...",
    "userId": "clx456...",
    "label": "Transportation",
    "icon": "car",
    "color": "#3498DB"
  }
]
```

### Implementation Code Reference

```30:35:src/categories/categories.service.ts
  async findAll(userId: string): Promise<Category[]> {
    const categories = await this.prisma.category.findMany({
      where: { userId },
    });
    return categories.map((category) => this.mapToCategoryType(category));
  }
```

### Controller Endpoint

```48:60:src/categories/categories.controller.ts
  @Get()
  @ApiOperation({ summary: 'Get all categories for the authenticated user' })
  @ApiResponse({
    status: 200,
    description: 'List of categories',
    type: [Category],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAll(
    @Request() req: { user: { id: string; email: string } },
  ): Promise<Category[]> {
    return this.categoriesService.findAll(req.user.id);
  }
```

### Error Handling

- **401 Unauthorized**: Missing or invalid JWT token

---

## 3. Get Category by ID

### Description
Retrieves a specific category by its ID. The category must belong to the authenticated user.

### Endpoint

```http
GET /categories/:id
Authorization: Bearer <JWT_TOKEN>
```

### Path Parameters
- `id` (string, required): Category ID

### Service Method

**Method:** `findOne(userId: string, id: string): Promise<Category>`

**Location:** `src/categories/categories.service.ts` (lines 37-48)

**Implementation Details:**
1. Finds category by ID
2. Validates that category exists
3. Validates that category belongs to the authenticated user
4. Returns the category

### Response Example

```json
{
  "id": "clx123...",
  "userId": "clx456...",
  "label": "Groceries",
  "icon": "shopping-cart",
  "color": "#FF5733"
}
```

### Implementation Code Reference

```37:48:src/categories/categories.service.ts
  async findOne(userId: string, id: string): Promise<Category> {
    const category = await this.prisma.category.findUnique({
      where: { id },
    });
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    if (category.userId !== userId) {
      throw new ForbiddenException('You do not have access to this category');
    }
    return this.mapToCategoryType(category);
  }
```

### Controller Endpoint

```62:77:src/categories/categories.controller.ts
  @Get(':id')
  @ApiOperation({ summary: 'Get a category by ID' })
  @ApiParam({ name: 'id', description: 'Category ID' })
  @ApiResponse({
    status: 200,
    description: 'Category found',
    type: Category,
  })
  @ApiResponse({ status: 404, description: 'Category not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findOne(
    @Request() req: { user: { id: string; email: string } },
    @Param('id') id: string,
  ): Promise<Category> {
    return this.categoriesService.findOne(req.user.id, id);
  }
```

### Error Handling

- **401 Unauthorized**: Missing or invalid JWT token
- **403 Forbidden**: Category exists but doesn't belong to the authenticated user
- **404 Not Found**: Category doesn't exist

---

## 4. Update Category

### Description
Updates an existing category. All fields are optional - only provided fields will be updated.

### DTO: `UpdateCategoryDto`

**Location:** `src/categories/models/update-category.dto.ts`

**Fields:**
- `label` (string, optional): Category name/description
- `icon` (string, optional): Icon identifier
- `color` (string, optional): Color code in hex format

### Validation Rules
- All fields are optional
- If provided, `label` must be a non-empty string
- If provided, `icon` must be a valid string
- If provided, `color` must be a valid string

### Endpoint

```http
PATCH /categories/:id
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

### Path Parameters
- `id` (string, required): Category ID

### Request Example

**Update all fields:**

```json
{
  "label": "Food & Groceries",
  "icon": "food",
  "color": "#E74C3C"
}
```

**Update only label:**

```json
{
  "label": "Food & Groceries"
}
```

**Update only color:**

```json
{
  "color": "#E74C3C"
}
```

### Service Method

**Method:** `update(userId: string, id: string, updateCategoryDto: UpdateCategoryDto): Promise<Category>`

**Location:** `src/categories/categories.service.ts` (lines 50-73)

**Implementation Details:**
1. Validates that category exists
2. Validates that category belongs to the authenticated user
3. Updates only the fields provided in the DTO
4. Returns the updated category

**Note:** If updating the `label` to an existing label for the same user, Prisma will throw a unique constraint violation error.

### Response Example

```json
{
  "id": "clx123...",
  "userId": "clx456...",
  "label": "Food & Groceries",
  "icon": "food",
  "color": "#E74C3C"
}
```

### Implementation Code Reference

```50:73:src/categories/categories.service.ts
  async update(
    userId: string,
    id: string,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<Category> {
    const existingCategory = await this.prisma.category.findUnique({
      where: { id },
    });
    if (!existingCategory) {
      throw new NotFoundException('Category not found');
    }
    if (existingCategory.userId !== userId) {
      throw new ForbiddenException('You do not have access to this category');
    }
    const category = await this.prisma.category.update({
      where: { id },
      data: {
        label: updateCategoryDto.label,
        icon: updateCategoryDto.icon,
        color: updateCategoryDto.color,
      },
    });
    return this.mapToCategoryType(category);
  }
```

### Controller Endpoint

```79:95:src/categories/categories.controller.ts
  @Patch(':id')
  @ApiOperation({ summary: 'Update a category' })
  @ApiParam({ name: 'id', description: 'Category ID' })
  @ApiResponse({
    status: 200,
    description: 'Category successfully updated',
    type: Category,
  })
  @ApiResponse({ status: 404, description: 'Category not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async update(
    @Request() req: { user: { id: string; email: string } },
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ): Promise<Category> {
    return this.categoriesService.update(req.user.id, id, updateCategoryDto);
  }
```

### Error Handling

- **400 Bad Request**: Invalid request data (validation errors, duplicate label)
- **401 Unauthorized**: Missing or invalid JWT token
- **403 Forbidden**: Category exists but doesn't belong to the authenticated user
- **404 Not Found**: Category doesn't exist

---

## 5. Delete Category

### Description
Deletes a category. The category must belong to the authenticated user. Associated transactions will have their `categoryId` set to `null` (not deleted).

### Endpoint

```http
DELETE /categories/:id
Authorization: Bearer <JWT_TOKEN>
```

### Path Parameters
- `id` (string, required): Category ID

### Service Method

**Method:** `remove(userId: string, id: string): Promise<void>`

**Location:** `src/categories/categories.service.ts` (lines 75-88)

**Implementation Details:**
1. Validates that category exists
2. Validates that category belongs to the authenticated user
3. Deletes the category
4. Associated transactions are automatically updated (their `categoryId` is set to `null` due to `ON DELETE SET NULL` foreign key constraint)

### Response Example

```json
{
  "message": "Category deleted successfully"
}
```

### Implementation Code Reference

```75:88:src/categories/categories.service.ts
  async remove(userId: string, id: string): Promise<void> {
    const existingCategory = await this.prisma.category.findUnique({
      where: { id },
    });
    if (!existingCategory) {
      throw new NotFoundException('Category not found');
    }
    if (existingCategory.userId !== userId) {
      throw new ForbiddenException('You do not have access to this category');
    }
    await this.prisma.category.delete({
      where: { id },
    });
  }
```

### Controller Endpoint

```97:112:src/categories/categories.controller.ts
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a category' })
  @ApiParam({ name: 'id', description: 'Category ID' })
  @ApiResponse({
    status: 200,
    description: 'Category successfully deleted',
  })
  @ApiResponse({ status: 404, description: 'Category not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async remove(
    @Request() req: { user: { id: string; email: string } },
    @Param('id') id: string,
  ): Promise<{ message: string }> {
    await this.categoriesService.remove(req.user.id, id);
    return { message: 'Category deleted successfully' };
  }
```

### Error Handling

- **401 Unauthorized**: Missing or invalid JWT token
- **403 Forbidden**: Category exists but doesn't belong to the authenticated user
- **404 Not Found**: Category doesn't exist

### Cascading Behavior

When a category is deleted:
- **Transactions**: All transactions that reference this category will have their `categoryId` field set to `null`
- **Transactions are NOT deleted**: The transactions themselves remain intact
- This behavior is defined by the foreign key constraint: `ON DELETE SET NULL`

---

## Helper Methods

### Category Mapping

**Method:** `mapToCategoryType(category): Category`

**Location:** `src/categories/categories.service.ts` (lines 90-104)

Converts a Prisma category object to the `Category` type, ensuring consistent type structure.

```90:104:src/categories/categories.service.ts
  private mapToCategoryType(category: {
    id: string;
    userId: string;
    label: string;
    icon: string | null;
    color: string | null;
  }): Category {
    return {
      id: category.id,
      userId: category.userId,
      label: category.label,
      icon: category.icon,
      color: category.color,
    };
  }
```

---

## Authentication & Authorization

All category endpoints require:

1. **JWT Authentication**: Bearer token in the Authorization header
2. **User Context**: User ID is automatically extracted from the JWT token
3. **Ownership Validation**: 
   - Users can only access their own categories
   - All CRUD operations validate category ownership

### Controller Guard

All endpoints are protected with `JwtAuthGuard`:

```27:28:src/categories/categories.controller.ts
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
```

---

## Error Handling

### Common HTTP Status Codes

- **200 OK**: Successful GET, PATCH, or DELETE operation
- **201 Created**: Category successfully created
- **400 Bad Request**: Invalid request data (validation errors, duplicate label)
- **401 Unauthorized**: Missing or invalid JWT token
- **403 Forbidden**: User doesn't have access to the category (category belongs to another user)
- **404 Not Found**: Category doesn't exist

### Error Response Format

```json
{
  "statusCode": 404,
  "message": "Category not found",
  "error": "Not Found"
}
```

---

## Testing Examples

### cURL Examples

#### Create Category

```bash
curl -X POST "http://localhost:3000/categories" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "label": "Groceries",
    "icon": "shopping-cart",
    "color": "#FF5733"
  }'
```

#### Get All Categories

```bash
curl -X GET "http://localhost:3000/categories" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Get Category by ID

```bash
curl -X GET "http://localhost:3000/categories/clx123..." \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Update Category

```bash
curl -X PATCH "http://localhost:3000/categories/clx123..." \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "label": "Food & Groceries",
    "color": "#E74C3C"
  }'
```

#### Delete Category

```bash
curl -X DELETE "http://localhost:3000/categories/clx123..." \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## Best Practices

### 1. Category Naming
- Use clear, descriptive labels (e.g., "Groceries" instead of "Groc")
- Keep labels consistent across your application
- Consider using a consistent naming convention (e.g., singular vs plural)

### 2. Icons
- Use standard icon identifiers that match your frontend icon library
- Common examples: "shopping-cart", "food", "transport", "utilities", "entertainment"
- Keep icon names consistent and semantic

### 3. Colors
- Use hex color codes (e.g., "#FF5733")
- Ensure sufficient contrast for accessibility
- Consider using a consistent color palette
- Validate color format on the frontend if needed

### 4. Category Organization
- Create categories that align with your transaction types
- Categories are primarily used for EXPENSE and REFUND transactions
- Consider creating default categories for new users

### 5. Unique Labels
- Remember that each user can only have one category with a given label
- Check for existing categories before creating to provide better UX
- Handle duplicate label errors gracefully

### 6. Deletion Considerations
- When deleting a category, associated transactions won't be deleted
- The `categoryId` in transactions will be set to `null`
- Consider updating or re-categorizing transactions before deleting a category

### 7. Update Strategy
- Use PATCH for partial updates (only send fields that need to change)
- Validate that label updates don't conflict with existing categories
- Consider bulk update operations if needed

### 8. Data Validation
- Always validate category ownership before operations
- Handle edge cases (deleted users, orphaned categories, etc.)
- Consider adding soft deletes if you need to preserve category history

---

## Database Constraints

### Unique Constraint
- **Constraint**: `Category_userId_name_key` (unique on `userId` and `label`)
- **Behavior**: Prevents duplicate category labels for the same user
- **Error**: Prisma will throw a unique constraint violation if violated

### Foreign Key Constraints

**Category → User:**
- **Constraint**: `Category_userId_fkey`
- **Behavior**: `ON DELETE CASCADE` - If a user is deleted, all their categories are deleted
- **Behavior**: `ON UPDATE CASCADE` - If user ID changes, category user IDs are updated

**Transaction → Category:**
- **Constraint**: `Transaction_categoryId_fkey`
- **Behavior**: `ON DELETE SET NULL` - If a category is deleted, transaction categoryId is set to null
- **Behavior**: `ON UPDATE CASCADE` - If category ID changes, transaction categoryIds are updated

### Indexes

- `Category_userId_idx`: Index on `userId` for efficient user-based queries
- `Category_userId_name_key`: Unique index on `(userId, label)` for label uniqueness

---

## Use Cases

### 1. Creating Default Categories

When a new user registers, you might want to create default categories:

```typescript
const defaultCategories = [
  { label: 'Groceries', icon: 'shopping-cart', color: '#FF5733' },
  { label: 'Transportation', icon: 'car', color: '#3498DB' },
  { label: 'Entertainment', icon: 'movie', color: '#9B59B6' },
  { label: 'Bills', icon: 'receipt', color: '#E74C3C' },
  { label: 'Dining Out', icon: 'restaurant', color: '#F39C12' },
];

for (const category of defaultCategories) {
  await categoriesService.create(userId, category);
}
```

### 2. Category Usage in Transactions

Categories are used when creating expenses and refunds:

```typescript
// Create expense with category
const expense = await transactionsService.createExpense(userId, {
  label: 'Weekly Groceries',
  date: '2024-01-15',
  value: 125.50,
  categoryId: categoryId, // Reference to a category
});
```

### 3. Filtering Transactions by Category

You can query transactions and filter by category:

```typescript
const expenses = await prisma.transaction.findMany({
  where: {
    userId,
    type: 'EXPENSE',
    categoryId: categoryId,
  },
});
```

---

## File Structure

```
src/categories/
├── categories.controller.ts          # HTTP endpoints
├── categories.service.ts             # Business logic
├── categories.module.ts              # Module definition
├── models/
│   ├── create-category.dto.ts       # Create DTO
│   ├── update-category.dto.ts       # Update DTO
│   └── category.type.ts             # Category response type
├── categories.controller.spec.ts     # Controller tests
├── categories.service.spec.ts        # Service tests
└── CATEGORY_IMPLEMENTATION_GUIDE.md  # This file
```

---

## Related Documentation

- [Transaction Creation Implementation Guide](../transactions/TRANSACTION_CREATION_IMPLEMENTATION_GUIDE.md) - Guide for creating transactions (which use categories)
- [Expenses and Refunds Query Implementation](../transactions/EXPENSES_REFUNDS_IMPLEMENTATION.md) - Guide for querying transactions by category

---

## Notes

- Categories are user-specific - each user has their own set of categories
- Category labels must be unique per user (enforced by database constraint)
- Deleting a category does not delete associated transactions - only sets their categoryId to null
- Categories are optional when creating transactions (except for refunds, which require a category)
- The `icon` and `color` fields are purely for UI customization and have no business logic constraints







