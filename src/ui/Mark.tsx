import { MARK } from '../brand/mark';

// The Delineare pencil, rendered by Instrumenta's icon library (src/brand/mark.ts is generated).
export function Mark({ size = 24 }: { size?: 16 | 24 | 32 | 48 | 96 }) {
  return <span className="mark" aria-hidden="true" dangerouslySetInnerHTML={{ __html: MARK[size] ?? '' }} />;
}
