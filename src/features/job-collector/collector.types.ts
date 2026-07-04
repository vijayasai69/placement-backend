export interface RawJob {
  title?: string;
  company?: string;
  location?: string;
  description?: string;
  applyLink?: string;
  applicationDeadline?: string | Date;
  source: string;
  sourceUrl?: string;
  scrapedAt: Date;
}

export interface ValidatedJob {
  title: string;
  company: string;
  location: string;
  description: string;
  requiredSkills: string[];
  applyLink: string;
  applicationDeadline: Date;
  source: string;
  sourceUrl?: string;
  scrapedAt: Date;
  isActive: boolean;
  lastFetchedAt: Date;
}
