const states = [
  { id: "ap", name: "Andhra Pradesh", short: "AP", emoji: "🏛️" },
  { id: "ts", name: "Telangana", short: "TS", emoji: "🏰" },
];

interface StateSelectorProps {
  selected: string | null;
  onSelect: (stateId: string) => void;
}

export function StateSelector({ selected, onSelect }: StateSelectorProps) {
  return (
    <div className="flex gap-3">
      {states.map((state) => (
        <button
          key={state.id}
          onClick={() => onSelect(state.id)}
          className={`flex-1 flex items-center gap-3 p-3 rounded-xl border-2 transition-all duration-200 ${
            selected === state.id
              ? "border-primary bg-primary/10 shadow-primary scale-[1.02]"
              : "border-border bg-card hover:border-primary/40 hover:shadow-card"
          }`}
        >
          <span className="text-2xl">{state.emoji}</span>
          <div className="text-left">
            <div className="font-heading font-bold text-xs">{state.short}</div>
            <div className="text-[10px] text-muted-foreground">{state.name}</div>
          </div>
        </button>
      ))}
    </div>
  );
}
