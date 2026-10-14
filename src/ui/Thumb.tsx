import { useEffect, useState } from 'react';

// Shows a stored image Blob through an object URL that is released when the image goes away.
export function BlobImage({ blob, alt, className }: { blob: Blob; alt: string; className?: string }) {
  const [url, setUrl] = useState('');
  useEffect(() => {
    const next = URL.createObjectURL(blob);
    setUrl(next);
    return () => URL.revokeObjectURL(next);
  }, [blob]);
  return url ? <img src={url} alt={alt} className={className} /> : null;
}

export function shortDate(time: number): string {
  return new Date(time).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: new Date(time).getFullYear() === new Date().getFullYear() ? undefined : 'numeric' });
}
