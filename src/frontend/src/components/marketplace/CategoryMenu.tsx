import { useGetCategories } from '@/hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

interface CategoryMenuProps {
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
}

export default function CategoryMenu({ selectedCategory, onSelectCategory }: CategoryMenuProps) {
  const { data: categories, isLoading, error } = useGetCategories();

  if (isLoading) {
    return (
      <div className="flex gap-2 overflow-x-auto pb-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-9 w-24 rounded-full flex-shrink-0" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-sm text-destructive">
        Failed to load categories
      </div>
    );
  }

  if (!categories || categories.length === 0) {
    return null;
  }

  return (
    <ScrollArea className="w-full whitespace-nowrap">
      <div className="flex gap-2 pb-2">
        <Button
          variant={selectedCategory === null ? 'default' : 'outline'}
          size="sm"
          onClick={() => onSelectCategory(null)}
          className="rounded-full flex-shrink-0"
        >
          All
        </Button>
        {categories.map((category) => (
          <Button
            key={category.id.toString()}
            variant={selectedCategory === category.name ? 'default' : 'outline'}
            size="sm"
            onClick={() => onSelectCategory(category.name)}
            className="rounded-full flex-shrink-0"
          >
            {category.name}
          </Button>
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}
