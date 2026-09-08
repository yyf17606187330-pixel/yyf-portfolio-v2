import { describe, expect, it } from 'vitest';
import { createProjectMediaDeckItems } from '../features/works/ProjectMediaDeck';
import { resolveMediaUrl } from '../lib/media';
import { aboutContent } from './about';
import { aiVideoCapabilityItems } from './aiVideoCapability';
import { colorGradingWorkGroup } from './colorGradingWorks';
import { experienceContent } from './experience';
import { waterPurifierProject } from './showcase';
import { teaWareProject, teaWareProjectMediaItems } from './teaWareShowcase';
import { waterPurifierMediaDeck } from './waterPurifierMedia';

interface MediaBundle {
  id: string;
  poster: string | null;
  previewSrc: string | null;
  fullSrc?: string | null;
  fallbackSrc?: string;
}

const commercialLinks = [
  { experienceId: 'kuwo', project: waterPurifierProject, mediaItems: waterPurifierMediaDeck },
  { experienceId: 'zhepin', project: teaWareProject, mediaItems: teaWareProjectMediaItems },
] as const;

// Use the same card assembly as the page so the tea primary asset is counted once.
const commercialProjects = commercialLinks.flatMap(({ project, mediaItems }) => (
  createProjectMediaDeckItems(project, '', mediaItems).map((item) => item.project)
));

const mediaBundles: readonly MediaBundle[] = [
  ...commercialProjects.map((project) => ({ id: project.slug, ...project })),
  ...colorGradingWorkGroup.items.map((item) => ({ id: item.slug, ...item })),
  ...aiVideoCapabilityItems,
];

function configuredPaths(bundle: MediaBundle): string[] {
  return [bundle.poster, bundle.previewSrc, bundle.fullSrc, bundle.fallbackSrc]
    .filter((path): path is string => typeof path === 'string' && path.length > 0);
}

describe('content consistency', () => {
  it.each(commercialLinks)('keeps $experienceId project metadata with its owning experience', ({
    experienceId,
    project,
  }) => {
    const entry = experienceContent.experiences.find((experience) => experience.id === experienceId);

    expect(entry).toBeDefined();
    expect(project.year).toBe(entry?.displayPeriod);
    expect([entry?.company, entry?.brand]).toContain(project.client);
  });

  it('keeps exported item identities and full-player media unique', () => {
    const ids = mediaBundles.map((bundle) => bundle.id);
    const fullSources = mediaBundles.flatMap((bundle) => bundle.fullSrc ? [bundle.fullSrc] : []);

    expect(new Set(ids).size).toBe(ids.length);
    expect(new Set(fullSources).size).toBe(fullSources.length);

    for (const project of commercialProjects) {
      expect(project.poster.trim()).not.toBe('');
      expect(project.previewSrc.trim()).not.toBe('');
      expect(project.fullSrc.trim()).not.toBe('');
    }
  });

  it('keeps configured media resolvable and separates previews from full playback', () => {
    const previewSources = new Set(mediaBundles.flatMap((bundle) => (
      bundle.previewSrc ? [bundle.previewSrc] : []
    )));

    for (const bundle of mediaBundles) {
      const paths = configuredPaths(bundle);
      for (const path of paths) {
        expect(resolveMediaUrl(path, '/media/'), `${bundle.id}: ${path}`).not.toBeNull();
      }
      for (const source of [bundle.fullSrc, bundle.fallbackSrc]) {
        if (source) expect(previewSources.has(source), `${bundle.id}: ${source}`).toBe(false);
      }
    }

    const portrait = aboutContent.portrait;
    const portraitPaths = portrait?.type === 'video'
      ? [portrait.src, portrait.poster, portrait.hover?.src]
      : [portrait?.src];
    for (const path of portraitPaths) {
      if (path) expect(resolveMediaUrl(path, '/media/')).not.toBeNull();
    }
  });
});
