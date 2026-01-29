import { ReadingList } from "@/components/media/reading-list";
import { Watchlist } from "@/components/media/watchlist";
import { CurrentlyReading } from "@/components/media/currently-reading";
import { CurrentlyWatching } from "@/components/media/currently-watching";
import { SeedWatchlistButton } from "@/components/media/seed-watchlist-button";

export default function MediaPage() {
  return (
    <div className="space-y-6">
        <SeedWatchlistButton />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CurrentlyWatching />
            <CurrentlyReading />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Watchlist />
            <ReadingList />
        </div>
    </div>
  );
}
