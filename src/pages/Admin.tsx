import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Trash2, Loader2, ShieldCheck } from "lucide-react";
import { useStore } from "@/store/useStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { adminApi } from "@/api/admin";
import { useTagsQuery } from "@/hooks/queries/useTagsQuery";
import { useQueryClient } from "@tanstack/react-query";

export default function Admin() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { tagsResponse, isLoading: tagsLoading } = useTagsQuery();

  // Loading States for Form Submissions
  const [submittingTag, setSubmittingTag] = useState(false);
  const [submittingPaper, setSubmittingPaper] = useState(false);
  const [submittingSummary, setSubmittingSummary] = useState(false);

  // 1. Tag Form States
  const [tagName, setTagName] = useState("");
  const [tagDesc, setTagDesc] = useState("");

  // 2. Paper Form States
  const [paperTitle, setPaperTitle] = useState("");
  const [paperShort, setPaperShort] = useState("");
  const [paperAuthors, setPaperAuthors] = useState("");
  const [paperPublishedAt, setPaperPublishedAt] = useState("");
  const [paperImageUrl, setPaperImageUrl] = useState("");
  const [paperRawUrl, setPaperRawUrl] = useState("");
  const [paperSource, setPaperSource] = useState<"arxiv" | "github">("arxiv");
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);

  // 3. Summary Form States
  const [sumPaperId, setSumPaperId] = useState("");
  const [sumStyle, setSumStyle] = useState("plain");
  const [sumHook, setSumHook] = useState("");
  const [sumPoints, setSumPoints] = useState<string[]>([""]);
  const [sumDetailed, setSumDetailed] = useState("");

  // Tag Form Submit Handler
  const handleTagSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tagName.trim()) return;

    setSubmittingTag(true);
    try {
      await adminApi.createTag({
        name: tagName.trim(),
        description: tagDesc.trim(),
      });
      toast({
        title: "태그 등록 성공",
        description: `태그 '${tagName}'가 성공적으로 등록되었습니다.`,
      });
      setTagName("");
      setTagDesc("");
      // Refetch tags query
      queryClient.invalidateQueries({ queryKey: ["all-tags"] });
    } catch (err: any) {
      console.error(err);
      toast({
        variant: "destructive",
        title: "태그 등록 실패",
        description: err.response?.data?.detail || "에러가 발생했습니다.",
      });
    } finally {
      setSubmittingTag(false);
    }
  };

  // Paper Form Submit Handler
  const handlePaperSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paperTitle.trim() || !paperShort.trim() || !paperPublishedAt) return;

    setSubmittingPaper(true);
    try {
      const authorsList = paperAuthors
        .split(",")
        .map((a) => a.trim())
        .filter(Boolean);

      const paperData = {
        title: paperTitle.trim(),
        short: paperShort.trim(),
        authors: authorsList,
        published_at: new Date(paperPublishedAt).toISOString(),
        image_url: paperImageUrl.trim(),
        raw_url: paperRawUrl.trim(),
        source: paperSource,
        tag_ids: selectedTagIds,
      };

      await adminApi.createPaper(paperData);
      toast({
        title: "논문 등록 성공",
        description: `논문 '${paperTitle}'이 성공적으로 등록되었습니다.`,
      });

      // Reset Form
      setPaperTitle("");
      setPaperShort("");
      setPaperAuthors("");
      setPaperPublishedAt("");
      setPaperImageUrl("");
      setPaperRawUrl("");
      setPaperSource("arxiv");
      setSelectedTagIds([]);
    } catch (err: any) {
      console.error(err);
      toast({
        variant: "destructive",
        title: "논문 등록 실패",
        description: err.response?.data?.detail || "에러가 발생했습니다.",
      });
    } finally {
      setSubmittingPaper(false);
    }
  };

  // Summary Form Submit Handler
  const handleSummarySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const paperIdNum = parseInt(sumPaperId, 10);
    if (isNaN(paperIdNum) || !sumHook.trim() || !sumDetailed.trim()) return;

    setSubmittingSummary(true);
    try {
      const cleanPoints = sumPoints.map((p) => p.trim()).filter(Boolean);

      await adminApi.createSummary({
        paper_id: paperIdNum,
        style: sumStyle,
        hook: sumHook.trim(),
        points: cleanPoints,
        detailed: sumDetailed.trim(),
      });

      toast({
        title: "요약본 등록 성공",
        description: `논문 ID ${sumPaperId}번에 대한 요약본이 성공적으로 등록되었습니다.`,
      });

      // Reset Form
      setSumPaperId("");
      setSumStyle("plain");
      setSumHook("");
      setSumPoints([""]);
      setSumDetailed("");
    } catch (err: any) {
      console.error(err);
      toast({
        variant: "destructive",
        title: "요약본 등록 실패",
        description: err.response?.data?.detail || "에러가 발생했습니다.",
      });
    } finally {
      setSubmittingSummary(false);
    }
  };

  // Summary Points Handlers
  const handleAddPoint = () => {
    setSumPoints([...sumPoints, ""]);
  };

  const handleRemovePoint = (index: number) => {
    if (sumPoints.length > 1) {
      setSumPoints(sumPoints.filter((_, i) => i !== index));
    }
  };

  const handlePointChange = (index: number, value: string) => {
    const newPoints = [...sumPoints];
    newPoints[index] = value;
    setSumPoints(newPoints);
  };

  return (
    <main className="min-h-screen bg-muted/20 pb-20">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-md border-b mobile-safe-area-pt">
        <div className="flex items-center gap-3 p-4 max-w-[480px] md:max-w-2xl lg:max-w-4xl mx-auto">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-primary" />
            <h1 className="font-display text-xl font-bold">관리자 대시보드</h1>
          </div>
        </div>
      </header>

      <div className="max-w-[480px] md:max-w-2xl lg:max-w-4xl mx-auto p-4 space-y-6">
        <Tabs defaultValue="paper" className="w-full">
          <TabsList className="grid w-full grid-cols-3 h-12 bg-background border rounded-lg p-1 shadow-sm">
            <TabsTrigger value="paper" className="font-medium text-sm">논문 등록</TabsTrigger>
            <TabsTrigger value="summary" className="font-medium text-sm">요약 작성</TabsTrigger>
            <TabsTrigger value="tag" className="font-medium text-sm">태그 등록</TabsTrigger>
          </TabsList>

          {/* 1. Paper Registration Tab */}
          <TabsContent value="paper" className="mt-4">
            <Card className="border shadow-md">
              <CardHeader>
                <CardTitle className="text-lg">새 논문 등록</CardTitle>
                <CardDescription>데이터베이스에 새로운 논문 정보 및 태그 연결 정보를 수동으로 입력합니다.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePaperSubmit} className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="paper-title">논문 제목</Label>
                    <Input
                      id="paper-title"
                      placeholder="논문 제목 입력"
                      value={paperTitle}
                      onChange={(e) => setPaperTitle(e.target.value)}
                      required
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="paper-short">한줄 소개 (Short Description)</Label>
                    <Input
                      id="paper-short"
                      placeholder="피드에서 카드 하단에 노출될 간단한 소개 문구"
                      value={paperShort}
                      onChange={(e) => setPaperShort(e.target.value)}
                      required
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="paper-authors">저자 (쉼표로 구분)</Label>
                    <Input
                      id="paper-authors"
                      placeholder="예: Yann LeCun, Yoshua Bengio, Geoffrey Hinton"
                      value={paperAuthors}
                      onChange={(e) => setPaperAuthors(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="paper-published">발행 날짜</Label>
                      <Input
                        id="paper-published"
                        type="date"
                        value={paperPublishedAt}
                        onChange={(e) => setPaperPublishedAt(e.target.value)}
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="paper-source">출처 (Source)</Label>
                      <Select
                        value={paperSource}
                        onValueChange={(val: "arxiv" | "github") => setPaperSource(val)}
                      >
                        <SelectTrigger id="paper-source">
                          <SelectValue placeholder="출처 선택" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="arxiv">ArXiv</SelectItem>
                          <SelectItem value="github">GitHub</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="paper-image">대표 이미지 URL</Label>
                    <Input
                      id="paper-image"
                      type="url"
                      placeholder="https://example.com/image.png"
                      value={paperImageUrl}
                      onChange={(e) => setPaperImageUrl(e.target.value)}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="paper-raw">논문 원본 URL</Label>
                    <Input
                      id="paper-raw"
                      type="url"
                      placeholder="https://arxiv.org/abs/..."
                      value={paperRawUrl}
                      onChange={(e) => setPaperRawUrl(e.target.value)}
                    />
                  </div>

                  {/* Tags Selection */}
                  <div className="space-y-2">
                    <Label>태그 연결</Label>
                    {tagsLoading ? (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        태그 불러오는 중...
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 border rounded-lg p-3 bg-muted/10 max-h-40 overflow-y-auto">
                        {tagsResponse?.map((item) => (
                          <div key={item.tag.id} className="flex items-center space-x-2 py-1">
                            <Checkbox
                              id={`tag-${item.tag.id}`}
                              checked={selectedTagIds.includes(item.tag.id)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedTagIds([...selectedTagIds, item.tag.id]);
                                } else {
                                  setSelectedTagIds(selectedTagIds.filter((id) => id !== item.tag.id));
                                }
                              }}
                            />
                            <label
                              htmlFor={`tag-${item.tag.id}`}
                              className="text-sm font-medium leading-none cursor-pointer select-none"
                            >
                              {item.tag.name}
                            </label>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <Button type="submit" className="w-full mt-2" disabled={submittingPaper}>
                    {submittingPaper && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    논문 등록 완료
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 2. Summary Form Tab */}
          <TabsContent value="summary" className="mt-4">
            <Card className="border shadow-md">
              <CardHeader>
                <CardTitle className="text-lg">논문 요약 작성</CardTitle>
                <CardDescription>등록된 논문에 상세 요약 정보 및 카드뉴스형 포인트 데이터를 작성합니다.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSummarySubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="sum-paper-id">논문 ID (Number)</Label>
                      <Input
                        id="sum-paper-id"
                        type="number"
                        placeholder="예: 42"
                        value={sumPaperId}
                        onChange={(e) => setSumPaperId(e.target.value)}
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="sum-style">요약 스타일 (Style)</Label>
                      <Select value={sumStyle} onValueChange={setSumStyle}>
                        <SelectTrigger id="sum-style">
                          <SelectValue placeholder="스타일 선택" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="plain">일반 (Plain)</SelectItem>
                          <SelectItem value="detailed">상세 설명 (Detailed)</SelectItem>
                          <SelectItem value="dc">디시인사이드 스타일 (DC)</SelectItem>
                          <SelectItem value="basic_aggro">어그로 (Aggro)</SelectItem>
                          <SelectItem value="instagram_card_news">인스타 카드뉴스 (Instagram)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="sum-hook">한줄 요약 (Hook)</Label>
                    <Input
                      id="sum-hook"
                      placeholder="논문의 핵심을 담은 강렬한 한줄 요약"
                      value={sumHook}
                      onChange={(e) => setSumHook(e.target.value)}
                      required
                    />
                  </div>

                  {/* Summary Points Inputs */}
                  <div className="space-y-2">
                    <Label>요약 핵심 포인트</Label>
                    <div className="space-y-2">
                      {sumPoints.map((point, index) => (
                        <div key={index} className="flex gap-2 items-center">
                          <Input
                            placeholder={`핵심 포인트 ${index + 1} 입력`}
                            value={point}
                            onChange={(e) => handlePointChange(index, e.target.value)}
                            required
                          />
                          {sumPoints.length > 1 && (
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              onClick={() => handleRemovePoint(index)}
                              className="shrink-0"
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="mt-2 text-xs"
                      onClick={handleAddPoint}
                    >
                      <Plus className="w-3.5 h-3.5 mr-1" /> 포인트 추가
                    </Button>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="sum-detailed">상세 설명 (Detailed Body)</Label>
                    <Textarea
                      id="sum-detailed"
                      rows={5}
                      placeholder="상세한 논문 요약 본문을 마크다운 형식으로 작성 가능합니다."
                      value={sumDetailed}
                      onChange={(e) => setSumDetailed(e.target.value)}
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full mt-2" disabled={submittingSummary}>
                    {submittingSummary && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    요약본 등록 완료
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 3. Tag Registration Tab */}
          <TabsContent value="tag" className="mt-4">
            <Card className="border shadow-md">
              <CardHeader>
                <CardTitle className="text-lg">새 태그 추가</CardTitle>
                <CardDescription>서비스 전반에서 사용될 새로운 분야 태그를 등록합니다.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleTagSubmit} className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="tag-name">태그 이름</Label>
                    <Input
                      id="tag-name"
                      placeholder="예: ComputerVision (공백 불가 권장)"
                      value={tagName}
                      onChange={(e) => setTagName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="tag-description">태그 설명</Label>
                    <Textarea
                      id="tag-description"
                      rows={3}
                      placeholder="태그에 대한 상세 설명 입력"
                      value={tagDesc}
                      onChange={(e) => setTagDesc(e.target.value)}
                    />
                  </div>

                  <Button type="submit" className="w-full mt-2" disabled={submittingTag}>
                    {submittingTag && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    태그 등록 완료
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
