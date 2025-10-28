import { supabase } from '../lib/supabase';
import { 
  AccountingCategory, 
  AccountingTransaction, 
  DailyCashSummary, 
  CreateAccountingTransactionData,
  CreateAccountingCategoryData 
} from '../lib/types';

export interface FinancialReport {
  period: string;
  income: number;
  expense: number;
  profit: number;
  growth: number;
  transactionCount: number;
}

export interface BudgetItem {
  id: string;
  category_id: string;
  category?: AccountingCategory;
  amount: number;
  period: 'monthly' | 'quarterly' | 'yearly';
  start_date: string;
  end_date: string;
  spent: number;
  remaining: number;
  created_at: string;
  updated_at: string;
}

export interface CashFlowProjection {
  date: string;
  projected_income: number;
  projected_expense: number;
  projected_balance: number;
  confidence_level: number;
}

export interface CategoryAnalysis {
  category: AccountingCategory;
  total_amount: number;
  transaction_count: number;
  average_amount: number;
  percentage: number;
  trend: 'up' | 'down' | 'stable';
}

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

  // Advanced Analytics
  static async getCategoryAnalysis(startDate: string, endDate: string): Promise<CategoryAnalysis[]> {
    const { data: transactions, error } = await supabase
      .from('accounting_transactions')
      .select(`
        *,
        category:accounting_categories(*)
      `)
      .gte('transaction_date', startDate)
      .lte('transaction_date', endDate);

    if (error) throw error;

    const categoryMap = new Map<string, CategoryAnalysis>();
    const totalAmount = transactions?.reduce((sum, t) => sum + t.amount, 0) || 0;

    transactions?.forEach(transaction => {
      const categoryId = transaction.category_id || 'uncategorized';
      const categoryName = transaction.category?.name_ar || 'غير محدد';
      
      if (!categoryMap.has(categoryId)) {
        categoryMap.set(categoryId, {
          category: transaction.category || {
            id: categoryId,
            name_ar: categoryName,
            name_en: categoryName,
            name_tr: categoryName,
            type: transaction.type,
            is_active: true,
            created_at: '',
            updated_at: ''
          },
          total_amount: 0,
          transaction_count: 0,
          average_amount: 0,
          percentage: 0,
          trend: 'stable'
        });
      }

      const analysis = categoryMap.get(categoryId)!;
      analysis.total_amount += transaction.amount;
      analysis.transaction_count += 1;
    });

    // Calculate percentages and averages
    categoryMap.forEach(analysis => {
      analysis.percentage = totalAmount > 0 ? (analysis.total_amount / totalAmount) * 100 : 0;
      analysis.average_amount = analysis.transaction_count > 0 ? analysis.total_amount / analysis.transaction_count : 0;
    });

    return Array.from(categoryMap.values()).sort((a, b) => b.total_amount - a.total_amount);
  }

  // Cash Flow Projections
  static async getCashFlowProjection(days: number = 30): Promise<CashFlowProjection[]> {
    const projections: CashFlowProjection[] = [];
    const today = new Date();
    
    // Get historical data for trend analysis
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - 90); // Last 90 days
    
    const { data: historicalData, error } = await supabase
      .from('accounting_transactions')
      .select('*')
      .gte('transaction_date', startDate.toISOString().split('T')[0])
      .lte('transaction_date', today.toISOString().split('T')[0]);

    if (error) throw error;

    // Calculate average daily income and expense
    const dailyIncome = historicalData?.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0) / 90 || 0;
    const dailyExpense = historicalData?.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0) / 90 || 0;
    
    // Get current balance
    const { data: latestSummary } = await supabase
      .from('daily_cash_summary')
      .select('closing_balance')
      .order('summary_date', { ascending: false })
      .limit(1)
      .single();

    let currentBalance = latestSummary?.closing_balance || 0;

    // Generate projections
    for (let i = 1; i <= days; i++) {
      const projectionDate = new Date(today);
      projectionDate.setDate(projectionDate.getDate() + i);
      
      // Add some randomness to projections (±20%)
      const incomeVariation = 0.8 + Math.random() * 0.4;
      const expenseVariation = 0.8 + Math.random() * 0.4;
      
      const projectedIncome = dailyIncome * incomeVariation;
      const projectedExpense = dailyExpense * expenseVariation;
      
      currentBalance += projectedIncome - projectedExpense;
      
      projections.push({
        date: projectionDate.toISOString().split('T')[0],
        projected_income: projectedIncome,
        projected_expense: projectedExpense,
        projected_balance: currentBalance,
        confidence_level: Math.max(0.3, 1 - (i / days)) // Decreasing confidence over time
      });
    }

    return projections;
  }

  // Monthly Trends
  static async getMonthlyTrends(months: number = 12): Promise<FinancialReport[]> {
    const trends: FinancialReport[] = [];
    const today = new Date();
    
    for (let i = months - 1; i >= 0; i--) {
      const monthStart = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthEnd = new Date(today.getFullYear(), today.getMonth() - i + 1, 0);
      
      const { data: transactions, error } = await supabase
        .from('accounting_transactions')
        .select('*')
        .gte('transaction_date', monthStart.toISOString().split('T')[0])
        .lte('transaction_date', monthEnd.toISOString().split('T')[0]);

      if (error) continue;

      const income = transactions?.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0) || 0;
      const expense = transactions?.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0) || 0;
      const profit = income - expense;
      const transactionCount = transactions?.length || 0;
      
      trends.push({
        period: monthStart.toLocaleDateString('ar-SA', { month: 'long', year: 'numeric' }),
        income,
        expense,
        profit,
        growth: 0,
        transactionCount
      });
    }

    // Calculate growth rates
    for (let i = 1; i < trends.length; i++) {
      const prevIncome = trends[i - 1].income;
      const currentIncome = trends[i].income;
      trends[i].growth = prevIncome > 0 ? ((currentIncome - prevIncome) / prevIncome) * 100 : 0;
    }

    return trends;
  }

  // Export Functions
  static async exportTransactions(startDate: string, endDate: string, format: 'csv' | 'excel' = 'csv'): Promise<string> {
    const { data: transactions, error } = await supabase
      .from('accounting_transactions')
      .select(`
        *,
        category:accounting_categories(*)
      `)
      .gte('transaction_date', startDate)
      .lte('transaction_date', endDate)
      .order('transaction_date', { ascending: false });

    if (error) throw error;

    if (format === 'csv') {
      const headers = ['التاريخ', 'النوع', 'الفئة', 'المبلغ', 'الوصف'];
      const rows = transactions?.map(t => [
        t.transaction_date,
        t.type === 'income' ? 'وارد' : 'صادر',
        t.category?.name_ar || 'غير محدد',
        t.amount,
        t.description_ar || ''
      ]) || [];

      const csvContent = [headers, ...rows]
        .map(row => row.map(field => `"${field}"`).join(','))
        .join('\n');

      return csvContent;
    }

    return JSON.stringify(transactions, null, 2);
  }

  // Dashboard Statistics
  static async getDashboardStats(): Promise<{
    totalIncome: number;
    totalExpense: number;
    netProfit: number;
    monthlyIncome: number;
    monthlyExpense: number;
    monthlyProfit: number;
    transactionCount: number;
    averageTransaction: number;
    topCategory: string;
    cashFlow: number;
  }> {
    const today = new Date();
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    const [allTransactions, monthlyTransactions, latestSummary] = await Promise.all([
      supabase.from('accounting_transactions').select('*'),
      supabase.from('accounting_transactions')
        .select('*')
        .gte('transaction_date', monthStart.toISOString().split('T')[0])
        .lte('transaction_date', monthEnd.toISOString().split('T')[0]),
      supabase.from('daily_cash_summary')
        .select('closing_balance')
        .order('summary_date', { ascending: false })
        .limit(1)
        .single()
    ]);

    const allData = allTransactions.data || [];
    const monthlyData = monthlyTransactions.data || [];

    const totalIncome = allData.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = allData.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const netProfit = totalIncome - totalExpense;

    const monthlyIncome = monthlyData.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const monthlyExpense = monthlyData.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const monthlyProfit = monthlyIncome - monthlyExpense;

    const transactionCount = allData.length;
    const averageTransaction = transactionCount > 0 ? (totalIncome + totalExpense) / transactionCount : 0;

    // Find top category
    const categoryTotals = allData.reduce((acc, t) => {
      const categoryName = t.category_id || 'uncategorized';
      acc[categoryName] = (acc[categoryName] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

    const topCategory = Object.entries(categoryTotals).reduce((a, b) => 
      categoryTotals[a[0]] > categoryTotals[b[0]] ? a : b
    )?.[0] || 'غير محدد';

    return {
      totalIncome,
      totalExpense,
      netProfit,
      monthlyIncome,
      monthlyExpense,
      monthlyProfit,
      transactionCount,
      averageTransaction,
      topCategory,
      cashFlow: latestSummary.data?.closing_balance || 0
    };
  }
}
