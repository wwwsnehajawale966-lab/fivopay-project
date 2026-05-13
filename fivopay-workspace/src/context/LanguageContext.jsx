import React, { createContext, useContext, useState, useEffect } from 'react';

// Translations dictionary
export const translations = {
  en: {
    // Navigation
    dashboard: 'Dashboard',
    planner: 'Planner',
    analytics: 'Analytics',
    settings: 'Settings',
    
    // Dashboard
    totalTasks: 'Total Tasks',
    completed: 'Completed',
    pending: 'Pending',
    addCard: 'Add Card',
    addList: 'Add List',
    search: 'Search tasks...',
    
    // Task Modal
    taskDetails: 'Task Details',
    description: 'Description',
    dueDate: 'Due Date',
    assignTo: 'Assign To',
    labels: 'Labels',
    checklist: 'Checklist',
    addChecklistItem: 'Add Checklist Item',
    deleteTask: 'Delete Task',
    confirmChanges: 'Confirm Changes',
    
    // Settings
    accountSettings: 'Account Settings',
    manageProfilePreferencesSecurity: 'Manage your profile, preferences, and security.',
    profile: 'User Profile',
    name: 'Full Name',
    email: 'Email Address',
    generalSettings: 'General Settings',
    theme: 'Theme',
    language: 'Language',
    notifications: 'Notifications',
    preferences: 'Preferences',
    about: 'About Fivopay Workspace',
    logout: 'Logout',
    deleteAccount: 'Delete Account',
    save: 'Save Changes',
    
    // Analytics
    employeePerformance: 'Employee Performance',
    weeklyProductivity: 'Weekly Productivity',
    taskStatus: 'Task Status',
    completionRate: 'Completion Rate',
    
    // Common
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    close: 'Close',
    loading: 'Loading...',
    
    // Notifications
    notifications: 'Notifications',
    noNotifications: 'No notifications',
    allCaughtUp: "You're all caught up!",
    markAllRead: 'Mark all read',
    unread: 'unread',
    newTaskAssigned: 'New Task Assigned',
    dueToday: 'Due Today',
    dueTomorrow: 'Due Tomorrow',
    taskOverdue: 'Task Overdue',
    taskCompleted: 'Task Completed',
    urgent: 'urgent',
    high: 'high',
    normal: 'normal',
    low: 'low',
    justNow: 'Just now',
  },
  
  mr: {
    // Navigation
    dashboard: 'डॅशबोर्ड',
    planner: 'प्लॅनर',
    analytics: 'विश्लेषण',
    settings: 'सेटिंग्ज',
    
    // Dashboard
    totalTasks: 'एकूण कार्ये',
    completed: 'पूर्ण झालेले',
    pending: 'प्रलंबित',
    addCard: 'कार्ड जोडा',
    addList: 'सूची जोडा',
    search: 'कार्ये शोधा...',
    
    // Task Modal
    taskDetails: 'कार्य तपशील',
    description: 'वर्णन',
    dueDate: 'अंतिम तारीख',
    assignTo: 'नेमणूक करा',
    labels: 'लेबल्स',
    checklist: 'तपासणी यादी',
    addChecklistItem: 'तपासणी आयटम जोडा',
    deleteTask: 'कार्य हटवा',
    confirmChanges: 'बदलांची पुष्टी करा',
    
    // Settings
    accountSettings: 'खाते सेटिंग्ज',
    manageProfilePreferencesSecurity: 'तुमचे प्रोफाइल, प्राधान्ये आणि सुरक्षा व्यवस्थापित करा.',
    profile: 'वापरकर्ता प्रोफाइल',
    name: 'पूर्ण नाव',
    email: 'ईमेल पत्ता',
    generalSettings: 'सामान्य सेटिंग्ज',
    theme: 'थीम',
    language: 'भाषा',
    notifications: 'सूचना',
    preferences: 'प्राधान्ये',
    about: 'Fivopay Workspace बद्दल',
    logout: 'बाहेर पडा',
    deleteAccount: 'खाते हटवा',
    save: 'बदल जतन करा',
    
    // Analytics
    employeePerformance: 'कर्मचारी कामगिरी',
    weeklyProductivity: 'साप्ताहिक उत्पादकता',
    taskStatus: 'कार्य स्थिती',
    completionRate: 'पूर्णत्व दर',
    
    // Common
    cancel: 'रद्द करा',
    delete: 'हटवा',
    edit: 'संपादित करा',
    close: 'बंद करा',
    loading: 'लोड होत आहे...',
    
    // Notifications
    notifications: 'सूचना',
    noNotifications: 'कोणत्याही सूचना नाहीत',
    allCaughtUp: 'तुम्ही सर्व अद्ययावत आहात!',
    markAllRead: 'सर्व वाचलेले मार्क करा',
    unread: 'न वाचलेले',
    newTaskAssigned: 'नवीन कार्य नियुक्त',
    dueToday: 'आज अंतिम मुदत',
    dueTomorrow: 'उद्याच अंतिम मुदत',
    taskOverdue: 'कार्य मुदत संपलेले',
    taskCompleted: 'कार्य पूर्ण झाले',
    urgent: 'तातडीचे',
    high: 'उच्च',
    normal: 'सामान्य',
    low: 'कमी',
    justNow: 'आत्ताच',
  },
  
  hi: {
    // Navigation
    dashboard: 'डैशबोर्ड',
    planner: 'प्लानर',
    analytics: 'एनालिटिक्स',
    settings: 'सेटिंग्स',
    
    // Dashboard
    totalTasks: 'कुल कार्य',
    completed: 'पूरा हुआ',
    pending: 'लंबित',
    addCard: 'कार्ड जोड़ें',
    addList: 'सूची जोड़ें',
    search: 'कार्य खोजें...',
    
    // Task Modal
    taskDetails: 'कार्य विवरण',
    description: 'विवरण',
    dueDate: 'नियत तारीख',
    assignTo: 'सौंपें',
    labels: 'लेबल',
    checklist: 'चेकलिस्ट',
    addChecklistItem: 'चेकलिस्ट आइटम जोड़ें',
    deleteTask: 'कार्य हटाएं',
    confirmChanges: 'परिवर्तन की पुष्टि करें',
    
    // Settings
    accountSettings: 'अकाउंट सेटिंग्स',
    manageProfilePreferencesSecurity: 'अपना प्रोफाइल, प्राथमिकताएं और सुरक्षा प्रबंधित करें।',
    profile: 'यूजर प्रोफाइल',
    name: 'पूरा नाम',
    email: 'ईमेल पता',
    generalSettings: 'सामान्य सेटिंग्स',
    theme: 'थीम',
    language: 'भाषा',
    notifications: 'सूचनाएं',
    preferences: 'प्राथमिकताएं',
    about: 'Fivopay Workspace के बारे में',
    logout: 'लॉगआउट',
    deleteAccount: 'अकाउंट हटाएं',
    save: 'परिवर्तन सहेजें',
    
    // Analytics
    employeePerformance: 'कर्मचारी प्रदर्शन',
    weeklyProductivity: 'साप्ताहिक उत्पादकता',
    taskStatus: 'कार्य स्थिति',
    completionRate: 'पूर्णता दर',
    
    // Common
    cancel: 'रद्द करें',
    delete: 'हटाएं',
    edit: 'संपादित करें',
    close: 'बंद करें',
    loading: 'लोड हो रहा है...',
    
    // Notifications
    notifications: 'सूचनाएं',
    noNotifications: 'कोई सूचनाएं नहीं',
    allCaughtUp: 'आप सभी अपडेट हैं!',
    markAllRead: 'सभी को पढ़ा हुआ मार्क करें',
    unread: 'न पढ़े हुए',
    newTaskAssigned: 'नया कार्य सौंपा गया',
    dueToday: 'आज नियत तिथि',
    dueTomorrow: 'कल नियत तिथि',
    taskOverdue: 'कार्य की नियत तिथि बीत गई',
    taskCompleted: 'कार्य पूरा हुआ',
    urgent: 'अति तातड़ी',
    high: 'उच्च',
    normal: 'सामान्य',
    low: 'कम',
    justNow: 'अभी-अभी',
  }
};

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(localStorage.getItem('fivopay_language') || 'en');
  
  useEffect(() => {
    localStorage.setItem('fivopay_language', language);
  }, [language]);
  
  const t = (key) => {
    return translations[language]?.[key] || translations['en']?.[key] || key;
  };
  
  const changeLanguage = (lang) => {
    setLanguage(lang);
  };
  
  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export default LanguageContext;
