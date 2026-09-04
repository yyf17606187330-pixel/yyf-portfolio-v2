import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { waterPurifierCopy, waterPurifierProject } from '../../content/showcase';
import { waterPurifierMediaDeck } from '../../content/waterPurifierMedia';
import {
  teaWareCopy,
  teaWareProject,
  teaWareProjectMediaItems,
} from '../../content/teaWareShowcase';
import { CommercialProjectCase } from './CommercialProjectCase';

const projectMediaDeckStyles = readFileSync(
  resolve(process.cwd(), 'src/features/works/ProjectMediaDeck.css'),
  'utf8',
);
const projectShowcaseStyles = readFileSync(
  resolve(process.cwd(), 'src/features/works/ProjectShowcase.css'),
  'utf8',
);

function getStylesheetRules(source: string) {
  const style = document.createElement('style');
  style.textContent = source;
  document.head.append(style);

  return {
    rules: [...(style.sheet?.cssRules ?? [])],
    style,
  };
}

function getDesktopRules(rules: CSSRule[]) {
  const desktop = rules.find((rule) => (
    rule.type === CSSRule.MEDIA_RULE
    && (rule as CSSMediaRule).media.mediaText === '(min-width: 1025px)'
  )) as CSSMediaRule | undefined;

  return [...(desktop?.cssRules ?? [])];
}

function getStyleRule(rules: CSSRule[], selector: string) {
  return rules.find((rule) => (
    rule.type === CSSRule.STYLE_RULE
    && (rule as CSSStyleRule).selectorText === selector
  )) as CSSStyleRule | undefined;
}

describe('CommercialProjectCase', () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('presents the verified commercial case without exposing editorial placeholders', () => {
    render(
      <CommercialProjectCase
        {...waterPurifierCopy}
        mediaItems={waterPurifierMediaDeck}
        project={waterPurifierProject}
        playerOpen={false}
        onOpenProject={vi.fn()}
      />,
    );

    const projectCase = screen.getByRole('region', { name: '净水器商业项目' });
    expect(screen.getByRole('heading', { level: 2, name: '净水器' })).toBeInTheDocument();
    expect(projectCase).toHaveTextContent('碧云泉官方旗舰店 · 2022.10—2025.06');
    expect(projectCase).toHaveTextContent('单条素材单月最高投放消耗 45 万元，投产比 1:5');
    expect(projectCase).toHaveTextContent('UV 价值从 0 提升至约 6 元，BPM 约 6000');
    expect(projectCase).not.toHaveTextContent(
      /排版占位|正式文案待替换|LAYOUT STUDY|作品说明占位|创作过程占位/,
    );
    expect(projectCase).not.toHaveTextContent(/销售额|利润|累计消耗/);

    const narrative = screen.getByLabelText('净水器项目说明');
    expect(narrative.textContent?.length).toBeGreaterThanOrEqual(300);
    expect(narrative.querySelectorAll('p')).toHaveLength(6);
    expect(narrative).toHaveTextContent('从零搭起直播间骨架');
    expect(narrative).toHaveTextContent('用人群分析确定饮水安全题材');
    expect(narrative).toHaveTextContent('把产品优势转成痛点开头和内容卖点');
    expect(narrative).toHaveTextContent('把策划、制作与发布连成一条链路');
    expect(narrative).toHaveTextContent('用投放反馈持续压缩和优化表达');
    expect(narrative).toHaveTextContent('从内容结果反推直播表达');
  });

  it('presents the six-card 9:16 media deck without loading full media early', () => {
    const onOpenProject = vi.fn();
    const { container } = render(
      <CommercialProjectCase
        {...waterPurifierCopy}
        mediaItems={waterPurifierMediaDeck}
        project={waterPurifierProject}
        playerOpen={false}
        onOpenProject={onOpenProject}
      />,
    );
    const deck = screen.getByRole('group', { name: '净水器媒体卡组' });
    const playButton = screen.getByRole('button', { name: '播放净水器短片 01' });

    expect(deck.closest('.project-showcase__media')).toHaveClass('project-showcase__media--deck-focus');
    expect(deck.querySelectorAll('[data-project-media-card]')).toHaveLength(6);
    expect(screen.getByText('01 / 06')).toBeInTheDocument();
    expect(playButton.querySelector('.lazy-preview')).toHaveStyle({ aspectRatio: '9/16' });
    expect(container.querySelector('video[src*="full-"]')).not.toBeInTheDocument();
    fireEvent.click(playButton);
    expect(onOpenProject).toHaveBeenCalledWith(waterPurifierProject, playButton);
  });

  it('uses caller-provided media without duplicating the primary tea ware film', () => {
    render(
      <CommercialProjectCase
        {...teaWareCopy}
        mediaItems={teaWareProjectMediaItems}
        project={teaWareProject}
        playerOpen={false}
        onOpenProject={vi.fn()}
      />,
    );

    const deck = screen.getByRole('group', { name: '茶具媒体卡组' });
    expect([...deck.querySelectorAll('[data-project-media-card]')].map((card) => (
      card.getAttribute('data-project-media-card')
    ))).toEqual([
      'tea-ware',
      'tea-ware-titanium-tea-pour',
      'tea-ware-titanium-set-breakdown',
    ]);
    expect(screen.getByText('01 / 03')).toBeInTheDocument();
  });

  it('condenses and enlarges only the desktop commercial deck layout', () => {
    const showcaseSheet = getStylesheetRules(projectShowcaseStyles);
    const deckSheet = getStylesheetRules(projectMediaDeckStyles);

    try {
      const showcaseDesktop = getDesktopRules(showcaseSheet.rules);
      const deckDesktop = getDesktopRules(deckSheet.rules);
      const commercialProject = getStyleRule(showcaseDesktop, '.commercial-project');
      const heading = getStyleRule(
        showcaseDesktop,
        '.commercial-project > .project-showcase__heading',
      );
      const project = getStyleRule(
        showcaseDesktop,
        '.commercial-project > .project-showcase__project',
      );
      const processHeading = getStyleRule(
        showcaseDesktop,
        '.commercial-project .project-showcase__process-heading',
      );
      const media = getStyleRule(
        showcaseDesktop,
        '.commercial-project .project-showcase__media--deck-focus',
      );
      const deck = getStyleRule(deckDesktop, '.project-media-deck--spacious');

      expect(commercialProject?.style.getPropertyValue('--commercial-project-content-gap')).toBe(
        'clamp(2rem, 3vw, 3rem)',
      );
      expect(commercialProject?.style.getPropertyValue('--commercial-project-deck-width')).toBe(
        'clamp(31rem, 37vw, 33.5rem)',
      );
      expect(heading?.style.paddingBottom).toBe('var(--commercial-project-content-gap)');
      expect(project?.style.rowGap).toBe('var(--commercial-project-content-gap)');
      expect(project?.style.gridTemplateColumns).toBe(
        'minmax(0, 1.3fr) minmax(33.5rem, 0.92fr)',
      );
      expect(processHeading?.style.borderTop).toBe('0px');
      expect(processHeading?.style.paddingTop).toBe('0px');
      expect(media?.style.width).toBe('100%');
      expect(media?.style.maxWidth).toBe('var(--commercial-project-deck-width)');
      expect(deck?.style.getPropertyValue('--project-media-deck-width')).toBe(
        'clamp(31rem, 37vw, 33.5rem)',
      );
      expect(deck?.style.getPropertyValue('--project-media-deck-height')).toBe(
        'clamp(57.5rem, calc(65.78vw + 2.4rem), 62rem)',
      );
    } finally {
      showcaseSheet.style.remove();
      deckSheet.style.remove();
    }
  });

  it('retains semantic duties, project vitals and the verified six-stage process', () => {
    render(
      <CommercialProjectCase
        {...waterPurifierCopy}
        mediaItems={waterPurifierMediaDeck}
        project={waterPurifierProject}
        playerOpen={false}
        onOpenProject={vi.fn()}
      />,
    );

    const responsibilities = screen.getByRole('list', { name: '本项目职责' });
    expect(responsibilities).toHaveTextContent('策划');
    expect(responsibilities).toHaveTextContent('编导');
    expect(responsibilities).toHaveTextContent('拍摄');
    expect(responsibilities).toHaveTextContent('剪辑');
    expect(responsibilities).toHaveTextContent('调色');
    expect(responsibilities).toHaveTextContent('账号运营');

    const vitals = screen.getByLabelText('项目关键信息');
    expect(vitals).toHaveTextContent('2022.10—2025.06');
    expect(vitals).toHaveTextContent('碧云泉官方旗舰店');
    expect(vitals).toHaveTextContent('COMMERCIAL FILM / 商业短视频');
    expect(vitals).toHaveTextContent('9 / 16 · 01:16');
    expect(vitals).toHaveTextContent('已完成商业投放');

    const process = screen.getByRole('list', { name: '净水器项目创作过程' });
    expect(process.children).toHaveLength(6);
    expect(process).toHaveTextContent('01 / 项目背景');
    expect(process).toHaveTextContent('06 / 结果复盘');
  });
});
