
import { Skeleton } from "@/components/ui/skeleton";

export function PaperCardSkeleton() {
    return (
        <div className="bg-card rounded-lg border shadow-sm overflow-hidden flex flex-col md:flex-row md:gap-5 md:p-4 mb-4">
            {/* Image Skeleton */}
            <div className="w-full md:w-[28%] flex-shrink-0">
                <Skeleton className="aspect-[3/2] md:aspect-[4/3] w-full rounded-none md:rounded-lg" />
            </div>

            {/* Content Skeleton */}
            <div className="flex-1 flex flex-col p-4 md:p-0 gap-3">
                {/* Header */}
                <div className="space-y-2">
                    <Skeleton className="h-6 w-3/4" />
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-4 w-1/3" />
                        <Skeleton className="h-5 w-16 rounded-sm" />
                    </div>
                </div>

                {/* Tags */}
                <div className="flex gap-2">
                    <Skeleton className="h-6 w-16 rounded-full" />
                    <Skeleton className="h-6 w-20 rounded-full" />
                    <Skeleton className="h-6 w-14 rounded-full" />
                </div>

                {/* Summary Hook */}
                <Skeleton className="h-4 w-full" />

                {/* Abstract */}
                <div className="space-y-1">
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-5/6" />
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-2 mt-auto">
                    <div className="flex gap-2">
                        <Skeleton className="h-8 w-16" />
                        <Skeleton className="h-8 w-16" />
                    </div>
                    <div className="flex gap-2">
                        <Skeleton className="h-8 w-12" />
                        <Skeleton className="h-8 w-20" />
                    </div>
                </div>
            </div>
        </div>
    );
}
