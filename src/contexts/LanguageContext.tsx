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
  'common.save': { en: 'Save', he: 'שמירה' },
  'common.cancel': { en: 'Cancel', he: 'ביטול' },
  'common.delete': { en: 'Delete', he: 'מחיקה' },
  'common.edit': { en: 'Edit', he: 'עריכה' },
  'common.add': { en: 'Add', he: 'הוספה' },
  'common.search': { en: 'Search', he: 'חיפוש' },
  'common.close': { en: 'Close', he: 'סגירה' },
  'common.confirm': { en: 'Confirm', he: 'אישור' },
  'common.back': { en: 'Back', he: 'חזרה' },
  'common.settings': { en: 'Settings', he: 'הגדרות' },
  'common.noData': { en: 'No data found', he: 'לא נמצאו נתונים' },
  'common.export': { en: 'Export', he: 'ייצוא' },
  'common.filter': { en: 'Filter', he: 'סינון' },
  'common.reset': { en: 'Reset', he: 'איפוס' },
  'common.device': { en: 'Device', he: 'התקן' },
  'common.status': { en: 'Status', he: 'סטטוס' },
  'common.dateRange': { en: 'Date Range', he: 'טווח תאריכים' },
  'common.from': { en: 'From', he: 'מתאריך' },
  'common.to': { en: 'To', he: 'עד תאריך' },

  // Auth
  'auth.signIn': { en: 'Sign In', he: 'התחברות' },
  'auth.signOut': { en: 'Sign Out', he: 'התנתקות' },
  'auth.employeeId': { en: 'Employee ID', he: 'מספר עובד' },
  'auth.password': { en: 'Password', he: 'סיסמה' },
  'auth.enterEmployeeId': { en: 'Enter your Employee ID', he: 'הזנת מספר עובד' },
  'auth.enterPassword': { en: 'Enter your password', he: 'הזנת סיסמה' },
  'auth.signingIn': { en: 'Signing in...', he: 'מתחבר...' },
  'auth.accessDashboard': { en: 'Sign in to access the dashboard', he: 'התחברות לגישה ללוח הבקרה' },
  'auth.logoutConfirm': { en: 'Are you sure you want to logout?', he: 'האם להתנתק?' },

  // Header
  'header.title': { en: 'NOC Handover', he: 'מסירת משמרת NOC' },
  'header.subtitle': { en: 'Shift Management System', he: 'מערכת ניהול משמרות' },
  'header.admin': { en: 'Admin', he: 'ניהול' },
  'header.adminPanel': { en: 'Admin Panel', he: 'פאנל ניהול' },
  'header.logout': { en: 'Logout', he: 'התנתקות' },

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
  'admin.addNewUser': { en: 'Add New User', he: 'הוספת משתמש חדש' },
  'admin.createNewUser': { en: 'Create New User', he: 'יצירת משתמש חדש' },
  'admin.createUserDesc': { en: 'Create a new user account with specified role', he: 'יצירת חשבון משתמש חדש עם תפקיד מוגדר' },
  'admin.fullName': { en: 'Full Name', he: 'שם מלא' },
  'admin.role': { en: 'Role', he: 'תפקיד' },
  'admin.regularUser': { en: 'Regular User', he: 'משתמש רגיל' },
  'admin.admin': { en: 'Admin', he: 'מנהל' },
  'admin.addUser': { en: 'Add User', he: 'הוספת משתמש' },
  'admin.adding': { en: 'Adding...', he: 'מוסיף...' },
  'admin.allUsers': { en: 'All Users', he: 'כל המשתמשים' },
  'admin.manageUsersDesc': { en: 'Manage existing user accounts and permissions', he: 'ניהול חשבונות משתמשים והרשאות קיימים' },
  'admin.currentRole': { en: 'Current Role', he: 'תפקיד נוכחי' },
  'admin.actions': { en: 'Actions', he: 'פעולות' },
  'admin.changeRole': { en: 'Change Role', he: 'שינוי תפקיד' },
  'admin.confirmRoleChange': { en: 'Confirm Role Change', he: 'אישור שינוי תפקיד' },
  'admin.userCreated': { en: 'User created successfully!', he: 'המשתמש נוצר בהצלחה!' },
  'admin.addNewTeam': { en: 'Add New Team', he: 'הוספת צוות חדש' },
  'admin.teamName': { en: 'Team Name', he: 'שם הצוות' },
  'admin.addTeam': { en: 'Add Team', he: 'הוספת צוות' },
  'admin.allTeams': { en: 'All Teams', he: 'כל הצוותים' },
  'admin.noTeams': { en: 'No teams created yet', he: 'עדיין לא נוצרו צוותים' },

  // Tabs / Navigation
  'tabs.alerts': { en: 'Ignored Alerts', he: 'התראות מושהות' },
  'tabs.messages': { en: 'Important Messages', he: 'הודעות חשובות' },
  'tabs.statistics': { en: 'Statistics', he: 'סטטיסטיקות' },
  'tabs.archive': { en: 'Archive', he: 'ארכיון' },
  'tabs.logs': { en: 'Logs', he: 'יומן פעילות' },

  // Status
  'status.active': { en: 'Active', he: 'פעיל' },
  'status.pending': { en: 'Pending', he: 'ממתין לאישור' },
  'status.expired': { en: 'Expired', he: 'פג תוקף' },
  'status.deleted': { en: 'Deleted', he: 'נמחק' },
  'status.archived': { en: 'Archived', he: 'בארכיון' },

  // Alerts Table
  'alerts.actions': { en: 'Actions', he: 'פעולות' },
  'alerts.ignoreUntil': { en: 'Ignore Until', he: 'התעלמות עד' },
  'alerts.notes': { en: 'Notes', he: 'הערות' },
  'alerts.summary': { en: 'Summary', he: 'תוכן ההתרעה' },
  'alerts.team': { en: 'Team', he: 'צוות' },
  'alerts.instructionGivenBy': { en: 'Instruction Given By', he: 'נותן ההנחיה' },
  'alerts.system': { en: 'System', he: 'מערכת' },
  'alerts.reviewNow': { en: 'Review Now', he: 'לבדיקה' },
  'alerts.activeAlerts': { en: 'Active Alerts', he: 'התראות פעילות' },
  'alerts.addAlert': { en: 'Add Alert', he: 'הוספת התראה' },
  'alerts.deleteAlert': { en: 'Delete Alert', he: 'מחיקת התראה' },
  'alerts.deleteConfirm': { en: 'Are you sure you want to delete this alert? It will be moved to the archive.', he: 'האם למחוק התראה זו? היא תועבר לארכיון.' },
  'alerts.viewDetails': { en: 'View Details', he: 'צפייה בפרטים' },
  'alerts.alertDetails': { en: 'Alert Details', he: 'פרטי התראה' },
  'alerts.addedBy': { en: 'Added By', he: 'נוסף על ידי' },
  'alerts.created': { en: 'Created', he: 'נוצר בתאריך' },
  'alerts.expiringSoon': { en: 'Expiring Soon', he: 'פג בקרוב' },
  'alerts.critical': { en: 'Critical', he: 'קריטי' },
  'alerts.pendingApproval': { en: 'Pending Approval', he: 'ממתין לאישור' },
  'alerts.noNotes': { en: 'No notes', he: 'אין הערות' },
  'alerts.noAlerts': { en: 'No ignored alerts found', he: 'לא נמצאו התראות מושהות' },
  'alerts.editAlert': { en: 'Edit Alert', he: 'עריכת התראה' },

  // Filters
  'filter.allTeams': { en: 'All Teams', he: 'כל הצוותים' },
  'filter.allSystems': { en: 'All Systems', he: 'כל המערכות' },
  'filter.allStatuses': { en: 'All Statuses', he: 'כל הסטטוסים' },
  'filter.clearFilters': { en: 'Clear Filters', he: 'איפוס סינון' },
  'filter.searchPlaceholder': { en: 'Search alerts...', he: 'חיפוש התראות...' },

  // Messages
  'messages.newMessage': { en: 'New Message', he: 'הודעה חדשה' },
  'messages.pinnedMessages': { en: 'Pinned Messages', he: 'הודעות נעוצות' },
  'messages.allMessages': { en: 'All Messages', he: 'כל ההודעות' },
  'messages.noMessages': { en: 'No messages found', he: 'לא נמצאו הודעות' },
  'messages.readMore': { en: 'Read More', he: 'קריאה נוספת' },
  'messages.pin': { en: 'Pin', he: 'נעיצה' },
  'messages.unpin': { en: 'Unpin', he: 'ביטול נעיצה' },
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
