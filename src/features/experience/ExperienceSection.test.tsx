import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { experienceContent } from '../../content/experience';
import { ExperienceSection } from './ExperienceSection';

describe('ExperienceSection', () => {
  it('renders the approved chapter, top results and reverse-chronological entries', () => {
    const { container } = render(<ExperienceSection content={experienceContent} />);
    const section = screen.getByRole('region', { name: '工作经历' });
    const entries = [...container.querySelectorAll<HTMLElement>('[data-experience-entry]')];

    expect(section).toHaveAttribute('id', 'experience');
    expect(within(section).getByRole('heading', {
      level: 2,
      name: '内容运营与影像创作 从策划到交付',
    })).toBeInTheDocument();
    expect(container.querySelectorAll('[data-experience-top-metric]')).toHaveLength(3);
    expect(section).toHaveTextContent('45万元／1:5');
    expect(section).toHaveTextContent('80万元／1:7');
    expect(section).toHaveTextContent('约1周→3天');
    expect(entries.map((entry) => entry.querySelector('h3')?.textContent)).toEqual([
      '兴海集团',
      '广州哲品家居用品有限公司',
      '酷我贸易（徐州）有限公司',
    ]);
    expect(entries.map((entry) => entry.querySelector('[data-experience-period]')?.textContent))
      .toEqual(['2025.11—至今', '2025 · 短期项目', '2022.10—2025.06']);
  });

  it('keeps the full long-form source visible for the first reduction pass', () => {
    const { container } = render(<ExperienceSection content={experienceContent} />);

    expect(container.querySelectorAll('[data-experience-summary]')).toHaveLength(6);
    expect(container.querySelectorAll('[data-experience-detail]')).toHaveLength(14);
    expect(container.querySelectorAll('[data-experience-metric]')).toHaveLength(5);
    expect(container.querySelectorAll('[data-experience-note]')).toHaveLength(6);

    for (const entry of experienceContent.experiences) {
      expect(container).toHaveTextContent(entry.scope);
      for (const summary of entry.summaries) expect(container).toHaveTextContent(summary);
      for (const detail of entry.detailBlocks) {
        expect(container).toHaveTextContent(detail.kicker);
        expect(container).toHaveTextContent(detail.title);
        expect(container).toHaveTextContent(detail.body);
      }
      for (const note of entry.publicNotes) expect(container).toHaveTextContent(note);
    }
  });

  it('keeps paired results inside their verified employer entries', () => {
    const { container } = render(<ExperienceSection content={experienceContent} />);
    const entries = [...container.querySelectorAll<HTMLElement>('[data-experience-entry]')];

    expect(entries[0]).toHaveTextContent('约6人');
    expect(entries[0]).toHaveTextContent('约1周→3天');
    expect(entries[0]).not.toHaveTextContent('80万元／1:7');
    expect(entries[1]).toHaveTextContent('80万元／1:7');
    expect(entries[1]).not.toHaveTextContent('45万元／1:5');
    expect(entries[2]).toHaveTextContent('45万元／1:5');
    expect(entries[2]).toHaveTextContent('0→约6元／BPM约6000');
    expect(container).not.toHaveTextContent(/四个月|2025\.07—11|约8个月/);
  });

  it('renders an optional project only inside its owning experience entry', () => {
    const { container } = render(
      <ExperienceSection
        content={experienceContent}
        renderProject={(entry) => entry.id === 'kuwo' ? (
          <section aria-label="酷我贸易代表项目">净水器项目</section>
        ) : null}
      />,
    );
    const entries = [...container.querySelectorAll<HTMLElement>('[data-experience-entry]')];

    expect(within(entries[0]).queryByLabelText('酷我贸易代表项目')).not.toBeInTheDocument();
    expect(within(entries[1]).queryByLabelText('酷我贸易代表项目')).not.toBeInTheDocument();
    expect(within(entries[2]).getByLabelText('酷我贸易代表项目')).toBeInTheDocument();
    expect(entries[2].lastElementChild).toHaveClass('experience-entry__project');
    expect(container.querySelectorAll('[data-experience-project]')).toHaveLength(1);
  });
});
