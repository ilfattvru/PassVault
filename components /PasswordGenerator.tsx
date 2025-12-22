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

  const generatePassword = async () => {
    let hasAtLeastOne = includeLowercase || includeUppercase || includeNumbers || includeSymbols;
    if (!hasAtLeastOne) {
      toast.error('Выберите хотя бы один тип символов');
      return;
    }

    try {
      const response = await fetch('http://localhost:8080/vault/entries/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          length: length[0],
          lowercase: includeLowercase,
          uppercase: includeUppercase,
          digits: includeNumbers,
          symbols: includeSymbols,
        }),
      });

      if (response.status === 200) {
        const password = await response.text();
        setGeneratedPassword(password);
      } else {
        toast.error('Не удалось сгенерировать пароль');
      }
    } catch (error) {
      toast.error('Ошибка подключения к серверу');
    }
  };

  const copyToClipboard = () => {
    if (generatedPassword) {
      navigator.clipboard.writeText(generatedPassword);
      toast.success('Пароль скопирован в буфер обмена');
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label className="mb-2 block">Длина: {length[0]}</Label>
        <Slider
          value={length}
          onValueChange={setLength}
          min={6}
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
            Заглавные (A-Z)
          </label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="lowercase"
            checked={includeLowercase}
            onCheckedChange={(checked) => setIncludeLowercase(checked as boolean)}
          />
          <label htmlFor="lowercase" className="cursor-pointer">
            Строчные (a-z)
          </label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="numbers"
            checked={includeNumbers}
            onCheckedChange={(checked) => setIncludeNumbers(checked as boolean)}
          />
          <label htmlFor="numbers" className="cursor-pointer">
            Цифры (0-9)
          </label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="symbols"
            checked={includeSymbols}
            onCheckedChange={(checked) => setIncludeSymbols(checked as boolean)}
          />
          <label htmlFor="symbols" className="cursor-pointer">
            Символы (!@#$...)
          </label>
        </div>
      </div>

      <Button onClick={generatePassword} className="w-full" type="button">
        <RefreshCw className="mr-2 h-4 w-4" />
        Сгенерировать пароль
      </Button>

      {generatedPassword && (
        <div className="space-y-2">
          <div className="p-3 bg-muted rounded-md break-all font-mono">
            {generatedPassword}
          </div>
          <div className="flex gap-2">
            <Button onClick={copyToClipboard} variant="outline" className="flex-1" type="button">
              <Copy className="mr-2 h-4 w-4" />
              Копировать
            </Button>
            {onUsePassword && (
              <Button
                onClick={() => onUsePassword(generatedPassword)}
                variant="default"
                className="flex-1"
                type="button"
              >
                Использовать этот пароль
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
