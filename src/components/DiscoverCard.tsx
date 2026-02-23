import { Card } from "@/components/ui/card";

interface DiscoverCardProps {
  text: string;
  imageUrl: string;
  onClick: () => void;
}

const DiscoverCard = ({ text, imageUrl, onClick }: DiscoverCardProps) => {
  return (
    <Card 
      className="group cursor-pointer overflow-hidden border-0 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
      onClick={onClick}
    >
      <div className="aspect-video overflow-hidden rounded-t-xl">
        <img 
          src={imageUrl} 
          alt={text}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
        />
      </div>
      <div className="p-4">
        <p className="text-sm font-medium text-foreground leading-snug">{text}</p>
      </div>
    </Card>
  );
};

export default DiscoverCard;
