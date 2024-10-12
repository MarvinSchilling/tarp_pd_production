// UserContext.js
import React, { createContext, useState, useEffect } from 'react';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch('http://localhost:3001/user', { credentials: 'include' })
      .then((res) => res.json())
      .then((data) => {
        setUser(data.user); // Benutzer setzen
      })
      .catch((error) => {
        console.error('Error fetching user:', error);
      });
  }, []);

  return (
    <UserContext.Provider value={{ user }}>
      {children}
    </UserContext.Provider>
  );
};
