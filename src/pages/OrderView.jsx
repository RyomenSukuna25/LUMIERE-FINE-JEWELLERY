import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../api';
import OrderConfirmation from '../components/OrderConfirmation';
import NotFound from './NotFound';

export default function OrderView() {
  const { number } = useParams();
  const [o, setO] = useState(undefined);
  useEffect(() => { api.orders.byNumber(`#${number.replace('#', '')}`).then(setO); }, [number]);
  if (o === undefined) return <div className="nf nf--inline"><p className="fine">Loading order…</p></div>;
  if (!o) return <NotFound />;
  return <OrderConfirmation order={o} />;
}
