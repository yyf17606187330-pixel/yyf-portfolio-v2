import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { aboutContent } from '../../content/about';
import { CapabilityBoundarySection } from './CapabilityBoundarySection';

describe('CapabilityBoundarySection', () => {
  it('renders the approved capability boundary without inventing a second content source', () => {
    render(
      <CapabilityBoundarySection
        capabilities={aboutContent.capabilities}
        groups={aboutContent.capabilityGroups}
      />,
    );

    const section = screen.getByRole('region', { name: '技能与工具' });

    expect(section).toHaveAttribute('id', 'skills');
    expect(section).toHaveAttribute('data-design-system', 'capability-editorial-v1');
    expect(within(section).getByRole('heading', {
      level: 2,
      name: '技能与工具能力边界',
    })).toHaveClass('capability-boundary__display');
    expect(within(section).getByText(/这些工具最终都服务于同一件事/))
      .toHaveClass('capability-boundary__body');
    expect(within(section).getByRole('list', { name: '技能清单' }).children)
      .toHaveLength(aboutContent.capabilities.length);
    expect(within(section).getByRole('list', { name: '能力范围清单' }).children)
      .toHaveLength(aboutContent.capabilityGroups.length);
    expect(within(section).getByRole('list', { name: '能力范围清单' }))
      .toHaveTextContent('运营投放');
  });

  it('uses the About capability range hierarchy as its typography contract', () => {
    render(
      <CapabilityBoundarySection
        capabilities={aboutContent.capabilities}
        groups={aboutContent.capabilityGroups}
      />,
    );

    const section = screen.getByRole('region', { name: '技能与工具' });

    expect(section).toHaveAttribute('data-typography-contract', 'about-scope-v1');
    expect(within(section).getByRole('heading', {
      level: 2,
      name: '技能与工具能力边界',
    })).toHaveClass('capability-boundary__scope-heading');
    expect(within(section).getByText('CORE SKILLS / 核心能力'))
      .toHaveClass('capability-boundary__scope-label');
    expect(within(section).getByText('WORKING RANGE / 能力边界'))
      .toHaveClass('capability-boundary__scope-label');
  });
});
