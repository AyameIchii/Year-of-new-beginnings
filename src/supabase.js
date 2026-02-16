import { createClient } from '@supabase/supabase-js';

// ═══════════════════════════════════════════════════════════════════════════
// ⚠️  QUAN TRỌNG: Thay 2 giá trị này bằng thông tin từ Supabase Dashboard
// ═══════════════════════════════════════════════════════════════════════════
const SUPABASE_URL = 'https://YOUR_PROJECT_ID.supabase.co';  // ← Thay đổi URL
const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY_HERE';              // ← Thay đổi key

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ═══════════════════════════════════════════════════════════════════════════
// API Functions - thay thế window.storage
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Lấy danh sách setup lì xì
 */
export async function getSetup() {
  const { data, error } = await supabase
    .from('lixi_setup')
    .select('*')
    .order('updated_at', { ascending: false })
    .limit(1)
    .single();
  
  if (error && error.code !== 'PGRST116') {
    console.error('Get setup error:', error);
    return null;
  }
  return data;
}

/**
 * Lưu danh sách setup lì xì
 */
export async function saveSetup(envelopes) {
  // Xóa setup cũ
  await supabase.from('lixi_setup').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  
  // Insert mới
  const { error } = await supabase
    .from('lixi_setup')
    .insert({ envelopes, updated_at: new Date().toISOString() });
  
  if (error) console.error('Save setup error:', error);
  return !error;
}

/**
 * Lấy tất cả phong bì
 */
export async function getEnvelopes() {
  const { data, error } = await supabase
    .from('lixi_envelopes')
    .select('*')
    .order('id');
  
  if (error) {
    console.error('Get envelopes error:', error);
    return [];
  }
  return data || [];
}

/**
 * Khởi tạo phong bì (gọi 1 lần khi reset)
 */
export async function initEnvelopes(envelopes) {
  // Xóa tất cả
  await supabase.from('lixi_envelopes').delete().neq('id', -1);
  
  // Insert batch
  const rows = envelopes.map((env) => ({
    id: env.id,
    value: env.value,
    picked_by: env.pickedBy,
    picked_at: env.pickedAt,
  }));
  
  const { error } = await supabase.from('lixi_envelopes').insert(rows);
  if (error) console.error('Init envelopes error:', error);
  return !error;
}

/**
 * Cập nhật phong bì đã bốc
 */
export async function updateEnvelope(id, pickedBy, pickedAt) {
  const { error } = await supabase
    .from('lixi_envelopes')
    .update({ picked_by: pickedBy, picked_at: pickedAt })
    .eq('id', id);
  
  if (error) console.error('Update envelope error:', error);
  return !error;
}

/**
 * Lấy lịch sử bốc thăm
 */
export async function getHistory() {
  const { data, error } = await supabase
    .from('lixi_history')
    .select('*')
    .order('picked_at', { ascending: false });
  
  if (error) {
    console.error('Get history error:', error);
    return [];
  }
  
  // Transform sang format cũ
  return (data || []).map((row) => ({
    id: row.id,
    pickedBy: row.picked_by,
    envelopeId: row.envelope_id,
    envelopeNumber: row.envelope_number,
    value: row.value,
    pickedAt: row.picked_at,
    isAdmin: row.is_admin || false,
  }));
}

/**
 * Thêm lịch sử bốc thăm
 */
export async function addHistory(histEntry) {
  const { error } = await supabase.from('lixi_history').insert({
    id: histEntry.id,
    picked_by: histEntry.pickedBy,
    envelope_id: histEntry.envelopeId,
    envelope_number: histEntry.envelopeNumber,
    value: histEntry.value,
    picked_at: histEntry.pickedAt,
    is_admin: histEntry.isAdmin || false,
  });
  
  if (error) console.error('Add history error:', error);
  return !error;
}

/**
 * Xóa toàn bộ lịch sử (reset)
 */
export async function clearHistory() {
  const { error } = await supabase.from('lixi_history').delete().neq('id', '');
  if (error) console.error('Clear history error:', error);
  return !error;
}

/**
 * Lấy tất cả số tài khoản
 */
export async function getBanks() {
  const { data, error } = await supabase
    .from('lixi_banks')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Get banks error:', error);
    return {};
  }
  
  // Transform thành object { userName: bankAccount }
  const result = {};
  (data || []).forEach((row) => {
    result[row.user_name] = row.bank_account;
  });
  return result;
}

/**
 * Lưu số tài khoản
 */
export async function saveBank(userName, bankAccount) {
  const { error } = await supabase
    .from('lixi_banks')
    .upsert(
      { user_name: userName, bank_account: bankAccount },
      { onConflict: 'user_name' }
    );
  
  if (error) console.error('Save bank error:', error);
  return !error;
}
