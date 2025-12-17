import { useState } from 'react';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Checkbox } from './ui/checkbox';
import { Slider } from './ui/slider';
import { Copy, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

export function PasswordGenerator({ onUsePassword }: { onUsePassword?: (password: string) => void }) {
  const [length, setLength] = useState([16]);
  const [includeUppercase, setIncludeUppercase] = useState(true);
  const [includeLowercase, setIncludeLowercase] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  const [generatedPassword, setGeneratedPassword] = useState('');

  const generatePassword = () => {
    let charset = '';
    if (includeLowercase) charset += 'abcdefghijklmnopqrstuvwxyz';
    if (includeUppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (includeNumbers) charset += '0123456789';
    if (includeSymbols) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';

    if (charset === '') {
      toast.error('Please select at least one character type');
      return;
    }

    let password = '';
    for (let i = 0; i < length[0]; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    setGeneratedPassword(password);
  };

  const copyToClipboard = () => {
    if (generatedPassword) {
      navigator.clipboard.writeText(generatedPassword);
      toast.success('Password copied to clipboard');
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label className="mb-2 block">Length: {length[0]}</Label>
        <Slider
          value={length}
          onValueChange={setLength}
          min={8}
          max={32}
          step={1}
          className="mt-2"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="uppercase"
            checked={includeUppercase}
            onCheckedChange={(checked) => setIncludeUppercase(checked as boolean)}
          />
          <label htmlFor="uppercase" className="cursor-pointer">
            Uppercase (A-Z)
          </label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="lowercase"
            checked={includeLowercase}
            onCheckedChange={(checked) => setIncludeLowercase(checked as boolean)}
          />
          <label htmlFor="lowercase" className="cursor-pointer">
            Lowercase (a-z)
          </label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="numbers"
            checked={includeNumbers}
            onCheckedChange={(checked) => setIncludeNumbers(checked as boolean)}
          />
          <label htmlFor="numbers" className="cursor-pointer">
            Numbers (0-9)
          </label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="symbols"
            checked={includeSymbols}
            onCheckedChange={(checked) => setIncludeSymbols(checked as boolean)}
          />
          <label htmlFor="symbols" className="cursor-pointer">
            Symbols (!@#$...)
          </label>
        </div>
      </div>

      <Button onClick={generatePassword} className="w-full" type="button">
        <RefreshCw className="mr-2 h-4 w-4" />
        Generate Password
      </Button>

      {generatedPassword && (
        <div className="space-y-2">
          <div className="p-3 bg-muted rounded-md break-all font-mono">
            {generatedPassword}
          </div>
          <div className="flex gap-2">
            <Button onClick={copyToClipboard} variant="outline" className="flex-1" type="button">
              <Copy className="mr-2 h-4 w-4" />
              Copy
            </Button>
            {onUsePassword && (
              <Button
                onClick={() => onUsePassword(generatedPassword)}
                variant="default"
                className="flex-1"
                type="button"
              >
                Use This Password
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
