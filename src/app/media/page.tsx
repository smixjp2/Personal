import { ReadingList } from "@/components/media/reading-list";
import { Watchlist } from "@/components/media/watchlist";
import { readingList, watchlist } from "@/lib/placeholder-data";

export default function MediaPage() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Watchlist initialItems={watchlist} />
      <ReadingList initialBooks={readingList} />
    </div>
  );
}
