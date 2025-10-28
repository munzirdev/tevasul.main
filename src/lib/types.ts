export interface RefakatEntry {
  id: string;
  name: string;
}

export interface VoluntaryReturnForm {
  id: string;
  user_id: string;
  full_name_tr: string;
  full_name_ar: string;
  kimlik_no: string;
  sinir_kapisi: string;
  gsm?: string;
  request_date: string;
  custom_date?: string;
  refakat_entries: RefakatEntry[];
  created_at: string;
  updated_at: string;
}

export interface CreateVoluntaryReturnFormData {
  full_name_tr: string;
  full_name_ar: string;
  kimlik_no: string;
  sinir_kapisi: string;
  gsm?: string;
  custom_date?: string;
  refakat_entries: RefakatEntry[];
}

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  country_code?: string;
  avatar_url?: string;
  role: 'user' | 'moderator' | 'admin';
  created_at: string;
  updated_at: string;
}

export interface Moderator {
  id: string;
  user_id: string;
  email: string;
  full_name: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

// Accounting System Types
export interface AccountingCategory {
  id: string;
  name_ar: string;
  name_en: string;
  name_tr: string;
  type: 'income' | 'expense';
  description_ar?: string;
  description_en?: string;
  description_tr?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AccountingTransaction {
  id: string;
  category_id?: string;
  category?: AccountingCategory;
  type: 'income' | 'expense';
  amount: number;
  description_ar?: string;
  description_en?: string;
  description_tr?: string;
  transaction_date: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface DailyCashSummary {
  id: string;
  summary_date: string;
  opening_balance: number;
  total_income: number;
  total_expense: number;
  closing_balance: number;
  notes_ar?: string;
  notes_en?: string;
  notes_tr?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateAccountingTransactionData {
  category_id?: string;
  type: 'income' | 'expense';
  amount: number;
  description_ar?: string;
  description_en?: string;
  description_tr?: string;
  transaction_date: string;
}

export interface CreateAccountingCategoryData {
  name_ar: string;
  name_en: string;
  name_tr: string;
  type: 'income' | 'expense';
  description_ar?: string;
  description_en?: string;
  description_tr?: string;
}

// Invoice System Types
export interface Invoice {
  id: string;
  invoice_number: string;
  client_name: string;
  client_email?: string;
  client_phone?: string;
  client_address?: string;
  issue_date: string;
  due_date: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  total_amount: number;
  notes_ar?: string;
  notes_en?: string;
  notes_tr?: string;
  items: InvoiceItem[];
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface InvoiceItem {
  id: string;
  invoice_id: string;
  description_ar: string;
  description_en: string;
  description_tr: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  created_at: string;
  updated_at: string;
}

export interface CreateInvoiceData {
  client_name: string;
  client_email?: string;
  client_phone?: string;
  client_address?: string;
  issue_date: string;
  due_date: string;
  tax_rate: number;
  notes_ar?: string;
  notes_en?: string;
  notes_tr?: string;
  items: CreateInvoiceItemData[];
}

export interface CreateInvoiceItemData {
  description_ar: string;
  description_en: string;
  description_tr: string;
  quantity: number;
  unit_price: number;
}

export interface InvoiceTemplate {
  id: string;
  name_ar: string;
  name_en: string;
  name_tr: string;
  template_content: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}