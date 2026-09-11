// Import createRoot function from React DOM client library
// This is used to create a root for rendering the React application in the browser
import { createRoot } from "react-dom/client";

// Import the main App component from the App.tsx file
// This is the root component of the HR dashboard application
import App from "./App.tsx";

// Import the AuthProvider from AuthContext
import { AuthProvider } from "./AuthContext";

// Import the ErrorBoundary so a render error anywhere below — including
// inside AuthProvider itself, before App's own inner boundary is reached —
// shows a recovery screen instead of a blank white page.
import { ErrorBoundary } from "./components/ErrorBoundary";

// sonner was a dependency with a Toaster component that was never mounted
// anywhere, so calls to `toast.*` throughout the app had nowhere to render.
// Mounted once here (outside App's own conditional early-returns) so it's
// present regardless of which screen/loading state App is currently showing.
import { Toaster } from "./components/ui/sonner";

// Import the global CSS styles from index.css
// This includes base styles and Tailwind CSS for the entire application
import "./index.css";

// Import the modern design system for beautiful UI components
import "./styles/design-system.css";

// Create a React root attached to the DOM element with id 'root'
// The exclamation mark asserts that getElementById will not return null
// Wrap the App component with AuthProvider to provide authentication context
// Render the App component inside this root, starting the React application
createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <AuthProvider>
      <App />
    </AuthProvider>
    <Toaster position="top-center" richColors />
  </ErrorBoundary>
);