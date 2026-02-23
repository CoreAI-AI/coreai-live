import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
  style?: React.CSSProperties;
}

export const Skeleton = ({ className, style }: SkeletonProps) => {
  return (
    <div
      className={cn(
        "rounded-lg bg-muted skeleton-shimmer",
        className
      )}
      style={style}
    />
  );
};

export const ChatMessageSkeleton = () => {
  return (
    <div className="flex gap-3 mb-4 animate-fade-in">
      <Skeleton className="w-8 h-8 rounded-full shrink-0" />
      <div className="flex-1 space-y-2.5">
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-4 w-3/5" />
        <Skeleton className="h-4 w-2/5" />
      </div>
    </div>
  );
};

export const ChatLoadingSkeleton = () => {
  return (
    <div className="space-y-6 p-4">
      {[...Array(3)].map((_, i) => (
        <ChatMessageSkeleton key={i} />
      ))}
    </div>
  );
};

export const ImageGallerySkeleton = () => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {[...Array(8)].map((_, i) => (
        <Skeleton 
          key={i} 
          className="aspect-square rounded-xl" 
          style={{ animationDelay: `${i * 100}ms` }}
        />
      ))}
    </div>
  );
};

export const DocumentListSkeleton = () => {
  return (
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <div 
          key={i} 
          className="flex items-center gap-3 p-4 border rounded-xl animate-fade-in"
          style={{ animationDelay: `${i * 50}ms` }}
        >
          <Skeleton className="w-10 h-10 rounded-lg" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-3 w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
};

export const NoteCardSkeleton = () => {
  return (
    <div className="border rounded-xl p-5 space-y-3 animate-fade-in">
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <Skeleton className="h-3 w-1/4 mt-2" />
    </div>
  );
};

export const SidebarSkeleton = () => {
  return (
    <div className="w-full h-full bg-sidebar p-4 space-y-4">
      {/* Header skeleton */}
      <div className="flex items-center gap-2">
        <Skeleton className="w-7 h-7 rounded-lg" />
        <Skeleton className="h-5 w-20" />
      </div>
      
      {/* Search skeleton */}
      <Skeleton className="h-9 w-full rounded-lg" />
      
      {/* Navigation skeleton */}
      <div className="space-y-2 pt-2">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-9 w-full rounded-lg" />
        ))}
      </div>
      
      {/* Chats skeleton */}
      <div className="space-y-2 pt-4">
        <Skeleton className="h-3 w-16" />
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-9 w-full rounded-lg" />
        ))}
      </div>
    </div>
  );
};

export const PageSkeleton = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <div className="w-12 h-12 bg-foreground rounded-xl flex items-center justify-center mx-auto animate-pulse">
          <div className="w-6 h-6 bg-background rounded-lg" />
        </div>
        <Skeleton className="h-4 w-32 mx-auto" />
      </div>
    </div>
  );
};
