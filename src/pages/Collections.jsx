import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import Img from '../components/Img';
import { COLLECTIONS } from '../data/collections';

export default function Collections() {
  return (
    <>
      <div className="pg-head"><div><h1 className="serif">Our Collections</h1><p>Distinct designs for every chapter of your story.</p></div></div>
      <div className="colp">
        {COLLECTIONS.map((c, i) => (
          <Link key={c.id} to={`/shop?collection=${c.id}`} className={`colp__row ${i % 2 ? 'is-flip' : ''}`} aria-label={`${c.name}, ${c.count} designs`}>
            <figure className="colp__fig"><Img src={c.coverSm} srcSet={`${c.coverXs} 480w, ${c.coverSm} 800w, ${c.cover} 1200w`} sizes="(min-width: 900px) 50vw, 100vw" alt={c.coverAlt} eager={i < 2} /></figure>
            <div className="colp__txt">
              <span className="meta">{c.tag}</span>
              <h2 className="serif">{c.name}</h2>
              <p>{c.blurb}</p>
              <span className="colp__go"><span>{c.count} designs</span><ArrowUpRight size={22} strokeWidth={1.3} /></span>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}
