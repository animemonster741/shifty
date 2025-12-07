export type AlertStatus = 'active' | 'pending' | 'expired' | 'deleted';

export interface IgnoredAlert {
  id: string;
  addedBy: string;
  addedByName: string;
  createdTime: Date;
  team: string;
  system: string;
  deviceName: string;
  summary: string;
  fullAlertPaste?: string;
  instructionGivenBy: string;
  ignoreUntil: Date;
  notes?: string;
  status: AlertStatus;
  modifiedBy?: string;
  modifiedTime?: Date;
  archivedTime?: Date;
  archiveReason?: string;
  approvedBy?: string;
  approvalTime?: Date;
  commentCount: number;
}

export interface ImportantMessage {
  id: string;
  title: string;
  content: string;
  addedBy: string;
  addedByName: string;
  createdTime: Date;
  attachmentUrl?: string;
  attachmentFilename?: string;
  attachmentType?: string;
  pinned: boolean;
  pinnedBy?: string;
  pinnedTime?: Date;
  modifiedBy?: string;
  modifiedTime?: Date;
  commentCount: number;
}

export interface Comment {
  id: string;
  parentId: string;
  parentType: 'alert' | 'message';
  text: string;
  addedBy: string;
  addedByName: string;
  createdTime: Date;
}

export interface TabNotification {
  alerts: boolean;
  messages: boolean;
  statistics: boolean;
  archive: boolean;
}

export type Team = 
  | 'Network Operations'
  | 'Security Operations'
  | 'Infrastructure'
  | 'Cloud Services'
  | 'Application Support'
  | 'Database Operations';

export const TEAMS: Team[] = [
  'Network Operations',
  'Security Operations',
  'Infrastructure',
  'Cloud Services',
  'Application Support',
  'Database Operations',
];

export const QUICK_DURATIONS = [
  { label: '1 hour', hours: 1 },
  { label: '4 hours', hours: 4 },
  { label: '8 hours', hours: 8 },
  { label: '24 hours', hours: 24 },
  { label: '48 hours', hours: 48 },
  { label: '72 hours', hours: 72 },
] as const;
