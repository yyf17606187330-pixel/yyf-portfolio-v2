import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { waterPurifierCopy, waterPurifierProject } from '../../content/showcase';
import { CommercialProjectCase } from './CommercialProjectCase';

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
    expect(narrative.querySelectorAll('p')).toHaveLength(4);
    expect(narrative).toHaveTextContent('从零搭起直播间骨架');
    expect(narrative).toHaveTextContent('用人群分析确定饮水安全题材');
    expect(narrative).toHaveTextContent('把制作、投放与复盘连成闭环');
    expect(narrative).toHaveTextContent('从内容结果反推直播表达');
  });

  it('presents the six-card 9:16 media deck without loading full media early', () => {
    const onOpenProject = vi.fn();
    const { container } = render(
      <CommercialProjectCase
        {...waterPurifierCopy}
        project={waterPurifierProject}
        playerOpen={false}
        onOpenProject={onOpenProject}
      />,
    );
    const deck = screen.getByRole('group', { name: '净水器媒体卡组' });
    const playButton = screen.getByRole('button', { name: '播放净水器短片 01' });

    expect(deck.querySelectorAll('[data-project-media-card]')).toHaveLength(6);
    expect(screen.getByText('01 / 06')).toBeInTheDocument();
    expect(playButton.querySelector('.lazy-preview')).toHaveStyle({ aspectRatio: '9/16' });
    expect(container.querySelector('video[src*="full-"]')).not.toBeInTheDocument();
    fireEvent.click(playButton);
    expect(onOpenProject).toHaveBeenCalledWith(waterPurifierProject, playButton);
  });

  it('retains semantic duties, project vitals and the verified four-stage process', () => {
    render(
      <CommercialProjectCase
        {...waterPurifierCopy}
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
    expect(process.children).toHaveLength(4);
    expect(process).toHaveTextContent('01 / 项目背景');
    expect(process).toHaveTextContent('04 / 职责复盘');
  });
});
