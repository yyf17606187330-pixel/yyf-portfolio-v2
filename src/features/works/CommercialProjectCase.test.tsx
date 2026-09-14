import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { waterPurifierCopy, waterPurifierProject } from '../../content/showcase';
import { waterPurifierMediaDeck } from '../../content/waterPurifierMedia';
import {
  teaWareCopy,
  teaWareProject,
  teaWareProjectMediaItems,
} from '../../content/teaWareShowcase';
import { CommercialProjectCase } from './CommercialProjectCase';

describe('CommercialProjectCase', () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('separates verified water purifier results from the production account', () => {
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
    const results = screen.getByRole('region', { name: '净水器项目结果' });
    const narrative = screen.getByRole('region', { name: '净水器项目说明' });

    expect(screen.getByRole('heading', { level: 2, name: '净水器' })).toBeInTheDocument();
    expect(projectCase).toHaveTextContent('碧云泉官方旗舰店 · 2022.10—2025.06');
    expect(results).toHaveTextContent('单条素材单月最高投放消耗 45 万元，投产比 1:5');
    expect(results).toHaveTextContent('UV 价值从 0 提升至约 6 元，BPM 约 6000');
    expect(narrative).not.toHaveTextContent(/45 万元|1:5|BPM|UV 价值/);
    expect(narrative).toHaveTextContent('搭建可以开播的直播间');
    expect(narrative).toHaveTextContent('采购与成本控制');
    expect(narrative).toHaveTextContent('采集传输信号和线上物料');
    expect(narrative).toHaveTextContent('参与主播面试');
    expect(narrative).toHaveTextContent('饮水安全、便捷、桌面陈设和品质生活');
    expect(narrative).toHaveTextContent('痛点开头、内容卖点和拍摄方式');
    expect(narrative).toHaveTextContent('策划、编导、拍摄、剪辑、调色与发布投放');
    expect(narrative).toHaveTextContent('调整主播话术');
    expect(projectCase).not.toHaveTextContent(
      /排版占位|正式文案待替换|LAYOUT STUDY|作品说明占位|创作过程占位/,
    );
    expect(projectCase).not.toHaveTextContent(/销售额|利润|累计消耗|80 万元|1:7/);
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

  it.each([
    { project: waterPurifierProject, copy: waterPurifierCopy, mediaItems: waterPurifierMediaDeck },
    { project: teaWareProject, copy: teaWareCopy, mediaItems: teaWareProjectMediaItems },
  ])('reads $project.title duties and results before media, followed by process details', ({
    project,
    copy,
    mediaItems,
  }) => {
    render(
      <CommercialProjectCase
        {...copy}
        mediaItems={mediaItems}
        project={project}
        playerOpen={false}
        onOpenProject={vi.fn()}
      />,
    );

    const responsibilities = screen.getByRole('list', { name: '本项目职责' });
    const results = screen.getByRole('region', { name: `${project.title}项目结果` });
    const media = screen.getByRole('group', { name: `${project.title}媒体卡组` });
    const process = screen.getByRole('list', { name: `${project.title}项目创作过程` });
    const vitals = screen.getByRole('region', { name: '项目关键信息' });

    expect(responsibilities.compareDocumentPosition(results) & Node.DOCUMENT_POSITION_FOLLOWING)
      .toBeTruthy();
    expect(results.compareDocumentPosition(media) & Node.DOCUMENT_POSITION_FOLLOWING)
      .toBeTruthy();
    expect(media.compareDocumentPosition(process) & Node.DOCUMENT_POSITION_FOLLOWING)
      .toBeTruthy();
    expect(process.compareDocumentPosition(vitals) & Node.DOCUMENT_POSITION_FOLLOWING)
      .toBeTruthy();
    expect(within(responsibilities).getAllByRole('listitem').map((item) => item.textContent))
      .toEqual(project.roles);
    expect(screen.getAllByText(`${project.client} · ${project.year}`, { exact: true }))
      .toHaveLength(1);
    expect(screen.getAllByText(copy.label, { exact: true })).toHaveLength(1);
    expect(screen.getAllByText(copy.statusLabel, { exact: true })).toHaveLength(1);
    expect(vitals).toHaveTextContent(
      `${project.aspectRatio.replace('/', ' : ')} · ${copy.durationLabel}`,
    );
    expect(vitals).not.toHaveTextContent(project.roles.join(' · '));
  });

  it('attributes the later half-year tea ware spend to one Gongdao cup film', () => {
    render(
      <CommercialProjectCase
        {...teaWareCopy}
        mediaItems={teaWareProjectMediaItems}
        project={teaWareProject}
        playerOpen={false}
        onOpenProject={vi.fn()}
      />,
    );

    const projectCase = screen.getByRole('region', { name: '茶具商业项目' });
    const results = screen.getByRole('region', { name: '茶具项目结果' });
    const process = screen.getByRole('list', { name: '茶具项目创作过程' });

    expect(projectCase).toHaveTextContent('2025.07—2025.11');
    expect(results).toHaveTextContent(
      '一条未公开的公道杯千川投放素材，后续半年累计消耗 80 万元，投产比 1:7',
    );
    expect(process).not.toHaveTextContent(/80 万元|1:7/);
    expect(projectCase).not.toHaveTextContent(/销售额|利润|45 万元|1:5|BPM|UV 价值/);
  });
});
