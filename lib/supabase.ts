import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

// Authentication operations
export const authOperations = {
  // Sign up with email and password
  async signUp(data: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
  }) {
    const { data: authData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          first_name: data.first_name,
          last_name: data.last_name,
        },
      },
    });
    
    return { data: authData, error };
  },

  // Sign in with email and password
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    return { data, error };
  },

  // Sign out
  async signOut() {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  // Get current user
  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    return { user, error };
  },

  // Get user profile
  async getUserProfile(userId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    return { data, error };
  },
};

// Database operations for Land (updated for auth)
export const landOperations = {
  // Get all land records for current user
  async getAll() {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return { data: null, error: userError || new Error('No authenticated user') };
    }

    const { data, error } = await supabase
      .from('land')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
    return { data, error };
  },

  // Create new land registration
  async create(landData: {
    parcel_id: number;
    size: number;
    ownership_type: string;
    supporting_document: string;
    statusa?: string;
    coordinates?: number[][];
    center_lat?: number;
    center_lng?: number;
  }) {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return { data: null, error: userError || new Error('No authenticated user') };
    }

    const { data, error } = await supabase
      .from('land')
      .insert({
        ...landData,
        user_id: user.id,
        statusa: landData.statusa || 'pending',
      })
      .select()
      .single();
    
    return { data, error };
  },

  // Update land status
  async updateStatus(id: number, status: string) {
    const { data, error } = await supabase
      .from('land')
      .update({ statusa: status })
      .eq('id', id)
      .select()
      .single();
    
    return { data, error };
  },

  // Update land coordinates
  async updateCoordinates(id: number, coordinates: number[][], center_lat: number, center_lng: number) {
    const { data, error } = await supabase
      .from('land')
      .update({ 
        coordinates, 
        center_lat, 
        center_lng 
      })
      .eq('id', id)
      .select()
      .single();
    
    return { data, error };
  },
};

// Database operations for Transfers (updated for auth)
export const transferOperations = {
  // Get all transfers for current user
  async getAll() {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return { data: null, error: userError || new Error('No authenticated user') };
    }

    const { data, error } = await supabase
      .from('transfers')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
    return { data, error };
  },

  // Create new transfer
  async create(transferData: {
    recipient_name: string;
    contract_document: string;
    parcel_id: string;
    status?: string;
  }) {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return { data: null, error: userError || new Error('No authenticated user') };
    }

    const { data, error } = await supabase
      .from('transfers')
      .insert({
        ...transferData,
        user_id: user.id,
        status: transferData.status || 'pending',
      })
      .select()
      .single();
    
    return { data, error };
  },

  // Update transfer
  async update(id: number, updateData: Partial<{
    recipient_name: string;
    contract_document: string;
    parcel_id: string;
    status: string;
  }>) {
    const { data, error } = await supabase
      .from('transfers')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    return { data, error };
  },

  // Delete transfer
  async delete(id: number) {
    const { error } = await supabase
      .from('transfers')
      .delete()
      .eq('id', id);
    
    return { error };
  },
};

// File upload to Supabase Storage (unchanged)
export const fileUpload = {
  async uploadDocument(file: File, folder: 'land-documents' | 'transfer-contracts') {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(filePath, file);

    if (uploadError) {
      return { data: null, error: uploadError };
    }

    const { data: { publicUrl } } = supabase.storage
      .from('documents')
      .getPublicUrl(filePath);

    return { 
      data: { url: publicUrl, path: filePath }, 
      error: null 
    };
  },
}; 