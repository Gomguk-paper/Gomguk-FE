import { Search as SearchIcon, SlidersHorizontal } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { TagChip } from "@/components/TagChip";
import { SortMode } from "@/hooks/usePaperSearch";
import { HamburgerMenu } from "@/components/HamburgerMenu";

interface SearchHeaderProps {
    query: string;
    setQuery: (query: string) => void;
    handleSearch: (term: string) => void;
    sortMode: SortMode;
    setSortMode: (mode: SortMode) => void;
    selectedTags: string[];
    handleTagClick: (tag: string) => void;
    showMenuTrigger?: boolean;
}

export function SearchHeader({
    query,
    setQuery,
    handleSearch,
    sortMode,
    setSortMode,
    selectedTags,
    handleTagClick,
    showMenuTrigger = false,
}: SearchHeaderProps) {
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSearch(query);
        }
    };

    return (
        <div className="space-y-3 px-4">
            {/* Search Input */}
            <div className="flex items-center gap-2">
                {showMenuTrigger && <HamburgerMenu />}
                <div className="relative flex-1">
                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="논문 제목, 키워드로 검색..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="w-full pl-10 pr-4 py-3 bg-secondary rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                </div>
            </div>

            {/* Sort & Filter */}
            <div className="flex items-center gap-2">
                <Select value={sortMode} onValueChange={(v) => setSortMode(v as SortMode)}>
                    <SelectTrigger className="w-32 h-9 text-xs">
                        <SlidersHorizontal className="w-3.5 h-3.5 mr-1" />
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="trending">🔥 트렌딩</SelectItem>
                        <SelectItem value="recent">🕐 최신순</SelectItem>
                        <SelectItem value="recommended">⭐ 추천순</SelectItem>
                    </SelectContent>
                </Select>

                {selectedTags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {selectedTags.map(tag => (
                            <TagChip key={tag} tag={tag} selected onClick={() => handleTagClick(tag)} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
