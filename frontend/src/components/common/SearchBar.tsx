import { Search, X, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  isLoading?: boolean;
}

export const SearchBar = ({
  value,
  onChange,
  placeholder = 'Buscar...',
  isLoading,
}: SearchBarProps) => {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="pl-9 pr-9"
      />
      {value && !isLoading && (
        <Button
          type="button"
          className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0 bg-transparent hover:bg-gray-100"
          onClick={() => onChange('')}
        >
          <X className="h-4 w-4" />
        </Button>
      )}
      {isLoading && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
        </div>
      )}
    </div>
  );
};