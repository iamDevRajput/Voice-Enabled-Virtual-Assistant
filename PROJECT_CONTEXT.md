# Project Context: Virtual Assistant

This document serves as the permanent knowledge base for the Virtual Assistant project. It outlines the architecture, tech stack, data flows, and development guidelines for future reference.

---

## 1. Project Overview
*   **Purpose**: To provide a customizable, voice-enabled Virtual Assistant interface capable of natural language interaction.
*   **Target users**: End-users seeking an AI-driven personal assistant for tasks like web search, weather queries, basic information retrieval, and social media shortcuts.
*   **Main features**: Secure User Registration/Login, Assistant Customization (Name, Avatar), Intent parsing (via Google Gemini LLM), and Command History tracking.
*   **Current status**: Functional MVP (Minimum Viable Product). Authentication works, Gemini integration works, but there are known limitations regarding security configurations and voice implementations.

---

## 2. Tech Stack
*   **Frontend**: React.js (via Vite), React Router DOM, TailwindCSS.
*   **Backend**: Node.js, Express.js.
*   **Database**: MongoDB (via Mongoose).
*   **Authentication**: JSON Web Tokens (JWT) stored in HTTP-only cookies, `bcryptjs` for password hashing.
*   **AI APIs**: Google Gemini API (for NLP and intent classification).
*   **Cloud Services**: Cloudinary (for avatar image hosting).
*   **Build Tools**: Vite.

---

## 3. Folder Structure
*   **`backend/`**: Contains the Express.js API.
    *   `config/`: Setup for Cloudinary credentials, MongoDB connection, and JWT generation logic.
    *   `controllers/`: Core business logic separated by domains (`auth.controllers.js`, `user.controllers.js`).
    *   `middlewares/`: Express middlewares for JWT verification (`isAuth.js`) and file uploads (`multer.js`).
    *   `models/`: Mongoose schemas outlining DB structure.
    *   `routes/`: API endpoint definitions mapped to specific controllers.
*   **`frontend/`**: Contains the React SPA.
    *   `public/`: Static assets bypassing the Vite bundler.
    *   `src/assets/`: Locally hosted images and SVGs.
    *   `src/components/`: Reusable React components (e.g., `Card.jsx`).
    *   `src/context/`: Global state management (`UserContext.jsx`).
    *   `src/pages/`: Top-level route components representing views.

---

## 4. Application Architecture
This is a standard 3-tier MERN application. 
The Frontend (React) communicates with the Backend (Express) via a RESTful API using `axios`. The Backend acts as the orchestrator, communicating with MongoDB for persistence, Cloudinary for file storage, and the Gemini API for natural language processing. The application uses a stateful cookie-based approach for JWT authentication, abstracting token management away from the client-side local storage.

---

## 5. Frontend Flow
*   **Routes**: Handled by `react-router-dom` in `App.jsx`.
    *   `/` (Home) - Protected
    *   `/signup` (Sign Up) - Public
    *   `/signin` (Sign In) - Public
    *   `/customize`, `/customize2` - Protected onboarding flows.
*   **Components**: UI is modular, utilizing components like `Card.jsx` for repetitive layouts.
*   **Context/State**: `UserContext.jsx` provides global state for `userData`, server URLs, and handles the `handleCurrentUser` function triggered on application mount.
*   **API calls**: Conducted via `axios`. Features like `withCredentials: true` are used to ensure the browser sends the authentication cookie with every request.

---

## 6. Backend Flow
*   **Routes**: Mounted in `index.js` (e.g., `/api/auth`, `/api/user`).
*   **Controllers**: Extract logic from routes. E.g., `askToAssistant` processes the command, queries Gemini, updates the DB history, and returns the response.
*   **Middleware**: `isAuth` prevents unauthorized access by verifying the JWT cookie. `multer` intercepts `multipart/form-data` streams for image processing.
*   **Services**: `gemini.js` encapsulates the prompt construction and Axios network request to the Google Gemini API.
*   **Models**: `user.model.js` ensures data integrity before it reaches MongoDB.

---

## 7. Authentication Flow
1. User provides credentials to the signup/login endpoints.
2. Backend validates credentials and hashes passwords using `bcryptjs`.
3. If successful, backend signs a JWT with `userId` and sets it in an HTTP-only, Secure cookie (`token`).
4. On subsequent requests to protected routes, the `isAuth` middleware reads the cookie, verifies the signature, and injects `req.userId` into the request object.
5. `UserContext` automatically fetches the user's profile on frontend mount to maintain session state.

---

## 8. Database Schema
**Collection**: `User` (Mongoose Schema)
*   `name`: String (Required)
*   `email`: String (Required, Unique)
*   `password`: String (Required, Hashed)
*   `assistantName`: String
*   `assistantImage`: String (Cloudinary URL)
*   `history`: Array of Strings (Command log)
*   `timestamps`: Built-in tracking of creation and updates.

---

## 9. API Documentation
*   **POST** `/api/auth/signup`
    *   *Middleware*: None
    *   *Purpose*: Register a new user, hash password, issue JWT cookie.
*   **POST** `/api/auth/signin`
    *   *Middleware*: None
    *   *Purpose*: Authenticate user, issue JWT cookie.
*   **GET** `/api/auth/logout`
    *   *Middleware*: None
    *   *Purpose*: Clear JWT session cookie.
*   **GET** `/api/user/current`
    *   *Middleware*: `isAuth`
    *   *Purpose*: Retrieve the currently authenticated user's profile data.
*   **POST** `/api/user/update`
    *   *Middleware*: `isAuth`, `multer.upload`
    *   *Purpose*: Update the user's customized assistant name and avatar image (uploads to Cloudinary).
*   **POST** `/api/user/asktoassistant`
    *   *Middleware*: `isAuth`
    *   *Purpose*: Send a command to the assistant, save command to user history, and return Gemini's parsed intent/response.

---

## 10. Environment Variables
*   `MONGODB_URL`: Connection string for the MongoDB cluster.
*   `JWT_SECRET`: Secret key used for signing JSON Web Tokens.
*   `PORT`: Backend server port (Default: 5000).
*   `CLOUDINARY_CLOUD_NAME`: Cloudinary account identifier.
*   `CLOUDINARY_API_KEY`: Cloudinary access key.
*   `CLOUDINARY_API_SECRET`: Cloudinary access secret.
*   `GEMINI_API_URL`: Endpoint for Google's Gemini LLM.

---

## 11. Reusable Components
*   **`Card.jsx`**: Frontend UI container component.
*   **`UserContext.jsx`**: Global state provider component.

---

## 12. Reusable Utilities
*   **`config/cloudinary.js`**: Reusable uploader function `uploadOnCloudinary`.
*   **`config/token.js`**: Reusable JWT generator `genToken`.
*   **`gemini.js`**: Reusable LLM interaction wrapper.

---

## 13. Feature List
*   JWT-based Authentication (Login/Signup/Logout).
*   Virtual Assistant Customization (Name and Image).
*   Natural Language intent mapping (via Gemini).
*   Action triggering (opening links, getting time, weather) based on intent.
*   Command history persistence.

---

## 14. Current Limitations
*   No genuine voice input/output interface (Speech-to-Text/Text-to-Speech).
*   No frontend UI provided to view user command history.
*   Lacks global loading states during asynchronous API/LLM calls.
*   Hardcoded cookies (`secure: true`) conflict with HTTP local development without dynamic environment toggling.

---

## 15. Known Bugs
*   An unprotected, orphaned `GET /` route exists in `index.js` that mirrors Gemini API functionality, which could be exploited.
*   Cookie configurations are strictly optimized for production/HTTPS environments, leading to potential local development auth issues unless modified.

---

## 16. Performance Considerations
*   **Unbounded Array Growth**: `user.history` array grows indefinitely, which will eventually break MongoDB's 16MB document size limit.
*   **Cloudinary Orphans**: Updating avatars does not delete the old image from Cloudinary, leading to long-term storage bloat.
*   **Synchronous LLM**: `askToAssistant` holds open HTTP connections while waiting on Gemini, which can exhaust connection pools under scale.

---

## 17. Security Considerations
*   **Missing Rate Limiting**: Auth and LLM endpoints are highly susceptible to brute force and denial of wallet attacks.
*   **Missing Input Sanitization**: User commands are appended to DB and passed to prompts directly, creating risks for NoSQL and Prompt Injections.
*   **Orphaned Endpoints**: Exposed routes (`GET /`) need immediate deprecation.

---

## 18. Technical Debt
*   Lack of a rigid input validation layer (e.g., Zod, Joi) prior to database insertion.
*   Lack of TypeScript limits type safety for LLM-returned JSON structures.
*   Missing automated test coverage.
*   Heavy reliance on brittle regex (`replace(/```json|```/g)`) to parse AI responses.

---

## 19. Coding Conventions
*   **Backend**: Modular routing structure with separated controllers. Uses ES6 `import`/`export` syntax. Handled async functions with `try/catch`. 
*   **Frontend**: Functional components utilizing React Hooks (`useState`, `useEffect`, `useContext`). Uses Tailwind CSS utility classes for styling.

---

## 20. Future Roadmap
1.  **Extract Service Layer**: Move business logic (like handling intents and parsing Gemini responses) out of Express controllers and into dedicated Service files (e.g., `services/intentHandler.js`).
2.  **Relational History**: Extract the `history` array into a separate Mongoose Collection mapped by `userId` to allow for efficient querying and pagination.
3.  **Dynamic Configurations**: Use `.env` flags in the frontend to toggle `serverUrl` dynamically. Use `.env` flags in backend to conditionally set cookie flags (`secure`).
4.  **Adopt Proper LLM JSON Modes**: Use official SDK features for guaranteed JSON output rather than parsing Markdown text blocks.

---

## 21. AI Development Rules

When working on this project:

- **Preserve architecture**: Do not fundamentally change the MERN structure without explicit instructions.
- **Never rewrite files unnecessarily**: Add or modify minimal lines instead of rewriting entire modules.
- **Search before creating anything**: Verify if a utility, route, or component already exists before making a new one.
- **Reuse existing components**: Utilize `Card.jsx`, `uploadOnCloudinary`, etc.
- **Avoid duplicate logic**: Keep code DRY.
- **Follow existing coding style**: Maintain ES6 imports, `try/catch` error handling, and Tailwind CSS patterns.
- **Make minimal safe changes**: Only change what is necessary to fulfill a feature or fix a bug.
- **Explain implementation before coding**: Adhere to the "Understand first. Code later" philosophy in all interactions.
