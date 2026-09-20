export type TagColor = 'amber' | 'cyan' | 'green' | 'purple' | 'red' | 'default';

export interface Tag {
  label: string;
  color: TagColor;
}
