import { createContext, useCallback, useContext, useState } from 'react';
import { api } from '../api';

const Ctx = createContext(null);
export const useAuth = () => useContext(Ctx);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => api.auth.session());
  const login = useCallback(async (creds) => { const s = await api.auth.login(creds); setSession(s); return s; }, []);
  const register = useCallback(async (d) => { const s = await api.auth.register(d); setSession(s); return s; }, []);
  const logout = useCallback(async () => { await api.auth.logout(); setSession(null); }, []);
  return <Ctx.Provider value={{ session, login, register, logout, isStaff: !!session && session.role !== 'CUSTOMER' }}>{children}</Ctx.Provider>;
}
