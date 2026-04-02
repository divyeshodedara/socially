# API Documentation

This documentation provides detailed information about the Social Media API.

## 📂 API Base Info

**Base URL:**
`http://localhost:3000/api/v1`

**Authentication:**
Use JWT token in the `Authorization` header:
`Authorization: Bearer <token>`

---

## 🔐 Authentication

### Register User

- **Method & URL:** `POST /auth/signup`
- **Description:** Creates a new user account.
- **Authentication:** Not Required
- **Request Body:**
  ```json
  {
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123"
  }
  ```
- **Response (Success):**
  ```json
  {
    "success": true,
    "message": "User registered successfully. Please check your email to verify your account.",
    "data": {
      "user": {
        "id": "60d21b4667d0d8992e610c85",
        "username": "testuser",
        "email": "test@example.com"
      }
    }
  }
  ```
- **Response (Error):**
  ```json
  {
    "success": false,
    "message": "User with this email or username already exists."
  }
  ```

### Login User

- **Method & URL:** `POST /auth/login`
- **Description:** Authenticates a user and returns a JWT token.
- **Authentication:** Not Required
- **Request Body:**
  ```json
  {
    "email": "test@example.com",
    "password": "password123"
  }
  ```
- **Response (Success):**
  ```json
  {
    "success": true,
    "message": "Login successful.",
    "data": {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "user": {
        "id": "60d21b4667d0d8992e610c85",
        "username": "testuser",
        "email": "test@example.com"
      }
    }
  }
  ```
- **Response (Error):**
  ```json
  {
    "success": false,
    "message": "Invalid credentials."
  }
  ```

### Logout User

- **Method & URL:** `POST /auth/logout`
- **Description:** Logs out the currently authenticated user.
- **Authentication:** Required
- **Response (Success):**
  ```json
  {
    "success": true,
    "message": "Logout successful."
  }
  ```
- **Response (Error):**
  ```json
  {
    "success": false,
    "message": "You are not logged in."
  }
  ```

---

## 👤 Users

### Get User Profile

- **Method & URL:** `GET /users/profile/:id`
- **Description:** Retrieves the profile of a specific user.
- **Authentication:** Required
- **Response (Success):**
  ```json
  {
    "success": true,
    "message": "Profile fetched successfully.",
    "data": {
      "user": {
        "id": "60d21b4667d0d8992e610c85",
        "username": "testuser",
        "profilePicture": "http://example.com/path/to/image.jpg",
        "followers": [],
        "following": []
      }
    }
  }
  ```
- **Response (Error):**
  ```json
  {
    "success": false,
    "message": "User not found."
  }
  ```

### Update Profile

- **Method & URL:** `POST /users/edit-profile`
- **Description:** Updates the profile of the authenticated user.
- **Authentication:** Required
- **Request Body (form-data):**
  - `username` (string)
  - `profilePicture` (file)
- **Response (Success):**
  ```json
  {
    "success": true,
    "message": "Profile updated successfully.",
    "data": {
      "user": {
        "id": "60d21b4667d0d8992e610c85",
        "username": "newusername",
        "profilePicture": "http://example.com/path/to/new_image.jpg"
      }
    }
  }
  ```
- **Response (Error):**
  ```json
  {
    "success": false,
    "message": "Failed to update profile."
  }
  ```

### Follow User

- **Method & URL:** `POST /users/follow/:id`
- **Description:** Follows a specific user.
- **Authentication:** Required
- **Response (Success):**
  ```json
  {
    "success": true,
    "message": "User followed successfully."
  }
  ```
- **Response (Error):**
  ```json
  {
    "success": false,
    "message": "User not found."
  }
  ```

### Unfollow User

- **Method & URL:** `POST /users/unfollow/:id`
- **Description:** Unfollows a specific user.
- **Authentication:** Required
- **Response (Success):**
  ```json
  {
    "success": true,
    "message": "User unfollowed successfully."
  }
  ```
- **Response (Error):**
  ```json
  {
    "success": false,
    "message": "User not found."
  }
  ```

---

## 📝 Posts

### Create Post

- **Method & URL:** `POST /posts/create-post`
- **Description:** Creates a new post.
- **Authentication:** Required
- **Request Body (form-data):**
  - `content` (string)
  - `image` (file)
- **Response (Success):**
  ```json
  {
    "success": true,
    "message": "Post created successfully.",
    "data": {
      "post": {
        "id": "60d21b4667d0d8992e610c86",
        "content": "This is a new post.",
        "image": "http://example.com/path/to/image.jpg",
        "author": "60d21b4667d0d8992e610c85"
      }
    }
  }
  ```
- **Response (Error):**
  ```json
  {
    "success": false,
    "message": "Failed to create post."
  }
  ```

### Get All Posts (Feed)

- **Method & URL:** `GET /posts/all-posts`
- **Description:** Retrieves all posts for the user's feed.
- **Authentication:** Required
- **Response (Success):**
  ```json
  {
    "success": true,
    "message": "Posts retrieved successfully.",
    "data": {
      "posts": [
        {
          "id": "60d21b4667d0d8992e610c86",
          "content": "This is a post.",
          "image": "http://example.com/path/to/image.jpg",
          "author": {
            "id": "60d21b4667d0d8992e610c85",
            "username": "testuser"
          },
          "likes": [],
          "comments": []
        }
      ]
    }
  }
  ```
- **Response (Error):**
  ```json
  {
    "success": false,
    "message": "Failed to retrieve posts."
  }
  ```

### Get Single Post

- **Method & URL:** `GET /posts/:postId`
- **Description:** Retrieves a single post by its ID.
- **Authentication:** Required
- **Response (Success):**
  ```json
  {
    "success": true,
    "message": "Post retrieved successfully.",
    "data": {
      "post": {
        "id": "60d21b4667d0d8992e610c86",
        "content": "This is a post.",
        "image": "http://example.com/path/to/image.jpg",
        "author": {
          "id": "60d21b4667d0d8992e610c85",
          "username": "testuser"
        },
        "likes": [],
        "comments": []
      }
    }
  }
  ```
- **Response (Error):**
  ```json
  {
    "success": false,
    "message": "Post not found."
  }
  ```

### Delete Post

- **Method & URL:** `DELETE /posts/delete/:postId`
- **Description:** Deletes a specific post.
- **Authentication:** Required
- **Response (Success):**
  ```json
  {
    "success": true,
    "message": "Post deleted successfully."
  }
  ```
- **Response (Error):**
  ```json
  {
    "success": false,
    "message": "You are not authorized to delete this post."
  }
  ```

---

## 💬 Comments

### Add Comment

- **Method & URL:** `POST /posts/comment/:postId`
- **Description:** Adds a comment to a specific post.
- **Authentication:** Required
- **Request Body:**
  ```json
  {
    "content": "This is a comment."
  }
  ```
- **Response (Success):**
  ```json
  {
    "success": true,
    "message": "Comment added successfully.",
    "data": {
      "comment": {
        "id": "60d21b4667d0d8992e610c87",
        "content": "This is a comment.",
        "author": "60d21b4667d0d8992e610c85",
        "post": "60d21b4667d0d8992e610c86"
      }
    }
  }
  ```
- **Response (Error):**
  ```json
  {
    "success": false,
    "message": "Post not found."
  }
  ```

### Get Comments for Post

- **Method & URL:** `GET /posts/:postId/comments`
- **Description:** Retrieves all comments for a specific post.
- **Authentication:** Required
- **Response (Success):**
  ```json
  {
    "success": true,
    "message": "Comments retrieved successfully.",
    "data": {
      "comments": [
        {
          "id": "60d21b4667d0d8992e610c87",
          "content": "This is a comment.",
          "author": {
            "id": "60d21b4667d0d8992e610c85",
            "username": "testuser"
          }
        }
      ]
    }
  }
  ```
- **Response (Error):**
  ```json
  {
    "success": false,
    "message": "Post not found."
  }
  ```

### Delete Comment

- **Method & URL:** `DELETE /comments/:commentId`
- **Description:** Deletes a specific comment.
- **Authentication:** Required
- **Response (Success):**
  ```json
  {
    "success": true,
    "message": "Comment deleted successfully."
  }
  ```
- **Response (Error):**
  ```json
  {
    "success": false,
    "message": "You are not authorized to delete this comment."
  }
  ```

---

## ❤️ Likes

### Like Post

- **Method & URL:** `POST /posts/like-dislike/:postId`
- **Description:** Likes a specific post.
- **Authentication:** Required
- **Response (Success):**
  ```json
  {
    "success": true,
    "message": "Post liked successfully."
  }
  ```
- **Response (Error):**
  ```json
  {
    "success": false,
    "message": "Post not found."
  }
  ```

### Unlike Post

- **Method & URL:** `POST /posts/like-dislike/:postId`
- **Description:** Unlikes a specific post.
- **Authentication:** Required
- **Response (Success):**
  ```json
  {
    "success": true,
    "message": "Post unliked successfully."
  }
  ```
- **Response (Error):**
  ```json
  {
    "success": false,
    "message": "Post not found."
  }
  ```

---

## 📸 Media Upload

### Upload Image

- **Method & URL:** `POST /media/upload`
- **Description:** Uploads an image and returns the URL.
- **Authentication:** Required
- **Request Body (form-data):**
  - `image` (file)
- **Response (Success):**
  ```json
  {
    "success": true,
    "message": "Image uploaded successfully.",
    "data": {
      "imageUrl": "http://example.com/path/to/uploaded_image.jpg"
    }
  }
  ```
- **Response (Error):**
  ```json
  {
    "success": false,
    "message": "Image upload failed."
  }
  ```
