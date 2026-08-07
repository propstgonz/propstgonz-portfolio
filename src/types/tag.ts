/**
 * Color coding for tag pills across the site. Keep this consistent
 * wherever tags are used — don't invent new meanings per component.
 *
 *  - amber   → identity / who I am (role, student status)
 *  - cyan    → location / language (where I am, what language something's in)
 *  - green   → status / availability (things that are live, working, open)
 *  - purple  → reserved for future use (e.g. project category tags)
 *  - red     → reserved for warnings / deprecated things
 *  - default → neutral, no particular meaning
 */
export type TagColor = 'amber' | 'cyan' | 'green' | 'purple' | 'red' | 'default';

export interface Tag {
  label: string;
  color: TagColor;
}
