import { supabase } from '../lib/supabase';
import { 
  AccountingCategory, 
  AccountingTransaction, 
  DailyCashSummary, 
  CreateAccountingTransactionData, 
  CreateAccountingCategoryData 
} from '../lib/types';

export class AccountingService {
  // Categories
  static async getCategories(type?: 'income' | 'expense'): Promise<AccountingCategory[]> {
    let query = supabase
      .from('accounting_categories')
      .select('*')
      .eq('is_active', true)
      .order('name_ar');

    if (type) {
      query = query.eq('type', type);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  static async createCategory(categoryData: CreateAccountingCategoryData): Promise<AccountingCategory> {
    const { data, error } = await supabase
      .from('accounting_categories')
      .insert(categoryData)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async updateCategory(id: string, categoryData: Partial<CreateAccountingCategoryData>): Promise<AccountingCategory> {
    const { data, error } = await supabase
      .from('accounting_categories')
      .update({ ...categoryData, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async deleteCategory(id: string): Promise<void> {
    const { error } = await supabase
      .from('accounting_categories')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;
  }

  // Transactions
  static async getTransactions(
    startDate?: string, 
    endDate?: string, 
    type?: 'income' | 'expense',
    categoryId?: string
  ): Promise<AccountingTransaction[]> {
    let query = supabase
      .from('accounting_transactions')
      .select(`
        *,
        category:accounting_categories(*)
      `)
      .order('transaction_date', { ascending: false });

    if (startDate) {
      query = query.gte('transaction_date', startDate);
    }
    if (endDate) {
      query = query.lte('transaction_date', endDate);
    }
    if (type) {
      query = query.eq('type', type);
    }
    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  static async getTransactionsByDate(date: string): Promise<AccountingTransaction[]> {
    const { data, error } = await supabase
      .from('accounting_transactions')
      .select(`
        *,
        category:accounting_categories(*)
      `)
      .eq('transaction_date', date)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async createTransaction(transactionData: CreateAccountingTransactionData): Promise<AccountingTransaction> {
    const { data, error } = await supabase
      .from('accounting_transactions')
      .insert(transactionData)
      .select(`
        *,
        category:accounting_categories(*)
      `)
      .single();

    if (error) throw error;
    return data;
  }

  static async updateTransaction(id: string, transactionData: Partial<CreateAccountingTransactionData>): Promise<AccountingTransaction> {
    const { data, error } = await supabase
      .from('accounting_transactions')
      .update({ ...transactionData, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select(`
        *,
        category:accounting_categories(*)
      `)
      .single();

    if (error) throw error;
    return data;
  }

  static async deleteTransaction(id: string): Promise<void> {
    const { error } = await supabase
      .from('accounting_transactions')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // Daily Summaries
  static async getDailySummaries(startDate?: string, endDate?: string): Promise<DailyCashSummary[]> {
    let query = supabase
      .from('daily_cash_summary')
      .select('*')
      .order('summary_date', { ascending: false });

    if (startDate) {
      query = query.gte('summary_date', startDate);
    }
    if (endDate) {
      query = query.lte('summary_date', endDate);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  static async getDailySummary(date: string): Promise<DailyCashSummary | null> {
    const { data, error } = await supabase
      .from('daily_cash_summary')
      .select('*')
      .eq('summary_date', date)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  static async updateDailySummary(date: string, summaryData: Partial<DailyCashSummary>): Promise<DailyCashSummary> {
    const { data, error } = await supabase
      .from('daily_cash_summary')
      .upsert({
        summary_date: date,
        ...summaryData,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Statistics and Reports
  static async getMonthlyStats(year: number, month: number): Promise<{
    totalIncome: number;
    totalExpense: number;
    netIncome: number;
    transactionCount: number;
  }> {
    const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
    const endDate = `${year}-${month.toString().padStart(2, '0')}-31`;

    const { data, error } = await supabase
      .from('accounting_transactions')
      .select('type, amount')
      .gte('transaction_date', startDate)
      .lte('transaction_date', endDate);

    if (error) throw error;

    const transactions = data || [];
    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpense = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      totalIncome,
      totalExpense,
      netIncome: totalIncome - totalExpense,
      transactionCount: transactions.length
    };
  }

  static async getCategoryStats(startDate?: string, endDate?: string): Promise<{
    category: AccountingCategory;
    totalAmount: number;
    transactionCount: number;
  }[]> {
    let query = supabase
      .from('accounting_transactions')
      .select(`
        category_id,
        amount,
        category:accounting_categories(*)
      `);

    if (startDate) {
      query = query.gte('transaction_date', startDate);
    }
    if (endDate) {
      query = query.lte('transaction_date', endDate);
    }

    const { data, error } = await query;
    if (error) throw error;

    const transactions = data || [];
    const categoryMap = new Map<string, { category: AccountingCategory; totalAmount: number; transactionCount: number }>();

    transactions.forEach(transaction => {
      if (transaction.category) {
        const categoryId = transaction.category_id;
        if (!categoryMap.has(categoryId)) {
          categoryMap.set(categoryId, {
            category: transaction.category,
            totalAmount: 0,
            transactionCount: 0
          });
        }
        
        const stats = categoryMap.get(categoryId)!;
        stats.totalAmount += transaction.amount;
        stats.transactionCount += 1;
      }
    });

    return Array.from(categoryMap.values()).sort((a, b) => b.totalAmount - a.totalAmount);
  }

  // Utility methods
  static formatCurrency(amount: number, currency: string = 'TRY'): string {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: currency
    }).format(amount);
  }

  static formatDate(date: string | Date): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('tr-TR');
  }

  static getCurrentDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  static getDateRange(period: 'today' | 'week' | 'month' | 'year'): { startDate: string; endDate: string } {
    const today = new Date();
    const startDate = new Date();
    const endDate = new Date();

    switch (period) {
      case 'today':
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);
        break;
      case 'week':
        startDate.setDate(today.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(today.getMonth() - 1);
        break;
      case 'year':
        startDate.setFullYear(today.getFullYear() - 1);
        break;
    }

    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    };
  }
}
