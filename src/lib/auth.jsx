import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from './supabase';

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  async function loadProfile(uid) {
    const { data } = await supabase.from('profiles').select('*').eq('id', uid).single();
    setProfile(data || null);
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const u = data.session?.user || null;
      setUser(u);
      if (u) loadProfile(u.id).finally(() => setLoading(false));
      else setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      const u = session?.user || null;
      setUser(u);
      if (u) loadProfile(u.id);
      else setProfile(null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const refreshProfile = () => user && loadProfile(user.id);
  const signOut = () => supabase.auth.signOut();

  return (
    <AuthCtx.Provider value={{ user, profile, loading, refreshProfile, signOut }}>
      {children}
    </AuthCtx.Provider>
  );
}

export const useAuth = () => useContext(AuthCtx);
