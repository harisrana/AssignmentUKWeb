export interface ExpertWriter {
  name: string;
  credential: string;
  avatarUrl: string;
  tags: string[];
  ordersDone: string;
  successRate: string;
}

export interface Guarantee {
  icon: string;
  title: string;
  description: string;
}

export interface Stat {
  icon: string;
  value: string;
  label: string;
}

export interface WhyUsItem {
  icon: string;
  title: string;
  description: string;
}

export interface Faq {
  question: string;
  answer: string;
  open: boolean;
}
