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
6. Update a category → `PATCH /categories/:id`
7. Delete a category → `DELETE /categories/:id`

