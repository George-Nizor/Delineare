import type { CheckAnswer } from '../store/db';

// Four plain answers to one check. No numbers and no overall score.
export function Answers({ value, onChange, label }: { value: CheckAnswer | undefined; onChange: (answer: CheckAnswer) => void; label: string }) {
  const options: [CheckAnswer, string][] = [['yes', 'Yes'], ['partly', 'Partly'], ['not-yet', 'Not yet'], ['cant-tell', "Can't tell"]];
  return (
    <span className="answers" role="group" aria-label={label}>
      {options.map(([answer, text]) => (
        <button key={answer} type="button" aria-pressed={value === answer} onClick={() => onChange(answer)}>{text}</button>
      ))}
    </span>
  );
}
