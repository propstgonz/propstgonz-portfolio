export type TagColor = 'amber' | 'cyan' | 'green' | 'purple' | 'red' | 'default';

export interface Tag {
  label: string;
  color: TagColor;
}

export const tags: Tag[] = [
  { label: 'IT student',   color: 'amber'   },
  { label: 'Galicia, ES',  color: 'cyan'    },
  { label: 'self-hosted',  color: 'green'   },
  { label: 'linux',        color: 'default' },
];
