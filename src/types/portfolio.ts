export type ProjectCategory = 'film' | 'ai-video' | 'photography' | 'design-interactive';

export interface Project {
  slug: string;
  title: string;
  category: ProjectCategory;
  year: string;
  client: string;
  roles: string[];
  featured: boolean;
  order: number;
  poster: string;
  previewSrc: string;
  fullSrc: string;
  fallbackSrc?: string;
  aspectRatio: `${number}/${number}`;
}

export interface SiteProfile {
  name: string;
  latinName: string;
  positioning: string;
  bio: string;
  portrait: string;
  email: string;
  wechatQr: string;
}

export interface FluidEffectConfig {
  colors: [string, string, string];
  intensity: number;
  enabledRegions: Array<'intro' | 'hero' | 'menu'>;
  fallback: 'static-gradient' | 'solid';
}
