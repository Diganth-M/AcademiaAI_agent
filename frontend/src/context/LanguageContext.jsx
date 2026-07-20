import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('English');
  const [chatbotLanguage, setChatbotLanguage] = useState('English');

  // When global language changes, automatically sync chatbot language
  useEffect(() => {
    setChatbotLanguage(language);
  }, [language]);

  const updateLanguage = (newLang) => {
    setLanguage(newLang);
  };

  const updateChatbotLanguage = (newLang, applyEverywhere = false) => {
    setChatbotLanguage(newLang);
    if (applyEverywhere) {
      setLanguage(newLang);
    }
  };

  return (
    <LanguageContext.Provider value={{
      language, 
      updateLanguage,
      chatbotLanguage,
      updateChatbotLanguage
    }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
