import React, { createContext, useContext, useState } from 'react';

const LanguageContext = createContext();

export const translations = {
  en: {
    appName: "MarketLink",
    tagline: "Farm Fresh Just a Click Away",
    home: "Home",
    markets: "Farmers Markets",
    produce: "Fresh Produce",
    about: "About Us",
    contact: "Contact",
    searchPlaceholder: "Search organic tomatoes, raw honey, sourdough...",
    cart: "Basket",
    login: "Log In",
    register: "Join MarketLink",
    myOrders: "My Pre-Orders",
    farmerDashboard: "Farmer Stall Dashboard",
    adminCenter: "Admin Command Center",
    payAtPickup: "Pay at Pickup",
    aiAssistant: "Ask Greenie AI",
    foodWasteImpact: "Food Waste Reduction",
    qrCode: "Order QR Code"
  },
  ur: {
    appName: "مارکیٹ لنک",
    tagline: "تازہ فصل، بس ایک کلک پر",
    home: "ہوم",
    markets: "کسان منڈی",
    produce: "تازہ سبزی اور پھل",
    about: "ہمارے بارے میں",
    contact: "رابطہ کریں",
    searchPlaceholder: "تازہ ٹماٹر، شہد، روٹی تلاش کریں...",
    cart: "ٹوکری",
    login: "لاگ ان",
    register: "اکاؤنٹ بنائیں",
    myOrders: "میرے آرڈرز",
    farmerDashboard: "کسان کا ڈیش بورڈ",
    adminCenter: "ایڈمن سینٹر",
    payAtPickup: "پک اپ پر ادائیگی",
    aiAssistant: "گرینی AI سے پوچھیں",
    foodWasteImpact: "خوراک کا ضیاع کم کریں",
    qrCode: "آرڈر کیو آر کوڈ"
  },
  romanUrdu: {
    appName: "MarketLink",
    tagline: "Kisaan Ki Taza Fasal Ek Click Par",
    home: "Home",
    markets: "Farmers Markets",
    produce: "Taza Produce",
    about: "Humare Baare Mein",
    contact: "Contact Karein",
    searchPlaceholder: "Taza tamatar, raw honey, sourdough search karein...",
    cart: "Tokri",
    login: "Log In",
    register: "Account Banayein",
    myOrders: "Mere Pre-Orders",
    farmerDashboard: "Farmer Dashboard",
    adminCenter: "Admin Command Center",
    payAtPickup: "Pickup Par Payment",
    aiAssistant: "Ask Greenie AI",
    foodWasteImpact: "Food Waste Reduction",
    qrCode: "Order QR Code"
  }
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('en');

  const t = (key) => {
    return translations[language]?.[key] || translations.en[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      <div className={language === 'ur' ? 'font-sans rtl' : 'font-sans'}>
        {children}
      </div>
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
