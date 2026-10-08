import { AnimatePresence, motion } from 'framer-motion';
import ProductCard from './ProductCard';

export default function ProductGrid({ products, columns = 'grid-4' }) {
  return (
    <motion.div layout className={`pgrid ${columns}`}>
      <AnimatePresence mode="popLayout" initial={false}>
        {products.map((p, i) => (
          <motion.div key={p.id} layout initial={{ opacity: 0, y: 24, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.97 }} transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1], delay: Math.min(i, 8) * 0.025 }}>
            <ProductCard product={p} priority={i < 4} />
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
}
