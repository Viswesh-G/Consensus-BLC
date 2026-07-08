import fs from 'fs';
import path from 'path';
import yaml from 'yaml';

export interface OverviewStat {
  value: string;
  label: string;
  detail: string;
}

export interface TradeoffDetail {
  score: number; // 0–10
  why: string;
}

export interface AlgorithmTradeoffs {
  decentralization: TradeoffDetail;
  immutability: TradeoffDetail;
  transparency: TradeoffDetail;
  security: TradeoffDetail;
}

export interface AlgorithmEntry {
  slug: string;
  name: string;
  category: string;
  icon: string;
  shortTagline: string;
  /** Short text shown on hover in the card grid */
  hoverDescription: string;
  /** Full detailed explanation shown on the algorithm detail page */
  detailDescription: string;
  adopters: string;
  layer1Coins: string;
  layer2Coins: string;
  tradeoffs: AlgorithmTradeoffs;
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
    coinsHeading: string;
    tradeoffsHeading: string;
    exploreMoreHeading: string;
  };
  algorithms: AlgorithmEntry[];
}

export function getContent(): SiteContent {
  const filePath = path.join(process.cwd(), 'content.yml');
  const fileContents = fs.readFileSync(filePath, 'utf8');
  return yaml.parse(fileContents) as SiteContent;
}

// Keep a helper for algorithms specifically to easily replace algorithmsData imports
export function getAlgorithms(): AlgorithmEntry[] {
  return getContent().algorithms;
}
