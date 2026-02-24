import React from 'react';

interface GuessLimitSelectorProps {
  value: number | null;
  onChange: (val: number | null) => void;
}

const OPTIONS = [
  { label: 'Unlimited', value: null },
  { label: '5', value: 5 },
  { label: '10', value: 10 },
  { label: '15', value: 15 },
  { label: '20', value: 20 },
];

export default function GuessLimitSelector({ value, onChange }: GuessLimitSelectorProps) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <span className="font-minecraft text-xs text-mc-gray">Guess limit:</span>
      <div className="flex gap-2">
        {OPTIONS.map((opt) => (
          <button
            key={String(opt.value)}
            onClick={() => onChange(opt.value)}
            className={`px-3 py-1 text-xs font-minecraft border-2 transition-colors ${
              value === opt.value
                ? 'bg-mc-grass border-green-400 text-white'
                : 'bg-mc-dark border-mc-stone text-mc-gray hover:bg-mc-stone'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
