import { ReviewsList } from "@/components/ReviewsList";

interface ReviewsManagementProps {
  restaurantId: string;
}

export const ReviewsManagement = ({ restaurantId }: ReviewsManagementProps) => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Gestione Recensioni</h2>
      <ReviewsList restaurantId={restaurantId} />
    </div>
  );
};