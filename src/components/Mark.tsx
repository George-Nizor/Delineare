import { MARK } from '../brand/mark';
import '../brand/instrumenta-icons.css';

// The pencil mark, rendered by Instrumenta's icon library. It draws its line when hovered or
// focused (the `ii-hover` ancestor) or while `playing` is set, and rests otherwise.
export function Mark({ size = 32, playing = false }: { size?: 16 | 24 | 32 | 48 | 96; playing?: boolean }) {
  return <span className={playing ? 'ii-play' : undefined} style={{ display: 'inline-flex', lineHeight: 0 }} aria-hidden="true" dangerouslySetInnerHTML={{ __html: MARK[size] || MARK[32]! }} />;
}
