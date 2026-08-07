export interface LinkItem {
  label: string;
  href: string;
  description?: string;
}

export interface LinkCategory {
  name: string;
  items: LinkItem[];
}
