# Insomnia Collection

This folder contains the Insomnia collection for the Expense Tracker API.

## Import Instructions

1. Open Insomnia
2. Click on **Create** → **Import** → **From File**
3. Select `Expense Tracker API.json`
4. The collection will be imported with all requests organized in folders

## Environment Variables

The collection includes a **Local** environment with the following variables:

- `baseUrl`: `http://localhost:3000` (default)
- `accessToken`: Empty by default (set after login)

### Setting the Access Token

1. Run the **Login** request from the **Auth** folder
2. Copy the `accessToken` from the response
3. Go to **Environments** → **Local**
4. Update the `accessToken` variable with the token from the login response

Alternatively, you can use Insomnia's response extraction feature to automatically set the token.

## Collection Structure

### Auth Folder
- **Register**: Create a new user account
- **Login**: Authenticate and get an access token

### Categories Folder
- **Create Category**: Create a new category
- **Get All Categories**: List all categories for the authenticated user
- **Get Category by ID**: Get a specific category by ID
- **Update Category**: Update an existing category (partial updates supported)
- **Delete Category**: Delete a category by ID
- **Test Endpoint**: Smoke test to verify the module is working

### Transactions Folder
- **Create Income**: Create a new income transaction (with optional recurrence)
- **Create Bill**: Create a new bill transaction (with optional recurrence)
- **Create Subscription**: Create a new subscription transaction (with optional recurrence)
- **Create Saving**: Create a new saving transaction (requires savings goal ID, automatically updates goal)
- **Create Expense**: Create a new expense transaction (with optional category)
- **Create Refund**: Create a refund transaction to balance future budgets (requires category ID)
- **Test Endpoint**: Smoke test to verify the module is working

## Usage Tips

1. **Path Parameters**: For requests that require an ID (Get/Update/Delete Category), update the `id` parameter in the URL parameters section
2. **Partial Updates**: The Update Category endpoint supports partial updates - you only need to include the fields you want to change in the request body
3. **Authentication**: All category endpoints use Bearer token authentication. Make sure to set the `accessToken` in the environment after logging in

## Example Workflow

1. Register a new user → `POST /auth/register`
2. Login → `POST /auth/login` (copy the access token)
3. Set the `accessToken` in the Local environment
4. Create a category → `POST /categories`
5. Get all categories → `GET /categories`
6. Create an income transaction → `POST /transactions/income`
7. Create an expense transaction → `POST /transactions/expense` (with category ID)
8. Create a refund transaction → `POST /transactions/refund` (to balance the category)
9. Create a bill transaction → `POST /transactions/bill` (with recurrence)
10. Create a subscription transaction → `POST /transactions/subscription` (with recurrence)

## Transaction Types

### Income
- Used for money coming in (salary, bonuses, etc.)
- Optional recurrence (DAILY, WEEKLY, MONTHLY, YEARLY)
- Required: `label`, `date`, `value`

### Bill
- Used for recurring bills (utilities, rent, etc.)
- Optional recurrence (DAILY, WEEKLY, MONTHLY, YEARLY)
- Required: `label`, `date`, `value`

### Subscription
- Used for subscription services (Netflix, Spotify, etc.)
- Optional recurrence (typically MONTHLY)
- Required: `label`, `date`, `value`

### Saving
- Used to add money to a savings goal
- Automatically updates the savings goal's `currentAmount`
- Required: `goalId`, `value`, `date`

### Expense
- Used for general expenses
- Optional category association
- Required: `label`, `date`, `value`

### Refund
- Used to return money to a category (e.g., after returning a purchased item)
- Required category ID to balance future budgets
- Required: `label`, `date`, `value`, `categoryId`

