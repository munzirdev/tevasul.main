import React, { useState, useEffect } from 'react';
import { 
  Plus, Edit, Trash2, Calendar, DollarSign, TrendingUp, TrendingDown, Filter, Search, Download, Eye,
  BarChart3, PieChart, LineChart, Target, AlertCircle, CheckCircle, Clock, Users, Building,
  FileText, Receipt, Calculator, Wallet, CreditCard, Banknote, Coins, PiggyBank,
  ArrowUpRight, ArrowDownRight, Activity, Zap, Shield, Lock, Unlock, Settings,
  RefreshCw, Save, X, Upload, Archive, BookOpen, TrendingUp as TrendingUpIcon,
  DollarSign as DollarSignIcon, Percent, Layers, Grid, List, MapPin, Globe,
  Smartphone, Monitor, Tablet, Wifi, Battery, HardDrive, Cpu, MemoryStick
} from 'lucide-react';
import { AccountingService } from '../services/accountingService';
import { 
  AccountingCategory, 
  AccountingTransaction, 
  DailyCashSummary, 
  CreateAccountingTransactionData,
  CreateAccountingCategoryData 
} from '../lib/types';
import { useLanguage } from '../hooks/useLanguage';

interface AccountingManagementProps {
  isDarkMode: boolean;
}

interface DashboardStats {
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
}

interface FinancialReport {
  period: string;
  income: number;
  expense: number;
  profit: number;
  growth: number;
}

const AccountingManagement: React.FC<AccountingManagementProps> = ({ isDarkMode }) => {
  const { t, language } = useLanguage();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'transactions' | 'categories' | 'reports' | 'budgets' | 'analytics' | 'settings'>('dashboard');
  const [transactions, setTransactions] = useState<AccountingTransaction[]>([]);
  const [categories, setCategories] = useState<AccountingCategory[]>([]);
  const [dailySummaries, setDailySummaries] = useState<DailyCashSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<AccountingTransaction | null>(null);
  const [editingCategory, setEditingCategory] = useState<AccountingCategory | null>(null);
  const [selectedDate, setSelectedDate] = useState(AccountingService.getCurrentDate());
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month' | 'quarter' | 'year'>('month');
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    totalIncome: 0,
    totalExpense: 0,
    netProfit: 0,
    monthlyIncome: 0,
    monthlyExpense: 0,
    monthlyProfit: 0,
    transactionCount: 0,
    averageTransaction: 0,
    topCategory: '',
    cashFlow: 0
  });

  // Form states
  const [transactionForm, setTransactionForm] = useState<CreateAccountingTransactionData>({
    category_id: '',
    type: 'income',
    amount: 0,
    description_ar: '',
    description_en: '',
    description_tr: '',
    transaction_date: AccountingService.getCurrentDate()
  });

  const [categoryForm, setCategoryForm] = useState<CreateAccountingCategoryData>({
    name_ar: '',
    name_en: '',
    name_tr: '',
    type: 'income',
    description_ar: '',
    description_en: '',
    description_tr: ''
  });

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  // Load data when filters change
  useEffect(() => {
    loadData();
  }, [selectedDate, filterType, filterCategory, dateRange]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [transactionsData, categoriesData, summariesData] = await Promise.all([
        AccountingService.getTransactions(selectedDate, filterType, filterCategory),
        AccountingService.getCategories(),
        AccountingService.getDailySummaries(dateRange)
      ]);

      setTransactions(transactionsData);
      setCategories(categoriesData);
      setDailySummaries(summariesData);
      
      // Calculate dashboard stats
      calculateDashboardStats(transactionsData, summariesData);
    } catch (error) {
      console.error('Error loading accounting data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateDashboardStats = (transactions: AccountingTransaction[], summaries: DailyCashSummary[]) => {
    const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const netProfit = totalIncome - totalExpense;
    
    // Calculate monthly stats
    const currentMonth = new Date().getMonth();
    const monthlyTransactions = transactions.filter(t => new Date(t.transaction_date).getMonth() === currentMonth);
    const monthlyIncome = monthlyTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const monthlyExpense = monthlyTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const monthlyProfit = monthlyIncome - monthlyExpense;
    
    // Find top category
    const categoryTotals = transactions.reduce((acc, t) => {
      const categoryName = t.category?.name_ar || 'غير محدد';
      acc[categoryName] = (acc[categoryName] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);
    
    const topCategory = Object.entries(categoryTotals).reduce((a, b) => categoryTotals[a[0]] > categoryTotals[b[0]] ? a : b)?.[0] || 'غير محدد';
    
    setDashboardStats({
      totalIncome,
      totalExpense,
      netProfit,
      monthlyIncome,
      monthlyExpense,
      monthlyProfit,
      transactionCount: transactions.length,
      averageTransaction: transactions.length > 0 ? (totalIncome + totalExpense) / transactions.length : 0,
      topCategory,
      cashFlow: summaries.length > 0 ? summaries[summaries.length - 1].closing_balance : 0
    });
  };

  const handleTransactionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (editingTransaction) {
        await AccountingService.updateTransaction(editingTransaction.id, transactionForm);
      } else {
        await AccountingService.createTransaction(transactionForm);
      }
      
      setShowTransactionForm(false);
      setEditingTransaction(null);
      setTransactionForm({
        category_id: '',
        type: 'income',
        amount: 0,
        description_ar: '',
        description_en: '',
        description_tr: '',
        transaction_date: AccountingService.getCurrentDate()
      });
      
      await loadData();
    } catch (error) {
      console.error('Error saving transaction:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (editingCategory) {
        await AccountingService.updateCategory(editingCategory.id, categoryForm);
      } else {
        await AccountingService.createCategory(categoryForm);
      }
      
      setShowCategoryForm(false);
      setEditingCategory(null);
      setCategoryForm({
        name_ar: '',
        name_en: '',
        name_tr: '',
        type: 'income',
        description_ar: '',
        description_en: '',
        description_tr: ''
      });
      
      await loadData();
    } catch (error) {
      console.error('Error saving category:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذه المعاملة؟')) {
      setLoading(true);
      try {
        await AccountingService.deleteTransaction(id);
        await loadData();
      } catch (error) {
        console.error('Error deleting transaction:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذه الفئة؟')) {
      setLoading(true);
      try {
        await AccountingService.deleteCategory(id);
        await loadData();
      } catch (error) {
        console.error('Error deleting category:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleEditTransaction = (transaction: AccountingTransaction) => {
    setEditingTransaction(transaction);
    setTransactionForm({
      category_id: transaction.category_id || '',
      type: transaction.type,
      amount: transaction.amount,
      description_ar: transaction.description_ar || '',
      description_en: transaction.description_en || '',
      description_tr: transaction.description_tr || '',
      transaction_date: transaction.transaction_date
    });
    setShowTransactionForm(true);
  };

  const handleEditCategory = (category: AccountingCategory) => {
    setEditingCategory(category);
    setCategoryForm({
      name_ar: category.name_ar,
      name_en: category.name_en,
      name_tr: category.name_tr,
      type: category.type,
      description_ar: category.description_ar || '',
      description_en: category.description_en || '',
      description_tr: category.description_tr || ''
    });
    setShowCategoryForm(true);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const getCategoryName = (category: AccountingCategory | undefined) => {
    if (!category) return 'غير محدد';
    return language === 'ar' ? category.name_ar : 
           language === 'en' ? category.name_en : category.name_tr;
  };

  const getDescription = (transaction: AccountingTransaction) => {
    return language === 'ar' ? transaction.description_ar : 
           language === 'en' ? transaction.description_en : transaction.description_tr;
  };

  // Dashboard Component
  const DashboardTab = () => (
    <div className="space-y-6">
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Income */}
        <div className={`p-6 rounded-2xl backdrop-blur-xl border transition-all duration-300 hover:scale-105 ${
          isDarkMode 
            ? 'bg-gradient-to-br from-green-500/20 to-emerald-500/10 border-green-400/30 shadow-green-500/25' 
            : 'bg-gradient-to-br from-green-500/30 to-emerald-500/20 border-green-400/50 shadow-green-500/25'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${isDarkMode ? 'text-green-300' : 'text-green-700'}`}>
                إجمالي الإيرادات
              </p>
              <p className={`text-2xl font-bold ${isDarkMode ? 'text-green-100' : 'text-green-800'}`}>
                {formatCurrency(dashboardStats.totalIncome)}
              </p>
            </div>
            <div className={`p-3 rounded-full ${isDarkMode ? 'bg-green-500/20' : 'bg-green-500/30'}`}>
              <TrendingUp className={`w-6 h-6 ${isDarkMode ? 'text-green-300' : 'text-green-600'}`} />
            </div>
          </div>
        </div>

        {/* Total Expenses */}
        <div className={`p-6 rounded-2xl backdrop-blur-xl border transition-all duration-300 hover:scale-105 ${
          isDarkMode 
            ? 'bg-gradient-to-br from-red-500/20 to-rose-500/10 border-red-400/30 shadow-red-500/25' 
            : 'bg-gradient-to-br from-red-500/30 to-rose-500/20 border-red-400/50 shadow-red-500/25'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${isDarkMode ? 'text-red-300' : 'text-red-700'}`}>
                إجمالي المصروفات
              </p>
              <p className={`text-2xl font-bold ${isDarkMode ? 'text-red-100' : 'text-red-800'}`}>
                {formatCurrency(dashboardStats.totalExpense)}
              </p>
            </div>
            <div className={`p-3 rounded-full ${isDarkMode ? 'bg-red-500/20' : 'bg-red-500/30'}`}>
              <TrendingDown className={`w-6 h-6 ${isDarkMode ? 'text-red-300' : 'text-red-600'}`} />
            </div>
          </div>
        </div>

        {/* Net Profit */}
        <div className={`p-6 rounded-2xl backdrop-blur-xl border transition-all duration-300 hover:scale-105 ${
          isDarkMode 
            ? 'bg-gradient-to-br from-blue-500/20 to-cyan-500/10 border-blue-400/30 shadow-blue-500/25' 
            : 'bg-gradient-to-br from-blue-500/30 to-cyan-500/20 border-blue-400/50 shadow-blue-500/25'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${isDarkMode ? 'text-blue-300' : 'text-blue-700'}`}>
                صافي الربح
              </p>
              <p className={`text-2xl font-bold ${isDarkMode ? 'text-blue-100' : 'text-blue-800'}`}>
                {formatCurrency(dashboardStats.netProfit)}
              </p>
            </div>
            <div className={`p-3 rounded-full ${isDarkMode ? 'bg-blue-500/20' : 'bg-blue-500/30'}`}>
              <Calculator className={`w-6 h-6 ${isDarkMode ? 'text-blue-300' : 'text-blue-600'}`} />
            </div>
          </div>
        </div>

        {/* Cash Flow */}
        <div className={`p-6 rounded-2xl backdrop-blur-xl border transition-all duration-300 hover:scale-105 ${
          isDarkMode 
            ? 'bg-gradient-to-br from-purple-500/20 to-violet-500/10 border-purple-400/30 shadow-purple-500/25' 
            : 'bg-gradient-to-br from-purple-500/30 to-violet-500/20 border-purple-400/50 shadow-purple-500/25'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${isDarkMode ? 'text-purple-300' : 'text-purple-700'}`}>
                التدفق النقدي
              </p>
              <p className={`text-2xl font-bold ${isDarkMode ? 'text-purple-100' : 'text-purple-800'}`}>
                {formatCurrency(dashboardStats.cashFlow)}
              </p>
            </div>
            <div className={`p-3 rounded-full ${isDarkMode ? 'bg-purple-500/20' : 'bg-purple-500/30'}`}>
              <Activity className={`w-6 h-6 ${isDarkMode ? 'text-purple-300' : 'text-purple-600'}`} />
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Income vs Expense */}
        <div className={`p-6 rounded-2xl backdrop-blur-xl border ${
          isDarkMode 
            ? 'bg-white/5 border-white/10' 
            : 'bg-white/10 border-white/20'
        }`}>
          <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
            الأداء الشهري
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>إيرادات الشهر</span>
              <span className={`font-semibold ${isDarkMode ? 'text-green-300' : 'text-green-600'}`}>
                {formatCurrency(dashboardStats.monthlyIncome)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>مصروفات الشهر</span>
              <span className={`font-semibold ${isDarkMode ? 'text-red-300' : 'text-red-600'}`}>
                {formatCurrency(dashboardStats.monthlyExpense)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>ربح الشهر</span>
              <span className={`font-semibold ${dashboardStats.monthlyProfit >= 0 ? (isDarkMode ? 'text-green-300' : 'text-green-600') : (isDarkMode ? 'text-red-300' : 'text-red-600')}`}>
                {formatCurrency(dashboardStats.monthlyProfit)}
              </span>
            </div>
          </div>
        </div>

        {/* Transaction Statistics */}
        <div className={`p-6 rounded-2xl backdrop-blur-xl border ${
          isDarkMode 
            ? 'bg-white/5 border-white/10' 
            : 'bg-white/10 border-white/20'
        }`}>
          <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
            إحصائيات المعاملات
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>عدد المعاملات</span>
              <span className={`font-semibold ${isDarkMode ? 'text-blue-300' : 'text-blue-600'}`}>
                {dashboardStats.transactionCount}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>متوسط المعاملة</span>
              <span className={`font-semibold ${isDarkMode ? 'text-purple-300' : 'text-purple-600'}`}>
                {formatCurrency(dashboardStats.averageTransaction)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>أعلى فئة</span>
              <span className={`font-semibold ${isDarkMode ? 'text-orange-300' : 'text-orange-600'}`}>
                {dashboardStats.topCategory}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className={`p-6 rounded-2xl backdrop-blur-xl border ${
        isDarkMode 
          ? 'bg-white/5 border-white/10' 
          : 'bg-white/10 border-white/20'
      }`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
            المعاملات الأخيرة
          </h3>
          <button
            onClick={() => setActiveTab('transactions')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              isDarkMode 
                ? 'bg-blue-500/20 text-blue-300 hover:bg-blue-500/30' 
                : 'bg-blue-500/30 text-blue-700 hover:bg-blue-500/40'
            }`}
          >
            عرض الكل
          </button>
        </div>
        <div className="space-y-3">
          {transactions.slice(0, 5).map((transaction) => (
            <div key={transaction.id} className={`p-4 rounded-lg border ${
              isDarkMode 
                ? 'bg-white/5 border-white/10' 
                : 'bg-white/10 border-white/20'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-full ${
                    transaction.type === 'income' 
                      ? (isDarkMode ? 'bg-green-500/20' : 'bg-green-500/30')
                      : (isDarkMode ? 'bg-red-500/20' : 'bg-red-500/30')
                  }`}>
                    {transaction.type === 'income' ? (
                      <ArrowUpRight className={`w-4 h-4 ${isDarkMode ? 'text-green-300' : 'text-green-600'}`} />
                    ) : (
                      <ArrowDownRight className={`w-4 h-4 ${isDarkMode ? 'text-red-300' : 'text-red-600'}`} />
                    )}
                  </div>
                  <div>
                    <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                      {getCategoryName(transaction.category)}
                    </p>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {getDescription(transaction) || 'لا يوجد وصف'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-semibold ${
                    transaction.type === 'income' 
                      ? (isDarkMode ? 'text-green-300' : 'text-green-600')
                      : (isDarkMode ? 'text-red-300' : 'text-red-600')
                  }`}>
                    {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                  </p>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {new Date(transaction.transaction_date).toLocaleDateString('ar-SA')}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Transactions Tab
  const TransactionsTab = () => (
    <div className="space-y-6">
      {/* Filters */}
      <div className={`p-6 rounded-2xl backdrop-blur-xl border ${
        isDarkMode 
          ? 'bg-white/5 border-white/10' 
          : 'bg-white/10 border-white/20'
      }`}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              التاريخ
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className={`w-full px-3 py-2 rounded-lg border ${
                isDarkMode 
                  ? 'bg-white/10 border-white/20 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            />
          </div>
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              النوع
            </label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className={`w-full px-3 py-2 rounded-lg border ${
                isDarkMode 
                  ? 'bg-white/10 border-white/20 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="all">الكل</option>
              <option value="income">واردات</option>
              <option value="expense">صادرات</option>
            </select>
          </div>
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              الفئة
            </label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className={`w-full px-3 py-2 rounded-lg border ${
                isDarkMode 
                  ? 'bg-white/10 border-white/20 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="all">الكل</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {getCategoryName(category)}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => setShowTransactionForm(true)}
              className={`w-full px-4 py-2 rounded-lg font-medium transition-colors ${
                isDarkMode 
                  ? 'bg-green-500/20 text-green-300 hover:bg-green-500/30' 
                  : 'bg-green-500/30 text-green-700 hover:bg-green-500/40'
              }`}
            >
              <Plus className="w-4 h-4 inline mr-2" />
              إضافة معاملة
            </button>
          </div>
        </div>
      </div>

      {/* Transactions List */}
      <div className={`p-6 rounded-2xl backdrop-blur-xl border ${
        isDarkMode 
          ? 'bg-white/5 border-white/10' 
          : 'bg-white/10 border-white/20'
      }`}>
        <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
          المعاملات المالية
        </h3>
        <div className="space-y-3">
          {transactions.map((transaction) => (
            <div key={transaction.id} className={`p-4 rounded-lg border ${
              isDarkMode 
                ? 'bg-white/5 border-white/10' 
                : 'bg-white/10 border-white/20'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-full ${
                    transaction.type === 'income' 
                      ? (isDarkMode ? 'bg-green-500/20' : 'bg-green-500/30')
                      : (isDarkMode ? 'bg-red-500/20' : 'bg-red-500/30')
                  }`}>
                    {transaction.type === 'income' ? (
                      <ArrowUpRight className={`w-4 h-4 ${isDarkMode ? 'text-green-300' : 'text-green-600'}`} />
                    ) : (
                      <ArrowDownRight className={`w-4 h-4 ${isDarkMode ? 'text-red-300' : 'text-red-600'}`} />
                    )}
                  </div>
                  <div>
                    <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                      {getCategoryName(transaction.category)}
                    </p>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {getDescription(transaction) || 'لا يوجد وصف'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <p className={`font-semibold ${
                      transaction.type === 'income' 
                        ? (isDarkMode ? 'text-green-300' : 'text-green-600')
                        : (isDarkMode ? 'text-red-300' : 'text-red-600')
                    }`}>
                      {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                    </p>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {new Date(transaction.transaction_date).toLocaleDateString('ar-SA')}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditTransaction(transaction)}
                      className={`p-2 rounded-lg transition-colors ${
                        isDarkMode 
                          ? 'bg-blue-500/20 text-blue-300 hover:bg-blue-500/30' 
                          : 'bg-blue-500/30 text-blue-700 hover:bg-blue-500/40'
                      }`}
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteTransaction(transaction.id)}
                      className={`p-2 rounded-lg transition-colors ${
                        isDarkMode 
                          ? 'bg-red-500/20 text-red-300 hover:bg-red-500/30' 
                          : 'bg-red-500/30 text-red-700 hover:bg-red-500/40'
                      }`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {transactions.length === 0 && (
            <div className={`text-center py-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              لا توجد معاملات مالية
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Categories Tab
  const CategoriesTab = () => (
    <div className="space-y-6">
      {/* Add Category Button */}
      <div className="flex justify-end">
        <button
          onClick={() => setShowCategoryForm(true)}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            isDarkMode 
              ? 'bg-green-500/20 text-green-300 hover:bg-green-500/30' 
              : 'bg-green-500/30 text-green-700 hover:bg-green-500/40'
          }`}
        >
          <Plus className="w-4 h-4 inline mr-2" />
          إضافة فئة جديدة
        </button>
      </div>

      {/* Income Categories */}
      <div className={`p-6 rounded-2xl backdrop-blur-xl border ${
        isDarkMode 
          ? 'bg-white/5 border-white/10' 
          : 'bg-white/10 border-white/20'
      }`}>
        <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
          فئات الواردات
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.filter(c => c.type === 'income').map((category) => (
            <div key={category.id} className={`p-4 rounded-lg border ${
              isDarkMode 
                ? 'bg-white/5 border-white/10' 
                : 'bg-white/10 border-white/20'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                    {getCategoryName(category)}
                  </h4>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {language === 'ar' ? category.description_ar : 
                     language === 'en' ? category.description_en : category.description_tr}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEditCategory(category)}
                    className={`p-2 rounded-lg transition-colors ${
                      isDarkMode 
                        ? 'bg-blue-500/20 text-blue-300 hover:bg-blue-500/30' 
                        : 'bg-blue-500/30 text-blue-700 hover:bg-blue-500/40'
                    }`}
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteCategory(category.id)}
                    className={`p-2 rounded-lg transition-colors ${
                      isDarkMode 
                        ? 'bg-red-500/20 text-red-300 hover:bg-red-500/30' 
                        : 'bg-red-500/30 text-red-700 hover:bg-red-500/40'
                    }`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Expense Categories */}
      <div className={`p-6 rounded-2xl backdrop-blur-xl border ${
        isDarkMode 
          ? 'bg-white/5 border-white/10' 
          : 'bg-white/10 border-white/20'
      }`}>
        <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
          فئات الصادرات
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.filter(c => c.type === 'expense').map((category) => (
            <div key={category.id} className={`p-4 rounded-lg border ${
              isDarkMode 
                ? 'bg-white/5 border-white/10' 
                : 'bg-white/10 border-white/20'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                    {getCategoryName(category)}
                  </h4>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {language === 'ar' ? category.description_ar : 
                     language === 'en' ? category.description_en : category.description_tr}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEditCategory(category)}
                    className={`p-2 rounded-lg transition-colors ${
                      isDarkMode 
                        ? 'bg-blue-500/20 text-blue-300 hover:bg-blue-500/30' 
                        : 'bg-blue-500/30 text-blue-700 hover:bg-blue-500/40'
                    }`}
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteCategory(category.id)}
                    className={`p-2 rounded-lg transition-colors ${
                      isDarkMode 
                        ? 'bg-red-500/20 text-red-300 hover:bg-red-500/30' 
                        : 'bg-red-500/30 text-red-700 hover:bg-red-500/40'
                    }`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Reports Tab
  const ReportsTab = () => (
    <div className="space-y-6">
      {/* Report Filters */}
      <div className={`p-6 rounded-2xl backdrop-blur-xl border ${
        isDarkMode 
          ? 'bg-white/5 border-white/10' 
          : 'bg-white/10 border-white/20'
      }`}>
        <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
          التقارير المالية
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              الفترة
            </label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as any)}
              className={`w-full px-3 py-2 rounded-lg border ${
                isDarkMode 
                  ? 'bg-white/10 border-white/20 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="today">اليوم</option>
              <option value="week">هذا الأسبوع</option>
              <option value="month">هذا الشهر</option>
              <option value="quarter">هذا الربع</option>
              <option value="year">هذا العام</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={loadData}
              className={`w-full px-4 py-2 rounded-lg font-medium transition-colors ${
                isDarkMode 
                  ? 'bg-blue-500/20 text-blue-300 hover:bg-blue-500/30' 
                  : 'bg-blue-500/30 text-blue-700 hover:bg-blue-500/40'
              }`}
            >
              <RefreshCw className="w-4 h-4 inline mr-2" />
              تحديث التقرير
            </button>
          </div>
          <div className="flex items-end">
            <button
              onClick={async () => {
                const csvData = await AccountingService.exportTransactions(
                  new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                  new Date().toISOString().split('T')[0]
                );
                const blob = new Blob([csvData], { type: 'text/csv' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'accounting-report.csv';
                a.click();
              }}
              className={`w-full px-4 py-2 rounded-lg font-medium transition-colors ${
                isDarkMode 
                  ? 'bg-green-500/20 text-green-300 hover:bg-green-500/30' 
                  : 'bg-green-500/30 text-green-700 hover:bg-green-500/40'
              }`}
            >
              <Download className="w-4 h-4 inline mr-2" />
              تصدير CSV
            </button>
          </div>
        </div>
      </div>

      {/* Daily Summaries */}
      <div className={`p-6 rounded-2xl backdrop-blur-xl border ${
        isDarkMode 
          ? 'bg-white/5 border-white/10' 
          : 'bg-white/10 border-white/20'
      }`}>
        <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
          الملخصات اليومية
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className={`border-b ${isDarkMode ? 'border-white/10' : 'border-gray-200'}`}>
                <th className={`text-right py-3 px-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>التاريخ</th>
                <th className={`text-right py-3 px-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>الرصيد الافتتاحي</th>
                <th className={`text-right py-3 px-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>إجمالي الواردات</th>
                <th className={`text-right py-3 px-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>إجمالي الصادرات</th>
                <th className={`text-right py-3 px-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>الرصيد الختامي</th>
              </tr>
            </thead>
            <tbody>
              {dailySummaries.map((summary) => (
                <tr key={summary.id} className={`border-b ${isDarkMode ? 'border-white/5' : 'border-gray-100'}`}>
                  <td className={`py-3 px-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                    {new Date(summary.summary_date).toLocaleDateString('ar-SA')}
                  </td>
                  <td className={`py-3 px-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                    {formatCurrency(summary.opening_balance)}
                  </td>
                  <td className={`py-3 px-4 text-green-600`}>
                    {formatCurrency(summary.total_income)}
                  </td>
                  <td className={`py-3 px-4 text-red-600`}>
                    {formatCurrency(summary.total_expense)}
                  </td>
                  <td className={`py-3 px-4 font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                    {formatCurrency(summary.closing_balance)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // Budgets Tab
  const BudgetsTab = () => (
    <div className="space-y-6">
      <div className={`p-6 rounded-2xl backdrop-blur-xl border ${
        isDarkMode 
          ? 'bg-white/5 border-white/10' 
          : 'bg-white/10 border-white/20'
      }`}>
        <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
          إدارة الميزانيات
        </h3>
        <div className={`text-center py-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          <Target className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p>قريباً - نظام إدارة الميزانيات</p>
        </div>
      </div>
    </div>
  );

  // Analytics Tab
  const AnalyticsTab = () => (
    <div className="space-y-6">
      <div className={`p-6 rounded-2xl backdrop-blur-xl border ${
        isDarkMode 
          ? 'bg-white/5 border-white/10' 
          : 'bg-white/10 border-white/20'
      }`}>
        <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
          التحليلات المتقدمة
        </h3>
        <div className={`text-center py-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          <PieChart className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p>قريباً - التحليلات والرسوم البيانية</p>
        </div>
      </div>
    </div>
  );

  // Settings Tab
  const SettingsTab = () => (
    <div className="space-y-6">
      <div className={`p-6 rounded-2xl backdrop-blur-xl border ${
        isDarkMode 
          ? 'bg-white/5 border-white/10' 
          : 'bg-white/10 border-white/20'
      }`}>
        <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
          إعدادات النظام
        </h3>
        <div className={`text-center py-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          <Settings className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p>قريباً - إعدادات النظام المحاسبي</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Enhanced Header */}
      <div className={`p-6 rounded-2xl backdrop-blur-xl border ${
        isDarkMode 
          ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-blue-400/30' 
          : 'bg-gradient-to-r from-blue-500/30 to-purple-500/30 border-blue-400/50'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className={`p-3 rounded-full ${isDarkMode ? 'bg-blue-500/20' : 'bg-blue-500/30'}`}>
              <Calculator className={`w-8 h-8 ${isDarkMode ? 'text-blue-300' : 'text-blue-600'}`} />
            </div>
            <div>
              <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                نظام المحاسبة الشامل
              </h2>
              <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                إدارة مالية متقدمة للمشروع
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={loadData}
              disabled={loading}
              className={`p-2 rounded-lg transition-colors ${
                isDarkMode 
                  ? 'bg-white/10 text-white hover:bg-white/20' 
                  : 'bg-white/20 text-gray-700 hover:bg-white/30'
              } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => setShowTransactionForm(true)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                isDarkMode 
                  ? 'bg-green-500/20 text-green-300 hover:bg-green-500/30' 
                  : 'bg-green-500/30 text-green-700 hover:bg-green-500/40'
              }`}
            >
              <Plus className="w-4 h-4 inline mr-2" />
              معاملة جديدة
            </button>
          </div>
        </div>
      </div>

      {/* Enhanced Navigation Tabs */}
      <div className={`p-2 rounded-2xl backdrop-blur-xl border ${
        isDarkMode 
          ? 'bg-white/5 border-white/10' 
          : 'bg-white/10 border-white/20'
      }`}>
        <div className="flex space-x-2 overflow-x-auto">
          {[
            { id: 'dashboard', label: 'لوحة التحكم', icon: BarChart3 },
            { id: 'transactions', label: 'المعاملات', icon: Receipt },
            { id: 'categories', label: 'الفئات', icon: Layers },
            { id: 'reports', label: 'التقارير', icon: FileText },
            { id: 'budgets', label: 'الميزانيات', icon: Target },
            { id: 'analytics', label: 'التحليلات', icon: PieChart },
            { id: 'settings', label: 'الإعدادات', icon: Settings }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-4 py-3 rounded-xl font-medium transition-all duration-300 whitespace-nowrap ${
                  activeTab === tab.id
                    ? isDarkMode
                      ? 'bg-blue-500/20 text-blue-300 border border-blue-400/30'
                      : 'bg-blue-500/30 text-blue-700 border border-blue-400/50'
                    : isDarkMode
                    ? 'text-gray-300 hover:text-white hover:bg-white/10'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-white/20'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="min-h-[600px]">
        {activeTab === 'dashboard' && <DashboardTab />}
        {activeTab === 'transactions' && <TransactionsTab />}
        {activeTab === 'categories' && <CategoriesTab />}
        {activeTab === 'reports' && <ReportsTab />}
        {activeTab === 'budgets' && <BudgetsTab />}
        {activeTab === 'analytics' && <AnalyticsTab />}
        {activeTab === 'settings' && <SettingsTab />}
      </div>

      {/* Transaction Form Modal */}
      {showTransactionForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`w-full max-w-md rounded-2xl backdrop-blur-xl border ${
            isDarkMode 
              ? 'bg-white/10 border-white/20' 
              : 'bg-white border-gray-200'
          }`}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                  {editingTransaction ? 'تعديل المعاملة' : 'إضافة معاملة جديدة'}
                </h3>
                <button
                  onClick={() => {
                    setShowTransactionForm(false);
                    setEditingTransaction(null);
                    setTransactionForm({
                      category_id: '',
                      type: 'income',
                      amount: 0,
                      description_ar: '',
                      description_en: '',
                      description_tr: '',
                      transaction_date: AccountingService.getCurrentDate()
                    });
                  }}
                  className={`p-2 rounded-lg transition-colors ${
                    isDarkMode 
                      ? 'bg-white/10 text-white hover:bg-white/20' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleTransactionSubmit} className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    النوع
                  </label>
                  <select
                    value={transactionForm.type}
                    onChange={(e) => setTransactionForm({...transactionForm, type: e.target.value as 'income' | 'expense'})}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDarkMode 
                        ? 'bg-white/10 border-white/20 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    required
                  >
                    <option value="income">وارد</option>
                    <option value="expense">صادر</option>
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    الفئة
                  </label>
                  <select
                    value={transactionForm.category_id}
                    onChange={(e) => setTransactionForm({...transactionForm, category_id: e.target.value})}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDarkMode 
                        ? 'bg-white/10 border-white/20 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    <option value="">اختر الفئة</option>
                    {categories.filter(c => c.type === transactionForm.type).map(category => (
                      <option key={category.id} value={category.id}>
                        {getCategoryName(category)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    المبلغ
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={transactionForm.amount}
                    onChange={(e) => setTransactionForm({...transactionForm, amount: parseFloat(e.target.value) || 0})}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDarkMode 
                        ? 'bg-white/10 border-white/20 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    required
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    التاريخ
                  </label>
                  <input
                    type="date"
                    value={transactionForm.transaction_date}
                    onChange={(e) => setTransactionForm({...transactionForm, transaction_date: e.target.value})}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDarkMode 
                        ? 'bg-white/10 border-white/20 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    required
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    الوصف (عربي)
                  </label>
                  <textarea
                    value={transactionForm.description_ar}
                    onChange={(e) => setTransactionForm({...transactionForm, description_ar: e.target.value})}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDarkMode 
                        ? 'bg-white/10 border-white/20 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    rows={3}
                  />
                </div>

                <div className="flex space-x-3">
                  <button
                    type="submit"
                    disabled={loading}
                    className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                      isDarkMode 
                        ? 'bg-green-500/20 text-green-300 hover:bg-green-500/30' 
                        : 'bg-green-500/30 text-green-700 hover:bg-green-500/40'
                    } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {loading ? 'جاري الحفظ...' : (editingTransaction ? 'تحديث' : 'حفظ')}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowTransactionForm(false);
                      setEditingTransaction(null);
                    }}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      isDarkMode 
                        ? 'bg-gray-500/20 text-gray-300 hover:bg-gray-500/30' 
                        : 'bg-gray-500/30 text-gray-700 hover:bg-gray-500/40'
                    }`}
                  >
                    إلغاء
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Category Form Modal */}
      {showCategoryForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`w-full max-w-md rounded-2xl backdrop-blur-xl border ${
            isDarkMode 
              ? 'bg-white/10 border-white/20' 
              : 'bg-white border-gray-200'
          }`}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                  {editingCategory ? 'تعديل الفئة' : 'إضافة فئة جديدة'}
                </h3>
                <button
                  onClick={() => {
                    setShowCategoryForm(false);
                    setEditingCategory(null);
                    setCategoryForm({
                      name_ar: '',
                      name_en: '',
                      name_tr: '',
                      type: 'income',
                      description_ar: '',
                      description_en: '',
                      description_tr: ''
                    });
                  }}
                  className={`p-2 rounded-lg transition-colors ${
                    isDarkMode 
                      ? 'bg-white/10 text-white hover:bg-white/20' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCategorySubmit} className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    النوع
                  </label>
                  <select
                    value={categoryForm.type}
                    onChange={(e) => setCategoryForm({...categoryForm, type: e.target.value as 'income' | 'expense'})}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDarkMode 
                        ? 'bg-white/10 border-white/20 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    required
                  >
                    <option value="income">وارد</option>
                    <option value="expense">صادر</option>
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    الاسم (عربي)
                  </label>
                  <input
                    type="text"
                    value={categoryForm.name_ar}
                    onChange={(e) => setCategoryForm({...categoryForm, name_ar: e.target.value})}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDarkMode 
                        ? 'bg-white/10 border-white/20 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    required
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    الاسم (إنجليزي)
                  </label>
                  <input
                    type="text"
                    value={categoryForm.name_en}
                    onChange={(e) => setCategoryForm({...categoryForm, name_en: e.target.value})}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDarkMode 
                        ? 'bg-white/10 border-white/20 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    required
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    الاسم (تركي)
                  </label>
                  <input
                    type="text"
                    value={categoryForm.name_tr}
                    onChange={(e) => setCategoryForm({...categoryForm, name_tr: e.target.value})}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDarkMode 
                        ? 'bg-white/10 border-white/20 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    required
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    الوصف (عربي)
                  </label>
                  <textarea
                    value={categoryForm.description_ar}
                    onChange={(e) => setCategoryForm({...categoryForm, description_ar: e.target.value})}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDarkMode 
                        ? 'bg-white/10 border-white/20 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    rows={3}
                  />
                </div>

                <div className="flex space-x-3">
                  <button
                    type="submit"
                    disabled={loading}
                    className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                      isDarkMode 
                        ? 'bg-green-500/20 text-green-300 hover:bg-green-500/30' 
                        : 'bg-green-500/30 text-green-700 hover:bg-green-500/40'
                    } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {loading ? 'جاري الحفظ...' : (editingCategory ? 'تحديث' : 'حفظ')}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCategoryForm(false);
                      setEditingCategory(null);
                    }}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      isDarkMode 
                        ? 'bg-gray-500/20 text-gray-300 hover:bg-gray-500/30' 
                        : 'bg-gray-500/30 text-gray-700 hover:bg-gray-500/40'
                    }`}
                  >
                    إلغاء
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountingManagement;