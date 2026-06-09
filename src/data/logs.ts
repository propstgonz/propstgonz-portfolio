export interface LogEntry {
  date: string;
  message: string;
}

export const logs: LogEntry[] = [
  { date: '2025-12-28', message: "I cannot believe how fast time passes..." },
  { date: '2025-11-27', message: "Jenkins auto-rebuild deployed (or so I thought)." },
  { date: '2025-11-24', message: "Added contact form and started the hub page." },
  { date: '2025-11-04', message: "5:49 AM, cannot sleep, creative cunt time!" },
  { date: '2025-10-21', message: "Maybe someday I will update this again. Sure not today." },
  { date: '2025-09-08', message: "I forgot about updating the page, lol." },
  { date: '2025-08-03', message: "Website successfully migrated to Astro." },
  { date: '2025-07-28', message: "Started preparing the migration to Astro." },
  { date: '2025-07-16', message: "Went back to Ubuntu for compatibility with government programs." },
  { date: '2025-07-02', message: "Fixed my mailserver." },
  { date: '2025-06-10', message: "Moved to Arch by the way." },
];

// Number of entries visible before the accordion expands
export const LOGS_VISIBLE = 3;
