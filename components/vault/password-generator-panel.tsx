'use client';

import { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { generatePassword, type PasswordGeneratorOptions } from '@/lib/utils/password-generator';

interface PasswordGeneratorPanelProps {
    onGenerate: (password: string) => void;
}

const DEFAULT_OPTIONS: PasswordGeneratorOptions = {
    length: 16,
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true,
    excludeSimilar: false,
    excludeAmbiguous: false,
};

export function PasswordGeneratorPanel({ onGenerate }: PasswordGeneratorPanelProps) {
    const [options, setOptions] = useState<PasswordGeneratorOptions>(DEFAULT_OPTIONS);
    const [preview, setPreview] = useState(() => generatePassword(DEFAULT_OPTIONS));

    function regenerate(next: PasswordGeneratorOptions = options) {
        const generated = generatePassword(next);
        setPreview(generated);
        return generated;
    }

    function updateOption<K extends keyof PasswordGeneratorOptions>(
        key: K,
        value: PasswordGeneratorOptions[K],
    ) {
        const next = { ...options, [key]: value };
        setOptions(next);
        regenerate(next);
    }

    return (
        <div className="flex flex-col gap-3 border-2 border-border bg-secondary-background p-4">
            <div className="flex items-center gap-2">
                <Input readOnly value={preview} className="font-mono" />
                <Button type="button" variant="neutral" size="icon" onClick={() => regenerate()}>
                    <RefreshCw className="size-4" />
                </Button>
            </div>

            <div className="flex items-center gap-2">
                <Label className="w-32 shrink-0">Panjang: {options.length}</Label>
                <input
                    type="range"
                    min={8}
                    max={64}
                    value={options.length}
                    onChange={e => updateOption('length', Number(e.target.value))}
                    className="w-full"
                />
            </div>

            <div className="grid grid-cols-2 gap-2 text-sm">
                <label className="flex items-center gap-2">
                    <Checkbox
                        checked={options.uppercase}
                        onCheckedChange={checked => updateOption('uppercase', Boolean(checked))}
                    />
                    Huruf Besar (A-Z)
                </label>
                <label className="flex items-center gap-2">
                    <Checkbox
                        checked={options.lowercase}
                        onCheckedChange={checked => updateOption('lowercase', Boolean(checked))}
                    />
                    Huruf Kecil (a-z)
                </label>
                <label className="flex items-center gap-2">
                    <Checkbox
                        checked={options.numbers}
                        onCheckedChange={checked => updateOption('numbers', Boolean(checked))}
                    />
                    Angka (0-9)
                </label>
                <label className="flex items-center gap-2">
                    <Checkbox
                        checked={options.symbols}
                        onCheckedChange={checked => updateOption('symbols', Boolean(checked))}
                    />
                    Simbol (!@#$)
                </label>
                <label className="flex items-center gap-2">
                    <Checkbox
                        checked={options.excludeSimilar}
                        onCheckedChange={checked =>
                            updateOption('excludeSimilar', Boolean(checked))
                        }
                    />
                    Kecualikan Karakter Mirip (i, l, 1, O, 0)
                </label>
                <label className="flex items-center gap-2">
                    <Checkbox
                        checked={options.excludeAmbiguous}
                        onCheckedChange={checked =>
                            updateOption('excludeAmbiguous', Boolean(checked))
                        }
                    />
                    Kecualikan Karakter Ambigu
                </label>
            </div>

            <Button type="button" onClick={() => onGenerate(preview)}>
                Gunakan Password Ini
            </Button>
        </div>
    );
}
