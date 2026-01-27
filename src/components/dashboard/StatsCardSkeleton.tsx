import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface StatsCardSkeletonProps {
  variant?: "simple" | "with-sparkline" | "with-icon";
  index?: number;
}

export const StatsCardSkeleton = ({ variant = "simple", index = 0 }: StatsCardSkeletonProps) => {
  const shimmerVariants = {
    initial: { opacity: 0, y: 10 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.4,
        delay: index * 0.1,
        ease: "easeOut"
      }
    }
  };

  if (variant === "with-sparkline") {
    return (
      <motion.div
        variants={shimmerVariants}
        initial="initial"
        animate="animate"
      >
        <Card className="overflow-hidden">
          <div className="p-6">
            <div className="flex items-center justify-between mb-3">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-4 rounded-full" />
            </div>
            <Skeleton className="h-10 w-16 mb-3" />
            {/* Sparkline skeleton */}
            <div className="h-8 flex items-end gap-1">
              {[...Array(7)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{ 
                    duration: 0.3, 
                    delay: index * 0.1 + i * 0.05,
                    ease: "easeOut"
                  }}
                  style={{ transformOrigin: "bottom" }}
                  className="flex-1"
                >
                  <Skeleton 
                    className="w-full" 
                    style={{ height: `${Math.random() * 60 + 40}%` }}
                  />
                </motion.div>
              ))}
            </div>
          </div>
        </Card>
      </motion.div>
    );
  }

  if (variant === "with-icon") {
    return (
      <motion.div
        variants={shimmerVariants}
        initial="initial"
        animate="animate"
      >
        <Card className="overflow-hidden">
          <div className="p-6">
            <div className="flex items-center gap-4">
              <Skeleton className="h-12 w-12 rounded-xl" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-16" />
              </div>
              <Skeleton className="h-4 w-4 rounded-full" />
            </div>
          </div>
        </Card>
      </motion.div>
    );
  }

  // Simple variant
  return (
    <motion.div
      variants={shimmerVariants}
      initial="initial"
      animate="animate"
    >
      <Card className="overflow-hidden">
        <div className="p-6 space-y-3">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-20" />
        </div>
      </Card>
    </motion.div>
  );
};

// Grid skeleton for booking stats
export const BookingStatsGridSkeleton = () => (
  <div className="grid gap-4 md:grid-cols-3">
    {[0, 1, 2].map((i) => (
      <StatsCardSkeleton key={i} variant="with-sparkline" index={i} />
    ))}
  </div>
);

// Grid skeleton for structure stats (tables, menu)
export const StructureStatsGridSkeleton = () => (
  <div className="grid gap-4 md:grid-cols-2">
    {[0, 1].map((i) => (
      <StatsCardSkeleton key={i} variant="with-icon" index={i} />
    ))}
  </div>
);

// Grid skeleton for review stats
export const ReviewStatsGridSkeleton = () => (
  <div className="grid gap-4 md:grid-cols-2">
    {[0, 1].map((i) => (
      <StatsCardSkeleton key={i} variant="with-icon" index={i} />
    ))}
  </div>
);

// Restaurant header skeleton
export const RestaurantHeaderSkeleton = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4 }}
  >
    <Card className="overflow-hidden">
      <div className="p-6 md:p-8">
        <div className="flex flex-col md:flex-row gap-6 items-start">
          {/* Logo skeleton */}
          <Skeleton className="w-24 h-24 md:w-28 md:h-28 rounded-2xl flex-shrink-0" />
          
          {/* Info skeleton */}
          <div className="flex-1 min-w-0 space-y-4">
            <div className="space-y-2">
              <Skeleton className="h-8 w-48" />
              <div className="flex gap-2">
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-6 w-24" />
              </div>
            </div>
            <Skeleton className="h-4 w-full max-w-lg" />
            <Skeleton className="h-4 w-3/4 max-w-md" />
            <Skeleton className="h-9 w-40" />
          </div>
          
          {/* Rating skeleton */}
          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-2">
              <Skeleton className="h-6 w-8" />
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="w-5 h-5 rounded-full" />
                ))}
              </div>
            </div>
            <Skeleton className="h-4 w-20" />
          </div>
        </div>
      </div>
    </Card>
  </motion.div>
);

export default StatsCardSkeleton;
