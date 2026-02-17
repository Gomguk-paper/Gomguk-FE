// Domain Models - 논문 추천 서비스의 핵심 데이터 구조

export interface PaperSummaryEmbed {
  hook: string;
  points: string[];
  detailed: string;
}

export interface Paper {
  id: string;
  title: string;
  authors: string[];
  year: number;
  venue: string;
  tags: string[];
  abstract: string;
  pdfUrl: string;
  imageUrl?: string; // 논문 figure 이미지
  metrics: {
    trendingScore: number;
    recencyScore: number;
    recommendScore: number;
    citations: number;
  };
  /** PaperOut에 포함된 한국어 요약 (카드/캐러셀 표시용) */
  summary?: PaperSummaryEmbed;
}

export interface Summary {
  paperId: string;
  hookOneLiner: string;
  keyPoints: string[];
  detailed: string;
  evidenceScope: "abstract" | "intro" | "full";
}


