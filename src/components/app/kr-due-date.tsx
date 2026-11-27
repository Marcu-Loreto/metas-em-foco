import { useState } from "react";
import { format } from "date-fns";
import type { Front } from "@/data/goals";
import { useGoals } from "@/lib/store";
import { latestKrDue } from "@/lib/due-policy";
import { DuePicker } from "@/components/app/due-date";
import {
  AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle,
  AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction,
} from "@/components/ui/alert-dialog";

const displayDate = (value: string) => format(new Date(value + "T12:00:00"), "dd/MM/yyyy");

export function KrDuePicker({ front, krId, number }: { front: Front; krId: string; number: number }) {
  const { dueDates, setKrDueDate } = useGoals();
  const [pending, setPending] = useState<string | null>(null);
  const parent = dueDates[front.id];
  return (
    <>
      <DuePicker value={dueDates[krId]} initialDate={parent} label={`Prazo do KR${number}`}
        onChange={(due) => { if (!setKrDueDate(front.id, krId, due)) setPending(due); }} />
      <AlertDialog open={pending !== null} onOpenChange={(open) => { if (!open) setPending(null); }}>
        <AlertDialogContent className="max-w-[calc(100%-2rem)] sm:max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle>O prazo do KR ultrapassa o da meta</AlertDialogTitle>
            <AlertDialogDescription>
              A meta “{front.name}” fecha em {parent ? displayDate(parent) : "data não definida"}.
              O KR{number} foi escolhido para {pending ? displayDate(pending) : ""}.
              Escolha uma data menor ou confirme essa nova data de fechamento para o KR e a meta.
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
  const { dueDates, setDueDate } = useGoals();
  const [conflict, setConflict] = useState(false);
  const latest = latestKrDue(front, dueDates);
  return (
    <>
      <DuePicker value={dueDates[front.id]} onChange={(due) => { if (!setDueDate(front.id, due)) setConflict(true); }} />
      <AlertDialog open={conflict} onOpenChange={setConflict}>
        <AlertDialogContent className="max-w-[calc(100%-2rem)] sm:max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle>A meta não pode fechar antes dos KRs</AlertDialogTitle>
            <AlertDialogDescription>Há um KR com prazo em {latest ? displayDate(latest) : ""}. Escolha uma data igual ou posterior para a meta; os prazos atuais foram mantidos.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Escolher outra data</AlertDialogCancel></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}