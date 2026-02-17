import { createContext, useContext, useEffect, useState, useRef, ReactNode } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  loading: true,
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

const SESSION_KEY = "smartrail_session_active";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const hasLoggedSignIn = useRef(false);

  const logSignIn = async (user: User) => {
    if (hasLoggedSignIn.current) return;
    hasLoggedSignIn.current = true;
    try {
      await supabase.from("login_logs").insert({
        user_id: user.id,
        email: user.email ?? null,
        display_name: user.user_metadata?.display_name ?? user.email ?? null,
      });
    } catch (e) {
      console.error("Failed to log sign-in:", e);
    }
  };

  useEffect(() => {
    // Check if this is a fresh app open (no active session marker)
    const wasActive = sessionStorage.getItem(SESSION_KEY);

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "SIGNED_IN" && session) {
          setSession(session);
          setLoading(false);
          sessionStorage.setItem(SESSION_KEY, "true");
          // Log sign-in to database
          logSignIn(session.user);
        } else if (event === "SIGNED_OUT") {
          setSession(null);
          setLoading(false);
          sessionStorage.removeItem(SESSION_KEY);
          hasLoggedSignIn.current = false;
        } else {
          setSession(session);
          setLoading(false);
        }
      }
    );

    // If no active session marker, force sign out so user must re-enter password
    if (!wasActive) {
      supabase.auth.signOut().then(() => {
        setSession(null);
        setLoading(false);
      });
    } else {
      supabase.auth.getSession().then(({ data: { session } }) => {
        setSession(session);
        setLoading(false);
      });
    }

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    sessionStorage.removeItem(SESSION_KEY);
    hasLoggedSignIn.current = false;
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user: session?.user ?? null,
        loading,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
