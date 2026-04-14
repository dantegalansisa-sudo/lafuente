import { categories, categoryDisplayNames } from '../data/products';

interface CategoryFilterProps {
  selected: string | null;
  onSelect: (category: string | null) => void;
}

export default function CategoryFilter({ selected, onSelect }: CategoryFilterProps) {
  return (
    <div className="catalog__filters">
      <button
        className={`filter-chip ${selected === null ? 'active' : ''}`}
        onClick={() => onSelect(null)}
      >
        Todos
      </button>
      {categories.map(cat => (
        <button
          key={cat}
          className={`filter-chip ${selected === cat ? 'active' : ''}`}
          onClick={() => onSelect(cat)}
        >
          {categoryDisplayNames[cat] || cat}
        </button>
      ))}
    </div>
  );
}
