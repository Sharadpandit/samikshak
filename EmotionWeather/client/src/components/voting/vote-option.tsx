import { Button } from "@/components/ui/button";

interface VoteOptionProps {
  emoji: string;
  label: string;
  description: string;
  voteType: string;
  isSelected?: boolean;
  onClick: (voteType: string) => void;
}

export function VoteOption({ emoji, label, description, voteType, isSelected = false, onClick }: VoteOptionProps) {
  return (
    <Button
      variant="ghost"
      className={`emoji-vote-btn flex flex-col items-center p-6 h-auto bg-muted hover:bg-accent border-2 transition-all ${
        isSelected ? "border-primary bg-primary/10" : "border-transparent hover:border-primary"
      }`}
      onClick={() => onClick(voteType)}
      data-testid={`vote-option-${voteType}`}
    >
      <div className="text-4xl mb-3">{emoji}</div>
      <div className="font-medium text-foreground">{label}</div>
      <div className="text-sm text-muted-foreground mt-1 text-center">{description}</div>
    </Button>
  );
}
