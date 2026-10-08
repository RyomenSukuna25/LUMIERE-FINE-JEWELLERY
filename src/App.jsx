import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import SiteLayout from './layouts/SiteLayout.jsx';
import Home from './pages/Home.jsx';

const Collections = lazy(() => import('./pages/Collections.jsx'));
const Shop = lazy(() => import('./pages/Shop.jsx'));
const Product = lazy(() => import('./pages/Product.jsx'));
const Cart = lazy(() => import('./pages/Cart.jsx'));
const Checkout = lazy(() => import('./pages/Checkout.jsx'));
const OrderView = lazy(() => import('./pages/OrderView.jsx'));
const Account = lazy(() => import('./pages/Account.jsx'));
const About = lazy(() => import('./pages/About.jsx'));
const Journal = lazy(() => import('./pages/Journal.jsx'));
const Article = lazy(() => import('./pages/Article.jsx'));
const Contact = lazy(() => import('./pages/Contact.jsx'));
const AuthPage = lazy(() => import('./pages/AuthPage.jsx'));
const NotFound = lazy(() => import('./pages/NotFound.jsx'));
const DashboardApp = lazy(() => import('./dashboard/DashboardApp.jsx'));

const Loading = () => <div className="route-loading" role="status" aria-label="Loading"><span /></div>;

export default function App() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route element={<SiteLayout />}>
          <Route index element={<Home />} />
          <Route path="collections" element={<Collections />} />
          <Route path="shop" element={<Shop />} />
          <Route path="product/:id" element={<Product />} />
          <Route path="cart" element={<Cart />} />
          <Route path="checkout" element={<Checkout />} />
          <Route path="order/:number" element={<OrderView />} />
          <Route path="account/*" element={<Account />} />
          <Route path="about" element={<About />} />
          <Route path="journal" element={<Journal />} />
          <Route path="journal/:id" element={<Article />} />
          <Route path="contact" element={<Contact />} />
          <Route path="signin" element={<AuthPage mode="customer" />} />
          <Route path="staff/login" element={<AuthPage mode="staff" />} />
          <Route path="*" element={<NotFound />} />
        </Route>
        <Route path="staff/*" element={<DashboardApp />} />
      </Routes>
    </Suspense>
  );
}
