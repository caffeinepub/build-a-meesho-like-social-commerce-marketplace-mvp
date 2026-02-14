import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Info } from 'lucide-react';

export default function AdminProductManagementHelp() {
  return (
    <Card className="mb-6 border-primary/20 bg-primary/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Info className="h-5 w-5 text-primary" />
          How to Add Products
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <p>
          Welcome to Product Management! This page allows you to add, edit, and delete products in your marketplace.
        </p>
        <div>
          <p className="font-semibold mb-2">To add a new product:</p>
          <ol className="list-decimal list-inside space-y-1 ml-2">
            <li>Click the "Add Product" button above</li>
            <li>Fill in all required fields in the form</li>
            <li>Click "Add Product" to save</li>
          </ol>
        </div>
        <div>
          <p className="font-semibold mb-2">Required fields:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li><strong>Title:</strong> The product name</li>
            <li><strong>Description:</strong> Detailed product information</li>
            <li><strong>Price:</strong> Product price in dollars (e.g., 29.99)</li>
            <li><strong>Category:</strong> Product category (e.g., Electronics, Fashion, Home)</li>
            <li><strong>Image URL:</strong> A valid URL to the product image</li>
          </ul>
        </div>
        <p className="text-muted-foreground">
          You can access Product Management anytime from the account menu in the header.
        </p>
      </CardContent>
    </Card>
  );
}
