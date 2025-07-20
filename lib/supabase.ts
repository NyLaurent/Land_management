import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false, // We're not implementing auth for this MVP
  },
});

// Database operations for Land
export const landOperations = {
  // Get all land records
  async getAll() {
    const { data, error } = await supabase
      .from('land')
      .select('*')
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
  }) {
    const { data, error } = await supabase
      .from('land')
      .insert({
        ...landData,
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
};

// Database operations for Transfers
export const transferOperations = {
  // Get all transfers
  async getAll() {
    const { data, error } = await supabase
      .from('transfers')
      .select('*')
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
    const { data, error } = await supabase
      .from('transfers')
      .insert({
        ...transferData,
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

// File upload to Supabase Storage
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