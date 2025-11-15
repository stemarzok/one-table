import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface SearchBarProps {
  onSearch?: (query: string) => void;
}

const SearchBar = ({ onSearch }: SearchBarProps) => {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const query = formData.get("search") as string;
    onSearch?.(query);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-3xl mx-auto">
      <div className="flex gap-2 bg-background/95 backdrop-blur-sm rounded-full p-2 shadow-2xl border-2 border-primary/20">
        <Input
          type="text"
          name="search"
          placeholder="Cerca il tuo ristorante preferito..."
          className="flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-lg px-6"
        />
        <Button 
          type="submit" 
          size="lg" 
          className="rounded-full bg-primary hover:bg-primary/90 px-8"
        >
          <Search className="w-5 h-5 mr-2" />
          Cerca
        </Button>
      </div>
    </form>
  );
};

export default SearchBar;
