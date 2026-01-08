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
  'common.exportCsv': { en: 'Export CSV', he: 'ייצוא CSV' },
  'common.filter': { en: 'Filter', he: 'סינון' },
  'common.reset': { en: 'Reset', he: 'איפוס' },
  'common.device': { en: 'Device', he: 'התקן' },
  'common.status': { en: 'Status', he: 'סטטוס' },
  'common.dateRange': { en: 'Date Range', he: 'טווח תאריכים' },
  'common.from': { en: 'From', he: 'מתאריך' },
  'common.to': { en: 'To', he: 'עד תאריך' },
  'common.actions': { en: 'Actions', he: 'פעולות' },
  'common.reason': { en: 'Reason', he: 'סיבה' },
  'common.showing': { en: 'Showing', he: 'מוצגים' },
  'common.of': { en: 'of', he: 'מתוך' },

  // Relative Time
  'time.inDays': { en: 'In {days} days', he: 'בעוד {days} ימים' },
  'time.tomorrow': { en: 'Tomorrow', he: 'מחר' },
  'time.yesterday': { en: 'Yesterday', he: 'אתמול' },
  'time.today': { en: 'Today', he: 'היום' },
  'time.daysAgo': { en: '{days} days ago', he: 'לפני {days} ימים' },

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
  'header.title': { en: 'NOC Shift Handover', he: 'מסירת משמרת NOC' },
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
  'admin.title': { en: 'Management Panel', he: 'פאנל ניהול' },
  'admin.subtitle': { en: 'Manage users, roles and teams', he: 'ניהול משתמשים, תפקידים וצוותים' },
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
  'admin.teamCreated': { en: 'Team created successfully', he: 'הצוות נוצר בהצלחה' },
  'admin.you': { en: '(You)', he: '(אתה)' },
  'admin.roleChangeConfirmDesc': { en: 'Are you sure you want to change {name}\'s role from {oldRole} to {newRole}? This change will take effect immediately.', he: 'האם לשנות את התפקיד של {name} מ{oldRole} ל{newRole}? השינוי ייכנס לתוקף מיידית.' },
  'admin.roleUpdated': { en: 'User role updated to {role}', he: 'תפקיד המשתמש עודכן ל{role}' },
  'admin.cannotRemoveOwnRole': { en: 'You cannot remove your own admin role', he: 'לא ניתן להסיר את תפקיד המנהל שלך' },
  'admin.enterTeamName': { en: 'Enter team name', he: 'הזנת שם צוות' },
  'admin.teamExists': { en: 'Team name already exists', he: 'שם הצוות כבר קיים' },
  'admin.editTeamName': { en: 'Edit Team Name', he: 'עריכת שם צוות' },
  'admin.changeUserPassword': { en: 'Change User Password', he: 'שינוי סיסמה למשתמש' },
  'admin.newPassword': { en: 'New Password', he: 'סיסמה חדשה' },
  'admin.update': { en: 'Update', he: 'עדכון' },
  'admin.saveChanges': { en: 'Save Changes', he: 'שמירת שינויים' },
  'admin.passwordResetSuccess': { en: 'Password updated for {name}', he: 'הסיסמה עודכנה עבור {name}' },
  'admin.teamUpdateSuccess': { en: 'Team name updated successfully', he: 'שם הצוות עודכן בהצלחה' },
  'admin.enterNewPassword': { en: 'Enter new password', he: 'הזנת סיסמה חדשה' },
  'admin.enterNewTeamName': { en: 'Enter new team name', he: 'הזנת שם צוות חדש' },
  'admin.resetPassword': { en: 'Reset Password', he: 'איפוס סיסמה' },
  'admin.confirmPasswordReset': { en: 'Reset password for {name}?', he: 'לאפס סיסמה עבור {name}?' },
  'admin.confirmPasswordResetDesc': { en: 'This will set a new password for the user. They will need to use this new password to log in.', he: 'פעולה זו תגדיר סיסמה חדשה למשתמש. הוא יצטרך להשתמש בסיסמה החדשה כדי להתחבר.' },

  // Tabs / Navigation
  'tabs.alerts': { en: 'Paused Alerts', he: 'התראות מושהות' },
  'tabs.messages': { en: 'Important Messages', he: 'הודעות חשובות' },
  'tabs.statistics': { en: 'Statistics', he: 'סטטיסטיקות' },
  'tabs.archive': { en: 'Archive', he: 'ארכיון' },
  'tabs.logs': { en: 'Activity Log', he: 'יומן פעילות' },

  // Status
  'status.active': { en: 'Active', he: 'פעיל' },
  'status.pending': { en: 'Pending', he: 'ממתין לאישור' },
  'status.expired': { en: 'Expired', he: 'פג תוקף' },
  'status.deleted': { en: 'Deleted', he: 'נמחק' },
  'status.archived': { en: 'Archived', he: 'בארכיון' },
  'status.merged': { en: 'Merged', he: 'מוזג' },
  'status.unknown': { en: 'Unknown', he: 'לא ידוע' },

  // Alerts Table
  'alerts.actions': { en: 'Actions', he: 'פעולות' },
  'alerts.ignoreUntil': { en: 'Ignore Until', he: 'התעלמות עד' },
  'alerts.notes': { en: 'Notes', he: 'הערות' },
  'alerts.summary': { en: 'Alert Content', he: 'תוכן ההתרעה' },
  'alerts.team': { en: 'Team', he: 'צוות' },
  'alerts.system': { en: 'System', he: 'מערכת' },
  'alerts.instructionGivenBy': { en: 'Instruction Given By', he: 'נותן ההנחיה' },
  'alerts.reviewNow': { en: 'Review Now', he: 'לבדיקה' },
  'alerts.activeAlerts': { en: 'Active Alerts', he: 'התראות פעילות' },
  'alerts.addAlert': { en: 'Add Ignore', he: 'הוספת השהיה' },
  'alerts.addNewAlert': { en: 'Add New Alert', he: 'הוספת התראה חדשה' },
  'alerts.additionalAlerts': { en: 'Additional Alerts', he: 'התראות נוספות' },
  'alerts.deleteAlert': { en: 'Delete Alert', he: 'מחיקת התראה' },
  'alerts.deleteConfirm': { en: 'Are you sure you want to delete this alert? It will be moved to the archive.', he: 'האם למחוק התראה זו? היא תועבר לארכיון.' },
  'alerts.viewDetails': { en: 'View Details', he: 'צפייה בפרטים' },
  'alerts.alertDetails': { en: 'Alert Details', he: 'פרטי התראה' },
  'alerts.addedBy': { en: 'Added By', he: 'נוסף על ידי' },
  'alerts.created': { en: 'Created', he: 'נוצר בתאריך' },
  'alerts.expiringSoon': { en: 'Expiring Soon', he: 'פג תוקף בקרוב' },
  'alerts.critical': { en: 'Critical', he: 'קריטי' },
  'alerts.pendingApproval': { en: 'Pending Approvals', he: 'לבדיקה' },
  'alerts.noNotes': { en: 'No notes', he: 'אין הערות' },
  'alerts.noAlerts': { en: 'No paused alerts found', he: 'לא נמצאו התראות מושהות' },
  'alerts.editAlert': { en: 'Edit Alert', he: 'עריכת התראה' },
  'alerts.archived': { en: 'Archived', he: 'בארכיון' },
  'alerts.approve': { en: 'Approve', he: 'אישור' },
  'alerts.reject': { en: 'Reject', he: 'דחייה' },
  'alerts.approved': { en: 'Approved', he: 'אושר' },
  'alerts.rejected': { en: 'Rejected', he: 'נדחה' },
  'alerts.pendingReview': { en: 'Pending Review', he: 'ממתין לאישור' },
  'alerts.approveConfirm': { en: 'Approve this alert?', he: 'לאשר התראה זו?' },
  'alerts.rejectConfirm': { en: 'Reject this alert?', he: 'לדחות התראה זו?' },
  'alerts.approveConfirmDesc': { en: 'This alert will become active and appear in the main alerts list.', he: 'התראה זו תהפוך לפעילה ותופיע ברשימת ההתראות הראשית.' },
  'alerts.rejectConfirmDesc': { en: 'This alert will be archived and removed from the pending list.', he: 'התראה זו תועבר לארכיון ותוסר מרשימת הממתינות.' },
  'alerts.alertApproved': { en: 'Alert approved and activated', he: 'ההתראה אושרה והופעלה' },
  'alerts.alertRejected': { en: 'Alert rejected and archived', he: 'ההתראה נדחתה והועברה לארכיון' },
  'alerts.durationOver48h': { en: 'Duration over 48h', he: 'משך מעל 48 שעות' },
  'alerts.weekendException': { en: 'Weekend rule', he: 'נוהל סופ"ש' },
  'alerts.awaitingApproval': { en: 'Exception ignores awaiting your approval', he: 'התעלמויות חריגות הממתינות לאישורך' },

  // Filters
  'filter.allTeams': { en: 'All Teams', he: 'כל הצוותים' },
  'filter.allSystems': { en: 'All Systems', he: 'כל המערכות' },
  'filter.allStatuses': { en: 'All Statuses', he: 'כל הסטטוסים' },
  'filter.clearFilters': { en: 'Clear Filters', he: 'איפוס סינון' },
  'filter.searchPlaceholder': { en: 'Search alerts...', he: 'חיפוש התראות...' },
  'filter.searchArchive': { en: 'Search archive...', he: 'חיפוש בארכיון...' },
  'filter.searchLogs': { en: 'Search logs...', he: 'חיפוש ביומן...' },
  'filter.allFields': { en: 'All Fields', he: 'כל השדות' },

  // Messages
  'messages.newMessage': { en: 'New Message', he: 'הודעה חדשה' },
  'messages.pinnedMessages': { en: 'Pinned Messages', he: 'הודעות נעוצות' },
  'messages.allMessages': { en: 'All Messages', he: 'כל ההודעות' },
  'messages.noMessages': { en: 'No messages found', he: 'לא נמצאו הודעות' },
  'messages.readMore': { en: 'Read More', he: 'קריאה נוספת' },
  'messages.pin': { en: 'Pin', he: 'נעיצה' },
  'messages.unpin': { en: 'Unpin', he: 'ביטול נעיצה' },

  // Archive
  'archive.noAlerts': { en: 'No archived alerts found matching your filters', he: 'לא נמצאו התראות בארכיון התואמות את הסינון' },
  'archive.retentionNote': { en: 'Data retained for compliance and audit purposes', he: 'הנתונים נשמרים למטרות תאימות וביקורת' },
  'archive.archivedRecords': { en: 'archived records', he: 'רשומות בארכיון' },
  'archive.exportedRecords': { en: 'Exported {count} records to CSV', he: 'יוצאו {count} רשומות לקובץ CSV' },
  'archive.addToArchive': { en: 'Add Alert to Archive', he: 'הוספת התראה לארכיון' },
  'archive.secondaryArchive': { en: 'Additional Archive', he: 'ארכיון נוסף' },

  // Logs
  'logs.title': { en: 'Change Logs', he: 'יומן שינויים' },
  'logs.description': { en: 'Track all modifications made to alerts for auditing purposes', he: 'מעקב אחר כל השינויים שבוצעו בהתראות למטרות ביקורת' },
  'logs.changedBy': { en: 'Changed By', he: 'שונה על ידי' },
  'logs.changedAt': { en: 'Changed At', he: 'זמן שינוי' },
  'logs.alertId': { en: 'Alert ID', he: 'מזהה התראה' },
  'logs.field': { en: 'Field', he: 'שדה' },
  'logs.oldValue': { en: 'Old Value', he: 'ערך קודם' },
  'logs.newValue': { en: 'New Value', he: 'ערך חדש' },
  'logs.noLogs': { en: 'No change logs recorded yet', he: 'טרם נרשמו שינויים ביומן' },
  'logs.noMatch': { en: 'No log entries match your filters', he: 'לא נמצאו רשומות התואמות את הסינון' },
  'logs.logEntries': { en: 'log entries', he: 'רשומות יומן' },
  'logs.exportedLogs': { en: 'Exported {count} log entries to CSV', he: 'יוצאו {count} רשומות יומן לקובץ CSV' },
  'logs.empty': { en: '(empty)', he: '(ריק)' },

  // Statistics
  'stats.totalActiveIgnores': { en: 'Total Active Ignores', he: 'סה"כ השהיות פעילות' },
  'stats.currentCount': { en: 'Current count', he: 'ספירה נוכחית' },
  'stats.createdToday': { en: 'Created Today', he: 'נוצרו היום' },
  'stats.rolling24h': { en: 'Rolling 24h', he: '24 שעות אחרונות' },
  'stats.expiringSoon': { en: 'Expiring Soon', he: 'פג תוקף בקרוב' },
  'stats.within6Hours': { en: 'Within 6 hours', he: 'בתוך 6 שעות' },
  'stats.totalArchived': { en: 'Total Archived', he: 'סה"כ בארכיון' },
  'stats.allTime': { en: 'All time', he: 'כל הזמנים' },
  'stats.vsLastWeek': { en: 'vs last week', he: 'מול שבוע שעבר' },
  'stats.topRecurring': { en: 'Top Recurring Alerts', he: 'התראות חוזרות מובילות' },
  'stats.ignores': { en: 'ignores', he: 'השהיות' },
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
