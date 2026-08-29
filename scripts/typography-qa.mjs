/* global document, getComputedStyle, window */
import assert from 'node:assert/strict';
import console from 'node:console';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath, URL } from 'node:url';
import { chromium } from 'playwright-core';

// Run against the current local preview, using a fresh browser profile.
const executablePath = process.argv[2];
assert.ok(executablePath, 'Pass the installed Chrome executable as the first argument.');
const url = process.argv[3] ?? 'http://127.0.0.1:4184/';
assert.ok(['127.0.0.1', 'localhost'].includes(new URL(url).hostname), 'Local preview only.');
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const output = path.join(root, '.agent-state', 'qa', 'typography');
await mkdir(output, { recursive: true });
const report = { url, viewports: {}, errors: [], failures: [] };
const check = (condition, message) => { if (!condition) report.failures.push(message); };
const browser = await chromium.launch({ executablePath, headless: true, args: ['--mute-audio'] });

try {
  for (const viewport of [{ width: 1440, height: 900 }, { width: 960, height: 900 }, { width: 390, height: 844 }]) {
    const context = await browser.newContext({ viewport, reducedMotion: 'no-preference' });
    const page = await context.newPage();
    const fontRequests = [];
    page.on('pageerror', (error) => report.errors.push(error.message));
    page.on('console', (message) => { if (message.type() === 'error') report.errors.push(message.text()); });
    page.on('request', (request) => { if (request.resourceType() === 'font') fontRequests.push(request.url()); });
    await page.goto(url, { waitUntil: 'load' });
    await page.evaluate(() => document.fonts.ready);
    if (viewport.width >= 1024) {
      await page.waitForFunction(() => document.querySelector('.hero')?.classList.contains('hero--scroll-story'));
    }
    const data = await page.evaluate(() => {
      const rect = (selector) => {
        const box = document.querySelector(selector).getBoundingClientRect();
        return { left: box.left, right: box.right, top: box.top, bottom: box.bottom, width: box.width, height: box.height };
      };
      const numberStyle = (selector, property, pseudo = null) => Number.parseFloat(getComputedStyle(document.querySelector(selector), pseudo)[property]);
      const selectors = ['#hero-title', '.hero__bio', '.hero__cta', '.site-header__identity', '.site-header__nav', '#about', '#works'];
      return {
        width: document.documentElement.clientWidth,
        scrollWidth: document.documentElement.scrollWidth,
        copy: rect('.hero__copy'),
        title: rect('#hero-title'),
        about: {
          section: rect('#about'),
          transition: document.querySelector('.about-section__transition') ? {
            ...rect('.about-section__transition'),
            borderTop: numberStyle('.about-section__transition', 'borderTopWidth'),
            borderBottom: numberStyle('.about-section__transition', 'borderBottomWidth'),
            itemCount: document.querySelectorAll('.about-section__transition-grid > div').length,
          } : null,
          titleSize: numberStyle('.about-section__header h2', 'fontSize'),
          accentSize: numberStyle('.about-section__header h2 em', 'fontSize'),
          dropCapSize: numberStyle('.about-section__intro', 'fontSize', '::first-letter'),
          bodyWeight: numberStyle('.about-section__body', 'fontWeight'),
        },
        works: {
          projectTitleSize: numberStyle('.project-showcase__heading h2', 'fontSize'),
          projectStatementSize: numberStyle('.project-showcase__statement', 'fontSize'),
          longFormTitleSize: numberStyle('.long-form-projects__intro h2', 'fontSize'),
          longFormStatementSize: numberStyle('.long-form-projects__intro h2 em', 'fontSize'),
        },
        families: Object.fromEntries(selectors.map((selector) => [selector, getComputedStyle(document.querySelector(selector)).fontFamily])),
      };
    });
    const client = await context.newCDPSession(page);
    await client.send('DOM.enable');
    await client.send('CSS.enable');
    const { root: documentNode } = await client.send('DOM.getDocument');
    data.platformFonts = {};
    for (const selector of ['#hero-title', '.hero__bio']) {
      const { nodeId } = await client.send('DOM.querySelector', { nodeId: documentNode.nodeId, selector });
      data.platformFonts[selector] = (await client.send('CSS.getPlatformFontsForNode', { nodeId })).fonts;
    }
    data.fontRequests = fontRequests;
    report.viewports[viewport.width] = data;
    for (const [selector, family] of Object.entries(data.families)) {
      check(/^(?:"?苹方-简"?|"?PingFang SC"?)(?:,|$)/.test(family), `${viewport.width}: ${selector} does not prefer PingFang (${family})`);
    }
    check(data.scrollWidth <= data.width, `${viewport.width}: horizontal overflow`);
    check(!fontRequests.some((request) => /manrope|syne/i.test(request)), `${viewport.width}: legacy web fonts still downloaded`);
    check(data.about.accentSize / data.about.titleSize >= 0.69 && data.about.accentSize / data.about.titleSize <= 0.74, `${viewport.width}: About accent title is not one restrained step below the main title`);
    check(data.about.transition !== null, `${viewport.width}: Hero-to-About editorial transition rail is missing`);
    if (data.about.transition) {
      check(Math.abs(data.about.transition.top - data.about.section.top) <= 1, `${viewport.width}: transition rail does not start at the About boundary`);
      check(data.about.transition.width >= data.width - 1, `${viewport.width}: transition rail is not full-bleed`);
      check(data.about.transition.borderTop >= 1 && data.about.transition.borderBottom >= 1, `${viewport.width}: transition rail is missing its two rules`);
      check(data.about.transition.itemCount === 4, `${viewport.width}: transition rail does not contain four editorial items`);
    }
    check(data.about.dropCapSize >= 45 && data.about.dropCapSize <= 65, `${viewport.width}: Chinese drop cap still dominates the opening paragraph`);
    check(data.about.bodyWeight <= 350, `${viewport.width}: About body copy is not using the lighter PingFang weight`);
    if (viewport.width === 1440) {
      check(data.copy.left >= 160 && data.copy.left <= 173, '1440: Hero content group is not aligned with the revised left editorial edge');
      check(data.copy.right <= 720, '1440: Hero text intrudes into the portrait safe area');
      check(data.works.projectTitleSize >= 62 && data.works.projectTitleSize <= 68, '1440: water-purifier title is outside the approved compact scale');
      check(data.works.projectStatementSize >= 29 && data.works.projectStatementSize <= 34, '1440: water-purifier subtitle is outside the approved compact scale');
      check(Math.abs(data.works.longFormTitleSize - data.works.projectTitleSize) <= 1, '1440: long-form and water-purifier titles no longer share a scale');
      check(Math.abs(data.works.longFormStatementSize - data.works.projectStatementSize) <= 1, '1440: long-form and water-purifier subtitles no longer share a scale');
      for (const [selector, fonts] of Object.entries(data.platformFonts)) {
        check(fonts.some((font) => font.familyName === 'PingFang SC' && font.glyphCount > 0), `${selector}: PingFang not actually rendered on this machine`);
      }
    } else {
      check(data.copy.left >= 16 && data.copy.right <= data.width - 16, `${viewport.width}: text escapes the responsive gutter`);
      if (viewport.width === 390) {
        check(data.works.projectTitleSize >= 34 && data.works.projectTitleSize <= 38, '390: water-purifier title is outside the approved compact scale');
        check(data.works.projectStatementSize >= 21 && data.works.projectStatementSize <= 24, '390: water-purifier subtitle is outside the approved compact scale');
        check(Math.abs(data.works.longFormTitleSize - data.works.projectTitleSize) <= 1, '390: long-form and water-purifier titles no longer share a scale');
        check(Math.abs(data.works.longFormStatementSize - data.works.projectStatementSize) <= 1, '390: long-form and water-purifier subtitles no longer share a scale');
      }
    }
    await page.screenshot({ path: path.join(output, `hero-${viewport.width}.png`) });
    if (viewport.width === 1440 || viewport.width === 390) {
      await page.locator('#about').screenshot({ path: path.join(output, `about-${viewport.width}.png`) });
      await page.locator('.project-showcase__heading').screenshot({ path: path.join(output, `project-heading-${viewport.width}.png`) });
      await page.locator('.long-form-projects__intro').screenshot({ path: path.join(output, `long-form-heading-${viewport.width}.png`) });
    }
    if (viewport.width === 1440) {
      await page.evaluate(() => window.scrollTo(0, 1600));
      await page.waitForFunction(() => Number(getComputedStyle(document.querySelector('.hero__cta')).opacity) > 0.99);
      const alignment = await page.evaluate(() => ({
        button: document.querySelector('.hero__cta').getBoundingClientRect().left,
        copy: document.querySelector('.hero__copy').getBoundingClientRect().left,
      }));
      data.ctaAlignment = alignment;
      check(Math.abs(alignment.button - alignment.copy) <= 1, '1440: delayed CTA no longer aligns with the text');
    }
    await context.close();
  }
} finally {
  await browser.close();
  await writeFile(path.join(output, 'report.json'), `${JSON.stringify(report, null, 2)}\n`);
  console.log(JSON.stringify(report, null, 2));
}
assert.equal(report.errors.length, 0, 'Browser errors found.');
assert.equal(report.failures.length, 0, report.failures.join('\n'));
