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
            "message": "User created successfully."
        }
        ```
    - `400 Bad Request`: Missing information or user already exists.
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
  - `401 Unauthorized`: Incorrect credentials.
    ```json
    {
        "error": "Invalid username or password."
    }
    ```
  - `500 Internal Server Error`: Server error.
    ```json
    {
        "error": "Internal server error."
    }
    ```

## Project Management

### POST `/api/projects`
Creates a new project.

- **Request Body:**
    ```json
    {
        "name": "string",
        "description": "string",
        "user_id": id
    }
    ```

- **Response:**
    - `201 Created`: Project created successfully.
        ```json
        {
            "project_id": id,
            "name": "string",
            "description": "string"
        }
        ```
    - `400 Bad Request`: Missing information or project already exists.
        ```json
        {
            "error": "Project name is required or project already exists."
        }
        ```
    - `500 Internal Server Error`: Server error.
        ```json
        {
            "error": "Internal server error."
        }
        ```

### PUT `/api/projects/:id`
Modifies an existing project.

- **Request Parameters:**
    - `id`: Project ID.

- **Request Body:**
    ```json
    {
        "name": "string",
        "description": "string",
        "user_id": id
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
    - `400 Bad Request`: Missing or invalid information.
        ```json
        {
            "error": "At least one field (name or description) is required to update."
        }
        ```
    - `403 Forbidden`: User is not the creator of the project.
        ```json
        {
            "error": "You are not authorized to modify this project."
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

### DELETE `/api/projects/:id`
Deletes a project if the user is the creator.

- **Request Parameters:**
  - `id`: Project ID.

- **Request Body:**
  ```json
  {
    "user_id": id
  }
  ```

- **Response:**
  - `200 OK`: Project deleted successfully.
  - `403 Forbidden`: User is not the creator of the project.
      ```json
      {
          "error": "You are not authorized to delete this project."
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

### POST `/api/project-assignments/assign-project`
Assigns a project to a user.

- **Request Body:**
  ```json
  {
    "user_id": id,
    "project_id": "string",
    "role": "string" // Optional, defaults to "member"
  }
  ```

- **Response:**
  - `201 Created`: Project assigned successfully.
      ```json
      {
          "message": "Project assigned successfully."
      }
      ```
  - `400 Bad Request`: Missing information or user already assigned.
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

### GET `/api/user-projects/:userId`
Retrieves projects associated with a user.

- **Request Parameters:**
    - `userId`: User ID.

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

## Route Files

- `routes/auth.js`
- `routes/project.js`
- `routes/projectAssignments.js`
- `routes/userProjects.js`

## Server

The server is configured in `server.js` and uses Express to handle routes and middleware.
