export type AlertStatus = 'active' | 'pending' | 'expired' | 'deleted';

export interface AlertChangeLog {
  id: string;
  alertId: string;
  changedBy: string;
  changedByName: string;
  changedAt: Date;
  fieldName: string;
  oldValue: string;
  newValue: string;
}

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
  modifiedByName?: string;
  modifiedTime?: Date;
  archivedTime?: Date;
  archiveReason?: string;
  approvedBy?: string;
  approvalTime?: Date;
  commentCount: number;
  changeLogs?: AlertChangeLog[];
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
  logs: boolean;
}

export interface AlertFilters {
  searchQuery: string;
  team: string;
  system: string;
  status: AlertStatus | 'all';
  dateFrom: string;
  dateTo: string;
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

export const SYSTEMS = [
  'Core Router',
  'Firewall Cluster',
  'AWS EC2',
  'Storage Array',
  'PostgreSQL',
  'Load Balancer',
  'DNS',
  'IDS/IPS',
  'Hypervisor',
] as const;

export const QUICK_DURATIONS = [
  { label: '1 hour', hours: 1 },
  { label: '4 hours', hours: 4 },
  { label: '8 hours', hours: 8 },
  { label: '24 hours', hours: 24 },
  { label: '48 hours', hours: 48 },
  { label: '72 hours', hours: 72 },
] as const;

export interface ShiftPreset {
  id: 'morning' | 'evening' | 'night';
  labelHe: string;
  labelEn: string;
  hour: number;
  minute: number;
}

export const SHIFT_PRESETS: ShiftPreset[] = [
  { id: 'morning', labelHe: 'בוקר (08:00)', labelEn: 'Morning (08:00)', hour: 8, minute: 0 },
  { id: 'evening', labelHe: 'ערב (15:00)', labelEn: 'Evening (15:00)', hour: 15, minute: 0 },
  { id: 'night', labelHe: 'לילה (23:00)', labelEn: 'Night (23:00)', hour: 23, minute: 0 },
];

export const COMMON_HOURS = [
  { label: '00:00', hour: 0, minute: 0 },
  { label: '04:00', hour: 4, minute: 0 },
  { label: '07:00', hour: 7, minute: 0 },
  { label: '08:00', hour: 8, minute: 0 },
  { label: '12:00', hour: 12, minute: 0 },
  { label: '15:00', hour: 15, minute: 0 },
  { label: '19:00', hour: 19, minute: 0 },
  { label: '23:00', hour: 23, minute: 0 },
];
