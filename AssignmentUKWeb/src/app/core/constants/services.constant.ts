export interface ServiceItem {
  slug: string;
  title: string;
  icon: string;
  summary: string;
}

/** Catalogue of academic services — shared by the nav dropdown & Services page. */
export const SERVICES: ServiceItem[] = [
  { slug: 'cipd', title: 'CIPD Assignments', icon: 'workspace_premium', summary: 'Levels 3, 5 & 7 HR and L&D assignments by CIPD-qualified experts.' },
  { slug: 'hnd', title: 'HND Assignments', icon: 'school', summary: 'Pearson BTEC HND coursework across business, health and computing.' },
  { slug: 'law', title: 'Law Assignments', icon: 'gavel', summary: 'Case analysis, legal research and dissertations from LLB/LLM writers.' },
  { slug: 'nursing', title: 'Nursing & Healthcare', icon: 'health_and_safety', summary: 'Care plans, reflective essays and evidence-based practice papers.' },
  { slug: 'business', title: 'Business & Management', icon: 'trending_up', summary: 'Strategy, marketing, accounting and MBA-level projects.' },
  { slug: 'essays', title: 'University Essays', icon: 'edit_note', summary: 'Custom essays with impeccable structure, referencing and originality.' },
  { slug: 'dissertation', title: 'Dissertation Writing', icon: 'menu_book', summary: 'End-to-end dissertation support from proposal to final submission.' },
];
