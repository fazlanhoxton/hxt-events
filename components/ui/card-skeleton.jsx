// components/ui/card-skeleton.jsx
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function CardSkeleton() {
  return (
    <Card>
      <CardHeader className="gap-2">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-4 w-1/5" />
      </CardHeader>
      <CardContent className="h-10">
        <Skeleton className="h-8 w-full" />
      </CardContent>
    </Card>
  );
}