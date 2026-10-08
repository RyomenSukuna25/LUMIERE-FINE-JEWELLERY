import { useEffect, useRef, useState } from 'react';

export default function Img({ src, srcSet, sizes = '(min-width: 1024px) 33vw, 50vw', alt, className = '', eager = false, style, ...rest }) {
  const ref = useRef(null);
  const [ready, setReady] = useState(false);
  useEffect(() => { setReady(!!ref.current?.complete && ref.current.naturalWidth > 0); }, [src]);
  return (
    <img
      ref={ref} src={src} srcSet={srcSet} sizes={srcSet ? sizes : undefined} alt={alt}
      loading={eager ? 'eager' : 'lazy'} decoding="async" fetchpriority={eager ? 'high' : undefined}
      className={`img ${ready ? 'is-in' : ''} ${className}`} style={style}
      onLoad={() => setReady(true)} {...rest}
    />
  );
}
