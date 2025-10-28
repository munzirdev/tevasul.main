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
  FileText,
  Search,
  EyeOff,
  CreditCard,
  Receipt,
  Target,
  AlertCircle,
  CheckCircle,
  Clock,
  Users,
  Building,
  Calculator,
  BookOpen,
  Settings,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Zap,
  Wallet,
  Banknote,
  Coins,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  LineChart,
  Layers,
  Grid3X3,
  List,
  Table,
  Archive,
  Tag,
  Hash,
  Percent,
  Minus,
  PlusCircle,
  MinusCircle,
  DollarSign as DollarIcon,
  Euro,
  PoundSterling,
  Yen,
  IndianRupee,
  TurkishLira,
  AlertTriangle,
  Info,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  MoreVertical,
  Copy,
  Share,
  ExternalLink,
  Lock,
  Unlock,
  Shield,
  ShieldCheck,
  Key,
  Database,
  Server,
  Cloud,
  Wifi,
  WifiOff,
  Signal,
  SignalZero,
  SignalLow,
  SignalMedium,
  SignalHigh,
  Battery,
  BatteryLow,
  BatteryMedium,
  BatteryHigh,
  BatteryFull,
  Power,
  PowerOff,
  Play,
  Pause,
  Stop,
  SkipBack,
  SkipForward,
  RotateCcw,
  RotateCw,
  Repeat,
  Shuffle,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  Camera,
  CameraOff,
  Video,
  VideoOff,
  Phone,
  PhoneOff,
  Mail,
  MessageSquare,
  MessageCircle,
  Send,
  Inbox,
  Outbox,
  Archive as ArchiveIcon,
  Trash,
  Trash2 as TrashIcon,
  Folder,
  FolderOpen,
  File,
  FileText as FileTextIcon,
  FileImage,
  FileVideo,
  FileAudio,
  FilePdf,
  FileSpreadsheet,
  FileCode,
  FileZip,
  FileCheck,
  FileX,
  FilePlus,
  FileMinus,
  FileEdit,
  FileSearch,
  FileDownload,
  FileUpload,
  Clipboard,
  ClipboardCheck,
  ClipboardCopy,
  ClipboardList,
  ClipboardX,
  Bookmark,
  BookmarkCheck,
  BookmarkPlus,
  BookmarkMinus,
  Flag,
  FlagCheck,
  FlagPlus,
  FlagMinus,
  Star,
  StarCheck,
  StarPlus,
  StarMinus,
  Heart,
  HeartCheck,
  HeartPlus,
  HeartMinus,
  ThumbsUp,
  ThumbsDown,
  Smile,
  Frown,
  Meh,
  Laugh,
  Angry,
  Sad,
  Surprised,
  Wink,
  Kiss,
  Tongue,
  Confused,
  Dizzy,
  Expressionless,
  Neutral,
  Grimace,
  RollingEyes,
  Cry,
  Sob,
  Joy,
  Rage,
  AngryFace,
  Persevere,
  Triumph,
  Disappointed,
  Worried,
  Confounded,
  Fearful,
  ColdSweat,
  Scream,
  Astonished,
  Flushed,
  Sleeping,
  DizzyFace,
  NoMouth,
  Mask,
  Thermometer,
  Droplet,
  Sun,
  Moon,
  Cloud as CloudIcon,
  CloudRain,
  CloudSnow,
  CloudLightning,
  CloudDrizzle,
  Wind,
  Tornado,
  Hurricane,
  Rainbow,
  Umbrella,
  Snowflake,
  Zap as ZapIcon,
  Flame,
  Snow,
  Ice,
  Water,
  Fire,
  Earth,
  Mountain,
  Tree,
  Leaf,
  Flower,
  Seedling,
  PalmTree,
  Cactus,
  Tulip,
  Rose,
  Sunflower,
  Hibiscus,
  CherryBlossom,
  Bouquet,
  WiltedFlower,
  Herb,
  Shamrock,
  FourLeafClover,
  Mushroom,
  Chestnut,
  FallenLeaf,
  MapleLeaf,
  Grapes,
  Melon,
  Watermelon,
  Tangerine,
  Lemon,
  Banana,
  Pineapple,
  Mango,
  RedApple,
  GreenApple,
  Pear,
  Peach,
  Cherries,
  Strawberry,
  Blueberries,
  KiwiFruit,
  Tomato,
  Coconut,
  Avocado,
  Eggplant,
  Potato,
  Carrot,
  Corn,
  HotPepper,
  Cucumber,
  Broccoli,
  Mushroom as MushroomIcon,
  Peanuts,
  Pretzel,
  Bagel,
  Bread,
  Croissant,
  Baguette,
  Pancakes,
  Waffle,
  Cheese,
  Meat,
  Bacon,
  Hamburger,
  Pizza,
  HotDog,
  Sandwich,
  Taco,
  Burrito,
  Salad,
  Popcorn,
  CannedFood,
  BentoBox,
  RiceCracker,
  RiceBall,
  CookedRice,
  CurryRice,
  Spaghetti,
  Ramen,
  Stew,
  Oden,
  Sushi,
  FriedShrimp,
  FishCake,
  MoonCake,
  Dango,
  Dumpling,
  FortuneCookie,
  TakeoutBox,
  Chopsticks,
  ForkAndKnife,
  PlateWithCutlery,
  BowlWithSpoon,
  CupWithStraw,
  BeverageBox,
  Mate,
  IceCream,
  ShavedIce,
  IceCream as IceCreamIcon,
  Doughnut,
  Cookie,
  BirthdayCake,
  Shortcake,
  Cupcake,
  Pie,
  ChocolateBar,
  Candy,
  Lollipop,
  Custard,
  HoneyPot,
  BabyBottle,
  GlassOfMilk,
  Coffee,
  Teapot,
  Sake,
  WineGlass,
  CocktailGlass,
  BeerMug,
  ClinkingGlasses,
  BottleWithPoppingCork,
  ClinkingBeerMugs,
  ClinkingWineGlasses,
  ClinkingChampagneGlasses,
  ClinkingSakeGlasses,
  ClinkingCocktailGlasses,
  ClinkingBeerMugs as ClinkingBeerMugsIcon,
  ClinkingWineGlasses as ClinkingWineGlassesIcon,
  ClinkingChampagneGlasses as ClinkingChampagneGlassesIcon,
  ClinkingSakeGlasses as ClinkingSakeGlassesIcon,
  ClinkingCocktailGlasses as ClinkingCocktailGlassesIcon,
  ClinkingBeerMugs as ClinkingBeerMugsIcon2,
  ClinkingWineGlasses as ClinkingWineGlassesIcon2,
  ClinkingChampagneGlasses as ClinkingChampagneGlassesIcon2,
  ClinkingSakeGlasses as ClinkingSakeGlassesIcon2,
  ClinkingCocktailGlasses as ClinkingCocktailGlassesIcon2
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
  const [activeTab, setActiveTab] = useState<'dashboard' | 'transactions' | 'categories' | 'summary' | 'reports' | 'budgets' | 'invoices' | 'payments' | 'analysis' | 'settings'>('dashboard');
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
  
  // Dashboard states
  const [dashboardStats, setDashboardStats] = useState({
    totalIncome: 0,
    totalExpense: 0,
    netProfit: 0,
    monthlyIncome: 0,
    monthlyExpense: 0,
    pendingInvoices: 0,
    overduePayments: 0,
    budgetUtilization: 0
  });
  
  // Budget states
  const [budgets, setBudgets] = useState([]);
  const [showBudgetForm, setShowBudgetForm] = useState(false);
  
  // Invoice states
  const [invoices, setInvoices] = useState([]);
  const [showInvoiceForm, setShowInvoiceForm] = useState(false);
  
  // Payment states
  const [payments, setPayments] = useState([]);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  
  // Analysis states
  const [analysisData, setAnalysisData] = useState({
    monthlyTrends: [],
    categoryBreakdown: [],
    profitMargins: [],
    cashFlow: []
  });
  
  // Settings states
  const [settings, setSettings] = useState({
    currency: 'USD',
    dateFormat: 'DD/MM/YYYY',
    fiscalYearStart: '01-01',
    autoBackup: true,
    notifications: true
  });

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

  // Calculate dashboard statistics
  const calculateDashboardStats = async () => {
    try {
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth() + 1;
      const currentYear = currentDate.getFullYear();
      
      // Get current month transactions
      const monthlyTransactions = await AccountingService.getTransactionsByMonth(currentYear, currentMonth);
      
      const monthlyIncome = monthlyTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
        
      const monthlyExpense = monthlyTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
      
      // Get all-time totals
      const allTransactions = await AccountingService.getTransactions();
      const totalIncome = allTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
        
      const totalExpense = allTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
      
      setDashboardStats({
        totalIncome,
        totalExpense,
        netProfit: totalIncome - totalExpense,
        monthlyIncome,
        monthlyExpense,
        pendingInvoices: 0, // Will be implemented with invoice system
        overduePayments: 0, // Will be implemented with payment tracking
        budgetUtilization: 0 // Will be implemented with budget system
      });
    } catch (error) {
      console.error('Error calculating dashboard stats:', error);
    }
  };

  useEffect(() => {
    loadData();
    if (activeTab === 'dashboard') {
      calculateDashboardStats();
    }
  }, [selectedDate, filterType, filterCategory, activeTab]);

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
          { key: 'dashboard', label: language === 'ar' ? 'لوحة التحكم' : 'Dashboard', icon: BarChart3 },
          { key: 'transactions', label: language === 'ar' ? 'المعاملات' : 'Transactions', icon: Receipt },
          { key: 'categories', label: language === 'ar' ? 'الفئات' : 'Categories', icon: Tag },
          { key: 'summary', label: language === 'ar' ? 'الملخص اليومي' : 'Daily Summary', icon: Calendar },
          { key: 'reports', label: language === 'ar' ? 'التقارير' : 'Reports', icon: FileText },
          { key: 'budgets', label: language === 'ar' ? 'الميزانيات' : 'Budgets', icon: Target },
          { key: 'invoices', label: language === 'ar' ? 'الفواتير' : 'Invoices', icon: FileTextIcon },
          { key: 'payments', label: language === 'ar' ? 'المدفوعات' : 'Payments', icon: CreditCard },
          { key: 'analysis', label: language === 'ar' ? 'التحليل المالي' : 'Financial Analysis', icon: LineChart },
          { key: 'settings', label: language === 'ar' ? 'الإعدادات' : 'Settings', icon: Settings }
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

      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total Income */}
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">إجمالي الواردات</p>
                  <p className="text-3xl font-bold">{dashboardStats.totalIncome.toLocaleString()} ₺</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-200" />
              </div>
            </div>

            {/* Total Expense */}
            <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-6 text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-100 text-sm font-medium">إجمالي الصادرات</p>
                  <p className="text-3xl font-bold">{dashboardStats.totalExpense.toLocaleString()} ₺</p>
                </div>
                <TrendingDown className="w-8 h-8 text-red-200" />
              </div>
            </div>

            {/* Net Profit */}
            <div className={`bg-gradient-to-br ${dashboardStats.netProfit >= 0 ? 'from-blue-500 to-blue-600' : 'from-orange-500 to-orange-600'} rounded-xl p-6 text-white shadow-lg`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`${dashboardStats.netProfit >= 0 ? 'text-blue-100' : 'text-orange-100'} text-sm font-medium`}>صافي الربح</p>
                  <p className="text-3xl font-bold">{dashboardStats.netProfit.toLocaleString()} ₺</p>
                </div>
                {dashboardStats.netProfit >= 0 ? <ArrowUpRight className="w-8 h-8 text-blue-200" /> : <ArrowDownRight className="w-8 h-8 text-orange-200" />}
              </div>
            </div>

            {/* Monthly Performance */}
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">الأداء الشهري</p>
                  <p className="text-3xl font-bold">{((dashboardStats.monthlyIncome - dashboardStats.monthlyExpense) / Math.max(dashboardStats.monthlyIncome, 1) * 100).toFixed(1)}%</p>
                </div>
                <Activity className="w-8 h-8 text-purple-200" />
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <h3 className="text-xl font-bold mb-4">إجراءات سريعة</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button
                onClick={() => setActiveTab('transactions')}
                className="flex flex-col items-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
              >
                <Plus className="w-8 h-8 text-blue-500 mb-2" />
                <span className="text-sm font-medium">إضافة معاملة</span>
              </button>
              
              <button
                onClick={() => setActiveTab('invoices')}
                className="flex flex-col items-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
              >
                <FileTextIcon className="w-8 h-8 text-green-500 mb-2" />
                <span className="text-sm font-medium">إنشاء فاتورة</span>
              </button>
              
              <button
                onClick={() => setActiveTab('reports')}
                className="flex flex-col items-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
              >
                <BarChart3 className="w-8 h-8 text-purple-500 mb-2" />
                <span className="text-sm font-medium">عرض التقارير</span>
              </button>
              
              <button
                onClick={() => setActiveTab('budgets')}
                className="flex flex-col items-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors"
              >
                <Target className="w-8 h-8 text-orange-500 mb-2" />
                <span className="text-sm font-medium">إدارة الميزانيات</span>
              </button>
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">المعاملات الأخيرة</h3>
              <button
                onClick={() => setActiveTab('transactions')}
                className="text-blue-500 hover:text-blue-600 text-sm font-medium"
              >
                عرض الكل
              </button>
            </div>
            <div className="space-y-3">
              {transactions.slice(0, 5).map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-3 ${transaction.type === 'income' ? 'bg-green-500' : 'bg-red-500'}`} />
                    <div>
                      <p className="font-medium">{transaction.category?.name_ar || 'بدون فئة'}</p>
                      <p className="text-sm text-gray-500">{transaction.description_ar || 'لا يوجد وصف'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                      {transaction.type === 'income' ? '+' : '-'}{transaction.amount.toLocaleString()} ₺
                    </p>
                    <p className="text-sm text-gray-500">{new Date(transaction.transaction_date).toLocaleDateString('ar-SA')}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

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

      {/* Budgets Tab */}
      {activeTab === 'budgets' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold">إدارة الميزانيات</h3>
            <button
              onClick={() => setShowBudgetForm(true)}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2 inline" />
              إضافة ميزانية
            </button>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <p className="text-gray-500 text-center py-8">
              نظام إدارة الميزانيات قيد التطوير
            </p>
          </div>
        </div>
      )}

      {/* Invoices Tab */}
      {activeTab === 'invoices' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold">إدارة الفواتير</h3>
            <button
              onClick={() => setShowInvoiceForm(true)}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2 inline" />
              إنشاء فاتورة
            </button>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <p className="text-gray-500 text-center py-8">
              نظام إدارة الفواتير قيد التطوير
            </p>
          </div>
        </div>
      )}

      {/* Payments Tab */}
      {activeTab === 'payments' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold">تتبع المدفوعات</h3>
            <button
              onClick={() => setShowPaymentForm(true)}
              className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2 inline" />
              إضافة دفعة
            </button>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <p className="text-gray-500 text-center py-8">
              نظام تتبع المدفوعات قيد التطوير
            </p>
          </div>
        </div>
      )}

      {/* Financial Analysis Tab */}
      {activeTab === 'analysis' && (
        <div className="space-y-6">
          <h3 className="text-xl font-bold">التحليل المالي</h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Monthly Trends */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
              <h4 className="text-lg font-semibold mb-4">الاتجاهات الشهرية</h4>
              <div className="h-64 flex items-center justify-center">
                <p className="text-gray-500">الرسوم البيانية قيد التطوير</p>
              </div>
            </div>

            {/* Category Breakdown */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
              <h4 className="text-lg font-semibold mb-4">توزيع الفئات</h4>
              <div className="h-64 flex items-center justify-center">
                <p className="text-gray-500">الرسوم البيانية قيد التطوير</p>
              </div>
            </div>

            {/* Profit Margins */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
              <h4 className="text-lg font-semibold mb-4">هوامش الربح</h4>
              <div className="h-64 flex items-center justify-center">
                <p className="text-gray-500">الرسوم البيانية قيد التطوير</p>
              </div>
            </div>

            {/* Cash Flow */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
              <h4 className="text-lg font-semibold mb-4">تدفق النقدية</h4>
              <div className="h-64 flex items-center justify-center">
                <p className="text-gray-500">الرسوم البيانية قيد التطوير</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          <h3 className="text-xl font-bold">إعدادات النظام</h3>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <div className="space-y-6">
              {/* Currency Settings */}
              <div>
                <label className="block text-sm font-medium mb-2">العملة الافتراضية</label>
                <select
                  value={settings.currency}
                  onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                >
                  <option value="USD">دولار أمريكي (USD)</option>
                  <option value="EUR">يورو (EUR)</option>
                  <option value="GBP">جنيه إسترليني (GBP)</option>
                  <option value="TRY">ليرة تركية (TRY)</option>
                  <option value="SAR">ريال سعودي (SAR)</option>
                </select>
              </div>

              {/* Date Format */}
              <div>
                <label className="block text-sm font-medium mb-2">تنسيق التاريخ</label>
                <select
                  value={settings.dateFormat}
                  onChange={(e) => setSettings({ ...settings, dateFormat: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                >
                  <option value="DD/MM/YYYY">يوم/شهر/سنة</option>
                  <option value="MM/DD/YYYY">شهر/يوم/سنة</option>
                  <option value="YYYY-MM-DD">سنة-شهر-يوم</option>
                </select>
              </div>

              {/* Fiscal Year */}
              <div>
                <label className="block text-sm font-medium mb-2">بداية السنة المالية</label>
                <input
                  type="date"
                  value={`2024-${settings.fiscalYearStart}`}
                  onChange={(e) => setSettings({ ...settings, fiscalYearStart: e.target.value.substring(5) })}
                  className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                />
              </div>

              {/* Notifications */}
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-sm font-medium">الإشعارات</label>
                  <p className="text-sm text-gray-500">تلقي إشعارات حول المعاملات المهمة</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.notifications}
                  onChange={(e) => setSettings({ ...settings, notifications: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded"
                />
              </div>

              {/* Auto Backup */}
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-sm font-medium">النسخ الاحتياطي التلقائي</label>
                  <p className="text-sm text-gray-500">إنشاء نسخ احتياطية تلقائية للبيانات</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.autoBackup}
                  onChange={(e) => setSettings({ ...settings, autoBackup: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded"
                />
              </div>

              <div className="flex justify-end">
                <button className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                  حفظ الإعدادات
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountingManagement;