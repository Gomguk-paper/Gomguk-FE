import { EyeOff, Hash, Undo } from "lucide-react";
import { useStore } from "@/store/useStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function FilterManagementSection() {
    const { hiddenPapers, excludedTags, undoHidePaper, unexcludeTag } = useStore();

    const hiddenPaperIds = Object.keys(hiddenPapers).filter(id => hiddenPapers[id]);
    const blockedTagNames = Object.keys(excludedTags).filter(tag => excludedTags[tag]);

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                    <EyeOff className="w-4 h-4" />
                    필터 관리
                </CardTitle>
                <CardDescription>숨긴 논문과 차단한 태그를 관리합니다</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* 숨긴 논문 */}
                <div>
                    <h4 className="text-sm font-medium mb-2 flex items-center gap-1.5">
                        <EyeOff className="w-3.5 h-3.5 text-muted-foreground" />
                        숨긴 논문
                    </h4>
                    {hiddenPaperIds.length === 0 ? (
                        <p className="text-xs text-muted-foreground">숨긴 논문이 없습니다</p>
                    ) : (
                        <div className="space-y-2">
                            {hiddenPaperIds.map(paperId => (
                                <div key={paperId} className="flex items-center justify-between p-2 bg-secondary/50 rounded-md">
                                    <span className="text-sm text-muted-foreground truncate mr-2">
                                        논문 #{paperId}
                                    </span>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="gap-1 h-7 text-xs shrink-0"
                                        onClick={() => undoHidePaper(paperId)}
                                    >
                                        <Undo className="w-3 h-3" />
                                        복구
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* 차단한 태그 */}
                <div>
                    <h4 className="text-sm font-medium mb-2 flex items-center gap-1.5">
                        <Hash className="w-3.5 h-3.5 text-muted-foreground" />
                        차단한 태그
                    </h4>
                    {blockedTagNames.length === 0 ? (
                        <p className="text-xs text-muted-foreground">차단한 태그가 없습니다</p>
                    ) : (
                        <div className="flex flex-wrap gap-2">
                            {blockedTagNames.map(tag => (
                                <div key={tag} className="flex items-center gap-1.5 px-2.5 py-1.5 bg-secondary/50 rounded-full border">
                                    <span className="text-sm">#{tag}</span>
                                    <button
                                        className="text-muted-foreground hover:text-foreground transition-colors"
                                        onClick={() => unexcludeTag(tag)}
                                        aria-label={`${tag} 차단 해제`}
                                    >
                                        <Undo className="w-3 h-3" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
