import { create } from 'zustand';
import { supabase } from '../lib/supabaseClient';

interface Tenant {
    id: string;
    name: string;
    spreadsheet_id: string;
    theme_color: string;
    sheet_name: string;
    geral_sheet_id?: string;
    geral_sheet_name?: string;
}

interface AuthState {
    user: any | null;
    session: any | null;
    tenant: Tenant | null;
    loading: boolean;
    initialize: () => Promise<void>;
    signIn: (email: string) => Promise<{ error: any }>;
    signInWithPassword: (email: string, password: string) => Promise<{ error: any }>;
    signUp: (email: string, password: string) => Promise<{ error: any }>;
    signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    session: null,
    tenant: null,
    loading: true,

    initialize: async () => {
        set({ loading: true });

        try {
            // Get current session
            const { data: { session }, error } = await supabase.auth.getSession();
            if (error) throw error;

            if (session) {
                // Fetch user profile and tenant
                let { data: profile } = await supabase
                    .from('profiles')
                    .select('tenant_id')
                    .eq('id', session.user.id)
                    .single();

                // If profile not found, try to self-heal (create default profile)
                if (!profile) {
                    // Try to finding 'KNN Pires do Rio' tenant
                    const { data: defaultTenant } = await supabase.from('tenants').select('id').eq('name', 'KNN Pires do Rio').single();
                    if (defaultTenant) {
                        try {
                            await supabase.from('profiles').insert({ id: session.user.id, tenant_id: defaultTenant.id });
                            profile = { tenant_id: defaultTenant.id };
                        } catch (e) { console.error('Auto-profile creation failed', e) }
                    }
                }

                if (profile && profile.tenant_id) {
                    const { data: tenant } = await supabase
                        .from('tenants')
                        .select('*')
                        .eq('id', profile.tenant_id)
                        .single();

                    set({ user: session.user, session, tenant, loading: false });
                } else {
                    console.warn("User logged in but no profile/tenant found");
                    set({ user: session.user, session, tenant: null, loading: false });
                }
            } else {
                set({ user: null, session: null, tenant: null, loading: false });
            }
        } catch (err) {
            console.error('Auth initialization error:', err);
            // Ensure we stop loading even on error
            set({ user: null, session: null, tenant: null, loading: false });
        }

        // Listen for changes
        supabase.auth.onAuthStateChange(async (_event, session) => {
            if (session) {
                // Simplified re-fetch or just update session
                set({ user: session.user, session, loading: false });
                // Optionally refetch tenant here if strictness is needed
            } else {
                set({ user: null, session: null, tenant: null, loading: false });
            }
        });
    },


    signIn: async (email) => {
        // Magic Link Login
        const { error } = await supabase.auth.signInWithOtp({
            email,
            options: {
                emailRedirectTo: window.location.origin
            }
        });
        return { error };
    },

    signInWithPassword: async (email, password) => {
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password
        });
        return { error };
    },

    signUp: async (email, password) => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                emailRedirectTo: window.location.origin
            }
        });

        if (data.user && !error) {
            // Try to assign default tenant immediately
            const { data: defaultTenant } = await supabase.from('tenants').select('id').eq('name', 'KNN Pires do Rio').single();
            if (defaultTenant) {
                await supabase.from('profiles').insert({ id: data.user.id, tenant_id: defaultTenant.id });
            }
        }

        return { error };
    },

    signOut: async () => {
        await supabase.auth.signOut();
        set({ user: null, session: null, tenant: null });
    }
}));
