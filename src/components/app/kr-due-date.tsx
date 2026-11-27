import { useState } from "react";
import { format } from "date-fns";
import type { Front } from "@/data/goals";
import { useGoals } from "@/lib/store";
import { latestKrDue } from "@/lib/due-policy";
import { DuePicker, DeadlineBadge } from "@/components/app/due-date";
import { frontPct } from "@/lib/progress";
import {
  AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle,
  AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction,
} from "@/components/ui/alert-dialog";

const displayDate = (value: string) => format(new Date(value + "T12:00:00"), "dd/MM/yyyy");

export function KrDuePicker({ front, krId, number }: { front: Front; krId: string; number: number }) {
  const { dueDates, closedDates, kr, setKrDueDate, setClosedDate } = useGoals();
  const [pending, setPending] = useState<string | null>(null);
  const parent = dueDates[front.id];
  return (
    <>
      <DuePicker value={dueDates[krId]} initialDate={parent} label={`Data estimada do KR${number}`} showCountdown={false}
        onChange={(due) => { if (!setKrDueDate(front.id, krId, due)) setPending(due); }} />
      <DuePicker value={closedDates[krId]} initialDate={dueDates[krId]} label={`Fechamento do KR${number}`} showCountdown={false} onChange={(date) => setClosedDate(krId, date)} />
      <DeadlineBadge due={dueDates[krId]} closed={closedDates[krId]} pct={kr[krId] ?? 0} />
      <AlertDialog open={pending !== null} onOpenChange={(open) => { if (!open) setPending(null); }}>
        <AlertDialogContent className="max-w-[calc(100%-2rem)] sm:max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle>O prazo do KR ultrapassa o da meta</AlertDialogTitle>
            <AlertDialogDescription>
              A meta “{front.name}” tem fechamento estimado em {parent ? displayDate(parent) : "data não definida"}.
              O KR{number} foi escolhido para {pending ? displayDate(pending) : ""}.
              Escolha uma data menor ou confirme essa nova estimativa para o KR e a meta.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:flex-wrap">
            <AlertDialogCancel>Diminuir data do KR</AlertDialogCancel>
            <AlertDialogAction className="h-auto whitespace-normal" onClick={() => {
              if (pending) setKrDueDate(front.id, krId, pending, true);
            }}>Ampliar prazo da meta e do KR</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

/** Both Goals and Report must respect the latest saved KR deadline. */
export function GoalDuePicker({ front }: { front: Front }) {
  const { dueDates, closedDates, kr, setDueDate, setClosedDate } = useGoals();
  const [conflict, setConflict] = useState(false);
  const [pendingClosure, setPendingClosure] = useState<string | null>(null);
  const latest = latestKrDue(front, dueDates);
  return (
    <>
      <DuePicker value={dueDates[front.id]} showCountdown={false} onChange={(due) => { if (!setDueDate(front.id, due)) setConflict(true); }} />
      <DuePicker value={closedDates[front.id]} initialDate={dueDates[front.id]} label="Fechamento da meta" showCountdown={false} onChange={(date) => {
        if (date && front.krs.some((k) => (kr[k.id] ?? 0) < 100)) setPendingClosure(date);
        else setClosedDate(front.id, date);
      }} />
      <DeadlineBadge due={dueDates[front.id]} closed={closedDates[front.id]} pct={frontPct(front, kr)} />
      <AlertDialog open={conflict} onOpenChange={setConflict}>
        <AlertDialogContent className="max-w-[calc(100%-2rem)] sm:max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle>A estimativa da meta não pode ser anterior à dos KRs</AlertDialogTitle>
            <AlertDialogDescription>Há um KR com prazo em {latest ? displayDate(latest) : ""}. Escolha uma data igual ou posterior para a meta; os prazos atuais foram mantidos.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Escolher outra data</AlertDialogCancel></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <AlertDialog open={pendingClosure !== null} onOpenChange={(open) => { if (!open) setPendingClosure(null); }}>
        <AlertDialogContent className="max-w-[calc(100%-2rem)] sm:max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar fechamento da meta?</AlertDialogTitle>
            <AlertDialogDescription>Há KRs ainda em andamento. Fechar a meta em {pendingClosure ? displayDate(pendingClosure) : ""} marcará todos os KRs como 100%, registrando essa data nos que ainda não têm fechamento. As estimativas serão mantidas.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => { if (pendingClosure) setClosedDate(front.id, pendingClosure); }}>Fechar meta e KRs</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}