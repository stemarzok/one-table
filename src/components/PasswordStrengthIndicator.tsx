import { Check, X } from "lucide-react";
import { checkPasswordStrength } from "@/lib/validation";

interface PasswordStrengthIndicatorProps {
  password: string;
}

const PasswordStrengthIndicator = ({ password }: PasswordStrengthIndicatorProps) => {
  const { checks } = checkPasswordStrength(password);

  const requirements = [
    { key: "minLength", label: "Minimo 8 caratteri", met: checks.minLength },
    { key: "hasUppercase", label: "Una lettera maiuscola", met: checks.hasUppercase },
    { key: "hasLowercase", label: "Una lettera minuscola", met: checks.hasLowercase },
    { key: "hasNumber", label: "Un numero", met: checks.hasNumber },
    { key: "hasSpecial", label: "Un carattere speciale (!@#$%...)", met: checks.hasSpecial },
  ];

  if (!password) return null;

  return (
    <div className="space-y-1.5 mt-2">
      {requirements.map((req) => (
        <div
          key={req.key}
          className={`flex items-center gap-2 text-xs transition-colors ${
            req.met ? "text-green-600 dark:text-green-500" : "text-muted-foreground"
          }`}
        >
          {req.met ? (
            <Check className="h-3 w-3" />
          ) : (
            <X className="h-3 w-3" />
          )}
          <span>{req.label}</span>
        </div>
      ))}
    </div>
  );
};

export default PasswordStrengthIndicator;
