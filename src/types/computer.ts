export interface Spec {
  label: string;
  value: string;
}

export interface Computer {
  id: string;
  name: string;
  os: string;
  role: string;
  color: string; // accent color for the card
  specs: Spec[];
}
