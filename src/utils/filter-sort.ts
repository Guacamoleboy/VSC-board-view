import { getAgeCategory } from "@/utils/age-formatter";
import type { FilterOptions, SortOptions } from "@/types/filter";
import type { BoardItem } from "@/types/board"; 

export function filterTodos(
  items: BoardItem[],
  filters: FilterOptions,
): BoardItem[] {
  let filtered = items;

  if (filters.labels.length > 0) {
    filtered = filtered.filter((item) => {
      if (!item.labels || item.labels.length === 0) {
        return false;
      }
    
      return filters.labels.some((filterLabel) =>
        (item.labels as string[])?.includes(filterLabel),
      );
    });
  }

  if (filters.age && filters.age !== "all") {
    filtered = filtered.filter((item) => {
      if (item.daysOld === undefined) {
        return false;
      }
      const category = getAgeCategory(item.daysOld);
      return category === filters.age;
    });
  }

  return filtered;
}

export function sortTodos(items: BoardItem[], sort: SortOptions): BoardItem[] {
  const sorted = [...items];

  sorted.sort((a, b) => {
    const dateA = a.lastModified instanceof Date ? a.lastModified.getTime() : 0;
    const dateB = b.lastModified instanceof Date ? b.lastModified.getTime() : 0;
    
    const comparison = dateA - dateB;

    return sort.direction === "asc" ? comparison : -comparison;
  });

  return sorted;
}

export function filterAndSortTodos(
  items: BoardItem[],
  filters: FilterOptions,
  sort: SortOptions,
): BoardItem[] {
  const filtered = filterTodos(items, filters);
  const sorted = sortTodos(filtered, sort);
  return sorted;
}