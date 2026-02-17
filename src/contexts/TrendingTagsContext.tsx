import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import { useTrendingTagNames } from "@/hooks/queries/useTrendingTagNames";

/** 앱 전역 트렌딩 태그 개수 (단일 소스) */
const TRENDING_TAGS_LIMIT = 20;

interface TrendingTagsValue {
  /** API 기준 트렌딩 순서의 태그 이름 배열 */
  trendingTagNames: string[];
  /** 해당 태그가 트렌딩 목록에 있으면 true → TagChip 빨간색 */
  isTrendingTag: (tag: string) => boolean;
  isLoading: boolean;
}

const TrendingTagsContext = createContext<TrendingTagsValue | null>(null);

export function TrendingTagsProvider({ children }: { children: ReactNode }) {
  const { trendingTagNames, isLoading } = useTrendingTagNames(TRENDING_TAGS_LIMIT);

  const trendingSet = useMemo(
    () => new Set(trendingTagNames),
    [trendingTagNames]
  );

  const isTrendingTag = useCallback(
    (tag: string) => trendingSet.has(tag),
    [trendingSet]
  );

  const value = useMemo<TrendingTagsValue>(
    () => ({
      trendingTagNames,
      isTrendingTag,
      isLoading,
    }),
    [trendingTagNames, isTrendingTag, isLoading]
  );

  return (
    <TrendingTagsContext.Provider value={value}>
      {children}
    </TrendingTagsContext.Provider>
  );
}

export function useTrendingTags(): TrendingTagsValue {
  const ctx = useContext(TrendingTagsContext);
  if (!ctx) {
    throw new Error("useTrendingTags must be used within TrendingTagsProvider");
  }
  return ctx;
}

/** 검색 인기 태그에 쓸 상위 개수 */
export const TRENDING_TOP_COUNT_SEARCH = 10;
