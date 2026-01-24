import { ShoppingList } from "@/components/shopping/shopping-list";
import { shoppingList } from "@/lib/placeholder-data";

export default function ShoppingPage() {
  return (
    <div className="container mx-auto max-w-5xl">
      <ShoppingList initialItems={shoppingList} />
    </div>
  );
}
