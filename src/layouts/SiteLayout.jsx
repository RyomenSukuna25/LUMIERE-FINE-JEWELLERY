import { useEffect } from 'react';
import { useLocation, useOutlet } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Header from '../components/Header';
import Footer from '../components/Footer';
import MenuOverlay from '../components/MenuOverlay';
import SearchOverlay from '../components/SearchOverlay';
import CartDrawer from '../components/CartDrawer';
import QuickView from '../components/QuickView';
import { LenisProvider, useLenisInstance, ScrollTrigger } from '../hooks/useLenis';

function Shell() {
  const { pathname } = useLocation();
  const outlet = useOutlet();
  const lenis = useLenisInstance();
  const home = pathname === '/';
  const toTop = () => { if (lenis) lenis.scrollTo(0, { immediate: true, force: true }); else window.scrollTo(0, 0); setTimeout(() => ScrollTrigger.refresh(), 60); };
  useEffect(() => { const t = setTimeout(() => ScrollTrigger.refresh(), 400); return () => clearTimeout(t); }, [pathname]);
  return (
    <>
      <a className="skip" href="#main">Skip to content</a>
      <Header />
      <MenuOverlay /><SearchOverlay /><CartDrawer /><QuickView />
      <AnimatePresence mode="wait" initial={false} onExitComplete={toTop}>
        <motion.main id="main" key={pathname} className={home ? 'page page--home' : 'page'} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } }} exit={{ opacity: 0, y: -6, transition: { duration: 0.2 } }}>
          {outlet}
        </motion.main>
      </AnimatePresence>
      <Footer />
    </>
  );
}
export default function SiteLayout() { return <LenisProvider><Shell /></LenisProvider>; }
