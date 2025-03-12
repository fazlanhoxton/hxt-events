import { Skeleton } from "@/components/ui/skeleton";

export function TableSkeleton() {
    function renderSkeleton() {
        return Array.from({ length: 20 }, (_, i) => (
            <Skeleton key={i} className=" h-[20px] rounded-lg" />
        ));
    }

    return (
        <div className="container mx-auto">
            <div className="grid grid-cols-5 gap-1">
                {renderSkeleton()}
            </div>
        </div>
    );
}
