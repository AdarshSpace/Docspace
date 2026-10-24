# Docspace — Document Workspace

A web-based document workspace built with Next.js that allows authenticated users to create, edit, format, and share documents with other registered users.

**Live Demo:** https://www.motionkart.online/  
**GitHub Repository:** https://github.com/AdarshSpace/Docspace

---

## Table of Contents

- [Overview](#overview)
- [Technology Stack](#technology-stack)
- [Features](#features)
- [Application Architecture](#application-architecture)
- [Database Models](#database-models)
- [API Endpoints](#api-endpoints)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)
- [Demo Accounts](#demo-accounts)
- [Project Structure](#project-structure)
- [Current Limitations](#current-limitations)
- [Future Improvements](#future-improvements)

## Overview

Docspace is a document management application designed to provide a simple workspace for creating and managing rich-text documents.

Users can authenticate, create documents, edit their content through a rich-text editor, and share documents with other registered users.

The application uses Next.js App Router for its frontend and API routes, MongoDB for data persistence, and JWT-based authentication using HTTP cookies.

The project focuses on document management, authentication, access control, and a clean, consistent user interface.

## Technology Stack

| Technology | Purpose |
|---|---|
| Next.js App Router | Application framework and API routes |
| React | User interface |
| TypeScript | Type-safe application development |
| MongoDB | Database |
| Mongoose | MongoDB object modeling |
| JSON Web Tokens (JWT) | Authentication |
| bcrypt | Password hashing |
| Tiptap | Rich-text editing |
| Tailwind CSS | Styling and responsive layouts |

## Features

### 1. Authentication

- JWT-based authentication using an HTTP cookie named `token`.
- Authentication helpers for identifying the current user.
- Protected resources intended to be accessible only to authenticated users.
- Password hashing with bcrypt rather than storing plain-text passwords.
- An API endpoint intended to return the authenticated user's information.

### 2. Document Dashboard

The dashboard serves as the central place for accessing documents.

- Access documents owned by the current user.
- Separate owned documents from documents shared with the user.
- Display document titles and last-updated timestamps.
- Provide an action to create new documents.
- Use a consistent blue-and-white visual theme.

### 3. Document Creation and Editing

- Create a document with a title.
- Store document titles, content, and owner references.
- Edit document content using the Tiptap rich-text editor.
- Format text using bold, italic, underline, and heading controls.
- Organize content using bullet lists and numbered lists.
- Automatically save changes after a short delay.
- Display a save status to indicate whether changes are saved or pending.
- Load existing document content and titles when opening a document, where implemented.

### 4. Document Sharing

Docspace is designed to support document collaboration through user-based sharing.

- Share documents using the email address of an existing registered user.
- Maintain sharing relationships in a separate `DocumentShare` collection.
- Allow document owners to grant access to other users.
- Check document ownership or sharing permissions before allowing access.

**Security requirement:** Document access must be validated on the server for every relevant API request. Hiding an action in the frontend is not sufficient to enforce permissions.

### 5. Consistent Workspace Header

The workspace layout is designed to provide a consistent header across dashboard pages.

- Product branding.
- Current user's email address.
- Workspace label.
- Sign-out action.

The shared layout should render the header once, avoiding duplicate headers on individual dashboard pages.

## Application Architecture

The application uses the Next.js App Router to organize pages, server-side functionality, and API endpoints.

The main request flow is:

1. The user interacts with the React interface.
2. The frontend sends a request to the appropriate Next.js API route.
3. The API validates authentication using the JWT cookie.
4. The server checks the user's permissions for the requested document.
5. Mongoose communicates with MongoDB to read or update data.
6. The API returns a response to the frontend.

### Authentication Flow

1. A user submits their login credentials.
2. The server verifies the credentials against the stored user record.
3. The password is checked using bcrypt.
4. After successful authentication, the server issues a JWT.
5. The token is stored in an HTTP cookie named `token`.
6. Protected API routes validate the token before processing requests.

The exact cookie flags, token expiration policy, and login implementation should be verified in the source code.

### Document Editing Flow

1. A user creates or opens a document.
2. The application retrieves the document through the API.
3. Tiptap displays the document content in an editable interface.
4. When the user makes changes, the editor schedules a save after a short delay.
5. The frontend sends the updated title or content to the document API.
6. The server verifies access and persists the changes in MongoDB.
7. The interface updates its save status based on the result.

### Sharing Flow

1. The document owner opens the Share interface.
2. The owner enters the email address of a registered user.
3. The server identifies the target user.
4. A sharing relationship is created in the `DocumentShare` collection.
5. The application checks that relationship when the recipient attempts to access the document.

These flows describe the intended architecture. Verify the corresponding implementation before treating every step as complete.

## Database Models

The application uses MongoDB with Mongoose. The following describes the expected data model; confirm the actual field names and schema definitions in the source code.

### User

Stores account and authentication information.

Typical fields:

- `_id` — unique user identifier.
- `email` — user's email address.
- `password` — bcrypt password hash.

Additional fields may exist depending on the implementation.

### Document

Stores the document's content and ownership information.

Typical fields:

- `_id` — unique document identifier.
- `title` — document title.
- `content` — rich-text document content.
- `owner` — reference to the document's owner.
- `createdAt` — creation timestamp.
- `updatedAt` — last modification timestamp.

### DocumentShare

Represents a sharing relationship between a document and a user.

Typical fields:

- `_id` — unique sharing record identifier.
- `document` — reference to the shared document.
- `user` — reference to the user receiving access.
- `sharedBy` — reference to the document's owner

The actual schema may differ. Confirm whether permissions, timestamps, or unique compound indexes are implemented.

## API Endpoints

The following table documents the planned API surface. Confirm that each route exists and test its behavior before considering it operational.

| Method | Endpoint | Intended purpose |
|---|---|---|
| `POST` | `/api/documents` | Create a document using a submitted title. |
| `GET` | `/api/documents/[id]` | Retrieve a document the user owns or can access. |
| `PATCH` | `/api/documents/[id]` | Update a document's title and content. |
| `GET` | `/api/documents/dashboard` | Retrieve owned and shared documents. |
| `POST` | `/api/documents/[id]/share` | Share a document with a registered user. |
| `GET` | `/api/auth/me` | Retrieve the authenticated user's information. |

| `POST` | `/api/documents/import` | Not implemented; planned document import endpoint. |
| `DELETE` | `/api/documents/[id]` | Not implemented; planned document deletion endpoint. |

### API Expectations

- Protected endpoints should reject unauthenticated requests.
- Document reads and updates should verify ownership or an appropriate sharing record.
- Sharing should be restricted to the document owner unless other permissions are explicitly supported.
- Invalid document IDs and missing documents should produce appropriate error responses.
- API responses should use consistent status codes and error formats.

The methods and paths above are documentation of the intended contract, not a guarantee that every endpoint is present or fully functional.

## Getting Started

Follow these steps to run Docspace locally.

### Prerequisites

Install or configure the following:

- **Node.js:** A supported version compatible with the project's dependencies.
- **npm:** Included with Node.js, or the package manager specified by the repository's lockfile.
- **MongoDB:** A local MongoDB instance or a MongoDB Atlas database.
- **Git:** To clone the repository.

Verify your installations:

```bash
node --version
npm --version
git --version
```

### 1. Clone the Repository

```bash
git clone https://github.com/AdarshSpace/Docspace.git
cd Docspace
```

### 2. Install Dependencies

If the repository uses `package-lock.json`, run:

```bash
npm install
```

Use the package manager corresponding to the existing lockfile if the project uses pnpm, Yarn, or another package manager.

### 3. Configure Environment Variables

Create a `.env.local` file in the project's root directory.

```env
DB_URL=mongodb+srv://<username>:<password>@<cluster-host>/docspace
JWT_SECRET=replace_with_a_secure_random_secret
NODE_ENV= "development" or "production"
```

Replace the database URL with your actual MongoDB connection string.

For MongoDB Atlas, use the connection string provided by your cluster, for example:

```env
DB_URL=mongodb+srv://<username>:<password>@<cluster-host>/docspace
```

Replace the placeholders with your actual credentials and cluster information. URL-encode special characters in the username or password when required.

**Important:** These are the environment variable names supplied for this project. Confirm that the database connection code reads `DB_URL` and that the authentication code reads `JWT_SECRET`. Do not commit `.env.local` or real credentials to Git.

### 4. Start the Development Server

```bash
npm run dev
```

Open the application at:

http://localhost:3000

If the development command fails, inspect the `scripts` section in `package.json` and use the command configured for the project.

## Environment Variables

| Variable | Description | Example |
|---|---|---|
| `DB_URL` | MongoDB connection string. | `mongodb+srv://<username>:<password>@<cluster-host>/docspace` |
| `JWT_SECRET` | Secret used to sign and verify JWTs. | A strong, randomly generated secret |
| `NODE_ENV` | Application environment. | `development` or `production` |


Configure MongoDB Atlas

Sign in to MongoDB Atlas.

Create a cluster if you don't already have one.

Open Database → Connect and obtain your MongoDB connection string.

Replace the placeholders with your database username, password, and cluster hostname.

Use docspace as the database name in the connection string, or replace it with your preferred database name.

In Atlas, configure Network Access to allow connections from your development environment.


### Generating a Secure JWT Secret

Generate a random secret locally using Node.js:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the generated value into your local environment file.

Never use a short, predictable secret such as `12asdf` in a deployed application. Keep production secrets outside source control and rotate any secret that has been exposed.

## Running the Application

### Development Mode

Start the development server with:

```bash
npm run dev
```

Next.js normally serves the development application at `http://localhost:3000`.

### Production Build

Create an optimized production build:

```bash
npm run build
```

Start the production server:

```bash
npm run start
```

Run the production server only after a successful build.

### Code Quality Checks

If the corresponding scripts exist in `package.json`, run:

```bash
npm run lint
npx tsc --noEmit
```

The TypeScript command checks the project for type errors. The lint command depends on the project's ESLint configuration and Next.js version.

## Demo Accounts

The following credentials were supplied for accessing the hosted demo.

| Account | Email | Password |
|---|---|---|
| Account 1 | `trial@gmail.com` | `Trial111` |
| Account 2 | `test@gmail.com` | `Test111` |

**Note:** These are shared demo credentials, not private accounts. Their continued availability depends on the deployed application's database and configuration. Do not reuse these passwords for personal accounts or production services.

## Project Structure

The application uses the Next.js App Router. The exact structure may vary, so compare this outline with the repository.

```text
Docspace/
├── public/                 # Static assets
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   │   └── login/
|   |   |   |   |___register/
|   |   |   |   |___me/
|   |   |   |
│   │   │   └── documents/
│   │   │       ├── [id]/
│   │   │       │   └── share/
│   │   │       └── dashboard/
│   │   ├── dashboard/      # Workspace pages and layouts
│   │   ├── login/          # Authentication pages, if present
│   │   ├── signup/         # Registration pages, if present
│   │   ├── layout.tsx      # Root layout
│   │   └── page.tsx        # Home page
│   ├── components/         # Reusable UI components
│   ├── lib/                # Database, authentication, and helpers
│   └── models/             # Mongoose models, if organized here
├── .env.local              # Local environment variables (not committed)
├── .gitignore
├── package.json
├── package-lock.json
├── tsconfig.json
└── README.md
```

This is an illustrative structure, not a verified listing of the repository's files.

## Current Limitations

The following items are known limitations based on the current project status.

### File Upload and Import

File upload and document import are not implemented.

There is no implemented `POST /api/documents/import` endpoint. Users therefore cannot currently import file contents into a new document through this feature.

A future implementation could support `.txt` and `.md` files, with server-side validation of file types and sizes before creating a document.

### Document Deletion

The `DELETE /api/documents/[id]` endpoint is not implemented.

Document deletion should include server-side authorization so that users cannot delete documents belonging to others.

### Sign Out

The Sign out button is currently not working.

A complete sign-out implementation should clear or invalidate the authentication session according to the application's token strategy and redirect the user to the login page. For JWT authentication stored in a cookie, the server should clear the cookie using matching cookie attributes. If immediate token revocation is required, an additional revocation mechanism is needed.

### Feature Verification

Some dashboard, document-loading, sharing, and save-status behaviors are described as intended functionality. Their completeness should be confirmed through manual testing and source-code inspection.

## Future Improvements

Potential next steps for the project include:

- Implement file import for supported text and Markdown formats.
- Implement secure document deletion.
- Fix the sign-out flow.


---

## License

Add a license to this repository if you intend to distribute the project for reuse. Until a license is included, do not assume that others have permission to reuse or redistribute its code.

---

**Docspace** — A document workspace built with Next.js, TypeScript, MongoDB, and Tiptap.
