import { Card } from "@/components/ui/card";

interface StyleCardProps {
  name: string;
  imageUrl: string;
  onClick: () => void;
}

const StyleCard = ({ name, imageUrl, onClick }: StyleCardProps) => {
  return (
    <Card 
      className="group cursor-pointer overflow-hidden border-0 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
      onClick={onClick}
    >
      <div className="aspect-square overflow-hidden rounded-xl">
        <img 
          src={imageUrl} 
          alt={name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
        />
      </div>
      <div className="p-3 text-center">
        <p className="text-sm font-medium text-foreground">{name}</p>
      </div>
    </Card>
  );
};

export default StyleCard;
