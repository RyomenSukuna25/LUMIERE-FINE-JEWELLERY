// CSS framing of a supplied photograph (no cropped file is written; framing is done with background-position/size).
export default function Crop({ src = '/images/hero.jpg', x = 50, y = 50, z = 1, label, className = '', children }) {
  return (
    <div className={`crop ${className}`} role="img" aria-label={label} style={{ backgroundImage: `url(${src})`, backgroundSize: `auto ${z * 100}%`, backgroundPosition: `${x}% ${y}%` }}>
      {children}
    </div>
  );
}
