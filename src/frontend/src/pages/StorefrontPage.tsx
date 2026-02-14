import { useState } from 'react';
import { useGetProducts, useInitializeMarketplace } from '@/hooks/useQueries';
import CategoryMenu from '@/components/marketplace/CategoryMenu';
import ProductGrid from '@/components/marketplace/ProductGrid';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

export default function StorefrontPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const { data: products, isLoading, error } = useGetProducts(selectedCategory);
  useInitializeMarketplace();

  const filteredProducts = products?.filter((product) =>
    product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.description.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/10 via-background to-accent/10 border-b">
        <div className="container mx-auto px-4 py-8 md:py-12">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <h1 className="text-3xl md:text-5xl font-bold leading-tight">
                Discover Amazing Deals
              </h1>
              <p className="text-lg text-muted-foreground">
                Shop the latest trends at unbeatable prices. Quality products delivered to your doorstep.
              </p>
            </div>
            <div className="hidden md:block">
              <img
                src="/assets/generated/hero-illustration.dim_1600x600.png"
                alt="Shopping illustration"
                className="w-full h-auto rounded-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Search Bar */}
        <div className="relative max-w-xl">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Category Filter */}
        <CategoryMenu
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />

        {/* Product Grid */}
        <ProductGrid
          products={filteredProducts}
          isLoading={isLoading}
          error={error}
        />
      </div>
    </div>
  );
}
