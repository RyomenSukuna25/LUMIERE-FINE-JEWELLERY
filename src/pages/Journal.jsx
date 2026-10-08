import { Link } from 'react-router-dom';
import { JOURNAL } from '../data/journal';
import { edImg, edSrcSet } from '../data/products';
import { dateFmt } from '../utils/format';

export default function Journal() {
  const [lead, ...rest] = JOURNAL;
  return (
    <>
      <div className="pg-head"><div><h1 className="serif">The Journal</h1><p>Stories on craft, care and the pieces we love.</p></div></div>
      <div className="jr">
        <Link to={`/journal/${lead.id}`} className="jr__lead"><figure><img src={edImg(lead.image, 1200)} srcSet={edSrcSet(lead.image)} sizes="60vw" alt="" /></figure><div><p className="meta">{lead.category} · {lead.read} min read</p><h2 className="serif">{lead.title}</h2><p>{lead.excerpt}</p><span className="link-arrow">Read the story</span></div></Link>
        <div className="jt__grid">{rest.map((a) => (
          <Link key={a.id} to={`/journal/${a.id}`} className="jcard"><figure><img src={edImg(a.image, 800)} srcSet={edSrcSet(a.image)} sizes="(min-width: 900px) 30vw, 90vw" alt="" loading="lazy" /></figure><p className="meta">{a.category} · {a.read} min read</p><h3 className="serif">{a.title}</h3><p>{a.excerpt}</p><span className="jcard__date">{dateFmt(a.date, { day: 'numeric', month: 'long', year: 'numeric' })}</span></Link>
        ))}</div>
      </div>
    </>
  );
}
