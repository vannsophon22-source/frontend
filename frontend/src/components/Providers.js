// src/components/Providers.jsx
"use client";

import { UserProvider } from "@/context/UserContext";
import AuthWrapper from "@/components/AuthWrapper";

export default function Providers({ children }) {
  return (
    <UserProvider>
      <AuthWrapper>
        {children}
      </AuthWrapper>
    </UserProvider>
  );
}
