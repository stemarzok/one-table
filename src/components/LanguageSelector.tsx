import { Globe, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLanguage, languageInfo, type Language } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

interface LanguageSelectorProps {
  variant?: "default" | "compact" | "full";
  className?: string;
}

const languages: Language[] = ['it', 'en', 'es', 'de', 'fr', 'nl', 'ru'];

export const LanguageSelector = ({ variant = "default", className }: LanguageSelectorProps) => {
  const { language, setLanguage, isTranslating } = useLanguage();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "relative transition-all h-9 w-9",
            className
          )}
        >
          {isTranslating ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <span className="text-xs font-bold uppercase tracking-tight">{language}</span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[180px] bg-popover border border-border z-[100]">
        {languages.map((lang) => {
          const info = languageInfo[lang];
          return (
            <DropdownMenuItem
              key={lang}
              onClick={() => setLanguage(lang)}
              className={cn(
                "flex items-center gap-3 cursor-pointer",
                language === lang && "bg-primary/10 text-primary"
              )}
            >
              <span className="text-xs font-bold uppercase w-5 text-center">{lang}</span>
              <span className="flex-1 text-sm">{info.nativeName}</span>
              {language === lang && (
                <span className="w-2 h-2 rounded-full bg-primary" />
              )}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSelector;
