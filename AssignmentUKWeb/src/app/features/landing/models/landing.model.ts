export interface ExpertWriter {
  name: string;
  credential: string;
  avatarUrl: string;
  tags: string[];
  ordersDone: string;
  successRate: string;
}

export interface ProcessStep {
  icon: string;
  title: string;
  description: string;
  accent: boolean;
}

export interface Guarantee {
  icon: string;
  title: string;
  description: string;
}

export interface Faq {
  question: string;
  answer: string;
  open: boolean;
}
