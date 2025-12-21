import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'en' | 'he';
export type Direction = 'ltr' | 'rtl';

interface Translations {
  [key: string]: {
    en: string;
    he: string;
  };
}

export const translations: Translations = {
  // Common
  'common.loading': { en: 'Loading...', he: 'טוען...' },
  'common.save': { en: 'Save', he: 'שמור' },
  'common.cancel': { en: 'Cancel', he: 'ביטול' },
  'common.delete': { en: 'Delete', he: 'מחק' },
  'common.edit': { en: 'Edit', he: 'ערוך' },
  'common.add': { en: 'Add', he: 'הוסף' },
  'common.search': { en: 'Search', he: 'חיפוש' },
  'common.close': { en: 'Close', he: 'סגור' },
  'common.confirm': { en: 'Confirm', he: 'אישור' },
  'common.back': { en: 'Back', he: 'חזרה' },
  'common.settings': { en: 'Settings', he: 'הגדרות' },

  // Auth
  'auth.signIn': { en: 'Sign In', he: 'התחברות' },
  'auth.signOut': { en: 'Sign Out', he: 'התנתקות' },
  'auth.employeeId': { en: 'Employee ID', he: 'מספר עובד' },
  'auth.password': { en: 'Password', he: 'סיסמה' },
  'auth.enterEmployeeId': { en: 'Enter your Employee ID', he: 'הזן מספר עובד' },
  'auth.enterPassword': { en: 'Enter your password', he: 'הזן סיסמה' },
  'auth.signingIn': { en: 'Signing in...', he: 'מתחבר...' },
  'auth.accessDashboard': { en: 'Sign in to access the dashboard', he: 'התחבר לגישה ללוח הבקרה' },
  'auth.logoutConfirm': { en: 'Are you sure you want to logout?', he: 'האם אתה בטוח שברצונך להתנתק?' },

  // Header
  'header.title': { en: 'NOC Handover', he: 'מסירת משמרת NOC' },
  'header.subtitle': { en: 'Shift Management System', he: 'מערכת ניהול משמרות' },
  'header.admin': { en: 'Admin', he: 'ניהול' },
  'header.adminPanel': { en: 'Admin Panel', he: 'פאנל ניהול' },
  'header.logout': { en: 'Logout', he: 'התנתק' },

  // Settings
  'settings.title': { en: 'Settings', he: 'הגדרות' },
  'settings.language': { en: 'Language', he: 'שפה' },
  'settings.english': { en: 'English', he: 'אנגלית' },
  'settings.hebrew': { en: 'Hebrew', he: 'עברית' },
  'settings.changePassword': { en: 'Change Password', he: 'שינוי סיסמה' },
  'settings.currentPassword': { en: 'Current Password', he: 'סיסמה נוכחית' },
  'settings.newPassword': { en: 'New Password', he: 'סיסמה חדשה' },
  'settings.confirmPassword': { en: 'Confirm New Password', he: 'אישור סיסמה חדשה' },
  'settings.passwordUpdated': { en: 'Password updated successfully', he: 'הסיסמה עודכנה בהצלחה' },
  'settings.passwordMismatch': { en: 'Passwords do not match', he: 'הסיסמאות אינן תואמות' },
  'settings.passwordMinLength': { en: 'Password must be at least 6 characters', he: 'הסיסמה חייבת להכיל לפחות 6 תווים' },
  'settings.updating': { en: 'Updating...', he: 'מעדכן...' },

  // Admin
  'admin.title': { en: 'Admin Panel', he: 'פאנל ניהול' },
  'admin.subtitle': { en: 'Manage users, roles, and teams', he: 'ניהול משתמשים, תפקידים וצוותים' },
  'admin.userManagement': { en: 'User Management', he: 'ניהול משתמשים' },
  'admin.teamManagement': { en: 'Team Management', he: 'ניהול צוותים' },
  'admin.addNewUser': { en: 'Add New User', he: 'הוסף משתמש חדש' },
  'admin.createUserDesc': { en: 'Create a new user account with specified role', he: 'צור חשבון משתמש חדש עם תפקיד מוגדר' },
  'admin.fullName': { en: 'Full Name', he: 'שם מלא' },
  'admin.role': { en: 'Role', he: 'תפקיד' },
  'admin.regularUser': { en: 'Regular User', he: 'משתמש רגיל' },
  'admin.admin': { en: 'Admin', he: 'מנהל' },
  'admin.addUser': { en: 'Add User', he: 'הוסף משתמש' },
  'admin.adding': { en: 'Adding...', he: 'מוסיף...' },
  'admin.allUsers': { en: 'All Users', he: 'כל המשתמשים' },
  'admin.manageUsersDesc': { en: 'Manage existing user accounts and permissions', he: 'נהל חשבונות משתמשים והרשאות קיימים' },
  'admin.currentRole': { en: 'Current Role', he: 'תפקיד נוכחי' },
  'admin.actions': { en: 'Actions', he: 'פעולות' },
  'admin.changeRole': { en: 'Change Role', he: 'שנה תפקיד' },
  'admin.confirmRoleChange': { en: 'Confirm Role Change', he: 'אשר שינוי תפקיד' },
  'admin.userCreated': { en: 'User created successfully!', he: 'המשתמש נוצר בהצלחה!' },
  'admin.addNewTeam': { en: 'Add New Team', he: 'הוסף צוות חדש' },
  'admin.teamName': { en: 'Team Name', he: 'שם הצוות' },
  'admin.addTeam': { en: 'Add Team', he: 'הוסף צוות' },
  'admin.allTeams': { en: 'All Teams', he: 'כל הצוותים' },
  'admin.noTeams': { en: 'No teams created yet', he: 'עדיין לא נוצרו צוותים' },

  // Tabs
  'tabs.alerts': { en: 'Alerts', he: 'התראות' },
  'tabs.messages': { en: 'Messages', he: 'הודעות' },
  'tabs.statistics': { en: 'Statistics', he: 'סטטיסטיקות' },
  'tabs.archive': { en: 'Archive', he: 'ארכיון' },
  'tabs.logs': { en: 'Logs', he: 'לוגים' },

  // Status
  'status.active': { en: 'Active', he: 'פעיל' },
  'status.pending': { en: 'Pending', he: 'ממתין' },
  'status.expired': { en: 'Expired', he: 'פג תוקף' },
  'status.deleted': { en: 'Deleted', he: 'נמחק' },
};

interface LanguageContextType {
  language: Language;
  direction: Direction;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const stored = localStorage.getItem('language');
    return (stored as Language) || 'en';
  });

  const direction: Direction = language === 'he' ? 'rtl' : 'ltr';

  useEffect(() => {
    localStorage.setItem('language', language);
    document.documentElement.setAttribute('dir', direction);
    document.documentElement.setAttribute('lang', language);
  }, [language, direction]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const t = (key: string): string => {
    const translation = translations[key];
    if (!translation) {
      console.warn(`Missing translation for key: ${key}`);
      return key;
    }
    return translation[language];
  };

  return (
    <LanguageContext.Provider value={{ language, direction, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
