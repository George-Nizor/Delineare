import { useEffect, useRef, type ReactNode } from 'react';

// Fades and lifts its children into place the first time they scroll into view. Elements that are
// already on screen when the page opens are handled by the page's own entrance animation instead.
export function Reveal({ children, className = '', as: Tag = 'div' }: { children: ReactNode; className?: string; as?: 'div' | 'section' | 'li' }) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    if (!('IntersectionObserver' in window)) { element.classList.add('shown'); return; }
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) if (entry.isIntersecting) { entry.target.classList.add('shown'); observer.unobserve(entry.target); }
    }, { rootMargin: '0px 0px -8% 0px' });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  return <Tag ref={ref as never} className={`reveal ${className}`}>{children}</Tag>;
}
