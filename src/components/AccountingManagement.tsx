import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Filter,
  Download,
  RefreshCw,
  Save,
  X,
  Eye,
  BarChart3,
  PieChart,
  FileText
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

const AccountingManagement: React.FC<AccountingManagementProps> = ({ isDarkMode }) => {
  const { t, language } = useLanguage();
  const [activeTab, setActiveTab] = useState<'transactions' | 'categories' | 'summary' | 'reports'>('transactions');
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

  // Form states
  const [transactionForm, setTransactionForm] = useState<CreateAccountingTransactionData>({
    type: 'income',
    amount: 0,
    transaction_date: selectedDate,
    description_ar: '',
    description_en: '',
    description_tr: ''
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

  useEffect(() => {
    loadData();
  }, [selectedDate, filterType, filterCategory]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [transactionsData, categoriesData, summariesData] = await Promise.all([
        AccountingService.getTransactionsByDate(selectedDate),
        AccountingService.getCategories(),
        AccountingService.getDailySummaries()
      ]);

      let filteredTransactions = transactionsData;
      if (filterType !== 'all') {
        filteredTransactions = filteredTransactions.filter(t => t.type === filterType);
      }
      if (filterCategory !== 'all') {
        filteredTransactions = filteredTransactions.filter(t => t.category_id === filterCategory);
      }

      setTransactions(filteredTransactions);
      setCategories(categoriesData);
      setDailySummaries(summariesData);
    } catch (error) {
      console.error('Error loading accounting data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTransactionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingTransaction) {
        await AccountingService.updateTransaction(editingTransaction.id, transactionForm);
      } else {
        await AccountingService.createTransaction(transactionForm);
      }
      
      setShowTransactionForm(false);
      setEditingTransaction(null);
      setTransactionForm({
        type: 'income',
        amount: 0,
        transaction_date: selectedDate,
        description_ar: '',
        description_en: '',
        description_tr: ''
      });
      loadData();
    } catch (error) {
      console.error('Error saving transaction:', error);
    }
  };

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
      loadData();
    } catch (error) {
      console.error('Error saving category:', error);
    }
  };

  const handleEditTransaction = (transaction: AccountingTransaction) => {
    setEditingTransaction(transaction);
    setTransactionForm({
      category_id: transaction.category_id,
      type: transaction.type,
      amount: transaction.amount,
      transaction_date: transaction.transaction_date,
      description_ar: transaction.description_ar || '',
      description_en: transaction.description_en || '',
      description_tr: transaction.description_tr || ''
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

  const handleDeleteTransaction = async (id: string) => {
    if (window.confirm(language === 'ar' ? 'هل أنت متأكد من حذف هذه المعاملة؟' : 'Are you sure you want to delete this transaction?')) {
      try {
        await AccountingService.deleteTransaction(id);
        loadData();
      } catch (error) {
        console.error('Error deleting transaction:', error);
      }
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (window.confirm(language === 'ar' ? 'هل أنت متأكد من حذف هذه الفئة؟' : 'Are you sure you want to delete this category?')) {
      try {
        await AccountingService.deleteCategory(id);
        loadData();
      } catch (error) {
        console.error('Error deleting category:', error);
      }
    }
  };

  const getTotalIncome = () => {
    return transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  };

  const getTotalExpense = () => {
    return transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  };

  const getNetIncome = () => {
    return getTotalIncome() - getTotalExpense();
  };

  const getCategoryName = (categoryId?: string) => {
    if (!categoryId) return language === 'ar' ? 'غير محدد' : 'Not specified';
    const category = categories.find(c => c.id === categoryId);
    if (!category) return language === 'ar' ? 'غير محدد' : 'Not specified';
    
    switch (language) {
      case 'ar': return category.name_ar;
      case 'tr': return category.name_tr;
      default: return category.name_en;
    }
  };

  const getDescription = (transaction: AccountingTransaction) => {
    switch (language) {
      case 'ar': return transaction.description_ar || '';
      case 'tr': return transaction.description_tr || '';
      default: return transaction.description_en || '';
    }
  };

  return (
    <div className={`p-6 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">
          {language === 'ar' ? 'نظام المحاسبة' : 'Accounting System'}
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          {language === 'ar' ? 'إدارة الصادرات والواردات اليومية' : 'Manage daily income and expenses'}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-6 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
        {[
          { key: 'transactions', label: language === 'ar' ? 'المعاملات' : 'Transactions', icon: DollarSign },
          { key: 'categories', label: language === 'ar' ? 'الفئات' : 'Categories', icon: Filter },
          { key: 'summary', label: language === 'ar' ? 'الملخص اليومي' : 'Daily Summary', icon: Calendar },
          { key: 'reports', label: language === 'ar' ? 'التقارير' : 'Reports', icon: BarChart3 }
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key as any)}
            className={`flex items-center px-4 py-2 rounded-md transition-colors ${
              activeTab === key
                ? 'bg-blue-500 text-white'
                : isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Icon className="w-4 h-4 mr-2" />
            {label}
          </button>
        ))}
      </div>

      {/* Transactions Tab */}
      {activeTab === 'transactions' && (
        <div>
          {/* Controls */}
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className={`px-3 py-2 border rounded-md ${
                  isDarkMode ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'
                }`}
              />
            </div>
            
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className={`px-3 py-2 border rounded-md ${
                isDarkMode ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'
              }`}
            >
              <option value="all">{language === 'ar' ? 'جميع الأنواع' : 'All Types'}</option>
              <option value="income">{language === 'ar' ? 'واردات' : 'Income'}</option>
              <option value="expense">{language === 'ar' ? 'صادرات' : 'Expense'}</option>
            </select>

            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className={`px-3 py-2 border rounded-md ${
                isDarkMode ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'
              }`}
            >
              <option value="all">{language === 'ar' ? 'جميع الفئات' : 'All Categories'}</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {language === 'ar' ? category.name_ar : language === 'tr' ? category.name_tr : category.name_en}
                </option>
              ))}
            </select>

            <button
              onClick={() => setShowTransactionForm(true)}
              className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              {language === 'ar' ? 'إضافة معاملة' : 'Add Transaction'}
            </button>

            <button
              onClick={loadData}
              className="flex items-center px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              {language === 'ar' ? 'تحديث' : 'Refresh'}
            </button>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-green-900' : 'bg-green-50'} border border-green-200`}>
              <div className="flex items-center">
                <TrendingUp className="w-8 h-8 text-green-500 mr-3" />
                <div>
                  <p className="text-sm text-green-600 dark:text-green-400">
                    {language === 'ar' ? 'إجمالي الواردات' : 'Total Income'}
                  </p>
                  <p className="text-xl font-bold text-green-700 dark:text-green-300">
                    {AccountingService.formatCurrency(getTotalIncome())}
                  </p>
                </div>
              </div>
            </div>

            <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-red-900' : 'bg-red-50'} border border-red-200`}>
              <div className="flex items-center">
                <TrendingDown className="w-8 h-8 text-red-500 mr-3" />
                <div>
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {language === 'ar' ? 'إجمالي الصادرات' : 'Total Expense'}
                  </p>
                  <p className="text-xl font-bold text-red-700 dark:text-red-300">
                    {AccountingService.formatCurrency(getTotalExpense())}
                  </p>
                </div>
              </div>
            </div>

            <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-blue-900' : 'bg-blue-50'} border border-blue-200`}>
              <div className="flex items-center">
                <BarChart3 className="w-8 h-8 text-blue-500 mr-3" />
                <div>
                  <p className="text-sm text-blue-600 dark:text-blue-400">
                    {language === 'ar' ? 'صافي الدخل' : 'Net Income'}
                  </p>
                  <p className={`text-xl font-bold ${getNetIncome() >= 0 ? 'text-blue-700 dark:text-blue-300' : 'text-red-700 dark:text-red-300'}`}>
                    {AccountingService.formatCurrency(getNetIncome())}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Transactions List */}
          <div className={`rounded-lg border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className={`${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {language === 'ar' ? 'النوع' : 'Type'}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {language === 'ar' ? 'المبلغ' : 'Amount'}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {language === 'ar' ? 'الفئة' : 'Category'}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {language === 'ar' ? 'الوصف' : 'Description'}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {language === 'ar' ? 'الإجراءات' : 'Actions'}
                    </th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                        {language === 'ar' ? 'جاري التحميل...' : 'Loading...'}
                      </td>
                    </tr>
                  ) : transactions.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                        {language === 'ar' ? 'لا توجد معاملات' : 'No transactions found'}
                      </td>
                    </tr>
                  ) : (
                    transactions.map((transaction) => (
                      <tr key={transaction.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            transaction.type === 'income' 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          }`}>
                            {transaction.type === 'income' 
                              ? (language === 'ar' ? 'وارد' : 'Income')
                              : (language === 'ar' ? 'صادر' : 'Expense')
                            }
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                          {AccountingService.formatCurrency(transaction.amount)}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {getCategoryName(transaction.category_id)}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-500 dark:text-gray-400">
                          {getDescription(transaction)}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEditTransaction(transaction)}
                              className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteTransaction(transaction.id)}
                              className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Categories Tab */}
      {activeTab === 'categories' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold">
              {language === 'ar' ? 'إدارة الفئات' : 'Category Management'}
            </h3>
            <button
              onClick={() => setShowCategoryForm(true)}
              className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              {language === 'ar' ? 'إضافة فئة' : 'Add Category'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Income Categories */}
            <div className={`rounded-lg border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className={`p-4 border-b ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'}`}>
                <h4 className="font-semibold text-green-600 dark:text-green-400 flex items-center">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  {language === 'ar' ? 'فئات الواردات' : 'Income Categories'}
                </h4>
              </div>
              <div className="p-4">
                {categories.filter(c => c.type === 'income').map(category => (
                  <div key={category.id} className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
                    <div>
                      <p className="font-medium">
                        {language === 'ar' ? category.name_ar : language === 'tr' ? category.name_tr : category.name_en}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {language === 'ar' ? category.description_ar : language === 'tr' ? category.description_tr : category.description_en}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditCategory(category)}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(category.id)}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Expense Categories */}
            <div className={`rounded-lg border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className={`p-4 border-b ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'}`}>
                <h4 className="font-semibold text-red-600 dark:text-red-400 flex items-center">
                  <TrendingDown className="w-4 h-4 mr-2" />
                  {language === 'ar' ? 'فئات الصادرات' : 'Expense Categories'}
                </h4>
              </div>
              <div className="p-4">
                {categories.filter(c => c.type === 'expense').map(category => (
                  <div key={category.id} className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
                    <div>
                      <p className="font-medium">
                        {language === 'ar' ? category.name_ar : language === 'tr' ? category.name_tr : category.name_en}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {language === 'ar' ? category.description_ar : language === 'tr' ? category.description_tr : category.description_en}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditCategory(category)}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(category.id)}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Daily Summary Tab */}
      {activeTab === 'summary' && (
        <div>
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4">
              {language === 'ar' ? 'الملخص اليومي' : 'Daily Summary'}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {dailySummaries.slice(0, 7).map(summary => (
                <div key={summary.id} className={`p-4 rounded-lg border ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="font-semibold">
                      {AccountingService.formatDate(summary.summary_date)}
                    </h4>
                    <span className={`text-sm px-2 py-1 rounded-full ${
                      summary.closing_balance >= 0 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}>
                      {summary.closing_balance >= 0 ? '+' : ''}{AccountingService.formatCurrency(summary.closing_balance)}
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-green-600 dark:text-green-400">
                        {language === 'ar' ? 'واردات:' : 'Income:'}
                      </span>
                      <span className="font-medium">{AccountingService.formatCurrency(summary.total_income)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-red-600 dark:text-red-400">
                        {language === 'ar' ? 'صادرات:' : 'Expense:'}
                      </span>
                      <span className="font-medium">{AccountingService.formatCurrency(summary.total_expense)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        {language === 'ar' ? 'رصيد افتتاحي:' : 'Opening:'}
                      </span>
                      <span className="font-medium">{AccountingService.formatCurrency(summary.opening_balance)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Reports Tab */}
      {activeTab === 'reports' && (
        <div>
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4">
              {language === 'ar' ? 'التقارير والإحصائيات' : 'Reports & Statistics'}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Monthly Summary */}
              <div className={`p-6 rounded-lg border ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
                <h4 className="font-semibold mb-4 flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2" />
                  {language === 'ar' ? 'ملخص شهري' : 'Monthly Summary'}
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>{language === 'ar' ? 'إجمالي الواردات:' : 'Total Income:'}</span>
                    <span className="font-semibold text-green-600 dark:text-green-400">
                      {AccountingService.formatCurrency(getTotalIncome())}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>{language === 'ar' ? 'إجمالي الصادرات:' : 'Total Expense:'}</span>
                    <span className="font-semibold text-red-600 dark:text-red-400">
                      {AccountingService.formatCurrency(getTotalExpense())}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>{language === 'ar' ? 'صافي الدخل:' : 'Net Income:'}</span>
                    <span className={`font-semibold ${getNetIncome() >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {AccountingService.formatCurrency(getNetIncome())}
                    </span>
                  </div>
                </div>
              </div>

              {/* Category Breakdown */}
              <div className={`p-6 rounded-lg border ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
                <h4 className="font-semibold mb-4 flex items-center">
                  <PieChart className="w-5 h-5 mr-2" />
                  {language === 'ar' ? 'توزيع الفئات' : 'Category Breakdown'}
                </h4>
                <div className="space-y-2">
                  {categories.map(category => {
                    const categoryTransactions = transactions.filter(t => t.category_id === category.id);
                    const totalAmount = categoryTransactions.reduce((sum, t) => sum + t.amount, 0);
                    
                    if (totalAmount === 0) return null;
                    
                    return (
                      <div key={category.id} className="flex justify-between items-center">
                        <span className="text-sm">
                          {language === 'ar' ? category.name_ar : language === 'tr' ? category.name_tr : category.name_en}
                        </span>
                        <span className={`text-sm font-semibold ${
                          category.type === 'income' 
                            ? 'text-green-600 dark:text-green-400' 
                            : 'text-red-600 dark:text-red-400'
                        }`}>
                          {AccountingService.formatCurrency(totalAmount)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Transaction Form Modal */}
      {showTransactionForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`w-full max-w-md p-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {editingTransaction 
                  ? (language === 'ar' ? 'تعديل المعاملة' : 'Edit Transaction')
                  : (language === 'ar' ? 'إضافة معاملة جديدة' : 'Add New Transaction')
                }
              </h3>
              <button
                onClick={() => {
                  setShowTransactionForm(false);
                  setEditingTransaction(null);
                }}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleTransactionSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  {language === 'ar' ? 'النوع' : 'Type'}
                </label>
                <select
                  value={transactionForm.type}
                  onChange={(e) => setTransactionForm({ ...transactionForm, type: e.target.value as 'income' | 'expense' })}
                  className={`w-full px-3 py-2 border rounded-md ${
                    isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                  }`}
                  required
                >
                  <option value="income">{language === 'ar' ? 'وارد' : 'Income'}</option>
                  <option value="expense">{language === 'ar' ? 'صادر' : 'Expense'}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  {language === 'ar' ? 'المبلغ' : 'Amount'}
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={transactionForm.amount}
                  onChange={(e) => setTransactionForm({ ...transactionForm, amount: parseFloat(e.target.value) || 0 })}
                  className={`w-full px-3 py-2 border rounded-md ${
                    isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                  }`}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  {language === 'ar' ? 'الفئة' : 'Category'}
                </label>
                <select
                  value={transactionForm.category_id || ''}
                  onChange={(e) => setTransactionForm({ ...transactionForm, category_id: e.target.value || undefined })}
                  className={`w-full px-3 py-2 border rounded-md ${
                    isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                  }`}
                >
                  <option value="">{language === 'ar' ? 'اختر الفئة' : 'Select Category'}</option>
                  {categories.filter(c => c.type === transactionForm.type).map(category => (
                    <option key={category.id} value={category.id}>
                      {language === 'ar' ? category.name_ar : language === 'tr' ? category.name_tr : category.name_en}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  {language === 'ar' ? 'التاريخ' : 'Date'}
                </label>
                <input
                  type="date"
                  value={transactionForm.transaction_date}
                  onChange={(e) => setTransactionForm({ ...transactionForm, transaction_date: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-md ${
                    isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                  }`}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  {language === 'ar' ? 'الوصف (عربي)' : 'Description (Arabic)'}
                </label>
                <textarea
                  value={transactionForm.description_ar}
                  onChange={(e) => setTransactionForm({ ...transactionForm, description_ar: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-md ${
                    isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                  }`}
                  rows={3}
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowTransactionForm(false);
                    setEditingTransaction(null);
                  }}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                >
                  {language === 'ar' ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                >
                  <Save className="w-4 h-4 mr-2 inline" />
                  {language === 'ar' ? 'حفظ' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Category Form Modal */}
      {showCategoryForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`w-full max-w-md p-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {editingCategory 
                  ? (language === 'ar' ? 'تعديل الفئة' : 'Edit Category')
                  : (language === 'ar' ? 'إضافة فئة جديدة' : 'Add New Category')
                }
              </h3>
              <button
                onClick={() => {
                  setShowCategoryForm(false);
                  setEditingCategory(null);
                }}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleCategorySubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  {language === 'ar' ? 'النوع' : 'Type'}
                </label>
                <select
                  value={categoryForm.type}
                  onChange={(e) => setCategoryForm({ ...categoryForm, type: e.target.value as 'income' | 'expense' })}
                  className={`w-full px-3 py-2 border rounded-md ${
                    isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                  }`}
                  required
                >
                  <option value="income">{language === 'ar' ? 'وارد' : 'Income'}</option>
                  <option value="expense">{language === 'ar' ? 'صادر' : 'Expense'}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  {language === 'ar' ? 'الاسم (عربي)' : 'Name (Arabic)'}
                </label>
                <input
                  type="text"
                  value={categoryForm.name_ar}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name_ar: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-md ${
                    isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                  }`}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  {language === 'ar' ? 'الاسم (إنجليزي)' : 'Name (English)'}
                </label>
                <input
                  type="text"
                  value={categoryForm.name_en}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name_en: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-md ${
                    isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                  }`}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  {language === 'ar' ? 'الاسم (تركي)' : 'Name (Turkish)'}
                </label>
                <input
                  type="text"
                  value={categoryForm.name_tr}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name_tr: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-md ${
                    isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                  }`}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  {language === 'ar' ? 'الوصف (عربي)' : 'Description (Arabic)'}
                </label>
                <textarea
                  value={categoryForm.description_ar}
                  onChange={(e) => setCategoryForm({ ...categoryForm, description_ar: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-md ${
                    isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                  }`}
                  rows={3}
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowCategoryForm(false);
                    setEditingCategory(null);
                  }}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                >
                  {language === 'ar' ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                >
                  <Save className="w-4 h-4 mr-2 inline" />
                  {language === 'ar' ? 'حفظ' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountingManagement;