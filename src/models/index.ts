// Domain Models - 논문 추천 서비스의 핵심 데이터 구조

export interface Paper {
  id: string;
  title: string;
  authors: string[];
  year: number;
  venue: string;
  tags: string[];
  abstract: string;
  pdfUrl: string;
  metrics: {
    trendingScore: number;
    recencyScore: number;
    citations: number;
  };
}

export interface Summary {
  paperId: string;
  hookOneLiner: string;
  keyPoints: string[];
  detailed: string;
  evidenceScope: "abstract" | "intro" | "full";
}

export interface Report {
  id: string;
  title: string;
  summary: string;
  tags: string[];
  relatedPaperIds: string[];
}
