import { IgnoredAlert, ImportantMessage, Comment } from '@/types';

const now = new Date();

function hoursFromNow(hours: number): Date {
  return new Date(now.getTime() + hours * 60 * 60 * 1000);
}

function hoursAgo(hours: number): Date {
  return new Date(now.getTime() - hours * 60 * 60 * 1000);
}

export const mockAlerts: IgnoredAlert[] = [
  {
    id: '1',
    addedBy: '2001',
    addedByName: 'Alex Thompson',
    createdTime: hoursAgo(2),
    team: 'Network Operations',
    system: 'Core Router',
    deviceName: 'RTR-CORE-01',
    summary: 'High CPU utilization alert - scheduled maintenance in progress, expected to normalize after patching window',
    instructionGivenBy: 'Sarah Mitchell',
    ignoreUntil: hoursFromNow(4),
    notes: 'Part of scheduled Q4 maintenance window',
    status: 'active',
    commentCount: 2,
  },
  {
    id: '2',
    addedBy: '2002',
    addedByName: 'Jordan Rivera',
    createdTime: hoursAgo(6),
    team: 'Security Operations',
    system: 'Firewall Cluster',
    deviceName: 'FW-SEC-PROD-02',
    summary: 'Connection threshold warning - known behavior during backup operations',
    instructionGivenBy: 'David Chen',
    ignoreUntil: hoursFromNow(0.5),
    status: 'active',
    commentCount: 0,
  },
  {
    id: '3',
    addedBy: '2003',
    addedByName: 'Casey Morgan',
    createdTime: hoursAgo(1),
    team: 'Cloud Services',
    system: 'AWS EC2',
    deviceName: 'prod-api-cluster',
    summary: 'Instance health check failures - auto-scaling replacing instances, no action required',
    instructionGivenBy: 'Sarah Mitchell',
    ignoreUntil: hoursFromNow(2),
    notes: 'Auto-scaling group is handling replacement',
    status: 'active',
    commentCount: 3,
  },
  {
    id: '4',
    addedBy: '2001',
    addedByName: 'Alex Thompson',
    createdTime: hoursAgo(12),
    team: 'Infrastructure',
    system: 'Storage Array',
    deviceName: 'SAN-PROD-01',
    summary: 'Disk latency warnings on array - vendor scheduled for hardware replacement tomorrow',
    instructionGivenBy: 'David Chen',
    ignoreUntil: hoursFromNow(36),
    notes: 'Vendor ticket #VND-2024-8891',
    status: 'active',
    commentCount: 5,
  },
  {
    id: '5',
    addedBy: '2004',
    addedByName: 'Taylor Brooks',
    createdTime: hoursAgo(0.5),
    team: 'Database Operations',
    system: 'PostgreSQL',
    deviceName: 'db-primary-west',
    summary: 'Replication lag detected - investigating root cause',
    instructionGivenBy: 'Sarah Mitchell',
    ignoreUntil: hoursFromNow(1),
    status: 'active',
    commentCount: 1,
  },
  {
    id: '6',
    addedBy: '2002',
    addedByName: 'Jordan Rivera',
    createdTime: hoursAgo(3),
    team: 'Application Support',
    system: 'Load Balancer',
    deviceName: 'LB-APP-PROD-01',
    summary: 'Backend server pool health oscillating - deploying fix in next release window',
    instructionGivenBy: 'David Chen',
    ignoreUntil: hoursFromNow(8),
    notes: 'JIRA ticket APP-4521',
    status: 'active',
    commentCount: 0,
  },
  {
    id: '7',
    addedBy: '2003',
    addedByName: 'Casey Morgan',
    createdTime: hoursAgo(24),
    team: 'Network Operations',
    system: 'DNS',
    deviceName: 'dns-resolver-02',
    summary: 'Query timeout alerts - known issue with upstream provider, escalated',
    instructionGivenBy: 'Sarah Mitchell',
    ignoreUntil: hoursFromNow(96),
    notes: 'Waiting on ISP response, exception approved by management',
    status: 'pending',
    commentCount: 2,
  },
];

export const mockSecondaryAlerts: IgnoredAlert[] = [
  {
    id: 'sec-1',
    addedBy: '2005',
    addedByName: 'Morgan Lee',
    createdTime: hoursAgo(4),
    team: 'Network Operations',
    system: 'Load Balancer',
    deviceName: 'LB-EDGE-01',
    summary: 'SSL certificate expiring soon - renewal scheduled for next week',
    instructionGivenBy: 'David Chen',
    ignoreUntil: hoursFromNow(168),
    notes: 'Certificate renewal ticket #CERT-2024-112',
    status: 'active',
    commentCount: 1,
  },
  {
    id: 'sec-2',
    addedBy: '2006',
    addedByName: 'Jamie Wilson',
    createdTime: hoursAgo(8),
    team: 'Security Operations',
    system: 'IDS/IPS',
    deviceName: 'IDS-DMZ-02',
    summary: 'High volume of blocked connections - ongoing DDoS mitigation',
    instructionGivenBy: 'Sarah Mitchell',
    ignoreUntil: hoursFromNow(12),
    notes: 'DDoS mitigation active, coordinating with ISP',
    status: 'active',
    commentCount: 3,
  },
  {
    id: 'sec-3',
    addedBy: '2007',
    addedByName: 'Riley Parker',
    createdTime: hoursAgo(1),
    team: 'Cloud Services',
    system: 'AWS EC2',
    deviceName: 'staging-web-cluster',
    summary: 'Instance termination alerts - scheduled scale-down for cost optimization',
    instructionGivenBy: 'David Chen',
    ignoreUntil: hoursFromNow(6),
    status: 'active',
    commentCount: 0,
  },
  {
    id: 'sec-4',
    addedBy: '2008',
    addedByName: 'Quinn Adams',
    createdTime: hoursAgo(16),
    team: 'Database Operations',
    system: 'PostgreSQL',
    deviceName: 'db-replica-east',
    summary: 'Checkpoint warnings during bulk data import - expected behavior',
    instructionGivenBy: 'Sarah Mitchell',
    ignoreUntil: hoursFromNow(24),
    notes: 'Monthly data sync from legacy system',
    status: 'pending',
    commentCount: 2,
  },
];

export const mockArchivedAlerts: IgnoredAlert[] = [
  {
    id: 'arch-1',
    addedBy: '2001',
    addedByName: 'Alex Thompson',
    createdTime: hoursAgo(72),
    team: 'Security Operations',
    system: 'IDS/IPS',
    deviceName: 'IDS-CORE-01',
    summary: 'False positive alerts during penetration testing window',
    instructionGivenBy: 'David Chen',
    ignoreUntil: hoursAgo(24),
    notes: 'Pen test completed successfully',
    status: 'expired',
    archivedTime: hoursAgo(24),
    archiveReason: 'Expired',
    commentCount: 4,
  },
  {
    id: 'arch-2',
    addedBy: '2002',
    addedByName: 'Jordan Rivera',
    createdTime: hoursAgo(96),
    team: 'Infrastructure',
    system: 'Hypervisor',
    deviceName: 'ESX-PROD-03',
    summary: 'Memory pressure alerts during VM migration',
    instructionGivenBy: 'Sarah Mitchell',
    ignoreUntil: hoursAgo(48),
    notes: 'Migration completed',
    status: 'expired',
    archivedTime: hoursAgo(48),
    archiveReason: 'Expired',
    commentCount: 1,
  },
];

export const mockSecondaryArchivedAlerts: IgnoredAlert[] = [
  {
    id: 'arch-sec-1',
    addedBy: '2005',
    addedByName: 'Morgan Lee',
    createdTime: hoursAgo(120),
    team: 'Cloud Services',
    system: 'AWS EC2',
    deviceName: 'prod-batch-cluster',
    summary: 'High memory usage during scheduled batch processing',
    instructionGivenBy: 'David Chen',
    ignoreUntil: hoursAgo(72),
    notes: 'Batch job completed successfully',
    status: 'expired',
    archivedTime: hoursAgo(72),
    archiveReason: 'Expired',
    commentCount: 2,
  },
  {
    id: 'arch-sec-2',
    addedBy: '2006',
    addedByName: 'Jamie Wilson',
    createdTime: hoursAgo(168),
    team: 'Network Operations',
    system: 'Switch',
    deviceName: 'SW-DIST-04',
    summary: 'Port flapping alerts - cable replaced',
    instructionGivenBy: 'Sarah Mitchell',
    ignoreUntil: hoursAgo(120),
    notes: 'Hardware issue resolved',
    status: 'deleted',
    archivedTime: hoursAgo(120),
    archiveReason: 'Deleted',
    commentCount: 0,
  },
  {
    id: 'arch-sec-3',
    addedBy: '2007',
    addedByName: 'Riley Parker',
    createdTime: hoursAgo(200),
    team: 'Database Operations',
    system: 'MongoDB',
    deviceName: 'mongo-shard-02',
    summary: 'Replication lag during data center sync',
    instructionGivenBy: 'David Chen',
    ignoreUntil: hoursAgo(150),
    notes: 'Sync completed, lag normalized',
    status: 'expired',
    archivedTime: hoursAgo(150),
    archiveReason: 'Merged',
    commentCount: 3,
  },
];

export const mockMessages: ImportantMessage[] = [
  {
    id: 'msg-1',
    title: 'Emergency Change: Core Router Firmware Update Tonight',
    content: `Team,

We will be performing an emergency firmware update on RTR-CORE-01 and RTR-CORE-02 tonight between 02:00 - 04:00 UTC.

**Impact:**
- Brief traffic failover expected (< 30 seconds)
- All monitoring alerts should be acknowledged during this window

**Contacts:**
- Primary: Sarah Mitchell (x4521)
- Secondary: Network On-Call

Please acknowledge this message by adding a comment below.`,
    addedBy: '1001',
    addedByName: 'Sarah Mitchell',
    createdTime: hoursAgo(1),
    pinned: true,
    pinnedBy: '1001',
    pinnedTime: hoursAgo(1),
    commentCount: 6,
  },
  {
    id: 'msg-2',
    title: 'Reminder: Monthly Maintenance Window - Dec 15th',
    content: `As a reminder, our monthly maintenance window is scheduled for December 15th, 2024 from 00:00 - 06:00 UTC.

**Planned Activities:**
1. Security patches for all production servers
2. Database index optimization
3. Certificate renewal for external APIs

Please ensure all change requests are submitted by Dec 12th for inclusion.`,
    addedBy: '1002',
    addedByName: 'David Chen',
    createdTime: hoursAgo(24),
    pinned: true,
    pinnedBy: '1002',
    pinnedTime: hoursAgo(12),
    commentCount: 3,
  },
  {
    id: 'msg-3',
    title: 'AWS us-east-1 Degraded Performance - Monitoring',
    content: `AWS has reported degraded performance in us-east-1 region affecting EC2 and RDS services.

**Current Status:** Monitoring
**AWS Status Page:** Updated at 14:30 UTC

We are tracking this incident. No customer impact observed yet on our services. Will update as situation develops.`,
    addedBy: '2003',
    addedByName: 'Casey Morgan',
    createdTime: hoursAgo(3),
    pinned: false,
    commentCount: 2,
  },
  {
    id: 'msg-4',
    title: 'New Runbook: Database Failover Procedure',
    content: `A new runbook has been published for database failover procedures. All team members should review before their next shift.

**Document:** DB-RB-2024-003
**Location:** Confluence > Operations > Runbooks

Key changes from previous version:
- Updated connection strings
- New health check endpoints
- Revised rollback procedure`,
    addedBy: '1001',
    addedByName: 'Sarah Mitchell',
    createdTime: hoursAgo(48),
    pinned: false,
    commentCount: 1,
  },
];

export const mockComments: Comment[] = [
  {
    id: 'c1',
    parentId: '1',
    parentType: 'alert',
    text: 'Maintenance started on schedule. CPU at 85%, expected.',
    addedBy: '2001',
    addedByName: 'Alex Thompson',
    createdTime: hoursAgo(1.5),
  },
  {
    id: 'c2',
    parentId: '1',
    parentType: 'alert',
    text: 'CPU dropped to 45% after patch completion. Looking good.',
    addedBy: '2003',
    addedByName: 'Casey Morgan',
    createdTime: hoursAgo(0.5),
  },
  {
    id: 'c3',
    parentId: 'msg-1',
    parentType: 'message',
    text: 'Acknowledged. I will be on standby during the window.',
    addedBy: '2001',
    addedByName: 'Alex Thompson',
    createdTime: hoursAgo(0.8),
  },
];
