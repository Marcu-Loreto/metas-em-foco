import { useEffect, useState } from "react";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { daysLeft, daysLeftLabel } from "@/lib/due";

export function DaysBadge({ n }: { n: number }) {
  const tone = n < 0 ? "bg-destructive/15 text-destructive" : n <= 7 ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground";
  return <span className={"inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium " + tone}><CalendarIcon className="h-3 w-3" />{daysLeftLabel(n)}</span>;
}

export function DuePicker({ value, onChange }: { value: string | undefined; onChange: (v: string | null) => void }) {
  const date = value ? new Date(value + "T12:00:00") : undefined;
  const [today, setToday] = useState<Date | null>(null);
  useEffect(() => {
    setToday(new Date());
    const timer = setInterval(() => setToday(new Date()), 60_000);
    return () => clearInterval(timer);
  }, []);
  return (
    <div className="my-4 flex flex-wrap items-center gap-2 text-sm">
      <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Data de finalização</span>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className={date ? "" : "text-muted-foreground"} aria-label="Escolher data de finalização">
            <CalendarIcon />{date ? format(date, "dd/MM/yyyy") : "Definir data"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar mode="single" locale={ptBR} selected={date} onSelect={(d) => onChange(d ? format(d, "yyyy-MM-dd") : null)} initialFocus className="p-3 pointer-events-auto" />
        </PopoverContent>
      </Popover>
      {value && today && <DaysBadge n={daysLeft(value, today)} />}
      {value && <Button variant="ghost" size="sm" onClick={() => onChange(null)}>Limpar</Button>}
    </div>
  );
}