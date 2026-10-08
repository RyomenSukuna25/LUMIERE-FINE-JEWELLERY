import { Link, useParams } from 'react-router-dom';
import { JOURNAL } from '../data/journal';
import { edImg, edSrcSet } from '../data/products';
import { dateFmt } from '../utils/format';
import NotFound from './NotFound';

export default function Article() {
  const { id } = useParams(); const a = JOURNAL.find((x) => x.id === id);
  if (!a) return <NotFound />;
  const more = JOURNAL.filter((x) => x.id !== a.id).slice(0, 2);
  return (
    <article className="art">
      <header><p className="meta">{a.category} · {a.read} min read · {dateFmt(a.date, { day: 'numeric', month: 'long', year: 'numeric' })}</p><h1 className="serif">{a.title}</h1><p className="art__ex">{a.excerpt}</p></header>
      <figure className="art__hero"><img src={edImg(a.image, 1200)} srcSet={edSrcSet(a.image)} sizes="100vw" alt="" /></figure>
      <div className="art__body">{a.body.map((p, i) => <p key={i} className={i === 0 ? 'art__first' : ''}>{p}</p>)}</div>
      <aside className="art__more"><h2 className="meta">Continue reading</h2>{more.map((m) => <Link key={m.id} to={`/journal/${m.id}`} className="serif">{m.title}</Link>)}</aside>
    </article>
  );
}
