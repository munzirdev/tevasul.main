import { supabase } from '../lib/supabase';
import { 
  AccountingCategory, 
  AccountingTransaction, 
  DailyCashSummary, 
  CreateAccountingTransactionData, 
  CreateAccountingCategoryData,
  Budget,
  CreateBudgetData,
  Payment,
  CreatePaymentData,
  AccountingSettings
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
    // First, try to get existing summaries
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
    
    // If no summaries found, calculate from transactions
    if (!data || data.length === 0) {
      return this.calculateSummariesFromTransactions(startDate, endDate);
    }
    
    // Get dates that need to be refreshed (last 30 days with transactions)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const cutoffDate = thirtyDaysAgo.toISOString().split('T')[0];
    
    // Get all transaction dates in the last 30 days
    const { data: recentTransactions, error: recentError } = await supabase
      .from('accounting_transactions')
      .select('transaction_date')
      .gte('transaction_date', cutoffDate)
      .order('transaction_date', { ascending: true });

    if (!recentError && recentTransactions) {
      const uniqueDates = Array.from(
        new Set(recentTransactions.map(t => t.transaction_date))
      ).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

      // Refresh summaries for recent dates in chronological order
      // This ensures correct balance calculation (each day's opening balance from previous day's closing balance)
      for (const date of uniqueDates) {
        const { error: refreshError } = await supabase.rpc('update_daily_cash_summary', {
          target_date: date
        });
        if (refreshError) {
          console.warn(`Error refreshing daily summary for ${date}:`, refreshError);
        }
      }

      // Refetch summaries after refresh
      const { data: refreshedData, error: refreshedError } = await query;
      if (!refreshedError && refreshedData) {
        return refreshedData;
      }
    }
    
    return data;
  }

  // Calculate summaries directly from transactions
  private static async calculateSummariesFromTransactions(startDate?: string, endDate?: string): Promise<DailyCashSummary[]> {
    let transactionsQuery = supabase
      .from('accounting_transactions')
      .select('transaction_date, type, amount')
      .order('transaction_date', { ascending: false });

    if (startDate) {
      transactionsQuery = transactionsQuery.gte('transaction_date', startDate);
    }
    if (endDate) {
      transactionsQuery = transactionsQuery.lte('transaction_date', endDate);
    }

    const { data: transactions, error } = await transactionsQuery;
    if (error) throw error;

    if (!transactions || transactions.length === 0) {
      return [];
    }

    // Group transactions by date
    const transactionsByDate = new Map<string, { income: number; expense: number }>();
    
    transactions.forEach(t => {
      const date = t.transaction_date;
      if (!transactionsByDate.has(date)) {
        transactionsByDate.set(date, { income: 0, expense: 0 });
      }
      
      const summary = transactionsByDate.get(date)!;
      if (t.type === 'income') {
        summary.income += t.amount;
      } else {
        summary.expense += t.amount;
      }
    });

    // Convert to DailyCashSummary format, sorted by date ascending to calculate balances correctly
    const summaries: DailyCashSummary[] = [];
    let openingBalance = 0;
    
    const sortedDates = Array.from(transactionsByDate.keys()).sort((a, b) => 
      new Date(a).getTime() - new Date(b).getTime()
    );

    for (const date of sortedDates) {
      const { income, expense } = transactionsByDate.get(date)!;
      const closingBalance = openingBalance + income - expense;

      summaries.push({
        id: date, // Use date as temporary ID
        summary_date: date,
        opening_balance: openingBalance,
        total_income: income,
        total_expense: expense,
        closing_balance: closingBalance,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

      // Next day's opening balance is this day's closing balance
      openingBalance = closingBalance;
    }

    // Reverse to return in descending order (newest first)
    return summaries.reverse();
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

  // Refresh daily summaries for all dates with transactions
  static async refreshDailySummaries(): Promise<void> {
    const { data: transactionDates, error: datesError } = await supabase
      .from('accounting_transactions')
      .select('transaction_date')
      .order('transaction_date', { ascending: true });

    if (datesError) throw datesError;

    // Get unique dates, sorted ascending (oldest first) to ensure correct balance calculation
    const uniqueDates = Array.from(
      new Set((transactionDates || []).map(t => t.transaction_date))
    ).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

    // Call update_daily_cash_summary function for each date in chronological order
    // This ensures that each day's opening balance is correctly calculated from the previous day's closing balance
    for (const date of uniqueDates) {
      const { error } = await supabase.rpc('update_daily_cash_summary', {
        target_date: date
      });

      if (error) {
        console.error(`Error updating daily summary for ${date}:`, error);
        // Continue with other dates even if one fails
      }
    }
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

  static async getTransactionsByMonth(year: number, month: number): Promise<AccountingTransaction[]> {
    const startDate = new Date(year, month - 1, 1).toISOString().split('T')[0];
    const endDate = new Date(year, month, 0).toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('accounting_transactions')
      .select(`
        *,
        category:accounting_categories(*)
      `)
      .gte('transaction_date', startDate)
      .lte('transaction_date', endDate)
      .order('transaction_date', { ascending: false });

    if (error) throw error;
    return data || [];
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

  // Budgets
  static async getBudgets(activeOnly: boolean = false): Promise<Budget[]> {
    try {
      let query = supabase
        .from('accounting_budgets')
        .select(`
          *,
          category:accounting_categories(*)
        `)
        .order('created_at', { ascending: false });

      if (activeOnly) {
        query = query.eq('is_active', true);
      }

      const { data, error } = await query;
      
      // إذا كان الجدول غير موجود أو خطأ في RLS، نعيد مصفوفة فارغة
      if (error) {
        // معالجة جميع أنواع الأخطاء المحتملة
        const errorMessage = error.message?.toLowerCase() || '';
        const errorCode = error.code || '';
        
        if (
          errorCode === '42P01' || // relation does not exist
          errorCode === 'PGRST116' || // no rows returned (but table exists)
          errorCode === '42501' || // insufficient privilege
          errorMessage.includes('does not exist') ||
          errorMessage.includes('permission denied') ||
          errorMessage.includes('row-level security') ||
          error?.status === 404 ||
          error?.statusCode === 404
        ) {
          console.warn('Budgets table access issue (may not exist or RLS blocking):', {
            code: errorCode,
            message: error.message,
            status: error.status
          });
          return [];
        }
        // إذا كان خطأ آخر، نرمي الخطأ
        throw error;
      }
      
      return data || [];
    } catch (error: any) {
      // إذا كان هناك خطأ عام، نعيد مصفوفة فارغة بدلاً من إيقاف التطبيق
      console.error('Error fetching budgets:', error);
      
      // معالجة جميع أنواع الأخطاء
      if (
        error?.code === '42P01' ||
        error?.code === 'PGRST116' ||
        error?.code === '42501' ||
        error?.status === 404 ||
        error?.statusCode === 404 ||
        error?.message?.toLowerCase()?.includes('does not exist') ||
        error?.message?.toLowerCase()?.includes('permission denied')
      ) {
        return [];
      }
      
      // للأخطاء الأخرى غير المتوقعة، نرمي الخطأ
      throw error;
    }
  }

  static async getBudgetById(id: string): Promise<Budget | null> {
    const { data, error } = await supabase
      .from('accounting_budgets')
      .select(`
        *,
        category:accounting_categories(*)
      `)
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  static async createBudget(budgetData: CreateBudgetData): Promise<Budget> {
    try {
      const { data, error } = await supabase
        .from('accounting_budgets')
        .insert(budgetData)
        .select(`
          *,
          category:accounting_categories(*)
        `)
        .single();

      if (error) {
        // إذا كان الجدول غير موجود، نرمي خطأ واضح
        if (error.code === '42P01' || error.code === 'PGRST116' || 
            error.message?.toLowerCase().includes('does not exist') ||
            error.message?.toLowerCase().includes('schema cache')) {
          throw new Error('جدول الميزانيات غير موجود. يرجى التأكد من تطبيق migrations في قاعدة البيانات.');
        }
        throw error;
      }
      
      if (!data) {
        throw new Error('فشل إنشاء الميزانية: لم يتم إرجاع بيانات');
      }
      
      return data;
    } catch (error: any) {
      console.error('Error creating budget:', error);
      throw error;
    }
  }

  static async updateBudget(id: string, budgetData: Partial<CreateBudgetData>): Promise<Budget> {
    try {
      const { data, error } = await supabase
        .from('accounting_budgets')
        .update({ ...budgetData, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select(`
          *,
          category:accounting_categories(*)
        `)
        .single();

      if (error) {
        if (error.code === '42P01' || error.code === 'PGRST116' || 
            error.message?.toLowerCase().includes('does not exist') ||
            error.message?.toLowerCase().includes('schema cache')) {
          throw new Error('جدول الميزانيات غير موجود. يرجى التأكد من تطبيق migrations في قاعدة البيانات.');
        }
        throw error;
      }

      if (!data) {
        throw new Error('فشل تحديث الميزانية: لم يتم إرجاع بيانات');
      }

      return data;
    } catch (error: any) {
      console.error('Error updating budget:', error);
      throw error;
    }
  }

  static async deleteBudget(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('accounting_budgets')
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) {
        if (error.code === '42P01' || error.code === 'PGRST116' || 
            error.message?.toLowerCase().includes('does not exist') ||
            error.message?.toLowerCase().includes('schema cache')) {
          throw new Error('جدول الميزانيات غير موجود. يرجى التأكد من تطبيق migrations في قاعدة البيانات.');
        }
        throw error;
      }
    } catch (error: any) {
      console.error('Error deleting budget:', error);
      throw error;
    }
  }

  // Payments
  static async getPayments(startDate?: string, endDate?: string, invoiceId?: string): Promise<Payment[]> {
    let query = supabase
      .from('accounting_payments')
      .select('*')
      .order('payment_date', { ascending: false });

    if (startDate) {
      query = query.gte('payment_date', startDate);
    }
    if (endDate) {
      query = query.lte('payment_date', endDate);
    }
    if (invoiceId) {
      query = query.eq('invoice_id', invoiceId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  static async getPaymentById(id: string): Promise<Payment | null> {
    const { data, error } = await supabase
      .from('accounting_payments')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  static async createPayment(paymentData: CreatePaymentData): Promise<Payment> {
    const { data, error } = await supabase
      .from('accounting_payments')
      .insert(paymentData)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async updatePayment(id: string, paymentData: Partial<CreatePaymentData>): Promise<Payment> {
    const { data, error } = await supabase
      .from('accounting_payments')
      .update({ ...paymentData, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async deletePayment(id: string): Promise<void> {
    const { error } = await supabase
      .from('accounting_payments')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  static async updatePaymentStatus(id: string, status: Payment['status']): Promise<Payment> {
    const { data, error } = await supabase
      .from('accounting_payments')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Settings
  static async getSettings(): Promise<AccountingSettings | null> {
    try {
      const { data, error } = await supabase
        .from('accounting_settings')
        .select('*')
        .limit(1)
        .single();

      if (error) {
        if (error.code === 'PGRST116' || error.code === '42P01') {
          // Table doesn't exist or no rows - return default settings
          console.warn('Settings table not found, using default settings');
          return null;
        }
        throw error;
      }
      return data;
    } catch (error) {
      console.error('Error getting settings:', error);
      return null;
    }
  }

  static async updateSettings(settingsData: Partial<AccountingSettings>): Promise<AccountingSettings> {
    try {
      // Try to get existing settings
      const existing = await this.getSettings();
      const settingsId = existing?.id || '00000000-0000-0000-0000-000000000001';

      const { data, error } = await supabase
        .from('accounting_settings')
        .upsert({
          id: settingsId,
          ...settingsData,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        // If table doesn't exist, just log the error but don't throw
        if (error.code === '42P01' || error.message?.includes('schema cache')) {
          console.error('Settings table does not exist. Please run the migration: 20241221_create_accounting_settings.sql');
          throw new Error('جدول الإعدادات غير موجود. يرجى تطبيق migration: 20241221_create_accounting_settings.sql');
        }
        throw error;
      }
      return data;
    } catch (error) {
      console.error('Error updating settings:', error);
      throw error;
    }
  }
}
