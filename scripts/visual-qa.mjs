/* global document, sessionStorage, window */

import { constants } from 'node:fs';
import { access, mkdir, writeFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import { join, resolve } from 'node:path';
import process from 'node:process';
import { URL } from 'node:url';
import { chromium } from 'playwright-core';

const projectRoot = resolve(import.meta.dirname, '..');
const artifactsDir = join(projectRoot, 'artifacts', 'qa');
const suppliedUrl = process.argv[2];

const viewportCases = [
  { key: 'desktop-1440', width: 1440, height: 900, screenshot: 'desktop-1440.png' },
  { key: 'desktop-1280', width: 1280, height: 800, screenshot: 'desktop-1280.png' },
  { key: 'mobile-390', width: 390, height: 844, screenshot: 'mobile-390.png' },
];

const expectedFilters = [
  { name: 'ALL / 全部 9', visible: 9 },
  { name: 'FILM / 影像 2', visible: 2 },
  { name: 'AI VIDEO / AI视频 2', visible: 2 },
  { name: 'PHOTOGRAPHY / 摄影 2', visible: 2 },
  { name: 'DESIGN + INTERACTIVE / 设计与交互 3', visible: 3 },
];

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function findChromeExecutable() {
  const candidates = [
    {
      label: 'Google Chrome (system Applications)',
      path: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    },
    {
      label: 'Google Chrome (user Applications)',
      path: join(homedir(), 'Applications', 'Google Chrome.app', 'Contents', 'MacOS', 'Google Chrome'),
    },
    {
      label: 'Google Chrome Canary',
      path: '/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary',
    },
    {
      label: 'Chromium',
      path: '/Applications/Chromium.app/Contents/MacOS/Chromium',
    },
  ];

  for (const candidate of candidates) {
    try {
      await access(candidate.path, constants.X_OK);
      return candidate;
    } catch {
      // Continue through the explicit preference-ordered candidate list.
    }
  }

  throw new Error([
    'No executable macOS Chrome installation was found.',
    'Install Google Chrome in /Applications (preferred), or Chrome Canary/Chromium in /Applications.',
    `Checked: ${candidates.map((candidate) => candidate.path).join(', ')}`,
  ].join(' '));
}

function parsePreviewUrl(value) {
  assert(value, 'Missing preview URL. Usage: npm run qa:visual -- http://127.0.0.1:4173');

  const url = new URL(value);
  assert(['http:', 'https:'].includes(url.protocol), `Preview URL must use http or https, received ${url.protocol}`);
  return url.href;
}

async function installDiagnostics(page, diagnostics, requests) {
  await page.exposeFunction('__recordWebGLDiagnostic', (diagnostic) => {
    diagnostics.webglErrors.push(diagnostic);
  });
  await page.addInitScript(() => {
    for (const eventName of ['webglcontextcreationerror', 'webglcontextlost']) {
      window.addEventListener(eventName, (event) => {
        void window.__recordWebGLDiagnostic({
          type: event.type,
          statusMessage: 'statusMessage' in event ? String(event.statusMessage) : '',
        });
      }, true);
    }
  });
  page.on('console', (message) => {
    if (message.type() === 'error') {
      diagnostics.consoleErrors.push({ text: message.text(), location: message.location() });
    }
  });
  page.on('pageerror', (error) => {
    diagnostics.pageErrors.push({ name: error.name, message: error.message, stack: error.stack ?? '' });
  });
  page.on('request', (request) => {
    requests.push({ url: request.url(), resourceType: request.resourceType(), method: request.method() });
  });
  page.on('requestfailed', (request) => {
    diagnostics.requestFailures.push({
      url: request.url(),
      resourceType: request.resourceType(),
      method: request.method(),
      failure: request.failure()?.errorText ?? 'Unknown request failure',
    });
  });
}

async function waitForStablePage(page) {
  await page.evaluate(async () => {
    await document.fonts.ready;
  });
  await page.waitForTimeout(250);
}

async function resetScroll(page) {
  await page.evaluate(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  });
  await page.waitForTimeout(100);
}

async function measureViewport(page) {
  return page.evaluate(() => {
    const documentElement = document.documentElement;
    const body = document.body;
    const identityHeading = document.querySelector('.identity-lead h1');
    const overflow = Math.max(
      0,
      documentElement.scrollWidth - documentElement.clientWidth,
      body.scrollWidth - documentElement.clientWidth,
    );
    const clippedIdentityLines = identityHeading
      ? Array.from(identityHeading.querySelectorAll('span'))
        .map((line) => ({ text: line.textContent ?? '', overflow: line.scrollWidth - identityHeading.clientWidth }))
        .filter((line) => line.overflow > 1)
      : [];
    const featuredRect = document.querySelector('.featured-work')?.getBoundingClientRect();

    return {
      overflow,
      clientWidth: documentElement.clientWidth,
      scrollWidth: Math.max(documentElement.scrollWidth, body.scrollWidth),
      clippedIdentityLines,
      featuredVisiblePixels: featuredRect
        ? Math.max(0, Math.min(window.innerHeight, featuredRect.bottom) - Math.max(0, featuredRect.top))
        : 0,
    };
  });
}

async function captureHomepageViewports(page, report) {
  for (const viewport of viewportCases) {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await resetScroll(page);
    await waitForStablePage(page);

    const headerVisible = await page.locator('.site-header').isVisible();
    const identityVisible = await page.getByRole('heading', { name: 'YANG YUFENG' }).isVisible();
    assert(headerVisible, `${viewport.key}: site header is not visible`);
    assert(identityVisible, `${viewport.key}: YANG YUFENG identity heading is not visible`);

    const measurement = await measureViewport(page);
    assert(measurement.overflow <= 1, `${viewport.key}: horizontal overflow is ${measurement.overflow}px`);
    assert(
      measurement.clippedIdentityLines.length === 0,
      `${viewport.key}: identity lines are visually clipped: ${JSON.stringify(measurement.clippedIdentityLines)}`,
    );
    await page.screenshot({ path: join(artifactsDir, viewport.screenshot), animations: 'allow' });
    report.viewports.push({ ...viewport, ...measurement });
  }
}

async function verifyIntro(page, report) {
  await page.goto(report.url, { waitUntil: 'networkidle' });
  await page.evaluate(() => sessionStorage.clear());
  await page.reload({ waitUntil: 'networkidle' });

  const intro = page.getByRole('dialog', { name: '开场动画' });
  await intro.waitFor({ state: 'visible' });
  await page.getByRole('button', { name: '跳过开场' }).click();
  await intro.waitFor({ state: 'detached' });
  await page.locator('.site-shell:not([inert])').waitFor({ state: 'visible' });

  const sessionValueAfterSkip = await page.evaluate(() => sessionStorage.getItem('yyf-portfolio-intro-played'));
  await page.reload({ waitUntil: 'networkidle' });
  await page.locator('.site-shell:not([inert])').waitFor({ state: 'visible' });
  const introCountAfterReload = await page.getByRole('dialog', { name: '开场动画' }).count();

  assert(sessionValueAfterSkip === 'true', 'Intro skip did not persist the session flag');
  assert(introCountAfterReload === 0, 'Intro reappeared after a same-session reload');
  report.interactions.intro = { visibleAfterClear: true, skipped: true, sessionValueAfterSkip, hiddenAfterReload: true };
}

async function verifyFilters(page, report) {
  await page.setViewportSize({ width: 1280, height: 800 });
  const indexSection = page.locator('.work-index');
  const toolbar = indexSection.getByRole('toolbar', { name: '作品分类' });
  await toolbar.scrollIntoViewIfNeeded();

  const results = [];
  for (const expected of expectedFilters) {
    const button = toolbar.getByRole('button', { name: expected.name, exact: true });
    assert(await button.count() === 1, `Missing category filter: ${expected.name}`);
    await button.click();
    const cards = indexSection.getByRole('button', { name: /^打开项目：/ });
    await page.waitForFunction(
      ({ selector, count }) => document.querySelectorAll(selector).length === count,
      { selector: '.work-index .project-card__button', count: expected.visible },
    );
    const visible = await cards.count();
    assert(visible === expected.visible, `${expected.name}: expected ${expected.visible} index cards, received ${visible}`);
    results.push({ label: expected.name, expected: expected.visible, visible });
  }

  await toolbar.getByRole('button', { name: expectedFilters[0].name, exact: true }).click();
  report.interactions.categories = results;
}

async function verifyAboutOverlay(page, report) {
  await page.setViewportSize({ width: 1280, height: 800 });
  await resetScroll(page);
  const opener = page.locator('.site-header__nav-secondary', { hasText: 'ABOUT' });
  await opener.focus();
  await opener.click();

  const dialog = page.getByRole('dialog', { name: '全站导航' });
  await dialog.waitFor({ state: 'visible' });
  const close = dialog.getByRole('button', { name: '关闭菜单' });
  await page.waitForFunction(() => document.activeElement?.getAttribute('aria-label') === '关闭菜单');
  await page.waitForTimeout(750);

  const position = await dialog.evaluate((element) => {
    const target = element.querySelector('#about');
    const navigation = element.querySelector('.navigation-overlay__nav');
    if (!target) {
      throw new Error('ABOUT target was not found inside the navigation overlay');
    }
    if (!navigation) {
      throw new Error('Navigation list was not found inside the navigation overlay');
    }
    const dialogRect = element.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    const navigationRect = navigation.getBoundingClientRect();
    const navigationLabelDefects = Array.from(navigation.querySelectorAll('a'))
      .map((link) => {
        const style = window.getComputedStyle(link);
        const lineHeight = Number.parseFloat(style.lineHeight);
        const height = link.getBoundingClientRect().height;
        const contentHeight = height - Number.parseFloat(style.paddingTop) - Number.parseFloat(style.paddingBottom);
        return {
          text: link.textContent ?? '',
          contentHeight,
          lineHeight,
          horizontalOverflow: link.scrollWidth - link.clientWidth,
        };
      })
      .filter((link) => link.contentHeight > link.lineHeight * 1.25 || link.horizontalOverflow > 1);
    return {
      scrollTop: element.scrollTop,
      targetVisible: targetRect.bottom > dialogRect.top && targetRect.top < dialogRect.bottom,
      navigationFullyVisible: navigationRect.top >= dialogRect.top - 1 && navigationRect.bottom <= dialogRect.bottom + 1,
      navigationLabelDefects,
    };
  });
  const closeInitiallyFocused = await close.evaluate((element) => document.activeElement === element);

  assert(position.scrollTop > 0, `ABOUT target did not set overlay scrollTop (received ${position.scrollTop})`);
  assert(position.targetVisible, 'ABOUT target is not visible after opening the targeted overlay');
  assert(position.navigationFullyVisible, 'Desktop navigation is clipped after scrolling to the ABOUT target');
  assert(
    position.navigationLabelDefects.length === 0,
    `Desktop navigation labels wrap or clip: ${JSON.stringify(position.navigationLabelDefects)}`,
  );
  assert(closeInitiallyFocused, 'Navigation CLOSE was not the initial focused control');
  await page.screenshot({ path: join(artifactsDir, 'about-overlay-1280.png'), animations: 'allow' });

  await page.keyboard.press('Escape');
  await dialog.waitFor({ state: 'detached' });
  const focusRestored = await opener.evaluate((element) => document.activeElement === element);
  assert(focusRestored, 'Escape did not restore focus to the ABOUT opener');
  report.interactions.about = { ...position, closeInitiallyFocused, escapeClosed: true, focusRestored };
}

async function verifyMissingMediaPlayer(page, report, requests) {
  await page.setViewportSize({ width: 1280, height: 800 });
  const opener = page.locator('.featured-work .project-card__button').first();
  await opener.scrollIntoViewIfNeeded();
  const scrollBefore = await page.evaluate(() => window.scrollY);
  const requestStart = requests.length;
  await opener.focus();
  await opener.click();

  const dialog = page.getByRole('dialog', { name: /^播放作品：/ });
  await dialog.waitFor({ state: 'visible' });
  await page.waitForTimeout(650);
  const missingFallbackVisible = await dialog.getByText('作品视频待替换', { exact: true }).isVisible();
  const videoCount = await dialog.locator('video').count();
  const emptyVideoSourceCount = await dialog.locator('video[src=""], video:not([src])').count();
  const mediaRequests = requests.slice(requestStart).filter((request) => request.resourceType === 'media');

  assert(missingFallbackVisible, 'Missing-media player fallback is not visible');
  assert(videoCount === 0, `Missing-media player unexpectedly rendered ${videoCount} video element(s)`);
  assert(emptyVideoSourceCount === 0, `Missing-media player rendered ${emptyVideoSourceCount} empty video source(s)`);
  assert(mediaRequests.length === 0, `Missing-media player started media requests: ${mediaRequests.map((request) => request.url).join(', ')}`);
  await page.screenshot({ path: join(artifactsDir, 'player-fallback-1280.png'), animations: 'allow' });

  await page.keyboard.press('Escape');
  await dialog.waitFor({ state: 'detached' });
  await page.waitForTimeout(100);
  const focusRestored = await opener.evaluate((element) => document.activeElement === element);
  const scrollAfter = await page.evaluate(() => window.scrollY);

  assert(focusRestored, 'Player Escape did not restore focus to the originating project');
  assert(Math.abs(scrollAfter - scrollBefore) <= 1, `Player close changed scroll position from ${scrollBefore} to ${scrollAfter}`);
  report.interactions.missingMediaPlayer = {
    missingFallbackVisible,
    videoCount,
    emptyVideoSourceCount,
    mediaRequests,
    escapeClosed: true,
    focusRestored,
    scrollBefore,
    scrollAfter,
  };
}

async function getNavigationLabelDefects(dialog) {
  return dialog.locator('.navigation-overlay__nav a').evaluateAll((links) => links
    .map((link) => {
      const style = window.getComputedStyle(link);
      const lineHeight = Number.parseFloat(style.lineHeight);
      const height = link.getBoundingClientRect().height;
      const contentHeight = height - Number.parseFloat(style.paddingTop) - Number.parseFloat(style.paddingBottom);
      const horizontalOverflow = link.scrollWidth - link.clientWidth;
      return { text: link.textContent ?? '', height, contentHeight, lineHeight, horizontalOverflow };
    })
    .filter((link) => link.contentHeight > link.lineHeight * 1.25 || link.horizontalOverflow > 1));
}

async function verifyMobileNavigationAndLongTitle(page, report) {
  await page.setViewportSize({ width: 390, height: 844 });
  await resetScroll(page);
  const menuOpener = page.getByRole('button', { name: 'MENU', exact: true });
  assert(await menuOpener.isVisible(), '390px MENU control is not visible');
  await menuOpener.focus();
  await menuOpener.click();

  const dialog = page.getByRole('dialog', { name: '全站导航' });
  await dialog.waitFor({ state: 'visible' });
  const closeInitiallyFocused = await dialog.getByRole('button', { name: '关闭菜单' }).evaluate(
    (element) => document.activeElement === element,
  );
  assert(closeInitiallyFocused, '390px navigation CLOSE was not initially focused');
  await page.waitForTimeout(750);
  const wrappedNavigationLabels = await getNavigationLabelDefects(dialog);
  assert(
    wrappedNavigationLabels.length === 0,
    `390px navigation labels wrap or clip: ${JSON.stringify(wrappedNavigationLabels)}`,
  );
  await page.screenshot({ path: join(artifactsDir, 'mobile-menu-390.png'), animations: 'allow' });
  await page.keyboard.press('Escape');
  await dialog.waitFor({ state: 'detached' });
  const focusRestored = await menuOpener.evaluate((element) => document.activeElement === element);
  assert(focusRestored, '390px menu Escape did not restore focus to MENU');

  const toolbar = page.getByRole('toolbar', { name: '作品分类' });
  await toolbar.scrollIntoViewIfNeeded();
  const filterButtons = toolbar.getByRole('button');
  assert(await filterButtons.count() === 5, '390px category filter does not expose all five controls');
  for (let index = 0; index < 5; index += 1) {
    assert(await filterButtons.nth(index).isVisible(), `390px category filter button ${index + 1} is not visible`);
  }
  const lastFilter = toolbar.getByRole('button', { name: expectedFilters[4].name, exact: true });
  await lastFilter.click();
  await page.waitForFunction(() => document.querySelectorAll('.work-index .project-card__button').length === 3);
  await page.screenshot({ path: join(artifactsDir, 'mobile-filter-390.png'), animations: 'allow' });

  const title = page.locator('.work-index .project-card__title').first();
  const originalTitle = await title.textContent();
  await title.evaluate((element) => {
    element.textContent = '这是用于验证移动端换行与信息层级的超长中文作品标题';
  });
  await title.scrollIntoViewIfNeeded();
  const longTitleOverflow = await measureViewport(page);
  assert(longTitleOverflow.overflow <= 1, `Temporary long Chinese title caused ${longTitleOverflow.overflow}px overflow`);
  await page.screenshot({ path: join(artifactsDir, 'long-title-390.png'), animations: 'allow' });
  await title.evaluate((element, text) => {
    element.textContent = text;
  }, originalTitle);

  await toolbar.getByRole('button', { name: expectedFilters[0].name, exact: true }).click();

  await page.setViewportSize({ width: 320, height: 844 });
  await resetScroll(page);
  const menu320 = page.getByRole('button', { name: 'MENU', exact: true });
  assert(await menu320.isVisible(), '320px MENU control is not visible');
  await menu320.click();
  await dialog.waitFor({ state: 'visible' });
  await page.waitForTimeout(750);
  const navigationLabelDefects320 = await getNavigationLabelDefects(dialog);
  const mobile320Measurement = await measureViewport(page);
  assert(
    navigationLabelDefects320.length === 0,
    `320px navigation labels wrap or clip: ${JSON.stringify(navigationLabelDefects320)}`,
  );
  assert(mobile320Measurement.overflow <= 1, `320px navigation has ${mobile320Measurement.overflow}px horizontal overflow`);
  await page.screenshot({ path: join(artifactsDir, 'mobile-menu-320.png'), animations: 'allow' });
  await page.keyboard.press('Escape');
  await dialog.waitFor({ state: 'detached' });

  report.interactions.mobile = {
    menuVisible: true,
    closeInitiallyFocused,
    escapeClosed: true,
    focusRestored,
    filterButtonCount: 5,
    lastFilterUsable: true,
    wrappedNavigationLabels,
    navigationLabelDefects320,
    overflow320: mobile320Measurement.overflow,
    temporaryLongTitleOverflow: longTitleOverflow.overflow,
  };
}

async function run() {
  await mkdir(artifactsDir, { recursive: true });
  const report = {
    generatedAt: new Date().toISOString(),
    url: '',
    browser: null,
    viewports: [],
    interactions: {},
    diagnostics: { consoleErrors: [], pageErrors: [], requestFailures: [], webglErrors: [], classifications: [] },
    limitations: [
      'Production content has no real video source. Audible autoplay is covered by component tests and still requires regression with the first real media delivery.',
    ],
    pass: false,
  };
  let browser;
  let failureMessage = '';

  try {
    report.url = parsePreviewUrl(suppliedUrl);
    const chrome = await findChromeExecutable();
    browser = await chromium.launch({ executablePath: chrome.path, headless: true });
    report.browser = { ...chrome, version: browser.version() };

    const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
    const page = await context.newPage();
    const requests = [];
    await installDiagnostics(page, report.diagnostics, requests);

    await verifyIntro(page, report);
    await captureHomepageViewports(page, report);
    await verifyFilters(page, report);
    await verifyAboutOverlay(page, report);
    await verifyMissingMediaPlayer(page, report, requests);
    await verifyMobileNavigationAndLongTitle(page, report);

    assert(report.diagnostics.consoleErrors.length === 0, `Console errors detected: ${JSON.stringify(report.diagnostics.consoleErrors)}`);
    assert(report.diagnostics.pageErrors.length === 0, `Page errors detected: ${JSON.stringify(report.diagnostics.pageErrors)}`);
    assert(report.diagnostics.requestFailures.length === 0, `Request failures detected: ${JSON.stringify(report.diagnostics.requestFailures)}`);
    assert(report.diagnostics.webglErrors.length === 0, `WebGL errors detected: ${JSON.stringify(report.diagnostics.webglErrors)}`);
    report.pass = true;
    await context.close();
  } catch (error) {
    report.failure = error instanceof Error ? { name: error.name, message: error.message, stack: error.stack ?? '' } : { message: String(error) };
    failureMessage = report.failure.message;
    process.exitCode = 1;
  } finally {
    await browser?.close();
    await writeFile(join(artifactsDir, 'qa-report.json'), `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  }

  if (!report.pass) {
    throw new Error(`Visual QA failed: ${failureMessage}. See ${join(artifactsDir, 'qa-report.json')}`);
  }

  process.stdout.write(`Visual QA passed. Evidence: ${artifactsDir}\n`);
}

await run();
