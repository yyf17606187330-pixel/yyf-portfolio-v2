import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Hero } from './Hero';

describe('Hero', () => {
  it('renders the shared identity hierarchy, placeholder bio, and work entry', () => {
    render(
      <Hero
        portrait={{
          objectPosition: '68% 45%',
          scale: 1,
          src: '/assets/hero/hero-candidate-02.webp',
          tone: 'light',
        }}
      />,
    );

    expect(screen.getByRole('heading', { name: 'YANG YUFENG' })).toBeInTheDocument();
    expect(screen.getByText('影像导演 × AI 视觉创作者')).toBeInTheDocument();
    expect(screen.getByText('待补充个人简介')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'VIEW WORK' })).toHaveAttribute('href', '#work');
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
