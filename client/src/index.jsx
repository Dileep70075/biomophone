import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { AuthContextProvider } from "./context/authContext";
import { UserProfileProvider } from "./context/UserProfileContext";
import { DarkModeContextProvider } from "./context/darkModeContext";
import { UserProvider } from "./context/UserContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <AuthContextProvider>
      <UserProfileProvider>
        <DarkModeContextProvider>
          <QueryClientProvider client={queryClient}>
            <UserProvider>
              <App />
            </UserProvider>
          </QueryClientProvider>
        </DarkModeContextProvider>
      </UserProfileProvider>
    </AuthContextProvider>
  </React.StrictMode>
);
