import React, { useState } from "react";

export const DifficultyContext = React.createContext(null);

export const DifficultyProvider = ({ children }) => {
  const [isEasy, setIsEasy] = useState(false);
  return <DifficultyContext.Provider value={{ isEasy, setIsEasy }}>{children}</DifficultyContext.Provider>;
};
