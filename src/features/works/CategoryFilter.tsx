import { categories } from '../../content/categories';
import type { ProjectCategory } from '../../types/portfolio';

export type CategorySelection = ProjectCategory | 'all';

interface CategoryFilterProps {
  activeCategory: CategorySelection;
  counts: Record<ProjectCategory, number>;
  total: number;
  onChange: (category: CategorySelection) => void;
}

export function CategoryFilter({ activeCategory, counts, total, onChange }: CategoryFilterProps) {
  return (
    <div className="category-filter" role="toolbar" aria-label="作品分类">
      <button
        aria-label={`ALL / 全部 ${total}`}
        aria-pressed={activeCategory === 'all'}
        type="button"
        onClick={() => onChange('all')}
      >
        <span>ALL / 全部</span>
        <span>{total}</span>
      </button>
      {categories.map((category) => (
        <button
          aria-label={`${category.label} ${counts[category.id]}`}
          aria-pressed={activeCategory === category.id}
          key={category.id}
          type="button"
          onClick={() => onChange(category.id)}
        >
          <span>{category.label}</span>
          <span>{counts[category.id]}</span>
        </button>
      ))}
    </div>
  );
}
