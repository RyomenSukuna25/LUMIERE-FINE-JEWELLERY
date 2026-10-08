import { Link } from 'react-router-dom';
export default function NotFound() {
  return (
    <div className="nf"><p className="meta">404</p><h1 className="serif">This page has slipped away.</h1><p>The piece or page you are looking for may have moved.</p><Link to="/shop" className="btn btn--dark">Browse jewellery</Link></div>
  );
}
