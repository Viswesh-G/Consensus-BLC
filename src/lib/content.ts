import fs from 'fs';
import path from 'path';
import yaml from 'yaml';

export interface OverviewStat {
  value: string;
  label: string;
  detail: string;
}

export interface AlgorithmEntry {
  slug: string;
  name: string;
  category: string;
  icon: string;
  shortTagline: string;
  hoverDescription: string;
  adopters: string;
}

export interface SiteContent {
  global: {
    header: string;
  };
  hero: {
    eyebrow: string;
    headlineLine1: string;
    headlineLine2: string;
    subhead: string;
    cta: string;
  };
  overview: {
    trilemmaEyebrow: string;
    trilemmaBody: string;
    stats: OverviewStat[];
  };
  grid: {
    title: string;
    description: string;
    cta: string;
  };
  detailPage: {
    backLink: string;
    placeholderHeading: string;
    placeholderBody: string;
    adoptersHeading: string;
    exploreMoreHeading: string;
  };
  algorithms: AlgorithmEntry[];
}

let cachedContent: SiteContent | null = null;

export function getContent(): SiteContent {
  if (cachedContent) return cachedContent;
  
  const filePath = path.join(process.cwd(), 'content.yml');
  const fileContents = fs.readFileSync(filePath, 'utf8');
  cachedContent = yaml.parse(fileContents) as SiteContent;
  
  return cachedContent;
}

// Keep a helper for algorithms specifically to easily replace algorithmsData imports
export function getAlgorithms(): AlgorithmEntry[] {
  return getContent().algorithms;
}
