import { Link } from 'react-router-dom';
import Logo from './Logo';
import Newsletter from './Newsletter';

export default function Footer() {
  return (
    <footer className="ftr">
      <div className="ftr__top">
        <div className="ftr__lead">
          <h2 className="serif">Letters from the atelier</h2>
          <p>New pieces, appointments and the occasional story. Once a month, never more.</p>
          <Newsletter />
        </div>
        <nav className="ftr__cols" aria-label="Footer">
          <div><h3>Jewellery</h3><Link to="/shop?category=Rings">Rings</Link><Link to="/shop?category=Necklaces">Necklaces</Link><Link to="/shop?category=Earrings">Earrings</Link><Link to="/shop?category=Bracelets">Bracelets</Link><Link to="/shop?collection=bridal">Bridal</Link></div>
          <div><h3>The House</h3><Link to="/about">Our story</Link><Link to="/journal">Journal</Link><Link to="/collections">Collections</Link><Link to="/contact">Book a viewing</Link></div>
          <div><h3>Client care</h3><Link to="/account/orders">Track an order</Link><Link to="/contact">Delivery</Link><Link to="/contact">Returns</Link><Link to="/contact">Jewellery care</Link></div>
        </nav>
      </div>
      <div className="ftr__mark" aria-hidden="true"><span>LUMIÈRE</span></div>
      <div className="ftr__base">
        <Logo />
        <p>© 2026 LUMIÈRE Fine Jewellery. All rights reserved.</p>
        <p className="ftr__legal"><Link to="/contact">Privacy</Link><Link to="/contact">Terms</Link></p>
      </div>
    </footer>
  );
}
