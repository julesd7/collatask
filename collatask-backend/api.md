markdown
# API Documentation

## Authentication

### POST `/api/auth/register`
Creates a new user.

- **Request Body:**
    ```json
    {
        "username": "string",
        "email": "string",
        "password": "string"
    }
    ```

- **Response:**
    - `201 Created`: User created successfully.
        ```json
        {
            "message": "User registered successfully.",
            "user_id": id
        }
        ```
    - `400 Bad Request`: Missing information.
        ```json
        {
            "error": "All fields are required."
        }
        ```
    - `409 Conflict`: User already exists.
        ```json
        {
            "error": "Username or email already exists."
        }
        ```
    - `500 Internal Server Error`: Server error.
        ```json
        {
            "error": "Internal server error."
        }
        ```

### POST `/api/auth/login`
Authenticates a user.

- **Request Body:**
  ```json
  {
    "identifier": "string",
    "password": "string",
    "rememberMe": boolean
  }
  ```

- **Response:**
  - `200 OK`: Authentication successful.
    ```json
    {
        "token": "jwt_token_here"
    }
    ```
    - `400 Bad Request`: Missing information.
        ```json
        {
            "error": "All fields are required."
        }
        ```
  - `401 Unauthorized`: Incorrect credentials.
    ```json
    {
        "error": "Invalid credentials."
    }
    ```
  - `500 Internal Server Error`: Server error.
    ```json
    {
        "error": "Internal server error."
    }
    ```

## User Management

### GET `/api/user/me`
Retrieves the authenticated user's information.

- **Headers:**
    - `Authorization`: Bearer _token_.

- **Response:**
    - `200 OK`: User information retrieved successfully.
        ```json
        {
                "user_id": id,
                "username": "string",
                "email": "string",
                "created_at": "timestamp"
        }
        ```
    - `401 Unauthorized`: Missing token.
        ```json
        {
                "error": "Unauthorized access."
        }
        ```
    - `403 Forbidden`: Invalid token.
        ```json
        {
                "error": "Forbidden access."
        }
        ```
    - `500 Internal Server Error`: Server error.
        ```json
        {
                "error": "Internal server error."
        }
        ```

### PUT `/api/user/update`
Updates the authenticated user's information.

- **Headers:**
    - `Authorization`: Bearer _token_.

- **Request Body:**
    ```json
    {
        "username": "string", // Optional
        "email": "string", // Optional
        "password": "string" // Optional
    }
    ```
- **Response:**
    - `200 OK`: User information updated successfully.
        ```json
        {
            "message": "User information updated successfully."
        }
        ```
    - `204 No Content`: No information provided to update.
        ```json
        {}
        ```
    - `401 Unauthorized`: Missing token.
        ```json
        {
            "error": "Unauthorized access."
        }
        ```
    - `403 Forbidden`: Invalid token.
        ```json
        {
            "error": "Forbidden access."
        }
        ```
    - `409 Conflit`: User already exists.
        ```json
        {
            "error": "Username or email already exists."
        }
        ```
    - `500 Internal Server Error`: Server error.
        ```json
        {
            "error": "Internal server error."
        }
        ```

### DELETE `/api/user/delete`
Deletes the authenticated user's account.

- **Headers:**
    - `Authorization`: Bearer _token_.

- **Response:**
    - `200 OK`: User deleted successfully.
        ```json
        {
            "message": "User deleted successfully."
        }
        ```
    - `401 Unauthorized`: Missing token.
        ```json
        {
            "error": "Unauthorized access."
        }
        ```
    - `403 Forbidden`: Invalid token.
        ```json
        {
            "error": "Forbidden access."
        }
        ```
        - `404 Not Found`: User not found.
        ```json
        {
            "error": "User not found."
        }
        ```
    - `500 Internal Server Error`: Server error.
        ```json
        {
            "error": "Internal server error."
        }
        ```

## Project Management

### POST `/api/projects/`
Creates a new project.

- **Headers:**
    - `Authorization`: Bearer _token_.

- **Request Body:**
    ```json
    {
        "name": "string",
        "description": "string" // Optional
    }
    ```

- **Response:**
    - `201 Created`: Project created successfully.
        ```json
        {
            "message": "Project created successfully",
            "project_id": id
        }
        ```
    - `400 Bad Request`: Missing information.
        ```json
        {
            "error": "Missing information."
        }
        ```
    - `401 Unauthorized`: Missing token.
        ```json
        {
            "error": "Unauthorized access."
        }
        ```
    - `403 Forbidden`: Invalid token.
        ```json
        {
            "error": "Forbidden access."
        }
        ```
    - `409 Conflict`: Project already exists.
        ```json
        {
            "error": "Project already exists."
        }
        ```
    - `500 Internal Server Error`: Server error.
        ```json
        {
            "error": "Internal server error."
        }
        ```

### PUT `/api/projects/:project_id`
Modifies an existing project.

- **Request Parameters:**
    - `project_id`: Project ID.

- **Headers:**
    - `Authorization`: Bearer _token_.

- **Request Body:**
    ```json
    {
        "name": "string", // Optional
        "description": "string", // Optional
    }
    ```

- **Response:**
    - `200 OK`: Project modified successfully.
        ```json
        {
            "project_id": id,
            "name": "string",
            "description": "string"
        }
        ```
    - `204 No Content`: No information provided to update.
        ```json
        {}
        ```
    - `400 Bad Request`: Missing or invalid information.
        ```json
        {
            "error": "At least one field (name or description) is required to update."
        }
        ```
    - `401 Unauthorized`: Missing token.
        ```json
        {
            "error": "Unauthorized access."
        }
        ```
    - `403 Forbidden`: User is not the creator of the project.
        ```json
        {
            "error": "Forbidden access."
        }
        ```
    - `404 Not Found`: Project not found.
        ```json
        {
            "error": "Project not found."
        }
        ```
    - `500 Internal Server Error`: Server error.
        ```json
        {
            "error": "Internal server error."
        }
        ```

### DELETE `/api/projects/:project_id`
Deletes a project if the user is the creator.

- **Request Parameters:**
  - `project_id`: Project ID.

- **Headers:**
    - `Authorization`: Bearer _token_.

- **Response:**
  - `200 OK`: Project deleted successfully.
      ```json
      {
          "message": "Project deleted successfully."
      }
      ```
    - `401 Unauthorized`: Missing token.
      ```json
      {
          "error": "Unauthorized access."
      }
      ```
  - `403 Forbidden`: User is not the creator of the project.
      ```json
      {
          "error": "Forbidden access."
      }
      ```
  - `404 Not Found`: Project not found.
      ```json
      {
          "error": "Project not found."
      }
      ```
  - `500 Internal Server Error`: Server error.
      ```json
      {
          "error": "Internal server error."
      }
      ```

### Project Assignments

### POST `/api/project-assignments/assign/:project_id`
Assigns a project to a user.

- **Request Parameters:**
  - `project_id`: Project ID.

- **Headers:**
    - `Authorization`: Bearer _token_.

- **Request Body:**
  ```json
  {
    "user_id": id,
    "role": "string" // Optional, defaults to "viewer"
  }
  ```

- **Response:**
  - `201 Created`: Project assigned successfully.
      ```json
      {
          "message": "Project assigned successfully."
      }
      ```
    - `400 Bad Request`: Missing information.
      ```json
      {
          "error": "Missing information."
      }
      ```
    - `401 Bad Request`: Missing token.
      ```json
      {
          "error": "Unauthorized access."
      }
      ```
    - `403 Forbidden`: User is not the creator of the project.
      ```json
      {
          "error": "Forbidden access."
      }
      ```
    - `404 Not Found`: Project not found.
      ```json
      {
          "error": "Project not found."
      }
      ```
    - `409 Conflict`: User already assigned to this project.
      ```json
      {
          "error": "User already assigned to this project."
      }
      ```
  - `500 Internal Server Error`: Server error.
      ```json
      {
          "error": "Internal server error."
      }
      ```

## Project Retrieval

### GET `/api/user-projects/`
Retrieves projects associated with a user.

- **Headers:**
    - `Authorization`: Bearer _token_.

- **Response:**
    - `200 OK`: List of projects.
        ```json
        [
            {
                "project_id": id,
                "name": "string",
                "description": "string"
            },
            ...
        ]
        ```
     - `401 Unauthorized`: Missing token.
        ```json
        {
                "error": "Unauthorized access."
        }
        ```
    - `403 Forbidden`: Invalid token.
        ```json
        {
                "error": "Forbidden access."
        }
        ```
    - `404 Not Found`: No projects found for this user.
        ```json
        {
            "error": "No projects found for this user."
        }
        ```
    - `500 Internal Server Error`: Server error.
        ```json
        {
            "error": "Internal server error."
        }
        ```

### `PUT /api/project-assignments/role/:project_id`
Updates a user's role in a project.

- **Request Parameters:**
  - `project_id`: Project ID.

- **Headers:**
    - `Authorization`: Bearer _token_.

- **Request Body:**
    ```json
    {
        "user_id": id,
        "role": "string"
    }
    ```

- **Response:**
    - `200 OK`: Role updated successfully.
        ```json
        {
            "message": "User role updated successfully."
        }
        ```
    - `400 Bad Request`: Missing information.
        ```json
        {
            "error": "Missing information."
        }
        ```
    - `401 Unauthorized`: Missing token.
        ```json
        {
            "error": "Unauthorized access."
        }
        ```
    - `403 Forbidden`: User is not the creator of the project.
        ```json
        {
            "error": "Forbidden access."
        }
        ```
    - `404 Not Found`: Project not found.
        ```json
        {
            "error": "Project not found."
        }
        ```
        ```json
        {
            "error": "User not assigned to this project."
        }
        ```
    - `500 Internal Server Error`: Server error.
        ```json
        {
            "error": "Internal server error."
        }
        ```

### DELETE `/api/project-assignments/remove/:project_id`
Removes a user from a project.

- **Request Parameters:**
  - `project_id`: Project ID.

- **Headers:**
    - `Authorization`: Bearer _token_.

- **Request Body:**
    ```json
    {
        "user_id": id
    }
    ```

- **Response:**
    - `200 OK`: User removed successfully.
        ```json
        {
            "message": "User removed successfully."
        }
        ```
    - `400 Bad Request`: Missing information.
        ```json
        {
            "error": "Missing information."
        }
        ```
    - `401 Unauthorized`: Missing token.
        ```json
        {
            "error": "Unauthorized access."
        }
        ```
    - `403 Forbidden`: User is not the creator of the project.
        ```json
        {
            "error": "Forbidden access."
        }
        ```
    - `404 Not Found`: Project not found.
        ```json
        {
            "error": "Project not found."
        }
        ```
        ```json
        {
            "error": "User not assigned to this project."
        }
        ```
    - `500 Internal Server Error`: Server error.
        ```json
        {
            "error": "Internal server error."
        }
        ```

## Route Files

- `routes/auth.js`
- `routes/project.js`
- `routes/projectAssignments.js`
- `routes/user.js`
- `routes/userProjects.js`

## Server

The server is configured in `server.js` and uses Express to handle routes and middleware.
