import { supabase } from '@/lib/supabase/client';
import { LoginCredentials, SignupCredentials, User } from '../types';

export const authService = {
  async login({ email, password }: LoginCredentials) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },

  async signup({ email, password, name }: SignupCredentials) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        },
      },
    });

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },

  async logout() {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      throw new Error(error.message);
    }

    return true;
  },

  async getCurrentUser(): Promise<User | null> {
    const { data, error } = await supabase.auth.getUser();
    
    if (error || !data?.user) {
      return null;
    }

    return {
      id: data.user.id,
      email: data.user.email as string,
      name: data.user.user_metadata?.name,
      avatar_url: data.user.user_metadata?.avatar_url,
      created_at: data.user.created_at,
      updated_at: data.user.updated_at || data.user.created_at,
    };
  },

  async getSession() {
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      throw new Error(error.message);
    }

    return data.session;
  },
};

export default authService; 