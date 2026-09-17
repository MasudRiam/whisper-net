import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <Skeleton className="h-10 w-64" />
      <Skeleton className="h-36 w-full" />
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
      </div>
    </div>
  );
}
