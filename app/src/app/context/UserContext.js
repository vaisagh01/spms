"use client"
import { createContext, useContext } from "react";
// Create UserContext
const UserContext = createContext(null);

// UserProvider component to wrap the app
export const UserProvider = ({ children }) => {

  const user = ({
    name: "Student",
    email: "vais@gmail"
    });

  return (
    <UserContext.Provider value={{ user }}>
      {children}
    </UserContext.Provider>
  );
};

// Custom hook to use the UserContext
export const useUser = () => useContext(UserContext);
