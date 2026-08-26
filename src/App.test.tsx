import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import App from './App';

vi.mock('./hooks/useLenis', () => ({ useLenis: vi.fn() }));

describe('App', () => {
  it('renders the approved single-screen hero without the works index', () => {
    const { container } = render(<App />);

    expect(screen.getByRole('heading', { name: '杨玉峰' })).toBeInTheDocument();
    expect(screen.queryByText('SELECTED WORK / 重点作品')).not.toBeInTheDocument();
    expect(container.querySelectorAll('main > section')).toHaveLength(1);
  });
});
