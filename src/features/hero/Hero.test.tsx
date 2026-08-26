import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Hero } from './Hero';

describe('Hero', () => {
  it('renders the approved portfolio identity, narrative, and reserved award slot', () => {
    const { container } = render(
      <Hero
        portrait={{
          objectPosition: '68% 45%',
          scale: 1,
          src: '/assets/hero/hero-candidate-02.webp',
          tone: 'light',
        }}
      />,
    );

    expect(screen.getByRole('heading', { name: '杨玉峰' })).toBeInTheDocument();
    expect(screen.getByText('新媒体内容运营 × 影像创作者')).toBeInTheDocument();
    expect(screen.getByText('懂运营，也能把内容从脚本拍到成片。')).toBeInTheDocument();
    expect(
      screen.getByText(
        '我以新媒体运营为核心，独立完成选题策划、脚本编导、拍摄剪辑、发布投放与数据复盘。既懂内容怎么做，也懂内容为什么有效；AI 则是我提升创意和生产效率的一部分。',
      ),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '查看作品' })).toHaveAttribute('href', '#top');
    const awardMarker = container.querySelector('.hero__marker');
    expect(awardMarker).toBeInTheDocument();
    expect(awardMarker).toBeEmptyDOMElement();
    expect(screen.queryByText('Y.')).not.toBeInTheDocument();
    expect(screen.queryByText('PORTFOLIO 2026')).not.toBeInTheDocument();
    expect(screen.queryByText(/nominee/i)).not.toBeInTheDocument();
    expect(screen.getByRole('img', { name: '杨玉峰个人肖像' })).toHaveAttribute(
      'src',
      '/assets/hero/hero-candidate-02.webp',
    );
  });

  it('keeps a complete static placeholder when the portrait is not ready', () => {
    render(
      <Hero
        portrait={{
          objectPosition: '50% 50%',
          scale: 1,
          src: '',
          tone: 'light',
        }}
      />,
    );

    expect(screen.getByText('肖像待替换')).toBeInTheDocument();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });
});
