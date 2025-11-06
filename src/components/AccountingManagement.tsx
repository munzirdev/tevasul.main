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
  IndianRupee,
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
  BatteryFull,
  Power,
  PowerOff,
  Play,
  Pause,
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
  Printer,
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
  FileSpreadsheet,
  FileCode,
  FileCheck,
  FileX,
  FilePlus,
  FileMinus,
  FileEdit,
  FileSearch,
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
import { InvoiceService } from '../services/invoiceService';
import { CustomerService } from '../services/customerService';
import { telegramService } from '../services/telegramService';
import {
  IncomeExpenseTrendChart,
  CategoryBreakdownChart,
  CashFlowChart,
  MonthlyTrendsChart,
  ProfitMarginChart,
  DailyTransactionsChart
} from './accounting/AccountingCharts';
import { 
  AccountingCategory, 
  AccountingTransaction, 
  DailyCashSummary, 
  CreateAccountingTransactionData,
  CreateAccountingCategoryData,
  Invoice,
  CreateInvoiceData,
  CreateInvoiceItemData,
  InvoiceTemplate,
  Budget,
  CreateBudgetData,
  Payment,
  CreatePaymentData,
  AccountingSettings,
  Customer,
  CreateCustomerData,
  CustomerFinancialSummary
} from '../lib/types';
import { useLanguage } from '../hooks/useLanguage';

interface AccountingManagementProps {
  isDarkMode: boolean;
}

const AccountingManagement: React.FC<AccountingManagementProps> = ({ isDarkMode }) => {
  const { t, language } = useLanguage();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'transactions' | 'categories' | 'summary' | 'reports' | 'budgets' | 'invoices' | 'payments' | 'analysis' | 'settings'>('dashboard');
  const [transactions, setTransactions] = useState<AccountingTransaction[]>([]);
  const [allTransactions, setAllTransactions] = useState<AccountingTransaction[]>([]); // All transactions for analysis
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
  
  // Reports month navigation
  const currentDate = new Date();
  const [selectedReportMonth, setSelectedReportMonth] = useState(currentDate.getMonth() + 1);
  const [selectedReportYear, setSelectedReportYear] = useState(currentDate.getFullYear());
  
  // Dashboard states
  const [dashboardStats, setDashboardStats] = useState({
    totalIncome: 0,
    totalExpense: 0,
    netProfit: 0,
    monthlyIncome: 0,
    monthlyExpense: 0,
    pendingInvoices: 0,
    overduePayments: 0,
    budgetUtilization: 0,
    cashBalance: 0
  });
  
  // Budget states
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [showBudgetForm, setShowBudgetForm] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [budgetForm, setBudgetForm] = useState<CreateBudgetData>({
    name_ar: '',
    name_en: '',
    name_tr: '',
    type: 'expense',
    amount: 0,
    period_start: AccountingService.getCurrentDate(),
    period_end: AccountingService.getCurrentDate(),
    description_ar: '',
    description_en: '',
    description_tr: ''
  });
  
  // Invoice states
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [showInvoiceForm, setShowInvoiceForm] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [invoiceStats, setInvoiceStats] = useState({
    total: 0,
    draft: 0,
    sent: 0,
    paid: 0,
    overdue: 0,
    cancelled: 0,
    totalAmount: 0,
    paidAmount: 0,
    pendingAmount: 0
  });
  
  // Invoice form states
  const [invoiceForm, setInvoiceForm] = useState<CreateInvoiceData>({
    client_name: '',
    client_email: '',
    client_phone: '',
    client_address: '',
    customer_id: '',
    issue_date: InvoiceService.getCurrentDate(),
    due_date: InvoiceService.getDefaultDueDate(),
    tax_rate: 20, // Default tax rate - will be updated from settings when loaded
    notes_ar: '',
    notes_en: '',
    notes_tr: '',
    items: [{
      description_ar: '',
      description_en: '',
      description_tr: '',
      quantity: 1,
      unit_price: 0
    }]
  });
  
  // Customer selection mode for invoice form
  const [invoiceCustomerMode, setInvoiceCustomerMode] = useState<'select' | 'new'>('select');
  
  // Invoice filters
  const [invoiceFilterStatus, setInvoiceFilterStatus] = useState<'all' | Invoice['status']>('all');
  const [invoiceSearchTerm, setInvoiceSearchTerm] = useState('');
  
  // Customer states
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerFinancialSummary, setCustomerFinancialSummary] = useState<CustomerFinancialSummary | null>(null);
  const [showCustomerDetails, setShowCustomerDetails] = useState(false);
  const [customerSearchTerm, setCustomerSearchTerm] = useState('');
  const [customerFilterStatus, setCustomerFilterStatus] = useState<'all' | Customer['status']>('all');
  const [customerForm, setCustomerForm] = useState<CreateCustomerData>({
    name_ar: '',
    name_en: '',
    name_tr: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: '',
    tax_id: '',
    notes_ar: '',
    notes_en: '',
    notes_tr: '',
    credit_limit: 0,
    payment_terms: '',
    status: 'active'
  });
  
  // Payment states
  const [payments, setPayments] = useState<Payment[]>([]);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [paymentForm, setPaymentForm] = useState<CreatePaymentData>({
    payment_method: 'cash',
    amount: 0,
    payment_date: AccountingService.getCurrentDate(),
    reference_number: '',
    status: 'pending',
    notes_ar: '',
    notes_en: '',
    notes_tr: ''
  });
  
  // Analysis states
  const [analysisData, setAnalysisData] = useState({
    monthlyTrends: [],
    categoryBreakdown: [],
    profitMargins: [],
    cashFlow: []
  });
  
  // Settings states
  const [settings, setSettings] = useState<Partial<AccountingSettings>>({
    currency: 'TRY',
    date_format: 'DD/MM/YYYY',
    fiscal_year_start: '01-01',
    default_tax_rate: 20,
    auto_backup: true,
    notifications: true,
    invoice_prefix: 'INV',
    invoice_number_format: 'YYYYMMDD-###',
    company_name_ar: 'مجموعة تواصل',
    company_name_en: 'Tevasul Group',
    company_address: 'CamiŞerif Mah. 5210 Sk. No:11A Akdeniz / Mersin',
    company_phone: '+90 534 962 72 41',
    company_email: 'info@tevasul.group',
    company_website: 'tevasul.group'
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

  // Load invoice data
  const loadInvoices = async () => {
    try {
      const [invoicesData, statsData] = await Promise.all([
        InvoiceService.getInvoices(),
        InvoiceService.getInvoiceStats()
      ]);
      
      setInvoices(invoicesData);
      setInvoiceStats(statsData);
    } catch (error) {
      console.error('Error loading invoices:', error);
    }
  };

  // Load customers data
  const loadCustomers = async () => {
    try {
      const customersData = await CustomerService.getCustomers();
      setCustomers(customersData);
    } catch (error) {
      console.error('Error loading customers:', error);
    }
  };

  // Load customer financial summary
  const loadCustomerFinancialSummary = async (customerId: string) => {
    try {
      const summary = await CustomerService.getCustomerFinancialSummary(customerId);
      setCustomerFinancialSummary(summary);
      setShowCustomerDetails(true);
    } catch (error) {
      console.error('Error loading customer financial summary:', error);
    }
  };

  // Handle customer form submission
  const handleCustomerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      let customerData;
      if (editingCustomer) {
        customerData = await CustomerService.updateCustomer(editingCustomer.id, customerForm);
        // إرسال إشعار تحديث عميل
        try {
          await telegramService.sendCustomerNotification(
            { ...customerForm, id: editingCustomer.id },
            'update'
          );
        } catch (notifError) {
          console.error('Error sending customer update notification:', notifError);
        }
      } else {
        customerData = await CustomerService.createCustomer(customerForm);
        // إرسال إشعار إضافة عميل
        try {
          await telegramService.sendCustomerNotification(
            { ...customerForm, id: customerData?.id },
            'create'
          );
        } catch (notifError) {
          console.error('Error sending customer create notification:', notifError);
        }
      }
      setShowCustomerForm(false);
      setEditingCustomer(null);
      setCustomerForm({
        name_ar: '',
        name_en: '',
        name_tr: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        country: '',
        tax_id: '',
        notes_ar: '',
        notes_en: '',
        notes_tr: '',
        credit_limit: 0,
        payment_terms: '',
        status: 'active'
      });
      await loadCustomers();
    } catch (error: any) {
      console.error('Error saving customer:', error);
      const errorMessage = error.message || (language === 'ar' ? 'خطأ غير معروف' : 'Unknown error');
      if (errorMessage.includes('table not found')) {
        alert(language === 'ar' 
          ? 'جدول العملاء غير موجود. يرجى تطبيق migration: 20250117_create_customers_table.sql في Supabase'
          : 'Customers table not found. Please apply migration: 20250117_create_customers_table.sql in Supabase');
      } else {
        alert(language === 'ar' 
          ? `حدث خطأ في حفظ العميل: ${errorMessage}` 
          : `Error saving customer: ${errorMessage}`);
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle edit customer
  const handleEditCustomer = (customer: Customer) => {
    setEditingCustomer(customer);
    setCustomerForm({
      name_ar: customer.name_ar || '',
      name_en: customer.name_en,
      name_tr: customer.name_tr || '',
      email: customer.email || '',
      phone: customer.phone || '',
      address: customer.address || '',
      city: customer.city || '',
      country: customer.country || '',
      tax_id: customer.tax_id || '',
      notes_ar: customer.notes_ar || '',
      notes_en: customer.notes_en || '',
      notes_tr: customer.notes_tr || '',
      credit_limit: customer.credit_limit || 0,
      payment_terms: customer.payment_terms || '',
      status: customer.status
    });
    setShowCustomerForm(true);
  };

  // Handle delete customer
  const handleDeleteCustomer = async (id: string) => {
    if (window.confirm(language === 'ar' ? 'هل أنت متأكد من حذف هذا العميل؟' : 'Are you sure you want to delete this customer?')) {
      try {
        // الحصول على بيانات العميل قبل الحذف
        const customer = customers.find(c => c.id === id);
        await CustomerService.deleteCustomer(id);
        
        // إرسال إشعار حذف عميل
        if (customer) {
          try {
            await telegramService.sendCustomerNotification(customer, 'delete');
          } catch (notifError) {
            console.error('Error sending customer delete notification:', notifError);
          }
        }
        
        loadCustomers();
      } catch (error) {
        console.error('Error deleting customer:', error);
      }
    }
  };

  // View customer details
  const handleViewCustomerDetails = async (customer: Customer) => {
    setSelectedCustomer(customer);
    await loadCustomerFinancialSummary(customer.id);
  };

  // Handle invoice form submission
  const handleInvoiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Invoice form submitted with data:', invoiceForm);
    setLoading(true);
    
    try {
      let customerId = invoiceForm.customer_id;
      
      // If in "new" mode and customer doesn't exist, create new customer
      if (invoiceCustomerMode === 'new' && !customerId && invoiceForm.client_name) {
        try {
          const newCustomer = await CustomerService.createCustomer({
            name_en: invoiceForm.client_name,
            name_ar: invoiceForm.client_name,
            email: invoiceForm.client_email || '',
            phone: invoiceForm.client_phone || '',
            address: invoiceForm.client_address || '',
            status: 'active'
          });
          customerId = newCustomer.id;
          console.log('New customer created:', newCustomer.id);
          
          // إرسال إشعار إضافة عميل (من داخل نموذج الفاتورة)
          try {
            await telegramService.sendCustomerNotification(
              {
                name_ar: invoiceForm.client_name,
                name_en: invoiceForm.client_name,
                email: invoiceForm.client_email || '',
                phone: invoiceForm.client_phone || '',
                address: invoiceForm.client_address || '',
                id: newCustomer.id,
                status: 'active'
              },
              'create'
            );
          } catch (notifError) {
            console.error('Error sending customer create notification:', notifError);
          }
          
          // Reload customers list
          await loadCustomers();
        } catch (customerError: any) {
          console.error('Error creating customer:', customerError);
          // If customer creation fails but table doesn't exist, continue without customer_id
          if (customerError.message?.includes('table not found')) {
            console.warn('Customers table not found, continuing without customer_id');
          } else {
            throw new Error(language === 'ar' 
              ? 'فشل في إضافة العميل: ' + customerError.message 
              : 'Failed to create customer: ' + customerError.message);
          }
        }
      }
      
      // Create invoice with customer_id if available
      const invoiceData = {
        ...invoiceForm,
        customer_id: customerId || undefined
      };
      
      let invoiceResult;
      if (editingInvoice) {
        console.log('Updating existing invoice:', editingInvoice.id);
        invoiceResult = await InvoiceService.updateInvoice(editingInvoice.id, invoiceData);
        console.log('Invoice updated successfully');
        
        // إرسال إشعار تحديث فاتورة
        try {
          await telegramService.sendInvoiceNotification(
            { ...invoiceData, id: editingInvoice.id },
            'update'
          );
        } catch (notifError) {
          console.error('Error sending invoice update notification:', notifError);
        }
      } else {
        console.log('Creating new invoice');
        invoiceResult = await InvoiceService.createInvoice(invoiceData);
        console.log('Invoice created successfully');
        
        // إرسال إشعار إنشاء فاتورة مع PDF
        try {
          // إنشاء HTML الفاتورة لإرسالها كـ PDF
          // حساب القيم بشكل صحيح
          const items = invoiceData.items || [];
          const subtotal = items.reduce((sum: number, item: any) => {
            const itemTotal = (item.quantity || 0) * (item.unit_price || 0);
            return sum + itemTotal;
          }, 0);
          const taxRate = invoiceData.tax_rate || 0;
          const tax_amount = subtotal * (taxRate / 100);
          const total_amount = subtotal + tax_amount;
          
          const invoiceForPDF = {
            ...invoiceResult,
            ...invoiceData,
            items: items.map((item: any) => ({
              ...item,
              total_price: (item.quantity || 0) * (item.unit_price || 0)
            })),
            subtotal: subtotal,
            tax_amount: tax_amount,
            total_amount: total_amount,
            due_amount: total_amount,
            created_at: invoiceData.issue_date || new Date().toISOString()
          };
          
          const invoiceHTML = generateInvoiceHTML(invoiceForPDF as any);
          
          await telegramService.sendInvoiceNotification(
            invoiceForPDF,
            'create',
            invoiceHTML
          );
        } catch (notifError) {
          console.error('Error sending invoice create notification:', notifError);
        }
      }
      
      console.log('Reloading invoices...');
      await loadInvoices();
      console.log('Invoices reloaded');
      
      setShowInvoiceForm(false);
      setEditingInvoice(null);
      resetInvoiceForm();
      console.log('Invoice form closed and reset');
    } catch (error: any) {
      console.error('Error saving invoice:', error);
      alert(language === 'ar' 
        ? 'حدث خطأ في حفظ الفاتورة: ' + (error.message || 'خطأ غير معروف')
        : 'Error saving invoice: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  // Reset invoice form
  const resetInvoiceForm = () => {
    console.log('Resetting invoice form');
    try {
      setInvoiceForm({
        client_name: '',
        client_email: '',
        client_phone: '',
        client_address: '',
        customer_id: '',
        issue_date: InvoiceService.getCurrentDate(),
        due_date: InvoiceService.getDefaultDueDate(),
        tax_rate: (settings.default_tax_rate || 20),
        notes_ar: '',
        notes_en: '',
        notes_tr: '',
        items: [{
          description_ar: '',
          description_en: '',
          description_tr: '',
          quantity: 1,
          unit_price: 0
        }]
      });
      setInvoiceCustomerMode('select');
      console.log('Invoice form reset successfully');
    } catch (error) {
      console.error('Error resetting invoice form:', error);
    }
  };

  // Add invoice item
  const addInvoiceItem = () => {
    setInvoiceForm({
      ...invoiceForm,
      items: [...invoiceForm.items, {
        description_ar: '',
        description_en: '',
        description_tr: '',
        quantity: 1,
        unit_price: 0
      }]
    });
  };

  // Remove invoice item
  const removeInvoiceItem = (index: number) => {
    if (invoiceForm.items.length > 1) {
      setInvoiceForm({
        ...invoiceForm,
        items: invoiceForm.items.filter((_, i) => i !== index)
      });
    }
  };

  // Update invoice item
  const updateInvoiceItem = (index: number, field: keyof CreateInvoiceItemData, value: any) => {
    const updatedItems = [...invoiceForm.items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    setInvoiceForm({ ...invoiceForm, items: updatedItems });
  };

  // Calculate invoice totals
  const calculateInvoiceTotals = () => {
    const subtotal = invoiceForm.items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
    const taxAmount = subtotal * (invoiceForm.tax_rate / 100);
    const totalAmount = subtotal + taxAmount;
    
    return { subtotal, taxAmount, totalAmount };
  };

  // Update invoice status
  const updateInvoiceStatus = async (invoiceId: string, status: Invoice['status']) => {
    try {
      await InvoiceService.updateInvoiceStatus(invoiceId, status);
      await loadInvoices();
    } catch (error) {
      console.error('Error updating invoice status:', error);
    }
  };

  // Delete invoice
  const deleteInvoice = async (invoiceId: string) => {
    console.log('Attempting to delete invoice:', invoiceId);
    
    if (window.confirm('هل أنت متأكد من حذف هذه الفاتورة؟ هذا الإجراء لا يمكن التراجع عنه.')) {
      try {
        // الحصول على بيانات الفاتورة قبل الحذف
        const invoice = invoices.find(inv => inv.id === invoiceId);
        
        console.log('User confirmed deletion, proceeding...');
        await InvoiceService.deleteInvoice(invoiceId);
        console.log('Invoice deleted successfully, reloading invoices...');
        
        // إرسال إشعار حذف فاتورة
        if (invoice) {
          try {
            await telegramService.sendInvoiceNotification(invoice, 'delete');
          } catch (notifError) {
            console.error('Error sending invoice delete notification:', notifError);
          }
        }
        
        await loadInvoices();
        alert('تم حذف الفاتورة بنجاح');
      } catch (error) {
        console.error('Error deleting invoice:', error);
        console.error('Error details:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint
        });
        alert(`حدث خطأ في حذف الفاتورة: ${error.message || 'خطأ غير معروف'}`);
      }
    } else {
      console.log('User cancelled deletion');
    }
  };

  // Print invoice
  // Generate invoice HTML (for PDF generation)
  const generateInvoiceHTML = (invoice: Invoice): string => {
    // Format dates
    const formatDate = (dateString: string) => {
      const date = new Date(dateString);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    };

    // Generate HTML content for the invoice
    const invoiceHTML = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>فاتورة ${invoice.invoice_number}</title>
        <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;600;700&family=Roboto:wght@300;400;500;700&display=swap" rel="stylesheet">
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          @page {
            size: A4;
            margin: 15mm;
          }
          
          body {
            font-family: 'Cairo', 'Roboto', Arial, sans-serif;
            font-size: 11pt;
            line-height: 1.5;
            color: #1a1a1a;
            background: white;
            direction: rtl;
            padding: 0;
            margin: 0;
          }
          
          .invoice-wrapper {
            width: 100%;
            max-width: 210mm;
            margin: 0 auto;
            background: white;
            padding: 10mm;
            page-break-after: avoid;
          }
          
          /* Header Section */
          .header-section {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 15px;
            padding-bottom: 15px;
            border-bottom: 3px solid #2563eb;
          }
          
          .logo-section {
            flex: 0 0 25%;
            text-align: center;
          }
          
          .logo-section img {
            width: 80px;
            height: 80px;
            object-fit: contain;
            margin-bottom: 8px;
          }
          
          .header-title {
            flex: 1;
            text-align: center;
            padding: 0 20px;
          }
          
          .invoice-title-ar {
            font-family: 'Cairo', Arial, sans-serif;
            font-size: 32pt;
            font-weight: 700;
            color: #1e40af;
            margin-bottom: 5px;
            letter-spacing: -1px;
          }
          
          .invoice-title-tr {
            font-family: 'Roboto', Arial, sans-serif;
            font-size: 24pt;
            font-weight: 500;
            color: #3b82f6;
            margin-bottom: 8px;
          }
          
          .invoice-number-section {
            text-align: left;
            flex: 0 0 25%;
          }
          
          .invoice-number-label {
            font-size: 9pt;
            color: #64748b;
            margin-bottom: 3px;
          }
          
          .invoice-number-value {
            font-size: 14pt;
            font-weight: 600;
            color: #1e293b;
            font-family: 'Roboto Mono', monospace;
          }
          
          /* Company and Client Info */
          .info-section {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 15px;
          }
          
          .info-box {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            padding: 12px;
          }
          
          .info-box-title {
            font-size: 12pt;
            font-weight: 600;
            color: #1e40af;
            margin-bottom: 8px;
            padding-bottom: 5px;
            border-bottom: 2px solid #3b82f6;
            display: flex;
            justify-content: space-between;
          }
          
          .info-box-title-ar {
            font-family: 'Cairo', Arial, sans-serif;
          }
          
          .info-box-title-tr {
            font-family: 'Roboto', Arial, sans-serif;
            font-size: 10pt;
            color: #64748b;
            font-weight: 400;
          }
          
          .info-item {
            font-size: 10pt;
            margin-bottom: 4px;
            color: #334155;
            display: flex;
            justify-content: space-between;
            padding: 3px 0;
          }
          
          .info-item-label {
            font-weight: 500;
            color: #475569;
            min-width: 80px;
          }
          
          .info-item-value {
            text-align: left;
            flex: 1;
          }
          
          .info-item-value-phone,
          .info-item-value-email {
            direction: ltr;
            text-align: left;
            font-family: 'Roboto', Arial, sans-serif;
          }
          
          /* Invoice Details Row */
          .invoice-details-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 15px;
            background: #f1f5f9;
            padding: 10px;
            border-radius: 6px;
          }
          
          .detail-item {
            display: flex;
            justify-content: space-between;
            font-size: 10pt;
          }
          
          .detail-label {
            font-weight: 600;
            color: #475569;
          }
          
          /* Items Table */
          .items-section {
            margin-bottom: 15px;
          }
          
          .items-table {
            width: 100%;
            border-collapse: collapse;
            border: 1px solid #cbd5e1;
            margin-top: 5px;
          }
          
          .items-table thead {
            background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
            color: white;
          }
          
          .items-table th {
            padding: 10px 8px;
            text-align: center;
            font-weight: 600;
            font-size: 10pt;
            border: 1px solid rgba(255,255,255,0.2);
          }
          
          .items-table th:first-child {
            text-align: right;
          }
          
          .items-table td {
            padding: 9px 8px;
            border: 1px solid #e2e8f0;
            font-size: 10pt;
            text-align: center;
          }
          
          .items-table td:first-child {
            text-align: right;
            font-weight: 500;
          }
          
          .items-table tbody tr:nth-child(even) {
            background: #f8fafc;
          }
          
          .items-table tbody tr:hover {
            background: #f1f5f9;
          }
          
          /* Totals Section */
          .totals-section {
            display: flex;
            justify-content: flex-end;
            margin-bottom: 15px;
          }
          
          .totals-table {
            width: 280px;
            border-collapse: collapse;
          }
          
          .totals-table tr {
            border-bottom: 1px solid #e2e8f0;
          }
          
          .totals-table td {
            padding: 8px 12px;
            font-size: 10pt;
          }
          
          .totals-table td:first-child {
            text-align: right;
            font-weight: 500;
            color: #475569;
          }
          
          .totals-table td:last-child {
            text-align: left;
            font-weight: 600;
            color: #1e293b;
            font-family: 'Roboto Mono', monospace;
          }
          
          .total-row {
            background: #f1f5f9;
            border-top: 2px solid #1e40af;
            font-weight: 700;
            font-size: 12pt;
          }
          
          .total-row td {
            font-size: 12pt;
            color: #1e40af;
            padding: 10px 12px;
          }
          
          /* Notes Section */
          .notes-section {
            background: #fef3c7;
            border: 1px solid #fcd34d;
            border-right: 4px solid #f59e0b;
            border-radius: 6px;
            padding: 12px;
            margin-bottom: 15px;
          }
          
          .notes-title {
            font-weight: 600;
            color: #92400e;
            margin-bottom: 6px;
            font-size: 11pt;
          }
          
          .notes-content {
            font-size: 10pt;
            color: #78350f;
            line-height: 1.6;
          }
          
          /* Footer */
          .footer-section {
            margin-top: 20px;
            padding-top: 12px;
            border-top: 2px solid #e2e8f0;
            text-align: center;
            font-size: 9pt;
            color: #64748b;
          }
          
          .footer-line {
            margin: 3px 0;
          }
          
          .footer-company-name {
            font-weight: 600;
            color: #1e40af;
            font-size: 10pt;
            margin-bottom: 5px;
          }
          
          .status-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 9pt;
            font-weight: 600;
            margin-top: 5px;
          }
          
          .status-paid { background: #d1fae5; color: #065f46; }
          .status-sent { background: #dbeafe; color: #1e40af; }
          .status-overdue { background: #fee2e2; color: #991b1b; }
          .status-draft { background: #f3f4f6; color: #374151; }
          .status-cancelled { background: #fce7f3; color: #9f1239; }
          
          /* Bilingual Text */
          .bilingual {
            display: flex;
            justify-content: space-between;
            align-items: baseline;
            gap: 10px;
          }
          
          .ar-text {
            font-family: 'Cairo', Arial, sans-serif;
            direction: rtl;
            text-align: right;
          }
          
          .tr-text {
            font-family: 'Roboto', Arial, sans-serif;
            direction: ltr;
            text-align: left;
            font-size: 9pt;
            color: #64748b;
          }
          
          @media print {
            body {
              margin: 0;
              padding: 0;
            }
            
            .invoice-wrapper {
              padding: 0;
              margin: 0;
              max-width: 100%;
            }
            
            @page {
              margin: 15mm;
            }
            
            .items-table {
              page-break-inside: avoid;
            }
            
            .info-section,
            .invoice-details-row,
            .totals-section {
              page-break-inside: avoid;
            }
          }
        </style>
      </head>
      <body>
        <div class="invoice-wrapper">
          <!-- Header -->
          <div class="header-section">
            <div class="logo-section">
              <img src="/logo-fınal.png" alt="Tevasul Group" onerror="this.style.display='none'">
            </div>
            
            <div class="header-title">
              <div class="invoice-title-ar">فاتورة</div>
              <div class="invoice-title-tr">FATURA</div>
              <div class="status-badge status-${invoice.status}">
                ${invoice.status === 'paid' ? 'مدفوعة / Ödendi' :
                  invoice.status === 'sent' ? 'مرسلة / Gönderildi' :
                  invoice.status === 'overdue' ? 'متأخرة / Gecikmiş' :
                  invoice.status === 'draft' ? 'مسودة / Taslak' :
                  'ملغاة / İptal'}
              </div>
            </div>
            
            <div class="invoice-number-section">
              <div class="invoice-number-label">رقم الفاتورة / Fatura No:</div>
              <div class="invoice-number-value">${invoice.invoice_number}</div>
            </div>
          </div>

          <!-- Company and Client Info -->
          <div class="info-section">
            <div class="info-box">
              <div class="info-box-title">
                <span class="info-box-title-ar">معلومات الشركة</span>
                <span class="info-box-title-tr">Şirket Bilgileri</span>
              </div>
              <div class="info-item">
                <span class="info-item-label">اسم الشركة:</span>
                <span class="info-item-value ar-text">مجموعة تواصل</span>
              </div>
              <div class="info-item">
                <span class="info-item-label">Company:</span>
                <span class="info-item-value">Tevasul Group</span>
              </div>
              <div class="info-item">
                <span class="info-item-label">العنوان:</span>
                <span class="info-item-value ar-text">CamiŞerif Mah. 5210 Sk. No:11A Akdeniz / Mersin</span>
              </div>
              <div class="info-item">
                <span class="info-item-label">الهاتف:</span>
                <span class="info-item-value info-item-value-phone">+90 534 962 72 41</span>
              </div>
              <div class="info-item">
                <span class="info-item-label">البريد:</span>
                <span class="info-item-value info-item-value-email">info@tevasul.group</span>
              </div>
              <div class="info-item">
                <span class="info-item-label">الموقع:</span>
                <span class="info-item-value info-item-value-email">tevasul.group</span>
              </div>
            </div>

            <div class="info-box">
              <div class="info-box-title">
                <span class="info-box-title-ar">معلومات العميل</span>
                <span class="info-box-title-tr">Müşteri Bilgileri</span>
              </div>
              <div class="info-item">
                <span class="info-item-label">الاسم / Ad:</span>
                <span class="info-item-value ar-text">${invoice.client_name}</span>
              </div>
              ${invoice.client_email ? `
              <div class="info-item">
                <span class="info-item-label">البريد / E-posta:</span>
                <span class="info-item-value info-item-value-email">${invoice.client_email}</span>
              </div>
              ` : ''}
              ${invoice.client_phone ? `
              <div class="info-item">
                <span class="info-item-label">الهاتف / Telefon:</span>
                <span class="info-item-value info-item-value-phone">${invoice.client_phone}</span>
              </div>
              ` : ''}
              ${invoice.client_address ? `
              <div class="info-item">
                <span class="info-item-label">العنوان / Adres:</span>
                <span class="info-item-value ar-text">${invoice.client_address}</span>
              </div>
              ` : ''}
            </div>
          </div>

          <!-- Invoice Details -->
          <div class="invoice-details-row">
            <div class="detail-item">
              <span class="detail-label ar-text">تاريخ الإصدار:</span>
              <span>${formatDate(invoice.issue_date)}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label ar-text">تاريخ الاستحقاق:</span>
              <span>${formatDate(invoice.due_date)}</span>
            </div>
          </div>

          <!-- Items Table -->
          <div class="items-section">
            <table class="items-table">
              <thead>
                <tr>
                  <th class="ar-text">الوصف / Açıklama</th>
                  <th>الكمية / Miktar</th>
                  <th>سعر الوحدة / Birim Fiyat</th>
                  <th>المجموع / Toplam</th>
                </tr>
              </thead>
              <tbody>
                ${invoice.items.map(item => `
                  <tr>
                    <td class="ar-text">
                      <div>${item.description_ar || ''}</div>
                      ${item.description_tr ? `<div style="font-size: 9pt; color: #64748b; margin-top: 3px;">${item.description_tr}</div>` : ''}
                    </td>
                    <td>${item.quantity}</td>
                    <td>${InvoiceService.formatCurrency(item.unit_price)}</td>
                    <td><strong>${InvoiceService.formatCurrency(item.total_price)}</strong></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <!-- Totals -->
          <div class="totals-section">
            <table class="totals-table">
              <tr>
                <td class="ar-text">المجموع الفرعي / Ara Toplam:</td>
                <td>${InvoiceService.formatCurrency(invoice.subtotal)}</td>
              </tr>
              <tr>
                <td class="ar-text">الضريبة (${invoice.tax_rate}%) / Vergi:</td>
                <td>${InvoiceService.formatCurrency(invoice.tax_amount)}</td>
              </tr>
              <tr class="total-row">
                <td class="ar-text">المجموع الكلي / Genel Toplam:</td>
                <td>${InvoiceService.formatCurrency(invoice.total_amount)}</td>
              </tr>
            </table>
          </div>

          <!-- Notes -->
          ${invoice.notes_ar || invoice.notes_tr ? `
          <div class="notes-section">
            <div class="notes-title ar-text">ملاحظات / Notlar</div>
            <div class="notes-content">
              ${invoice.notes_ar ? `<div class="ar-text" style="margin-bottom: 5px;">${invoice.notes_ar}</div>` : ''}
              ${invoice.notes_tr ? `<div style="font-family: 'Roboto', Arial; direction: ltr;">${invoice.notes_tr}</div>` : ''}
            </div>
          </div>
          ` : ''}

          <!-- Footer -->
          <div class="footer-section">
            <div class="footer-company-name">Tevasul Group - مجموعة تواصل</div>
            <div class="footer-line ar-text">شريكك الموثوق لإنجاز جميع خدماتك في تركيا</div>
            <div class="footer-line">Türkiye'deki tüm hizmetleriniz için güvenilir ortağınız</div>
            <div class="footer-line" style="margin-top: 8px; font-size: 8pt; direction: ltr; text-align: center; font-family: 'Roboto', Arial, sans-serif;">
              CamiŞerif Mah. 5210 Sk. No:11A Akdeniz / Mersin | 
              Tel: +90 534 962 72 41 | 
              Email: info@tevasul.group | 
              Web: tevasul.group
            </div>
            <div class="footer-line" style="font-size: 8pt; color: #94a3b8; margin-top: 5px;">
              ${formatDate(invoice.created_at)} / ${formatDate(invoice.created_at)}
            </div>
          </div>
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 300);
          };
        </script>
      </body>
      </html>
    `;

    return invoiceHTML;
  };

  const printInvoice = (invoice: Invoice) => {
    console.log('Printing invoice:', invoice);
    
    // Create a new window for printing
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    
    if (!printWindow) {
      alert('لا يمكن فتح نافذة الطباعة. تأكد من السماح بالنوافذ المنبثقة.');
      return;
    }

    // Generate HTML content for the invoice
    const invoiceHTML = generateInvoiceHTML(invoice);

    // Write the HTML content to the new window
    printWindow.document.write(invoiceHTML);
    printWindow.document.close();
  };

  // Prepare chart data for Dashboard
  const prepareChartData = () => {
    // Last 12 months data for trends
    const months = language === 'ar' 
      ? ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر']
      : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    const currentDate = new Date();
    const last12Months = Array.from({ length: 12 }, (_, i) => {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthIndex = date.getMonth();
      return {
        name: months[monthIndex],
        month: monthIndex + 1,
        year: date.getFullYear()
      };
    }).reverse();

    const monthlyTrendsData = last12Months.map(({ name, month, year }) => {
      const monthTransactions = allTransactions.filter(t => {
        const transactionDate = new Date(t.transaction_date);
        return transactionDate.getMonth() + 1 === month && 
               transactionDate.getFullYear() === year;
      });
      
      const income = monthTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
      const expense = monthTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
      const profit = income - expense;
      const profitMargin = income > 0 ? (profit / income) * 100 : 0;
      
      return {
        name,
        income,
        expense,
        profit,
        profitMargin: parseFloat(profitMargin.toFixed(2))
      };
    });

    // Last 30 days for cash flow
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      return date.toISOString().split('T')[0];
    });

    const cashFlowData = last30Days.map(date => {
      const dayTransactions = allTransactions.filter(t => t.transaction_date === date);
      const income = dayTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
      const expense = dayTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
      
      // Calculate balance up to this date
      const transactionsUpToDate = allTransactions.filter(t => t.transaction_date <= date);
      const balance = transactionsUpToDate
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0) -
        transactionsUpToDate
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
      
      return {
        name: new Date(date).toLocaleDateString('ar-SA', { day: 'numeric', month: 'short' }),
        income,
        expense,
        balance
      };
    });

    // Category breakdown
    const categoryData = categories.map(category => {
      const categoryTransactions = allTransactions.filter(t => t.category_id === category.id);
      const totalAmount = categoryTransactions.reduce((sum, t) => sum + t.amount, 0);
      
      if (totalAmount === 0) return null;
      
      return {
        name: language === 'ar' ? category.name_ar : language === 'tr' ? category.name_tr : category.name_en,
        value: totalAmount
      };
    }).filter(item => item !== null).sort((a, b) => (b?.value || 0) - (a?.value || 0));

    return {
      monthlyTrendsData,
      cashFlowData,
      categoryData
    };
  };

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
      
      // Get total payments
      const allPayments = await AccountingService.getPayments();
      const totalPayments = allPayments.reduce((sum, p) => sum + p.amount, 0);
      
      const netProfit = totalIncome - totalExpense;
      const cashBalance = netProfit - totalPayments;
      
      setDashboardStats({
        totalIncome,
        totalExpense,
        netProfit,
        monthlyIncome,
        monthlyExpense,
        pendingInvoices: 0, // Will be implemented with invoice system
        overduePayments: 0, // Will be implemented with payment tracking
        budgetUtilization: 0, // Will be implemented with budget system
        cashBalance
      });
    } catch (error) {
      console.error('Error calculating dashboard stats:', error);
    }
  };

  // Load budgets
  const loadBudgets = async () => {
    try {
      const budgetsData = await AccountingService.getBudgets(true);
      setBudgets(budgetsData);
    } catch (error: any) {
      // الدالة getBudgets تتعامل مع الأخطاء وترجع مصفوفة فارغة
      // لكن إذا كان هناك خطأ آخر، نستخدم مصفوفة فارغة
      console.warn('Error loading budgets (will use empty array):', error);
      setBudgets([]);
    }
  };

  // Load payments
  const loadPayments = async () => {
    try {
      const paymentsData = await AccountingService.getPayments();
      setPayments(paymentsData);
    } catch (error) {
      console.error('Error loading payments:', error);
    }
  };

  // Load settings
  const loadSettings = async () => {
    try {
      const settingsData = await AccountingService.getSettings();
      if (settingsData) {
        setSettings(settingsData);
        // Update invoice form tax rate if form is not being edited
        if (!editingInvoice && invoiceForm.tax_rate === 20) {
          setInvoiceForm(prev => ({
            ...prev,
            tax_rate: settingsData.default_tax_rate || 20
          }));
        }
      } else {
        // Keep default settings if table doesn't exist
        console.warn('Settings table not found, using default settings');
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  // Handle budget form submission
  const handleBudgetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (editingBudget) {
        await AccountingService.updateBudget(editingBudget.id, budgetForm);
      } else {
        await AccountingService.createBudget(budgetForm);
      }
      
      await loadBudgets();
      setShowBudgetForm(false);
      setEditingBudget(null);
      resetBudgetForm();
    } catch (error: any) {
      console.error('Error saving budget:', error);
      const errorMessage = error?.message || error?.error?.message || 'خطأ غير معروف';
      alert(
        language === 'ar' 
          ? `حدث خطأ في حفظ الميزانية: ${errorMessage}`
          : `Error saving budget: ${errorMessage}`
      );
    } finally {
      setLoading(false);
    }
  };

  // Reset budget form
  const resetBudgetForm = () => {
    setBudgetForm({
      name_ar: '',
      name_en: '',
      name_tr: '',
      type: 'expense',
      amount: 0,
      period_start: AccountingService.getCurrentDate(),
      period_end: AccountingService.getCurrentDate(),
      description_ar: '',
      description_en: '',
      description_tr: ''
    });
  };

  // Handle edit budget
  const handleEditBudget = (budget: Budget) => {
    setEditingBudget(budget);
    setBudgetForm({
      name_ar: budget.name_ar,
      name_en: budget.name_en,
      name_tr: budget.name_tr,
      type: budget.type,
      amount: budget.amount,
      period_start: budget.period_start,
      period_end: budget.period_end,
      category_id: budget.category_id,
      description_ar: budget.description_ar || '',
      description_en: budget.description_en || '',
      description_tr: budget.description_tr || ''
    });
    setShowBudgetForm(true);
  };

  // Handle delete budget
  const handleDeleteBudget = async (id: string) => {
    if (window.confirm(language === 'ar' ? 'هل أنت متأكد من حذف هذه الميزانية؟' : 'Are you sure you want to delete this budget?')) {
      try {
        await AccountingService.deleteBudget(id);
        await loadBudgets();
      } catch (error) {
        console.error('Error deleting budget:', error);
      }
    }
  };

  // Handle payment form submission
  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      let paymentData;
      if (editingPayment) {
        paymentData = await AccountingService.updatePayment(editingPayment.id, paymentForm);
        // إرسال إشعار تحديث دفعة
        try {
          await telegramService.sendPaymentNotification(
            { ...paymentForm, id: editingPayment.id },
            'update'
          );
        } catch (notifError) {
          console.error('Error sending payment update notification:', notifError);
        }
      } else {
        paymentData = await AccountingService.createPayment(paymentForm);
        // إرسال إشعار إضافة دفعة
        try {
          await telegramService.sendPaymentNotification(
            { ...paymentForm, id: paymentData?.id },
            'create'
          );
        } catch (notifError) {
          console.error('Error sending payment create notification:', notifError);
        }
      }
      
      await loadPayments();
      setShowPaymentForm(false);
      setEditingPayment(null);
      resetPaymentForm();
    } catch (error) {
      console.error('Error saving payment:', error);
      alert('حدث خطأ في حفظ المدفوعة: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Reset payment form
  const resetPaymentForm = () => {
    setPaymentForm({
      payment_method: 'cash',
      amount: 0,
      payment_date: AccountingService.getCurrentDate(),
      reference_number: '',
      status: 'pending',
      notes_ar: '',
      notes_en: '',
      notes_tr: ''
    });
  };

  // Handle edit payment
  const handleEditPayment = (payment: Payment) => {
    setEditingPayment(payment);
    setPaymentForm({
      invoice_id: payment.invoice_id,
      transaction_id: payment.transaction_id,
      payment_method: payment.payment_method,
      amount: payment.amount,
      payment_date: payment.payment_date,
      reference_number: payment.reference_number || '',
      status: payment.status || 'pending',
      notes_ar: payment.notes_ar || '',
      notes_en: payment.notes_en || '',
      notes_tr: payment.notes_tr || ''
    });
    setShowPaymentForm(true);
  };

  // Handle delete payment
  const handleDeletePayment = async (id: string) => {
    if (window.confirm(language === 'ar' ? 'هل أنت متأكد من حذف هذه المدفوعة؟' : 'Are you sure you want to delete this payment?')) {
      try {
        // الحصول على بيانات الدفعة قبل الحذف
        const payment = payments.find(p => p.id === id);
        await AccountingService.deletePayment(id);
        
        // إرسال إشعار حذف دفعة
        if (payment) {
          try {
            await telegramService.sendPaymentNotification(payment, 'delete');
          } catch (notifError) {
            console.error('Error sending payment delete notification:', notifError);
          }
        }
        
        await loadPayments();
      } catch (error) {
        console.error('Error deleting payment:', error);
      }
    }
  };

  // Handle save settings
  const handleSaveSettings = async () => {
    setLoading(true);
    
    try {
      const savedSettings = await AccountingService.updateSettings(settings);
      if (savedSettings) {
        setSettings(savedSettings);
      }
      alert(language === 'ar' ? 'تم حفظ الإعدادات بنجاح' : 'Settings saved successfully');
    } catch (error: any) {
      console.error('Error saving settings:', error);
      const errorMessage = error.message || (language === 'ar' ? 'خطأ غير معروف' : 'Unknown error');
      if (errorMessage.includes('جدول الإعدادات غير موجود') || errorMessage.includes('schema cache')) {
        alert(language === 'ar' 
          ? 'جدول الإعدادات غير موجود. يرجى تطبيق migration: 20241221_create_accounting_settings.sql في Supabase'
          : 'Settings table does not exist. Please apply migration: 20241221_create_accounting_settings.sql in Supabase');
      } else {
        alert(language === 'ar' ? `حدث خطأ في حفظ الإعدادات: ${errorMessage}` : `Error saving settings: ${errorMessage}`);
      }
    } finally {
      setLoading(false);
    }
  };

  // Load all transactions for analysis
  const loadAllTransactions = async () => {
    try {
      const allTransactionsData = await AccountingService.getTransactions();
      setAllTransactions(allTransactionsData);
    } catch (error) {
      console.error('Error loading all transactions:', error);
    }
  };

  useEffect(() => {
    loadData();
    loadSettings();
    if (activeTab === 'dashboard') {
      calculateDashboardStats();
    }
    if (activeTab === 'invoices') {
      loadInvoices();
      loadCustomers();
    }
    if (activeTab === 'budgets') {
      loadBudgets();
    }
    if (activeTab === 'payments') {
      loadPayments();
    }
    if (activeTab === 'analysis' || activeTab === 'reports') {
      loadAllTransactions();
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
        const newTransaction = await AccountingService.createTransaction(transactionForm);
        
        // إرسال تفاصيل الصندوق إلى التلغرام بعد إضافة معاملة جديدة
        try {
          // انتظار قصير لضمان تحديث الملخصات اليومية في قاعدة البيانات
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // الحصول على البيانات المحدثة من قاعدة البيانات
          const updatedTransactions = await AccountingService.getTransactions();
          
          // حساب الواردات والصادرات اليوم
          const todayTransactions = updatedTransactions.filter(t => t.transaction_date === transactionForm.transaction_date);
          const dailyIncome = todayTransactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);
          const dailyExpense = todayTransactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);
          
          // حساب صافي الربح (من جميع المعاملات)
          const totalIncome = updatedTransactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);
          const totalExpense = updatedTransactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);
          const netProfit = totalIncome - totalExpense;
          
          // حساب مجموع المدفوعات
          let totalPayments = 0;
          try {
            const allPayments = await AccountingService.getPayments();
            totalPayments = allPayments.reduce((sum, p) => sum + p.amount, 0);
          } catch (paymentsError) {
            console.warn('Could not fetch payments:', paymentsError);
            // إذا فشل جلب المدفوعات، نستخدم 0
            totalPayments = 0;
          }
          
          // حساب الواردات والصادرات الشهرية
          const currentDate = new Date();
          const currentMonth = currentDate.getMonth() + 1;
          const currentYear = currentDate.getFullYear();
          const monthlyTransactions = updatedTransactions.filter(t => {
            const transactionDate = new Date(t.transaction_date);
            return transactionDate.getMonth() + 1 === currentMonth && 
                   transactionDate.getFullYear() === currentYear;
          });
          const monthlyIncome = monthlyTransactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);
          const monthlyExpense = monthlyTransactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);
          
          // الحصول على اسم الفئة
          const category = categories.find(c => c.id === transactionForm.category_id);
          const categoryName = category 
            ? (language === 'ar' ? category.name_ar : language === 'tr' ? category.name_tr : category.name_en)
            : (language === 'ar' ? 'غير محدد' : 'Not specified');
          
          // الحصول على الوصف
          const description = language === 'ar' 
            ? (transactionForm.description_ar || 'لا يوجد وصف')
            : language === 'tr'
            ? (transactionForm.description_tr || 'Açıklama yok')
            : (transactionForm.description_en || 'No description');
          
          // إرسال التفاصيل إلى التلغرام
          await telegramService.sendCashBoxDetails({
            transactionType: transactionForm.type,
            amount: transactionForm.amount,
            description: description,
            categoryName: categoryName,
            transactionDate: AccountingService.formatDate(transactionForm.transaction_date),
            netProfit: netProfit,
            totalPayments: totalPayments,
            dailyIncome: dailyIncome,
            dailyExpense: dailyExpense,
            monthlyIncome: monthlyIncome,
            monthlyExpense: monthlyExpense
          });
        } catch (telegramError) {
          console.error('Error sending cash box details to Telegram:', telegramError);
          // لا نوقف العملية إذا فشل إرسال الرسالة إلى التلغرام
        }
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
      let categoryData;
      if (editingCategory) {
        categoryData = await AccountingService.updateCategory(editingCategory.id, categoryForm);
        // إرسال إشعار تحديث فئة
        try {
          await telegramService.sendCategoryNotification(
            { ...categoryForm, id: editingCategory.id },
            'update'
          );
        } catch (notifError) {
          console.error('Error sending category update notification:', notifError);
        }
      } else {
        categoryData = await AccountingService.createCategory(categoryForm);
        // إرسال إشعار إضافة فئة
        try {
          await telegramService.sendCategoryNotification(
            { ...categoryForm, id: categoryData?.id },
            'create'
          );
        } catch (notifError) {
          console.error('Error sending category create notification:', notifError);
        }
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
        // الحصول على بيانات المعاملة قبل الحذف
        const transaction = transactions.find(t => t.id === id);
        await AccountingService.deleteTransaction(id);
        
        // إرسال إشعار حذف معاملة
        if (transaction) {
          try {
            await telegramService.sendTransactionDeleteNotification(transaction);
          } catch (notifError) {
            console.error('Error sending transaction delete notification:', notifError);
          }
        }
        
        loadData();
      } catch (error) {
        console.error('Error deleting transaction:', error);
      }
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (window.confirm(language === 'ar' ? 'هل أنت متأكد من حذف هذه الفئة؟' : 'Are you sure you want to delete this category?')) {
      try {
        // الحصول على بيانات الفئة قبل الحذف
        const category = categories.find(c => c.id === id);
        await AccountingService.deleteCategory(id);
        
        // إرسال إشعار حذف فئة
        if (category) {
          try {
            await telegramService.sendCategoryNotification(category, 'delete');
          } catch (notifError) {
            console.error('Error sending category delete notification:', notifError);
          }
        }
        
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

  // Monthly summary calculations (using selected report month/year)
  const getMonthlyIncome = (month?: number, year?: number) => {
    const targetMonth = month || selectedReportMonth;
    const targetYear = year || selectedReportYear;
    
    return allTransactions
      .filter(t => {
        const transactionDate = new Date(t.transaction_date);
        return transactionDate.getMonth() + 1 === targetMonth && 
               transactionDate.getFullYear() === targetYear &&
               t.type === 'income';
      })
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const getMonthlyExpense = (month?: number, year?: number) => {
    const targetMonth = month || selectedReportMonth;
    const targetYear = year || selectedReportYear;
    
    return allTransactions
      .filter(t => {
        const transactionDate = new Date(t.transaction_date);
        return transactionDate.getMonth() + 1 === targetMonth && 
               transactionDate.getFullYear() === targetYear &&
               t.type === 'expense';
      })
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const getMonthlyNetIncome = (month?: number, year?: number) => {
    return getMonthlyIncome(month, year) - getMonthlyExpense(month, year);
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

          {/* Cash Box Status */}
          <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
            <div className={`bg-gradient-to-br ${dashboardStats.cashBalance >= 0 ? 'from-emerald-500 to-emerald-600' : 'from-rose-500 to-rose-600'} rounded-xl p-6 text-white shadow-lg`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`${dashboardStats.cashBalance >= 0 ? 'text-emerald-100' : 'text-rose-100'} text-sm font-medium`}>
                    {language === 'ar' ? 'حالة الصندوق' : 'Cash Box Status'}
                  </p>
                  <p className="text-3xl font-bold">{dashboardStats.cashBalance.toLocaleString()} ₺</p>
                  <p className={`${dashboardStats.cashBalance >= 0 ? 'text-emerald-200' : 'text-rose-200'} text-xs mt-2`}>
                    {language === 'ar' ? 'صافي الربح - مجموع المدفوعات' : 'Net Profit - Total Payments'}
                  </p>
                </div>
                {dashboardStats.cashBalance >= 0 ? (
                  <Wallet className="w-8 h-8 text-emerald-200" />
                ) : (
                  <AlertCircle className="w-8 h-8 text-rose-200" />
                )}
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
              <h3 className="text-xl font-bold">{language === 'ar' ? 'المعاملات الأخيرة' : 'Recent Transactions'}</h3>
              <button
                onClick={() => setActiveTab('transactions')}
                className="text-blue-500 hover:text-blue-600 text-sm font-medium"
              >
                {language === 'ar' ? 'عرض الكل' : 'View All'}
              </button>
            </div>
            <div className="space-y-3">
              {transactions.slice(0, 5).map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-3 ${transaction.type === 'income' ? 'bg-green-500' : 'bg-red-500'}`} />
                    <div>
                      <p className="font-medium">
                        {language === 'ar' 
                          ? (transaction.category?.name_ar || 'بدون فئة')
                          : language === 'tr'
                          ? (transaction.category?.name_tr || 'Kategori Yok')
                          : (transaction.category?.name_en || 'No Category')}
                      </p>
                      <p className="text-sm text-gray-500">
                        {getDescription(transaction) || (language === 'ar' ? 'لا يوجد وصف' : 'No description')}
                      </p>
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

          {/* Professional Charts Section */}
          {(() => {
            const chartData = prepareChartData();
            return (
              <>
                {/* Income/Expense Trends Chart */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold flex items-center">
                      <BarChart3 className="w-6 h-6 mr-2 text-blue-500" />
                      {language === 'ar' ? 'اتجاهات الواردات والصادرات' : 'Income & Expense Trends'}
                    </h3>
                  </div>
                  <div className="h-[350px]">
                    <IncomeExpenseTrendChart 
                      data={chartData.monthlyTrendsData} 
                      isDarkMode={isDarkMode} 
                    />
                  </div>
                </div>

                {/* Charts Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Category Breakdown */}
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold flex items-center">
                        <PieChart className="w-6 h-6 mr-2 text-purple-500" />
                        {language === 'ar' ? 'توزيع الفئات' : 'Category Breakdown'}
                      </h3>
                    </div>
                    <div className="h-[350px]">
                      <CategoryBreakdownChart 
                        data={chartData.categoryData} 
                        isDarkMode={isDarkMode} 
                      />
                    </div>
                  </div>

                  {/* Cash Flow Chart */}
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold flex items-center">
                        <LineChart className="w-6 h-6 mr-2 text-green-500" />
                        {language === 'ar' ? 'تدفق النقد' : 'Cash Flow'}
                      </h3>
                    </div>
                    <div className="h-[350px]">
                      <CashFlowChart 
                        data={chartData.cashFlowData.slice(-30)} 
                        isDarkMode={isDarkMode} 
                      />
                    </div>
                  </div>
                </div>

                {/* Monthly Trends Detailed */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold flex items-center">
                      <TrendingUp className="w-6 h-6 mr-2 text-orange-500" />
                      {language === 'ar' ? 'الاتجاهات الشهرية التفصيلية' : 'Detailed Monthly Trends'}
                    </h3>
                  </div>
                  <div className="h-[350px]">
                    <MonthlyTrendsChart 
                      data={chartData.monthlyTrendsData} 
                      isDarkMode={isDarkMode} 
                    />
                  </div>
                </div>
              </>
            );
          })()}
        </div>
      )}

      {/* Transactions Tab */}
      {activeTab === 'transactions' && (
        <div className="space-y-6">
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {language === 'ar' ? 'المعاملات المالية' : 'Financial Transactions'}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {language === 'ar' ? 'إدارة وتتبع جميع المعاملات المالية' : 'Manage and track all financial transactions'}
              </p>
            </div>
            <button
              onClick={() => setShowTransactionForm(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-medium"
            >
              <Plus className="w-5 h-5" />
              {language === 'ar' ? 'إضافة معاملة جديدة' : 'Add New Transaction'}
            </button>
          </div>

          {/* Filters and Controls */}
          <div className={`p-5 rounded-xl border ${isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200 shadow-sm'}`}>
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <Calendar className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                </div>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className={`flex-1 px-4 py-2.5 border rounded-lg transition-all ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20' 
                      : 'bg-gray-50 border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                  }`}
                />
              </div>
              
              <div className="flex items-center gap-2 flex-1 min-w-[180px]">
                <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <Filter className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                </div>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as any)}
                  className={`flex-1 px-4 py-2.5 border rounded-lg transition-all ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20' 
                      : 'bg-gray-50 border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                  }`}
                >
                  <option value="all">{language === 'ar' ? 'جميع الأنواع' : 'All Types'}</option>
                  <option value="income">{language === 'ar' ? 'واردات' : 'Income'}</option>
                  <option value="expense">{language === 'ar' ? 'صادرات' : 'Expense'}</option>
                </select>
              </div>

              <div className="flex items-center gap-2 flex-1 min-w-[180px]">
                <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <Tag className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                </div>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className={`flex-1 px-4 py-2.5 border rounded-lg transition-all ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20' 
                      : 'bg-gray-50 border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                  }`}
                >
                  <option value="all">{language === 'ar' ? 'جميع الفئات' : 'All Categories'}</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {language === 'ar' ? category.name_ar : language === 'tr' ? category.name_tr : category.name_en}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={loadData}
                className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200 font-medium"
              >
                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                {language === 'ar' ? 'تحديث' : 'Refresh'}
              </button>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Income Card */}
            <div className={`group relative overflow-hidden rounded-xl p-6 transition-all duration-300 ${
              isDarkMode 
                ? 'bg-gradient-to-br from-green-900/80 to-green-800/60 border border-green-700/50 shadow-lg shadow-green-500/10' 
                : 'bg-gradient-to-br from-green-50 to-green-100/50 border border-green-200 shadow-md hover:shadow-lg'
            } hover:scale-[1.02]`}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className={`text-sm font-medium mb-2 ${
                    isDarkMode ? 'text-green-300' : 'text-green-600'
                  }`}>
                    {language === 'ar' ? 'إجمالي الواردات' : 'Total Income'}
                  </p>
                  <p className={`text-2xl font-bold mb-1 ${
                    isDarkMode ? 'text-green-100' : 'text-green-700'
                  }`}>
                    {AccountingService.formatCurrency(getTotalIncome())}
                  </p>
                  <div className="flex items-center gap-1 mt-2">
                    <TrendingUp className={`w-4 h-4 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} />
                    <span className={`text-xs ${isDarkMode ? 'text-green-300' : 'text-green-600'}`}>
                      {language === 'ar' ? 'إيجابي' : 'Positive'}
                    </span>
                  </div>
                </div>
                <div className={`p-3 rounded-xl ${
                  isDarkMode ? 'bg-green-800/50' : 'bg-green-200/50'
                }`}>
                  <TrendingUp className={`w-8 h-8 ${isDarkMode ? 'text-green-300' : 'text-green-600'}`} />
                </div>
              </div>
              <div className={`absolute -bottom-2 -right-2 w-24 h-24 rounded-full opacity-10 ${
                isDarkMode ? 'bg-green-400' : 'bg-green-500'
              }`}></div>
            </div>

            {/* Expense Card */}
            <div className={`group relative overflow-hidden rounded-xl p-6 transition-all duration-300 ${
              isDarkMode 
                ? 'bg-gradient-to-br from-red-900/80 to-red-800/60 border border-red-700/50 shadow-lg shadow-red-500/10' 
                : 'bg-gradient-to-br from-red-50 to-red-100/50 border border-red-200 shadow-md hover:shadow-lg'
            } hover:scale-[1.02]`}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className={`text-sm font-medium mb-2 ${
                    isDarkMode ? 'text-red-300' : 'text-red-600'
                  }`}>
                    {language === 'ar' ? 'إجمالي الصادرات' : 'Total Expense'}
                  </p>
                  <p className={`text-2xl font-bold mb-1 ${
                    isDarkMode ? 'text-red-100' : 'text-red-700'
                  }`}>
                    {AccountingService.formatCurrency(getTotalExpense())}
                  </p>
                  <div className="flex items-center gap-1 mt-2">
                    <TrendingDown className={`w-4 h-4 ${isDarkMode ? 'text-red-400' : 'text-red-600'}`} />
                    <span className={`text-xs ${isDarkMode ? 'text-red-300' : 'text-red-600'}`}>
                      {language === 'ar' ? 'صادرات' : 'Expenses'}
                    </span>
                  </div>
                </div>
                <div className={`p-3 rounded-xl ${
                  isDarkMode ? 'bg-red-800/50' : 'bg-red-200/50'
                }`}>
                  <TrendingDown className={`w-8 h-8 ${isDarkMode ? 'text-red-300' : 'text-red-600'}`} />
                </div>
              </div>
              <div className={`absolute -bottom-2 -right-2 w-24 h-24 rounded-full opacity-10 ${
                isDarkMode ? 'bg-red-400' : 'bg-red-500'
              }`}></div>
            </div>

            {/* Net Income Card */}
            <div className={`group relative overflow-hidden rounded-xl p-6 transition-all duration-300 ${
              getNetIncome() >= 0
                ? (isDarkMode 
                    ? 'bg-gradient-to-br from-blue-900/80 to-blue-800/60 border border-blue-700/50 shadow-lg shadow-blue-500/10' 
                    : 'bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-200 shadow-md hover:shadow-lg')
                : (isDarkMode 
                    ? 'bg-gradient-to-br from-orange-900/80 to-orange-800/60 border border-orange-700/50 shadow-lg shadow-orange-500/10' 
                    : 'bg-gradient-to-br from-orange-50 to-orange-100/50 border border-orange-200 shadow-md hover:shadow-lg')
            } hover:scale-[1.02]`}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className={`text-sm font-medium mb-2 ${
                    getNetIncome() >= 0
                      ? (isDarkMode ? 'text-blue-300' : 'text-blue-600')
                      : (isDarkMode ? 'text-orange-300' : 'text-orange-600')
                  }`}>
                    {language === 'ar' ? 'صافي الدخل' : 'Net Income'}
                  </p>
                  <p className={`text-2xl font-bold mb-1 ${
                    getNetIncome() >= 0
                      ? (isDarkMode ? 'text-blue-100' : 'text-blue-700')
                      : (isDarkMode ? 'text-orange-100' : 'text-orange-700')
                  }`}>
                    {AccountingService.formatCurrency(getNetIncome())}
                  </p>
                  <div className="flex items-center gap-1 mt-2">
                    {getNetIncome() >= 0 ? (
                      <>
                        <TrendingUp className={`w-4 h-4 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                        <span className={`text-xs ${isDarkMode ? 'text-blue-300' : 'text-blue-600'}`}>
                          {language === 'ar' ? 'ربح' : 'Profit'}
                        </span>
                      </>
                    ) : (
                      <>
                        <TrendingDown className={`w-4 h-4 ${isDarkMode ? 'text-orange-400' : 'text-orange-600'}`} />
                        <span className={`text-xs ${isDarkMode ? 'text-orange-300' : 'text-orange-600'}`}>
                          {language === 'ar' ? 'خسارة' : 'Loss'}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <div className={`p-3 rounded-xl ${
                  getNetIncome() >= 0
                    ? (isDarkMode ? 'bg-blue-800/50' : 'bg-blue-200/50')
                    : (isDarkMode ? 'bg-orange-800/50' : 'bg-orange-200/50')
                }`}>
                  <BarChart3 className={`w-8 h-8 ${
                    getNetIncome() >= 0
                      ? (isDarkMode ? 'text-blue-300' : 'text-blue-600')
                      : (isDarkMode ? 'text-orange-300' : 'text-orange-600')
                  }`} />
                </div>
              </div>
              <div className={`absolute -bottom-2 -right-2 w-24 h-24 rounded-full opacity-10 ${
                getNetIncome() >= 0
                  ? (isDarkMode ? 'bg-blue-400' : 'bg-blue-500')
                  : (isDarkMode ? 'bg-orange-400' : 'bg-orange-500')
              }`}></div>
            </div>
          </div>

          {/* Transactions List */}
          <div className={`rounded-xl border overflow-hidden shadow-sm ${
            isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className={`${isDarkMode ? 'bg-gray-800/80' : 'bg-gray-50'} border-b ${
                    isDarkMode ? 'border-gray-700' : 'border-gray-200'
                  }`}>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                      {language === 'ar' ? 'النوع' : 'Type'}
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                      {language === 'ar' ? 'المبلغ' : 'Amount'}
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                      {language === 'ar' ? 'الفئة' : 'Category'}
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                      {language === 'ar' ? 'الوصف' : 'Description'}
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                      {language === 'ar' ? 'الإجراءات' : 'Actions'}
                    </th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDarkMode ? 'divide-gray-700/50' : 'divide-gray-100'}`}>
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center justify-center gap-3">
                          <RefreshCw className="w-8 h-8 animate-spin text-gray-400" />
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {language === 'ar' ? 'جاري التحميل...' : 'Loading...'}
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : transactions.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center justify-center gap-3">
                          <FileText className="w-12 h-12 text-gray-300 dark:text-gray-600" />
                          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                            {language === 'ar' ? 'لا توجد معاملات' : 'No transactions found'}
                          </p>
                          <p className="text-xs text-gray-400 dark:text-gray-500">
                            {language === 'ar' ? 'ابدأ بإضافة معاملة جديدة' : 'Start by adding a new transaction'}
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    transactions.map((transaction, index) => (
                      <tr 
                        key={transaction.id} 
                        className={`transition-all duration-200 ${
                          isDarkMode 
                            ? 'hover:bg-gray-700/50' 
                            : 'hover:bg-gray-50'
                        } ${index % 2 === 0 ? (isDarkMode ? 'bg-gray-800/30' : 'bg-white') : (isDarkMode ? 'bg-gray-800/50' : 'bg-gray-50/50')}`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full transition-all ${
                            transaction.type === 'income' 
                              ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300 border border-green-200 dark:border-green-700/50' 
                              : 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300 border border-red-200 dark:border-red-700/50'
                          }`}>
                            {transaction.type === 'income' ? (
                              <ArrowUpRight className="w-3 h-3" />
                            ) : (
                              <ArrowDownRight className="w-3 h-3" />
                            )}
                            {transaction.type === 'income' 
                              ? (language === 'ar' ? 'وارد' : 'Income')
                              : (language === 'ar' ? 'صادر' : 'Expense')
                            }
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`text-sm font-bold ${
                            transaction.type === 'income'
                              ? 'text-green-600 dark:text-green-400'
                              : 'text-red-600 dark:text-red-400'
                          }`}>
                            {transaction.type === 'income' ? '+' : '-'}
                            {AccountingService.formatCurrency(transaction.amount)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <Tag className="w-4 h-4 text-gray-400" />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              {getCategoryName(transaction.category_id)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 max-w-xs">
                            {getDescription(transaction) || (
                              <span className="italic text-gray-400 dark:text-gray-500">
                                {language === 'ar' ? 'لا يوجد وصف' : 'No description'}
                              </span>
                            )}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2 justify-end">
                            <button
                              onClick={() => handleEditTransaction(transaction)}
                              className={`p-2 rounded-lg transition-all duration-200 ${
                                isDarkMode
                                  ? 'text-blue-400 hover:bg-blue-900/30 hover:text-blue-300'
                                  : 'text-blue-600 hover:bg-blue-50 hover:text-blue-700'
                              }`}
                              title={language === 'ar' ? 'تعديل' : 'Edit'}
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteTransaction(transaction.id)}
                              className={`p-2 rounded-lg transition-all duration-200 ${
                                isDarkMode
                                  ? 'text-red-400 hover:bg-red-900/30 hover:text-red-300'
                                  : 'text-red-600 hover:bg-red-50 hover:text-red-700'
                              }`}
                              title={language === 'ar' ? 'حذف' : 'Delete'}
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
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {language === 'ar' ? 'الملخص اليومي' : 'Daily Summary'}
              </h3>
              <button
                onClick={async () => {
                  try {
                    setLoading(true);
                    await AccountingService.refreshDailySummaries();
                    await loadData();
                    alert(language === 'ar' ? 'تم تحديث الملخصات اليومية بنجاح' : 'Daily summaries refreshed successfully');
                  } catch (error) {
                    console.error('Error refreshing daily summaries:', error);
                    alert(language === 'ar' ? 'حدث خطأ في تحديث الملخصات اليومية' : 'Error refreshing daily summaries');
                  } finally {
                    setLoading(false);
                  }
                }}
                disabled={loading}
                className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                {language === 'ar' ? 'تحديث الملخصات' : 'Refresh Summaries'}
              </button>
            </div>
            
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
                    <div className="flex justify-between text-sm pt-1 border-t border-gray-300 dark:border-gray-600">
                      <span className={`font-semibold ${
                        (summary.total_income - summary.total_expense) >= 0
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        {language === 'ar' ? 'صافي اليوم:' : 'Net Daily:'}
                      </span>
                      <span className={`font-semibold ${
                        (summary.total_income - summary.total_expense) >= 0
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        {(summary.total_income - summary.total_expense) >= 0 ? '+' : ''}
                        {AccountingService.formatCurrency(summary.total_income - summary.total_expense)}
                      </span>
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
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {language === 'ar' ? 'التقارير والإحصائيات' : 'Reports & Statistics'}
              </h3>
              
              {/* Month Navigation */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    let newMonth = selectedReportMonth - 1;
                    let newYear = selectedReportYear;
                    if (newMonth < 1) {
                      newMonth = 12;
                      newYear -= 1;
                    }
                    setSelectedReportMonth(newMonth);
                    setSelectedReportYear(newYear);
                  }}
                  className={`p-2 rounded-lg ${isDarkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'} transition-colors`}
                  title={language === 'ar' ? 'الشهر السابق' : 'Previous Month'}
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                
                <div className="flex items-center gap-2">
                  <select
                    value={selectedReportMonth}
                    onChange={(e) => setSelectedReportMonth(parseInt(e.target.value))}
                    className={`px-3 py-2 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300'}`}
                  >
                    {language === 'ar' ? (
                      <>
                        <option value={1}>يناير</option>
                        <option value={2}>فبراير</option>
                        <option value={3}>مارس</option>
                        <option value={4}>أبريل</option>
                        <option value={5}>مايو</option>
                        <option value={6}>يونيو</option>
                        <option value={7}>يوليو</option>
                        <option value={8}>أغسطس</option>
                        <option value={9}>سبتمبر</option>
                        <option value={10}>أكتوبر</option>
                        <option value={11}>نوفمبر</option>
                        <option value={12}>ديسمبر</option>
                      </>
                    ) : (
                      <>
                        <option value={1}>January</option>
                        <option value={2}>February</option>
                        <option value={3}>March</option>
                        <option value={4}>April</option>
                        <option value={5}>May</option>
                        <option value={6}>June</option>
                        <option value={7}>July</option>
                        <option value={8}>August</option>
                        <option value={9}>September</option>
                        <option value={10}>October</option>
                        <option value={11}>November</option>
                        <option value={12}>December</option>
                      </>
                    )}
                  </select>
                  
                  <select
                    value={selectedReportYear}
                    onChange={(e) => setSelectedReportYear(parseInt(e.target.value))}
                    className={`px-3 py-2 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300'}`}
                  >
                    {Array.from({ length: 5 }, (_, i) => {
                      const year = currentDate.getFullYear() - i;
                      return (
                        <option key={year} value={year}>{year}</option>
                      );
                    })}
                  </select>
                </div>
                
                <button
                  onClick={() => {
                    let newMonth = selectedReportMonth + 1;
                    let newYear = selectedReportYear;
                    if (newMonth > 12) {
                      newMonth = 1;
                      newYear += 1;
                    }
                    // Don't allow future months
                    if (newYear > currentDate.getFullYear() || 
                        (newYear === currentDate.getFullYear() && newMonth > currentDate.getMonth() + 1)) {
                      return;
                    }
                    setSelectedReportMonth(newMonth);
                    setSelectedReportYear(newYear);
                  }}
                  disabled={selectedReportYear >= currentDate.getFullYear() && selectedReportMonth >= currentDate.getMonth() + 1}
                  className={`p-2 rounded-lg transition-colors ${
                    selectedReportYear >= currentDate.getFullYear() && selectedReportMonth >= currentDate.getMonth() + 1
                      ? 'opacity-50 cursor-not-allowed'
                      : isDarkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                  title={language === 'ar' ? 'الشهر التالي' : 'Next Month'}
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
                
                <button
                  onClick={() => {
                    setSelectedReportMonth(currentDate.getMonth() + 1);
                    setSelectedReportYear(currentDate.getFullYear());
                  }}
                  className={`px-3 py-2 rounded-lg text-sm ${isDarkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white transition-colors`}
                  title={language === 'ar' ? 'الشهر الحالي' : 'Current Month'}
                >
                  {language === 'ar' ? 'الحالي' : 'Today'}
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Monthly Summary */}
              <div className={`p-6 rounded-lg border ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
                <h4 className="font-semibold mb-4 flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2" />
                  {language === 'ar' ? 'ملخص شهري' : 'Monthly Summary'}
                  <span className="text-sm font-normal text-gray-500 dark:text-gray-400 mr-2">
                    {' - '}
                    {language === 'ar' ? (
                      <>
                        {['', 'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'][selectedReportMonth]}
                        {' ' + selectedReportYear}
                      </>
                    ) : (
                      <>
                        {new Date(selectedReportYear, selectedReportMonth - 1).toLocaleString('en-US', { month: 'long', year: 'numeric' })}
                      </>
                    )}
                  </span>
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>{language === 'ar' ? 'إجمالي الواردات:' : 'Total Income:'}</span>
                    <span className="font-semibold text-green-600 dark:text-green-400">
                      {AccountingService.formatCurrency(getMonthlyIncome())}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>{language === 'ar' ? 'إجمالي الصادرات:' : 'Total Expense:'}</span>
                    <span className="font-semibold text-red-600 dark:text-red-400">
                      {AccountingService.formatCurrency(getMonthlyExpense())}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>{language === 'ar' ? 'صافي الدخل:' : 'Net Income:'}</span>
                    <span className={`font-semibold ${getMonthlyNetIncome() >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {AccountingService.formatCurrency(getMonthlyNetIncome())}
                    </span>
                  </div>
                </div>
              </div>

              {/* Category Breakdown */}
              <div className={`p-6 rounded-lg border ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
                <h4 className="font-semibold mb-4 flex items-center">
                  <PieChart className="w-5 h-5 mr-2" />
                  {language === 'ar' ? 'توزيع الفئات (شهري)' : 'Category Breakdown (Monthly)'}
                </h4>
                <div className="space-y-2">
                  {categories.map(category => {
                    const categoryTransactions = allTransactions.filter(t => {
                      const transactionDate = new Date(t.transaction_date);
                      return t.category_id === category.id &&
                             transactionDate.getMonth() + 1 === selectedReportMonth &&
                             transactionDate.getFullYear() === selectedReportYear;
                    });
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className={`w-full max-w-lg rounded-2xl shadow-2xl transform transition-all ${
            isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
          } animate-in zoom-in-95 duration-200`}>
            {/* Header */}
            <div className={`flex items-center justify-between p-6 border-b ${
              isDarkMode ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${
                  transactionForm.type === 'income'
                    ? 'bg-green-100 dark:bg-green-900/30'
                    : 'bg-red-100 dark:bg-red-900/30'
                }`}>
                  {transactionForm.type === 'income' ? (
                    <TrendingUp className={`w-5 h-5 ${
                      isDarkMode ? 'text-green-400' : 'text-green-600'
                    }`} />
                  ) : (
                    <TrendingDown className={`w-5 h-5 ${
                      isDarkMode ? 'text-red-400' : 'text-red-600'
                    }`} />
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    {editingTransaction 
                      ? (language === 'ar' ? 'تعديل المعاملة' : 'Edit Transaction')
                      : (language === 'ar' ? 'إضافة معاملة جديدة' : 'Add New Transaction')
                    }
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                    {language === 'ar' ? 'أدخل تفاصيل المعاملة المالية' : 'Enter transaction details'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowTransactionForm(false);
                  setEditingTransaction(null);
                }}
                className={`p-2 rounded-lg transition-all ${
                  isDarkMode 
                    ? 'hover:bg-gray-700 text-gray-400 hover:text-gray-200' 
                    : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleTransactionSubmit} className="p-6 space-y-5">
              {/* Type Selection */}
              <div>
                <label className="block text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">
                  {language === 'ar' ? 'نوع المعاملة' : 'Transaction Type'}
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setTransactionForm({ ...transactionForm, type: 'income' })}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      transactionForm.type === 'income'
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20 dark:border-green-500'
                        : isDarkMode
                        ? 'border-gray-600 bg-gray-700/50 hover:border-gray-500'
                        : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <ArrowUpRight className={`w-5 h-5 ${
                        transactionForm.type === 'income'
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-gray-400'
                      }`} />
                      <span className={`font-medium ${
                        transactionForm.type === 'income'
                          ? 'text-green-700 dark:text-green-300'
                          : 'text-gray-500 dark:text-gray-400'
                      }`}>
                        {language === 'ar' ? 'وارد' : 'Income'}
                      </span>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setTransactionForm({ ...transactionForm, type: 'expense' })}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      transactionForm.type === 'expense'
                        ? 'border-red-500 bg-red-50 dark:bg-red-900/20 dark:border-red-500'
                        : isDarkMode
                        ? 'border-gray-600 bg-gray-700/50 hover:border-gray-500'
                        : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <ArrowDownRight className={`w-5 h-5 ${
                        transactionForm.type === 'expense'
                          ? 'text-red-600 dark:text-red-400'
                          : 'text-gray-400'
                      }`} />
                      <span className={`font-medium ${
                        transactionForm.type === 'expense'
                          ? 'text-red-700 dark:text-red-300'
                          : 'text-gray-500 dark:text-gray-400'
                      }`}>
                        {language === 'ar' ? 'صادر' : 'Expense'}
                      </span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Amount */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                  {language === 'ar' ? 'المبلغ' : 'Amount'} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className={`absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={transactionForm.amount || ''}
                    onChange={(e) => setTransactionForm({ ...transactionForm, amount: parseFloat(e.target.value) || 0 })}
                    className={`w-full pl-4 pr-12 py-3 border rounded-xl transition-all ${
                      isDarkMode 
                        ? 'bg-gray-700/50 border-gray-600 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20' 
                        : 'bg-gray-50 border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                    }`}
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                  {language === 'ar' ? 'الفئة' : 'Category'}
                </label>
                <div className="relative">
                  <div className={`absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    <Tag className="w-5 h-5" />
                  </div>
                  <select
                    value={transactionForm.category_id || ''}
                    onChange={(e) => setTransactionForm({ ...transactionForm, category_id: e.target.value || undefined })}
                    className={`w-full pl-4 pr-12 py-3 border rounded-xl transition-all appearance-none ${
                      isDarkMode 
                        ? 'bg-gray-700/50 border-gray-600 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20' 
                        : 'bg-gray-50 border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                    }`}
                  >
                    <option value="">{language === 'ar' ? 'اختر الفئة (اختياري)' : 'Select Category (Optional)'}</option>
                    {categories.filter(c => c.type === transactionForm.type).map(category => (
                      <option key={category.id} value={category.id}>
                        {language === 'ar' ? category.name_ar : language === 'tr' ? category.name_tr : category.name_en}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                  {language === 'ar' ? 'التاريخ' : 'Date'} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className={`absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    <Calendar className="w-5 h-5" />
                  </div>
                  <input
                    type="date"
                    value={transactionForm.transaction_date}
                    onChange={(e) => setTransactionForm({ ...transactionForm, transaction_date: e.target.value })}
                    className={`w-full pl-4 pr-12 py-3 border rounded-xl transition-all ${
                      isDarkMode 
                        ? 'bg-gray-700/50 border-gray-600 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20' 
                        : 'bg-gray-50 border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                    }`}
                    required
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                  {language === 'ar' ? 'الوصف' : 'Description'} ({language === 'ar' ? 'عربي' : 'Arabic'})
                </label>
                <textarea
                  value={transactionForm.description_ar}
                  onChange={(e) => setTransactionForm({ ...transactionForm, description_ar: e.target.value })}
                  className={`w-full px-4 py-3 border rounded-xl transition-all resize-none ${
                    isDarkMode 
                      ? 'bg-gray-700/50 border-gray-600 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20' 
                      : 'bg-gray-50 border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                  }`}
                  rows={3}
                  placeholder={language === 'ar' ? 'أدخل وصفاً للمعاملة...' : 'Enter transaction description...'}
                />
              </div>

              {/* Actions */}
              <div className={`flex items-center justify-end gap-3 pt-4 border-t ${
                isDarkMode ? 'border-gray-700' : 'border-gray-200'
              }`}>
                <button
                  type="button"
                  onClick={() => {
                    setShowTransactionForm(false);
                    setEditingTransaction(null);
                  }}
                  className={`px-5 py-2.5 rounded-xl font-medium transition-all ${
                    isDarkMode
                      ? 'text-gray-400 hover:bg-gray-700 hover:text-gray-200'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
                  }`}
                >
                  {language === 'ar' ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl font-medium"
                >
                  <Save className="w-4 h-4" />
                  {language === 'ar' ? 'حفظ المعاملة' : 'Save Transaction'}
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
            <h3 className="text-xl font-bold">
              {language === 'ar' ? 'إدارة الميزانيات' : 'Budget Management'}
            </h3>
            <button
              onClick={() => {
                setEditingBudget(null);
                resetBudgetForm();
                setShowBudgetForm(true);
              }}
              className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              {language === 'ar' ? 'إضافة ميزانية' : 'Add Budget'}
            </button>
          </div>

          {/* Budgets List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {budgets.map((budget) => {
              const percentageUsed = budget.percentage_used || 0;
              const isOverBudget = percentageUsed > 100;
              const isWarning = percentageUsed > 80;
              
              return (
                <div key={budget.id} className={`rounded-lg border ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'} shadow-lg`}>
                  <div className={`p-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-lg">
                        {language === 'ar' ? budget.name_ar : language === 'tr' ? budget.name_tr : budget.name_en}
                      </h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        budget.type === 'income' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}>
                        {budget.type === 'income' 
                          ? (language === 'ar' ? 'وارد' : 'Income')
                          : (language === 'ar' ? 'صادر' : 'Expense')
                        }
                      </span>
                    </div>
                    {budget.description_ar && (
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {language === 'ar' ? budget.description_ar : language === 'tr' ? budget.description_tr : budget.description_en}
                      </p>
                    )}
                  </div>
                  
                  <div className="p-4 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        {language === 'ar' ? 'الميزانية:' : 'Budget:'}
                      </span>
                      <span className="font-semibold">
                        {AccountingService.formatCurrency(budget.amount)}
                      </span>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        {language === 'ar' ? 'المُنفق:' : 'Spent:'}
                      </span>
                      <span className="font-semibold">
                        {AccountingService.formatCurrency(budget.spent || 0)}
                      </span>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        {language === 'ar' ? 'المتبقي:' : 'Remaining:'}
                      </span>
                      <span className={`font-semibold ${(budget.remaining || 0) < 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {AccountingService.formatCurrency(budget.remaining || 0)}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-3">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-600 dark:text-gray-400">
                          {language === 'ar' ? 'نسبة الاستخدام:' : 'Usage:'}
                        </span>
                        <span className={`font-semibold ${isOverBudget ? 'text-red-600' : isWarning ? 'text-orange-600' : 'text-green-600'}`}>
                          {percentageUsed.toFixed(1)}%
                        </span>
                      </div>
                      <div className={`w-full h-2 rounded-full overflow-hidden ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                        <div 
                          className={`h-full transition-all duration-300 ${
                            isOverBudget ? 'bg-red-500' : isWarning ? 'bg-orange-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${Math.min(percentageUsed, 100)}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
                      <span>
                        {AccountingService.formatDate(budget.period_start)} - {AccountingService.formatDate(budget.period_end)}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <button
                        onClick={() => handleEditBudget(budget)}
                        className="flex-1 px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm"
                      >
                        <Edit className="w-4 h-4 mr-1 inline" />
                        {language === 'ar' ? 'تعديل' : 'Edit'}
                      </button>
                      <button
                        onClick={() => handleDeleteBudget(budget.id)}
                        className="flex-1 px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors text-sm"
                      >
                        <Trash2 className="w-4 h-4 mr-1 inline" />
                        {language === 'ar' ? 'حذف' : 'Delete'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
            
            {budgets.length === 0 && (
              <div className="col-span-2 text-center py-12 text-gray-500">
                {language === 'ar' ? 'لا توجد ميزانيات' : 'No budgets found'}
              </div>
            )}
          </div>

          {/* Budget Form Modal */}
          {showBudgetForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className={`w-full max-w-2xl rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-xl`}>
                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold">
                      {editingBudget 
                        ? (language === 'ar' ? 'تعديل الميزانية' : 'Edit Budget')
                        : (language === 'ar' ? 'إضافة ميزانية جديدة' : 'Add New Budget')
                      }
                    </h3>
                    <button
                      onClick={() => {
                        setShowBudgetForm(false);
                        setEditingBudget(null);
                        resetBudgetForm();
                      }}
                      className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>

                  <form onSubmit={handleBudgetSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          {language === 'ar' ? 'الاسم (عربي) *' : 'Name (Arabic) *'}
                        </label>
                        <input
                          type="text"
                          value={budgetForm.name_ar}
                          onChange={(e) => setBudgetForm({ ...budgetForm, name_ar: e.target.value })}
                          className={`w-full px-3 py-2 border rounded-md ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">
                          {language === 'ar' ? 'النوع *' : 'Type *'}
                        </label>
                        <select
                          value={budgetForm.type}
                          onChange={(e) => setBudgetForm({ ...budgetForm, type: e.target.value as 'income' | 'expense' })}
                          className={`w-full px-3 py-2 border rounded-md ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                          required
                        >
                          <option value="income">{language === 'ar' ? 'وارد' : 'Income'}</option>
                          <option value="expense">{language === 'ar' ? 'صادر' : 'Expense'}</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">
                          {language === 'ar' ? 'المبلغ *' : 'Amount *'}
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={budgetForm.amount}
                          onChange={(e) => setBudgetForm({ ...budgetForm, amount: parseFloat(e.target.value) || 0 })}
                          className={`w-full px-3 py-2 border rounded-md ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">
                          {language === 'ar' ? 'الفئة' : 'Category'}
                        </label>
                        <select
                          value={budgetForm.category_id || ''}
                          onChange={(e) => setBudgetForm({ ...budgetForm, category_id: e.target.value || undefined })}
                          className={`w-full px-3 py-2 border rounded-md ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                        >
                          <option value="">{language === 'ar' ? 'اختر الفئة' : 'Select Category'}</option>
                          {categories.filter(c => c.type === budgetForm.type).map(category => (
                            <option key={category.id} value={category.id}>
                              {language === 'ar' ? category.name_ar : language === 'tr' ? category.name_tr : category.name_en}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">
                          {language === 'ar' ? 'تاريخ البداية *' : 'Start Date *'}
                        </label>
                        <input
                          type="date"
                          value={budgetForm.period_start}
                          onChange={(e) => setBudgetForm({ ...budgetForm, period_start: e.target.value })}
                          className={`w-full px-3 py-2 border rounded-md ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">
                          {language === 'ar' ? 'تاريخ النهاية *' : 'End Date *'}
                        </label>
                        <input
                          type="date"
                          value={budgetForm.period_end}
                          onChange={(e) => setBudgetForm({ ...budgetForm, period_end: e.target.value })}
                          className={`w-full px-3 py-2 border rounded-md ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        {language === 'ar' ? 'الوصف (عربي)' : 'Description (Arabic)'}
                      </label>
                      <textarea
                        value={budgetForm.description_ar}
                        onChange={(e) => setBudgetForm({ ...budgetForm, description_ar: e.target.value })}
                        className={`w-full px-3 py-2 border rounded-md ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                        rows={3}
                      />
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                      <button
                        type="button"
                        onClick={() => {
                          setShowBudgetForm(false);
                          setEditingBudget(null);
                          resetBudgetForm();
                        }}
                        className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                      >
                        {language === 'ar' ? 'إلغاء' : 'Cancel'}
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50"
                      >
                        {loading 
                          ? (language === 'ar' ? 'جاري الحفظ...' : 'Saving...')
                          : (editingBudget ? (language === 'ar' ? 'تحديث الميزانية' : 'Update Budget') : (language === 'ar' ? 'إنشاء الميزانية' : 'Create Budget'))
                        }
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Invoices Tab */}
      {activeTab === 'invoices' && (
        <div className="space-y-6">
          {/* Invoice Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">إجمالي الفواتير</p>
                  <p className="text-2xl font-bold">{invoiceStats.total}</p>
                </div>
                <FileTextIcon className="w-6 h-6 text-blue-200" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">مدفوعة</p>
                  <p className="text-2xl font-bold">{invoiceStats.paid}</p>
                </div>
                <CheckCircle className="w-6 h-6 text-green-200" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm">متأخرة</p>
                  <p className="text-2xl font-bold">{invoiceStats.overdue}</p>
                </div>
                <AlertCircle className="w-6 h-6 text-orange-200" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">المبلغ المستحق</p>
                  <p className="text-2xl font-bold">{invoiceStats.pendingAmount.toLocaleString()} ₺</p>
                </div>
                <DollarSign className="w-6 h-6 text-purple-200" />
              </div>
            </div>
          </div>

          {/* Customers Management Section */}
          <div className={`rounded-xl border ${isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200 shadow-sm'} p-6 mb-6`}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  {language === 'ar' ? 'إدارة العملاء' : 'Customers Management'}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {language === 'ar' ? 'إدارة بيانات العملاء ومتابعة حساباتهم المالية' : 'Manage customer data and track their financial accounts'}
                </p>
              </div>
              <button
                onClick={() => {
                  setEditingCustomer(null);
                  setCustomerForm({
                    name_ar: '',
                    name_en: '',
                    name_tr: '',
                    email: '',
                    phone: '',
                    address: '',
                    city: '',
                    country: '',
                    tax_id: '',
                    notes_ar: '',
                    notes_en: '',
                    notes_tr: '',
                    credit_limit: 0,
                    payment_terms: '',
                    status: 'active'
                  });
                  setShowCustomerForm(true);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                <Plus className="w-4 h-4" />
                {language === 'ar' ? 'إضافة عميل جديد' : 'Add New Customer'}
              </button>
            </div>

            {/* Customer Search and Filter */}
            <div className="flex flex-wrap items-center gap-4 mb-4">
              <div className="flex items-center gap-2 flex-1 min-w-[250px]">
                <Search className="w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  placeholder={language === 'ar' ? 'البحث في العملاء...' : 'Search customers...'}
                  value={customerSearchTerm}
                  onChange={(e) => setCustomerSearchTerm(e.target.value)}
                  className={`flex-1 px-3 py-2 border rounded-lg ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-gray-50 border-gray-300 text-gray-900'
                  }`}
                />
              </div>
              <select
                value={customerFilterStatus}
                onChange={(e) => setCustomerFilterStatus(e.target.value as any)}
                className={`px-3 py-2 border rounded-lg ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-gray-50 border-gray-300 text-gray-900'
                }`}
              >
                <option value="all">{language === 'ar' ? 'جميع الحالات' : 'All Status'}</option>
                <option value="active">{language === 'ar' ? 'نشط' : 'Active'}</option>
                <option value="inactive">{language === 'ar' ? 'غير نشط' : 'Inactive'}</option>
                <option value="suspended">{language === 'ar' ? 'معلق' : 'Suspended'}</option>
              </select>
            </div>

            {/* Customers List */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className={`${isDarkMode ? 'bg-gray-800/80' : 'bg-gray-50'} border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <tr>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                      {language === 'ar' ? 'اسم العميل' : 'Customer Name'}
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                      {language === 'ar' ? 'البريد الإلكتروني' : 'Email'}
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                      {language === 'ar' ? 'الهاتف' : 'Phone'}
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                      {language === 'ar' ? 'إجمالي الفواتير' : 'Total Invoiced'}
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                      {language === 'ar' ? 'المبلغ المستحق' : 'Outstanding'}
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                      {language === 'ar' ? 'الحالة' : 'Status'}
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                      {language === 'ar' ? 'الإجراءات' : 'Actions'}
                    </th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDarkMode ? 'divide-gray-700/50' : 'divide-gray-100'}`}>
                  {customers
                    .filter(customer => {
                      const matchesStatus = customerFilterStatus === 'all' || customer.status === customerFilterStatus;
                      const searchTerm = customerSearchTerm.toLowerCase();
                      const matchesSearch = 
                        (customer.name_ar?.toLowerCase().includes(searchTerm)) ||
                        (customer.name_en?.toLowerCase().includes(searchTerm)) ||
                        (customer.name_tr?.toLowerCase().includes(searchTerm)) ||
                        (customer.email?.toLowerCase().includes(searchTerm)) ||
                        (customer.phone?.toLowerCase().includes(searchTerm));
                      return matchesStatus && matchesSearch;
                    })
                    .map((customer) => (
                    <tr 
                      key={customer.id} 
                      className={`transition-all duration-200 ${
                        isDarkMode 
                          ? 'hover:bg-gray-700/50' 
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-gray-400" />
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {language === 'ar' ? customer.name_ar : language === 'tr' ? customer.name_tr : customer.name_en}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {customer.email || '-'}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {customer.phone || '-'}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {CustomerService.formatCurrency(customer.total_invoiced)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`text-sm font-bold ${
                          customer.total_outstanding > 0 
                            ? 'text-red-600 dark:text-red-400' 
                            : 'text-green-600 dark:text-green-400'
                        }`}>
                          {CustomerService.formatCurrency(customer.total_outstanding)}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          customer.status === 'active' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'
                            : customer.status === 'inactive'
                            ? 'bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-300'
                            : 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'
                        }`}>
                          {customer.status === 'active' 
                            ? (language === 'ar' ? 'نشط' : 'Active')
                            : customer.status === 'inactive'
                            ? (language === 'ar' ? 'غير نشط' : 'Inactive')
                            : (language === 'ar' ? 'معلق' : 'Suspended')
                          }
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 justify-end">
                          <button
                            onClick={() => handleViewCustomerDetails(customer)}
                            className={`p-2 rounded-lg transition-all ${
                              isDarkMode
                                ? 'text-blue-400 hover:bg-blue-900/30 hover:text-blue-300'
                                : 'text-blue-600 hover:bg-blue-50 hover:text-blue-700'
                            }`}
                            title={language === 'ar' ? 'عرض التفاصيل المالية' : 'View Financial Details'}
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEditCustomer(customer)}
                            className={`p-2 rounded-lg transition-all ${
                              isDarkMode
                                ? 'text-blue-400 hover:bg-blue-900/30 hover:text-blue-300'
                                : 'text-blue-600 hover:bg-blue-50 hover:text-blue-700'
                            }`}
                            title={language === 'ar' ? 'تعديل' : 'Edit'}
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteCustomer(customer.id)}
                            className={`p-2 rounded-lg transition-all ${
                              isDarkMode
                                ? 'text-red-400 hover:bg-red-900/30 hover:text-red-300'
                                : 'text-red-600 hover:bg-red-50 hover:text-red-700'
                            }`}
                            title={language === 'ar' ? 'حذف' : 'Delete'}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {customers.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {language === 'ar' ? 'لا يوجد عملاء' : 'No customers found'}
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Invoice Controls */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('Create invoice button clicked');
                  try {
                    resetInvoiceForm();
                    setShowInvoiceForm(true);
                    setEditingInvoice(null);
                    console.log('Invoice form should be visible now');
                  } catch (error) {
                    console.error('Error opening invoice form:', error);
                  }
                }}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                type="button"
              >
                <Plus className="w-4 h-4 mr-2 inline" />
                {language === 'ar' ? 'إنشاء فاتورة' : 'Create Invoice'}
              </button>

              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  placeholder={language === 'ar' ? 'البحث في الفواتير...' : 'Search invoices...'}
                  value={invoiceSearchTerm}
                  onChange={(e) => setInvoiceSearchTerm(e.target.value)}
                  className={`px-3 py-2 border rounded-md ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300'
                  }`}
                />
              </div>

              <select
                value={invoiceFilterStatus}
                onChange={(e) => setInvoiceFilterStatus(e.target.value as any)}
                className={`px-3 py-2 border rounded-md ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300'
                }`}
              >
                <option value="all">{language === 'ar' ? 'جميع الحالات' : 'All Status'}</option>
                <option value="draft">{language === 'ar' ? 'مسودة' : 'Draft'}</option>
                <option value="sent">{language === 'ar' ? 'مرسلة' : 'Sent'}</option>
                <option value="paid">{language === 'ar' ? 'مدفوعة' : 'Paid'}</option>
                <option value="overdue">{language === 'ar' ? 'متأخرة' : 'Overdue'}</option>
                <option value="cancelled">{language === 'ar' ? 'ملغاة' : 'Cancelled'}</option>
              </select>
            </div>

            <button
              onClick={() => {
                loadInvoices();
                loadCustomers();
              }}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <RefreshCw className="w-4 h-4 mr-2 inline" />
              {language === 'ar' ? 'تحديث' : 'Refresh'}
            </button>
          </div>

          {/* Invoices List */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      رقم الفاتورة
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      العميل
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      التاريخ
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      المبلغ
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      الحالة
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      الإجراءات
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {invoices
                    .filter(invoice => {
                      const matchesStatus = invoiceFilterStatus === 'all' || invoice.status === invoiceFilterStatus;
                      const matchesSearch = invoice.client_name.toLowerCase().includes(invoiceSearchTerm.toLowerCase()) ||
                                          invoice.invoice_number.toLowerCase().includes(invoiceSearchTerm.toLowerCase());
                      return matchesStatus && matchesSearch;
                    })
                    .map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {invoice.invoice_number}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        {invoice.client_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        {InvoiceService.formatDate(invoice.issue_date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {InvoiceService.formatCurrency(invoice.total_amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          invoice.status === 'paid' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                          invoice.status === 'sent' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                          invoice.status === 'overdue' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                          invoice.status === 'draft' ? 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200' :
                          'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
                        }`}>
                          {invoice.status === 'paid' ? 'مدفوعة' :
                           invoice.status === 'sent' ? 'مرسلة' :
                           invoice.status === 'overdue' ? 'متأخرة' :
                           invoice.status === 'draft' ? 'مسودة' :
                           'ملغاة'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setEditingInvoice(invoice);
                              setInvoiceForm({
                                client_name: invoice.client_name,
                                client_email: invoice.client_email || '',
                                client_phone: invoice.client_phone || '',
                                client_address: invoice.client_address || '',
                                issue_date: invoice.issue_date,
                                due_date: invoice.due_date,
                                tax_rate: invoice.tax_rate,
                                notes_ar: invoice.notes_ar || '',
                                notes_en: invoice.notes_en || '',
                                notes_tr: invoice.notes_tr || '',
                                items: invoice.items.map(item => ({
                                  description_ar: item.description_ar,
                                  description_en: item.description_en,
                                  description_tr: item.description_tr,
                                  quantity: item.quantity,
                                  unit_price: item.unit_price
                                }))
                              });
                              setShowInvoiceForm(true);
                            }}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          
                          {invoice.status === 'draft' && (
                            <button
                              onClick={() => updateInvoiceStatus(invoice.id, 'sent')}
                              className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                            >
                              <Send className="w-4 h-4" />
                            </button>
                          )}
                          
                          {invoice.status === 'sent' && (
                            <button
                              onClick={() => updateInvoiceStatus(invoice.id, 'paid')}
                              className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}
                          
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              deleteInvoice(invoice.id);
                            }}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded p-1 transition-colors"
                            title="حذف الفاتورة"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          
                          <button
                            onClick={() => printInvoice(invoice)}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                            title="طباعة الفاتورة"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Invoice Form Modal */}
          {showInvoiceForm && (
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" 
              onClick={(e) => {
                if (e.target === e.currentTarget) {
                  setShowInvoiceForm(false);
                  setEditingInvoice(null);
                  resetInvoiceForm();
                }
              }}
              style={{ zIndex: 9999 }}
            >
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold">
                      {editingInvoice ? 'تعديل الفاتورة' : 'إنشاء فاتورة جديدة'}
                    </h3>
                    <button
                      onClick={() => {
                        setShowInvoiceForm(false);
                        setEditingInvoice(null);
                        resetInvoiceForm();
                      }}
                      className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>

                  <form onSubmit={handleInvoiceSubmit} className="space-y-6">
                    {/* Client Information */}
                    <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                          {language === 'ar' ? 'معلومات العميل' : 'Client Information'}
                        </h4>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setInvoiceCustomerMode('select');
                              setInvoiceForm({ ...invoiceForm, customer_id: '', client_name: '', client_email: '', client_phone: '', client_address: '' });
                            }}
                            className={`px-3 py-1.5 text-xs rounded-lg transition-all ${
                              invoiceCustomerMode === 'select'
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500'
                            }`}
                          >
                            {language === 'ar' ? 'اختيار عميل موجود' : 'Select Existing'}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setInvoiceCustomerMode('new');
                              setInvoiceForm({ ...invoiceForm, customer_id: '' });
                            }}
                            className={`px-3 py-1.5 text-xs rounded-lg transition-all ${
                              invoiceCustomerMode === 'new'
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500'
                            }`}
                          >
                            {language === 'ar' ? 'إضافة عميل جديد' : 'Add New Customer'}
                          </button>
                        </div>
                      </div>
                      
                      {invoiceCustomerMode === 'select' ? (
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            {language === 'ar' ? 'اختر عميلاً' : 'Select Customer'} *
                          </label>
                          <select
                            value={invoiceForm.customer_id || ''}
                            onChange={(e) => {
                              const selectedCustomer = customers.find(c => c.id === e.target.value);
                              setInvoiceForm({
                                ...invoiceForm,
                                customer_id: e.target.value,
                                client_name: selectedCustomer ? (language === 'ar' ? selectedCustomer.name_ar : language === 'tr' ? selectedCustomer.name_tr : selectedCustomer.name_en) : '',
                                client_email: selectedCustomer?.email || '',
                                client_phone: selectedCustomer?.phone || '',
                                client_address: selectedCustomer?.address || ''
                              });
                            }}
                            className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                            required
                          >
                            <option value="">{language === 'ar' ? '-- اختر عميلاً --' : '-- Select Customer --'}</option>
                            {customers.filter(c => c.status === 'active').map(customer => (
                              <option key={customer.id} value={customer.id}>
                                {language === 'ar' ? customer.name_ar : language === 'tr' ? customer.name_tr : customer.name_en}
                                {customer.email ? ` (${customer.email})` : ''}
                              </option>
                            ))}
                          </select>
                          {customers.length === 0 && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                              {language === 'ar' ? 'لا يوجد عملاء. اضغط على "إضافة عميل جديد" لإضافة عميل.' : 'No customers found. Click "Add New Customer" to add one.'}
                            </p>
                          )}
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">
                              {language === 'ar' ? 'اسم العميل' : 'Customer Name'} *
                            </label>
                            <input
                              type="text"
                              value={invoiceForm.client_name}
                              onChange={(e) => setInvoiceForm({ ...invoiceForm, client_name: e.target.value })}
                              className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                              required
                            />
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Client Details (shown for both modes) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          {language === 'ar' ? 'البريد الإلكتروني' : 'Email'}
                        </label>
                        <input
                          type="email"
                          value={invoiceForm.client_email}
                          onChange={(e) => setInvoiceForm({ ...invoiceForm, client_email: e.target.value })}
                          className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">
                          {language === 'ar' ? 'رقم الهاتف' : 'Phone'}
                        </label>
                        <input
                          type="tel"
                          value={invoiceForm.client_phone}
                          onChange={(e) => setInvoiceForm({ ...invoiceForm, client_phone: e.target.value })}
                          className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium mb-2">
                          {language === 'ar' ? 'العنوان' : 'Address'}
                        </label>
                        <input
                          type="text"
                          value={invoiceForm.client_address}
                          onChange={(e) => setInvoiceForm({ ...invoiceForm, client_address: e.target.value })}
                          className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                        />
                      </div>
                    </div>

                    {/* Invoice Details */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">تاريخ الإصدار *</label>
                        <input
                          type="date"
                          value={invoiceForm.issue_date}
                          onChange={(e) => setInvoiceForm({ ...invoiceForm, issue_date: e.target.value })}
                          className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">تاريخ الاستحقاق *</label>
                        <input
                          type="date"
                          value={invoiceForm.due_date}
                          onChange={(e) => setInvoiceForm({ ...invoiceForm, due_date: e.target.value })}
                          className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">معدل الضريبة (%)</label>
                        <input
                          type="number"
                          value={invoiceForm.tax_rate}
                          onChange={(e) => setInvoiceForm({ ...invoiceForm, tax_rate: parseFloat(e.target.value) || 0 })}
                          className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                          min="0"
                          max="100"
                          step="0.01"
                        />
                      </div>
                    </div>

                    {/* Invoice Items */}
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-semibold">عناصر الفاتورة</h4>
                        <button
                          type="button"
                          onClick={addInvoiceItem}
                          className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                        >
                          <Plus className="w-4 h-4 mr-1 inline" />
                          إضافة عنصر
                        </button>
                      </div>

                      <div className="space-y-4">
                        {invoiceForm.items.map((item, index) => (
                          <div key={index} className="grid grid-cols-1 md:grid-cols-6 gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <div className="md:col-span-2">
                              <label className="block text-sm font-medium mb-1">الوصف (عربي) *</label>
                              <input
                                type="text"
                                value={item.description_ar}
                                onChange={(e) => updateInvoiceItem(index, 'description_ar', e.target.value)}
                                className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-600 border-gray-300 dark:border-gray-500"
                                required
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium mb-1">الكمية *</label>
                              <input
                                type="number"
                                value={item.quantity}
                                onChange={(e) => updateInvoiceItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                                className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-600 border-gray-300 dark:border-gray-500"
                                min="0"
                                step="0.01"
                                required
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium mb-1">سعر الوحدة *</label>
                              <input
                                type="number"
                                value={item.unit_price}
                                onChange={(e) => updateInvoiceItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                                className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-600 border-gray-300 dark:border-gray-500"
                                min="0"
                                step="0.01"
                                required
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium mb-1">المجموع</label>
                              <input
                                type="text"
                                value={InvoiceService.formatCurrency(item.quantity * item.unit_price)}
                                className="w-full px-3 py-2 border rounded-md bg-gray-100 dark:bg-gray-500 border-gray-300 dark:border-gray-500"
                                readOnly
                              />
                            </div>

                            <div className="flex items-end">
                              {invoiceForm.items.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => removeInvoiceItem(index)}
                                  className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Invoice Totals */}
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <div className="flex justify-end">
                        <div className="w-64 space-y-2">
                          <div className="flex justify-between">
                            <span>المجموع الفرعي:</span>
                            <span>{InvoiceService.formatCurrency(calculateInvoiceTotals().subtotal)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>الضريبة ({invoiceForm.tax_rate}%):</span>
                            <span>{InvoiceService.formatCurrency(calculateInvoiceTotals().taxAmount)}</span>
                          </div>
                          <div className="flex justify-between font-bold text-lg border-t pt-2">
                            <span>المجموع الكلي:</span>
                            <span>{InvoiceService.formatCurrency(calculateInvoiceTotals().totalAmount)}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Notes */}
                    <div>
                      <label className="block text-sm font-medium mb-2">ملاحظات (عربي)</label>
                      <textarea
                        value={invoiceForm.notes_ar}
                        onChange={(e) => setInvoiceForm({ ...invoiceForm, notes_ar: e.target.value })}
                        className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                        rows={3}
                      />
                    </div>

                    {/* Form Actions */}
                    <div className="flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={() => {
                          setShowInvoiceForm(false);
                          setEditingInvoice(null);
                          resetInvoiceForm();
                        }}
                        className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                      >
                        إلغاء
                      </button>
                      
                      {editingInvoice && (
                        <button
                          type="button"
                          onClick={() => printInvoice(editingInvoice)}
                          className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
                        >
                          <Printer className="w-4 h-4 mr-2 inline" />
                          طباعة الفاتورة
                        </button>
                      )}
                      
                      <button
                        type="submit"
                        disabled={loading}
                        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50"
                      >
                        {loading ? 'جاري الحفظ...' : (editingInvoice ? 'تحديث الفاتورة' : 'إنشاء الفاتورة')}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Payments Tab */}
      {activeTab === 'payments' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold">
              {language === 'ar' ? 'تتبع المدفوعات' : 'Payment Tracking'}
            </h3>
            <button
              onClick={() => {
                setEditingPayment(null);
                resetPaymentForm();
                setShowPaymentForm(true);
              }}
              className="flex items-center px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              {language === 'ar' ? 'إضافة دفعة' : 'Add Payment'}
            </button>
          </div>

          {/* Payments List */}
          <div className={`rounded-lg border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className={`${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {language === 'ar' ? 'المبلغ' : 'Amount'}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {language === 'ar' ? 'طريقة الدفع' : 'Payment Method'}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {language === 'ar' ? 'التاريخ' : 'Date'}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {language === 'ar' ? 'الحالة' : 'Status'}
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
                  ) : payments.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                        {language === 'ar' ? 'لا توجد مدفوعات' : 'No payments found'}
                      </td>
                    </tr>
                  ) : (
                    payments.map((payment) => (
                      <tr key={payment.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                          {AccountingService.formatCurrency(payment.amount)}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {language === 'ar' 
                            ? payment.payment_method === 'cash' ? 'نقدي' :
                              payment.payment_method === 'bank_transfer' ? 'تحويل بنكي' :
                              payment.payment_method === 'credit_card' ? 'بطاقة ائتمانية' :
                              payment.payment_method === 'check' ? 'شيك' : 'أخرى'
                            : payment.payment_method === 'cash' ? 'Cash' :
                              payment.payment_method === 'bank_transfer' ? 'Bank Transfer' :
                              payment.payment_method === 'credit_card' ? 'Credit Card' :
                              payment.payment_method === 'check' ? 'Check' : 'Other'
                          }
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {AccountingService.formatDate(payment.payment_date)}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <select
                            value={payment.status}
                            onChange={async (e) => {
                              try {
                                setLoading(true);
                                await AccountingService.updatePaymentStatus(payment.id, e.target.value as Payment['status']);
                                await loadPayments();
                              } catch (error) {
                                console.error('Error updating payment status:', error);
                                alert('حدث خطأ في تحديث الحالة: ' + (error as Error).message);
                              } finally {
                                setLoading(false);
                              }
                            }}
                            className={`text-xs font-semibold rounded-full px-3 py-1 border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-1 transition-all ${
                              payment.status === 'completed' 
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 hover:bg-green-200 dark:hover:bg-green-800 focus:ring-green-500'
                                : payment.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 hover:bg-yellow-200 dark:hover:bg-yellow-800 focus:ring-yellow-500'
                                : payment.status === 'failed'
                                ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 hover:bg-red-200 dark:hover:bg-red-800 focus:ring-red-500'
                                : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-800 focus:ring-gray-500'
                            } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            disabled={loading}
                          >
                            <option value="pending">{language === 'ar' ? 'قيد الانتظار' : 'Pending'}</option>
                            <option value="completed">{language === 'ar' ? 'مكتمل' : 'Completed'}</option>
                            <option value="failed">{language === 'ar' ? 'فشل' : 'Failed'}</option>
                            <option value="refunded">{language === 'ar' ? 'مسترد' : 'Refunded'}</option>
                          </select>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEditPayment(payment)}
                              className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeletePayment(payment.id)}
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

      {/* Customer Form Modal */}
      {showCustomerForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className={`w-full max-w-2xl rounded-2xl shadow-2xl transform transition-all ${
            isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
          } animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto`}>
            {/* Header */}
            <div className={`flex items-center justify-between p-6 border-b sticky top-0 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-blue-900/30' : 'bg-blue-100'}`}>
                  <Users className={`w-5 h-5 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    {editingCustomer 
                      ? (language === 'ar' ? 'تعديل العميل' : 'Edit Customer')
                      : (language === 'ar' ? 'إضافة عميل جديد' : 'Add New Customer')
                    }
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                    {language === 'ar' ? 'أدخل بيانات العميل' : 'Enter customer information'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowCustomerForm(false);
                  setEditingCustomer(null);
                }}
                className={`p-2 rounded-lg transition-all ${
                  isDarkMode 
                    ? 'hover:bg-gray-700 text-gray-400 hover:text-gray-200' 
                    : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCustomerSubmit} className="p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Name Arabic */}
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                    {language === 'ar' ? 'الاسم (عربي)' : 'Name (Arabic)'}
                  </label>
                  <input
                    type="text"
                    value={customerForm.name_ar || ''}
                    onChange={(e) => setCustomerForm({ ...customerForm, name_ar: e.target.value })}
                    className={`w-full px-4 py-3 border rounded-xl transition-all ${
                      isDarkMode 
                        ? 'bg-gray-700/50 border-gray-600 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20' 
                        : 'bg-gray-50 border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                    }`}
                  />
                </div>

                {/* Name English */}
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                    {language === 'ar' ? 'الاسم (إنجليزي)' : 'Name (English)'} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={customerForm.name_en}
                    onChange={(e) => setCustomerForm({ ...customerForm, name_en: e.target.value })}
                    className={`w-full px-4 py-3 border rounded-xl transition-all ${
                      isDarkMode 
                        ? 'bg-gray-700/50 border-gray-600 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20' 
                        : 'bg-gray-50 border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                    }`}
                    required
                  />
                </div>

                {/* Name Turkish */}
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                    {language === 'ar' ? 'الاسم (تركي)' : 'Name (Turkish)'}
                  </label>
                  <input
                    type="text"
                    value={customerForm.name_tr || ''}
                    onChange={(e) => setCustomerForm({ ...customerForm, name_tr: e.target.value })}
                    className={`w-full px-4 py-3 border rounded-xl transition-all ${
                      isDarkMode 
                        ? 'bg-gray-700/50 border-gray-600 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20' 
                        : 'bg-gray-50 border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                    }`}
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                    {language === 'ar' ? 'البريد الإلكتروني' : 'Email'}
                  </label>
                  <input
                    type="email"
                    value={customerForm.email || ''}
                    onChange={(e) => setCustomerForm({ ...customerForm, email: e.target.value })}
                    className={`w-full px-4 py-3 border rounded-xl transition-all ${
                      isDarkMode 
                        ? 'bg-gray-700/50 border-gray-600 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20' 
                        : 'bg-gray-50 border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                    }`}
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                    {language === 'ar' ? 'الهاتف' : 'Phone'}
                  </label>
                  <input
                    type="tel"
                    value={customerForm.phone || ''}
                    onChange={(e) => setCustomerForm({ ...customerForm, phone: e.target.value })}
                    className={`w-full px-4 py-3 border rounded-xl transition-all ${
                      isDarkMode 
                        ? 'bg-gray-700/50 border-gray-600 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20' 
                        : 'bg-gray-50 border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                    }`}
                  />
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                    {language === 'ar' ? 'الحالة' : 'Status'}
                  </label>
                  <select
                    value={customerForm.status}
                    onChange={(e) => setCustomerForm({ ...customerForm, status: e.target.value as any })}
                    className={`w-full px-4 py-3 border rounded-xl transition-all ${
                      isDarkMode 
                        ? 'bg-gray-700/50 border-gray-600 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20' 
                        : 'bg-gray-50 border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                    }`}
                  >
                    <option value="active">{language === 'ar' ? 'نشط' : 'Active'}</option>
                    <option value="inactive">{language === 'ar' ? 'غير نشط' : 'Inactive'}</option>
                    <option value="suspended">{language === 'ar' ? 'معلق' : 'Suspended'}</option>
                  </select>
                </div>

                {/* Address */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                    {language === 'ar' ? 'العنوان' : 'Address'}
                  </label>
                  <input
                    type="text"
                    value={customerForm.address || ''}
                    onChange={(e) => setCustomerForm({ ...customerForm, address: e.target.value })}
                    className={`w-full px-4 py-3 border rounded-xl transition-all ${
                      isDarkMode 
                        ? 'bg-gray-700/50 border-gray-600 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20' 
                        : 'bg-gray-50 border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                    }`}
                  />
                </div>

                {/* City */}
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                    {language === 'ar' ? 'المدينة' : 'City'}
                  </label>
                  <input
                    type="text"
                    value={customerForm.city || ''}
                    onChange={(e) => setCustomerForm({ ...customerForm, city: e.target.value })}
                    className={`w-full px-4 py-3 border rounded-xl transition-all ${
                      isDarkMode 
                        ? 'bg-gray-700/50 border-gray-600 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20' 
                        : 'bg-gray-50 border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                    }`}
                  />
                </div>

                {/* Country */}
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                    {language === 'ar' ? 'الدولة' : 'Country'}
                  </label>
                  <input
                    type="text"
                    value={customerForm.country || ''}
                    onChange={(e) => setCustomerForm({ ...customerForm, country: e.target.value })}
                    className={`w-full px-4 py-3 border rounded-xl transition-all ${
                      isDarkMode 
                        ? 'bg-gray-700/50 border-gray-600 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20' 
                        : 'bg-gray-50 border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                    }`}
                  />
                </div>

                {/* Tax ID */}
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                    {language === 'ar' ? 'الرقم الضريبي' : 'Tax ID'}
                  </label>
                  <input
                    type="text"
                    value={customerForm.tax_id || ''}
                    onChange={(e) => setCustomerForm({ ...customerForm, tax_id: e.target.value })}
                    className={`w-full px-4 py-3 border rounded-xl transition-all ${
                      isDarkMode 
                        ? 'bg-gray-700/50 border-gray-600 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20' 
                        : 'bg-gray-50 border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                    }`}
                  />
                </div>

                {/* Credit Limit */}
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                    {language === 'ar' ? 'حد الائتمان' : 'Credit Limit'}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={customerForm.credit_limit || 0}
                    onChange={(e) => setCustomerForm({ ...customerForm, credit_limit: parseFloat(e.target.value) || 0 })}
                    className={`w-full px-4 py-3 border rounded-xl transition-all ${
                      isDarkMode 
                        ? 'bg-gray-700/50 border-gray-600 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20' 
                        : 'bg-gray-50 border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                    }`}
                  />
                </div>

                {/* Payment Terms */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                    {language === 'ar' ? 'شروط الدفع' : 'Payment Terms'}
                  </label>
                  <input
                    type="text"
                    value={customerForm.payment_terms || ''}
                    onChange={(e) => setCustomerForm({ ...customerForm, payment_terms: e.target.value })}
                    className={`w-full px-4 py-3 border rounded-xl transition-all ${
                      isDarkMode 
                        ? 'bg-gray-700/50 border-gray-600 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20' 
                        : 'bg-gray-50 border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                    }`}
                    placeholder={language === 'ar' ? 'مثال: الدفع خلال 30 يوم' : 'e.g., Payment within 30 days'}
                  />
                </div>

                {/* Notes */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                    {language === 'ar' ? 'ملاحظات (عربي)' : 'Notes (Arabic)'}
                  </label>
                  <textarea
                    value={customerForm.notes_ar || ''}
                    onChange={(e) => setCustomerForm({ ...customerForm, notes_ar: e.target.value })}
                    className={`w-full px-4 py-3 border rounded-xl transition-all resize-none ${
                      isDarkMode 
                        ? 'bg-gray-700/50 border-gray-600 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20' 
                        : 'bg-gray-50 border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                    }`}
                    rows={3}
                  />
                </div>
              </div>

              {/* Actions */}
              <div className={`flex items-center justify-end gap-3 pt-4 border-t sticky bottom-0 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <button
                  type="button"
                  onClick={() => {
                    setShowCustomerForm(false);
                    setEditingCustomer(null);
                  }}
                  className={`px-5 py-2.5 rounded-xl font-medium transition-all ${
                    isDarkMode
                      ? 'text-gray-400 hover:bg-gray-700 hover:text-gray-200'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
                  }`}
                >
                  {language === 'ar' ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl font-medium"
                >
                  <Save className="w-4 h-4" />
                  {language === 'ar' ? 'حفظ العميل' : 'Save Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Customer Financial Details Modal */}
      {showCustomerDetails && customerFinancialSummary && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className={`w-full max-w-4xl rounded-2xl shadow-2xl transform transition-all ${
            isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
          } animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto`}>
            {/* Header */}
            <div className={`flex items-center justify-between p-6 border-b sticky top-0 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-green-900/30' : 'bg-green-100'}`}>
                  <BarChart3 className={`w-5 h-5 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    {language === 'ar' ? 'التفاصيل المالية للعميل' : 'Customer Financial Details'}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                    {customerFinancialSummary.customer_name}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowCustomerDetails(false);
                  setCustomerFinancialSummary(null);
                  setSelectedCustomer(null);
                }}
                className={`p-2 rounded-lg transition-all ${
                  isDarkMode 
                    ? 'hover:bg-gray-700 text-gray-400 hover:text-gray-200' 
                    : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Financial Summary */}
            <div className="p-6 space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-blue-900/30 border border-blue-700/50' : 'bg-blue-50 border border-blue-200'}`}>
                  <p className="text-sm text-blue-600 dark:text-blue-400 mb-1">
                    {language === 'ar' ? 'إجمالي الفواتير' : 'Total Invoiced'}
                  </p>
                  <p className="text-xl font-bold text-blue-700 dark:text-blue-300">
                    {CustomerService.formatCurrency(customerFinancialSummary.total_invoiced)}
                  </p>
                </div>
                <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-green-900/30 border border-green-700/50' : 'bg-green-50 border border-green-200'}`}>
                  <p className="text-sm text-green-600 dark:text-green-400 mb-1">
                    {language === 'ar' ? 'إجمالي المدفوع' : 'Total Paid'}
                  </p>
                  <p className="text-xl font-bold text-green-700 dark:text-green-300">
                    {CustomerService.formatCurrency(customerFinancialSummary.total_paid)}
                  </p>
                </div>
                <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-red-900/30 border border-red-700/50' : 'bg-red-50 border border-red-200'}`}>
                  <p className="text-sm text-red-600 dark:text-red-400 mb-1">
                    {language === 'ar' ? 'المبلغ المستحق' : 'Outstanding'}
                  </p>
                  <p className="text-xl font-bold text-red-700 dark:text-red-300">
                    {CustomerService.formatCurrency(customerFinancialSummary.total_outstanding)}
                  </p>
                </div>
                <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-orange-900/30 border border-orange-700/50' : 'bg-orange-50 border border-orange-200'}`}>
                  <p className="text-sm text-orange-600 dark:text-orange-400 mb-1">
                    {language === 'ar' ? 'المتأخر' : 'Overdue'}
                  </p>
                  <p className="text-xl font-bold text-orange-700 dark:text-orange-300">
                    {CustomerService.formatCurrency(customerFinancialSummary.overdue_amount)}
                  </p>
                </div>
              </div>

              {/* Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    {language === 'ar' ? 'عدد الفواتير' : 'Total Invoices'}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {customerFinancialSummary.invoices_count}
                  </p>
                </div>
                <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    {language === 'ar' ? 'متوسط قيمة الفاتورة' : 'Average Invoice'}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {CustomerService.formatCurrency(customerFinancialSummary.average_invoice_amount)}
                  </p>
                </div>
                <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    {language === 'ar' ? 'الفواتير المدفوعة' : 'Paid Invoices'}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {customerFinancialSummary.paid_invoices_count}
                  </p>
                </div>
              </div>

              {/* Payment History */}
              {customerFinancialSummary.payment_history.length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                    {language === 'ar' ? 'سجل المدفوعات' : 'Payment History'}
                  </h4>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className={`${isDarkMode ? 'bg-gray-800/80' : 'bg-gray-50'} border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                        <tr>
                          <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">
                            {language === 'ar' ? 'التاريخ' : 'Date'}
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">
                            {language === 'ar' ? 'رقم الفاتورة' : 'Invoice Number'}
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">
                            {language === 'ar' ? 'المبلغ' : 'Amount'}
                          </th>
                        </tr>
                      </thead>
                      <tbody className={`divide-y ${isDarkMode ? 'divide-gray-700/50' : 'divide-gray-100'}`}>
                        {customerFinancialSummary.payment_history.map((payment, index) => (
                          <tr key={index} className={isDarkMode ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'}>
                            <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                              {CustomerService.formatDate(payment.date)}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                              {payment.invoice_number}
                            </td>
                            <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                              {CustomerService.formatCurrency(payment.amount)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

          {/* Payment Form Modal */}
          {showPaymentForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className={`w-full max-w-2xl rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-xl`}>
                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold">
                      {editingPayment 
                        ? (language === 'ar' ? 'تعديل المدفوعة' : 'Edit Payment')
                        : (language === 'ar' ? 'إضافة دفعة جديدة' : 'Add New Payment')
                      }
                    </h3>
                    <button
                      onClick={() => {
                        setShowPaymentForm(false);
                        setEditingPayment(null);
                        resetPaymentForm();
                      }}
                      className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>

                  <form onSubmit={handlePaymentSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          {language === 'ar' ? 'المبلغ *' : 'Amount *'}
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={paymentForm.amount}
                          onChange={(e) => setPaymentForm({ ...paymentForm, amount: parseFloat(e.target.value) || 0 })}
                          className={`w-full px-3 py-2 border rounded-md ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">
                          {language === 'ar' ? 'طريقة الدفع *' : 'Payment Method *'}
                        </label>
                        <select
                          value={paymentForm.payment_method}
                          onChange={(e) => setPaymentForm({ ...paymentForm, payment_method: e.target.value as any })}
                          className={`w-full px-3 py-2 border rounded-md ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                          required
                        >
                          <option value="cash">{language === 'ar' ? 'نقدي' : 'Cash'}</option>
                          <option value="bank_transfer">{language === 'ar' ? 'تحويل بنكي' : 'Bank Transfer'}</option>
                          <option value="credit_card">{language === 'ar' ? 'بطاقة ائتمانية' : 'Credit Card'}</option>
                          <option value="check">{language === 'ar' ? 'شيك' : 'Check'}</option>
                          <option value="other">{language === 'ar' ? 'أخرى' : 'Other'}</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">
                          {language === 'ar' ? 'تاريخ الدفع *' : 'Payment Date *'}
                        </label>
                        <input
                          type="date"
                          value={paymentForm.payment_date}
                          onChange={(e) => setPaymentForm({ ...paymentForm, payment_date: e.target.value })}
                          className={`w-full px-3 py-2 border rounded-md ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">
                          {language === 'ar' ? 'رقم المرجع' : 'Reference Number'}
                        </label>
                        <input
                          type="text"
                          value={paymentForm.reference_number}
                          onChange={(e) => setPaymentForm({ ...paymentForm, reference_number: e.target.value })}
                          className={`w-full px-3 py-2 border rounded-md ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">
                          {language === 'ar' ? 'الحالة *' : 'Status *'}
                        </label>
                        <select
                          value={paymentForm.status || 'pending'}
                          onChange={(e) => setPaymentForm({ ...paymentForm, status: e.target.value as any })}
                          className={`w-full px-3 py-2 border rounded-md ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                          required
                        >
                          <option value="pending">{language === 'ar' ? 'قيد الانتظار' : 'Pending'}</option>
                          <option value="completed">{language === 'ar' ? 'مكتمل' : 'Completed'}</option>
                          <option value="failed">{language === 'ar' ? 'فشل' : 'Failed'}</option>
                          <option value="refunded">{language === 'ar' ? 'مسترد' : 'Refunded'}</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        {language === 'ar' ? 'ملاحظات (عربي)' : 'Notes (Arabic)'}
                      </label>
                      <textarea
                        value={paymentForm.notes_ar}
                        onChange={(e) => setPaymentForm({ ...paymentForm, notes_ar: e.target.value })}
                        className={`w-full px-3 py-2 border rounded-md ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                        rows={3}
                      />
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                      <button
                        type="button"
                        onClick={() => {
                          setShowPaymentForm(false);
                          setEditingPayment(null);
                          resetPaymentForm();
                        }}
                        className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                      >
                        {language === 'ar' ? 'إلغاء' : 'Cancel'}
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 transition-colors disabled:opacity-50"
                      >
                        {loading 
                          ? (language === 'ar' ? 'جاري الحفظ...' : 'Saving...')
                          : (editingPayment ? (language === 'ar' ? 'تحديث المدفوعة' : 'Update Payment') : (language === 'ar' ? 'إنشاء المدفوعة' : 'Create Payment'))
                        }
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Financial Analysis Tab */}
      {activeTab === 'analysis' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold flex items-center">
              <LineChart className="w-8 h-8 mr-3 text-blue-500" />
              {language === 'ar' ? 'التحليل المالي المتقدم' : 'Advanced Financial Analysis'}
            </h3>
            <button
              onClick={() => window.print()}
              className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <Printer className="w-4 h-4 mr-2" />
              {language === 'ar' ? 'طباعة التقرير' : 'Print Report'}
            </button>
          </div>

          {/* Key Metrics Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">{language === 'ar' ? 'إجمالي الواردات' : 'Total Income'}</p>
                  <p className="text-2xl font-bold">
                    {allTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0).toLocaleString()} ₺
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-200" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-6 text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-100 text-sm font-medium">{language === 'ar' ? 'إجمالي الصادرات' : 'Total Expense'}</p>
                  <p className="text-2xl font-bold">
                    {allTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0).toLocaleString()} ₺
                  </p>
                </div>
                <TrendingDown className="w-8 h-8 text-red-200" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">{language === 'ar' ? 'صافي الربح' : 'Net Profit'}</p>
                  <p className="text-2xl font-bold">
                    {(allTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0) - 
                      allTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)).toLocaleString()} ₺
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-blue-200" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">{language === 'ar' ? 'عدد المعاملات' : 'Transactions'}</p>
                  <p className="text-2xl font-bold">{allTransactions.length}</p>
                </div>
                <Activity className="w-8 h-8 text-purple-200" />
              </div>
            </div>
          </div>

          {/* Professional Charts */}
          {(() => {
            const chartData = prepareChartData();
            return (
              <>
                {/* Income/Expense Trends Chart */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                  <h4 className="text-xl font-bold mb-4 flex items-center">
                    <BarChart3 className="w-6 h-6 mr-2 text-blue-500" />
                    {language === 'ar' ? 'اتجاهات الواردات والصادرات (آخر 12 شهر)' : 'Income & Expense Trends (Last 12 Months)'}
                  </h4>
                  <div className="h-[400px]">
                    <IncomeExpenseTrendChart 
                      data={chartData.monthlyTrendsData} 
                      isDarkMode={isDarkMode} 
                    />
                  </div>
                </div>

                {/* Charts Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Category Breakdown */}
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                    <h4 className="text-xl font-bold mb-4 flex items-center">
                      <PieChart className="w-6 h-6 mr-2 text-purple-500" />
                      {language === 'ar' ? 'توزيع الفئات' : 'Category Breakdown'}
                    </h4>
                    <div className="h-[400px]">
                      <CategoryBreakdownChart 
                        data={chartData.categoryData} 
                        isDarkMode={isDarkMode} 
                      />
                    </div>
                  </div>

                  {/* Profit Margin Chart */}
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                    <h4 className="text-xl font-bold mb-4 flex items-center">
                      <Percent className="w-6 h-6 mr-2 text-orange-500" />
                      {language === 'ar' ? 'نسبة الربح الشهرية' : 'Monthly Profit Margin'}
                    </h4>
                    <div className="h-[400px]">
                      <ProfitMarginChart 
                        data={chartData.monthlyTrendsData} 
                        isDarkMode={isDarkMode} 
                      />
                    </div>
                  </div>
                </div>

                {/* Cash Flow Chart */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                  <h4 className="text-xl font-bold mb-4 flex items-center">
                    <LineChart className="w-6 h-6 mr-2 text-green-500" />
                    {language === 'ar' ? 'تدفق النقد (آخر 30 يوم)' : 'Cash Flow (Last 30 Days)'}
                  </h4>
                  <div className="h-[400px]">
                    <CashFlowChart 
                      data={chartData.cashFlowData.slice(-30)} 
                      isDarkMode={isDarkMode} 
                    />
                  </div>
                </div>

                {/* Monthly Trends Detailed */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                  <h4 className="text-xl font-bold mb-4 flex items-center">
                    <TrendingUp className="w-6 h-6 mr-2 text-orange-500" />
                    {language === 'ar' ? 'الاتجاهات الشهرية التفصيلية' : 'Detailed Monthly Trends'}
                  </h4>
                  <div className="h-[400px]">
                    <MonthlyTrendsChart 
                      data={chartData.monthlyTrendsData} 
                      isDarkMode={isDarkMode} 
                    />
                  </div>
                </div>
              </>
            );
          })()}
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold">
              {language === 'ar' ? 'إعدادات النظام' : 'System Settings'}
            </h3>
            <button
              onClick={handleSaveSettings}
              disabled={loading}
              className="flex items-center px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4 mr-2" />
              {loading 
                ? (language === 'ar' ? 'جاري الحفظ...' : 'Saving...')
                : (language === 'ar' ? 'حفظ الإعدادات' : 'Save Settings')
              }
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* General Settings */}
            <div className={`rounded-xl p-6 shadow-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <h4 className="text-lg font-semibold mb-4 flex items-center">
                <Settings className="w-5 h-5 mr-2" />
                {language === 'ar' ? 'الإعدادات العامة' : 'General Settings'}
              </h4>
              <div className="space-y-4">
                {/* Currency Settings */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    {language === 'ar' ? 'العملة الافتراضية' : 'Default Currency'}
                  </label>
                  <select
                    value={settings.currency || 'TRY'}
                    onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-md ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  >
                    <option value="USD">{language === 'ar' ? 'دولار أمريكي (USD)' : 'US Dollar (USD)'}</option>
                    <option value="EUR">{language === 'ar' ? 'يورو (EUR)' : 'Euro (EUR)'}</option>
                    <option value="GBP">{language === 'ar' ? 'جنيه إسترليني (GBP)' : 'British Pound (GBP)'}</option>
                    <option value="TRY">{language === 'ar' ? 'ليرة تركية (TRY)' : 'Turkish Lira (TRY)'}</option>
                    <option value="SAR">{language === 'ar' ? 'ريال سعودي (SAR)' : 'Saudi Riyal (SAR)'}</option>
                  </select>
                </div>

                {/* Date Format */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    {language === 'ar' ? 'تنسيق التاريخ' : 'Date Format'}
                  </label>
                  <select
                    value={settings.date_format || 'DD/MM/YYYY'}
                    onChange={(e) => setSettings({ ...settings, date_format: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-md ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  >
                    <option value="DD/MM/YYYY">{language === 'ar' ? 'يوم/شهر/سنة' : 'Day/Month/Year'}</option>
                    <option value="MM/DD/YYYY">{language === 'ar' ? 'شهر/يوم/سنة' : 'Month/Day/Year'}</option>
                    <option value="YYYY-MM-DD">{language === 'ar' ? 'سنة-شهر-يوم' : 'Year-Month-Day'}</option>
                  </select>
                </div>

                {/* Fiscal Year */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    {language === 'ar' ? 'بداية السنة المالية' : 'Fiscal Year Start'}
                  </label>
                  <input
                    type="date"
                    value={`2024-${settings.fiscal_year_start || '01-01'}`}
                    onChange={(e) => setSettings({ ...settings, fiscal_year_start: e.target.value.substring(5) })}
                    className={`w-full px-3 py-2 border rounded-md ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  />
                </div>

                {/* Default Tax Rate */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    {language === 'ar' ? 'الضريبة الافتراضية (%)' : 'Default Tax Rate (%)'}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={settings.default_tax_rate || 20}
                    onChange={(e) => setSettings({ ...settings, default_tax_rate: parseFloat(e.target.value) || 20 })}
                    className={`w-full px-3 py-2 border rounded-md ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  />
                </div>
              </div>
            </div>

            {/* Invoice Settings */}
            <div className={`rounded-xl p-6 shadow-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <h4 className="text-lg font-semibold mb-4 flex items-center">
                <FileTextIcon className="w-5 h-5 mr-2" />
                {language === 'ar' ? 'إعدادات الفواتير' : 'Invoice Settings'}
              </h4>
              <div className="space-y-4">
                {/* Invoice Prefix */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    {language === 'ar' ? 'بادئة رقم الفاتورة' : 'Invoice Number Prefix'}
                  </label>
                  <input
                    type="text"
                    value={settings.invoice_prefix || 'INV'}
                    onChange={(e) => setSettings({ ...settings, invoice_prefix: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-md ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    placeholder="INV"
                  />
                </div>

                {/* Invoice Number Format */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    {language === 'ar' ? 'تنسيق رقم الفاتورة' : 'Invoice Number Format'}
                  </label>
                  <select
                    value={settings.invoice_number_format || 'YYYYMMDD-###'}
                    onChange={(e) => setSettings({ ...settings, invoice_number_format: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-md ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  >
                    <option value="YYYYMMDD-###">{language === 'ar' ? 'تاريخ-رقم (20241221-001)' : 'Date-Number (20241221-001)'}</option>
                    <option value="YYYY-###">{language === 'ar' ? 'سنة-رقم (2024-001)' : 'Year-Number (2024-001)'}</option>
                    <option value="###">{language === 'ar' ? 'رقم تسلسلي (001)' : 'Sequential (001)'}</option>
                  </select>
                </div>

                {/* Notifications */}
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div>
                    <label className="block text-sm font-medium">
                      {language === 'ar' ? 'الإشعارات' : 'Notifications'}
                    </label>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {language === 'ar' ? 'تلقي إشعارات حول المعاملات المهمة' : 'Receive notifications about important transactions'}
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.notifications || false}
                    onChange={(e) => setSettings({ ...settings, notifications: e.target.checked })}
                    className="w-5 h-5 text-blue-600 rounded cursor-pointer"
                  />
                </div>

                {/* Auto Backup */}
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div>
                    <label className="block text-sm font-medium">
                      {language === 'ar' ? 'النسخ الاحتياطي التلقائي' : 'Auto Backup'}
                    </label>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {language === 'ar' ? 'إنشاء نسخ احتياطية تلقائية للبيانات' : 'Automatically backup data'}
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.auto_backup || false}
                    onChange={(e) => setSettings({ ...settings, auto_backup: e.target.checked })}
                    className="w-5 h-5 text-blue-600 rounded cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Company Information */}
            <div className={`lg:col-span-2 rounded-xl p-6 shadow-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <h4 className="text-lg font-semibold mb-4 flex items-center">
                <Building className="w-5 h-5 mr-2" />
                {language === 'ar' ? 'معلومات الشركة' : 'Company Information'}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Company Name Arabic */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    {language === 'ar' ? 'اسم الشركة (عربي)' : 'Company Name (Arabic)'}
                  </label>
                  <input
                    type="text"
                    value={settings.company_name_ar || ''}
                    onChange={(e) => setSettings({ ...settings, company_name_ar: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-md ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    dir="rtl"
                  />
                </div>

                {/* Company Name English */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    {language === 'ar' ? 'اسم الشركة (إنجليزي)' : 'Company Name (English)'}
                  </label>
                  <input
                    type="text"
                    value={settings.company_name_en || ''}
                    onChange={(e) => setSettings({ ...settings, company_name_en: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-md ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  />
                </div>

                {/* Company Address */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">
                    {language === 'ar' ? 'عنوان الشركة' : 'Company Address'}
                  </label>
                  <textarea
                    value={settings.company_address || ''}
                    onChange={(e) => setSettings({ ...settings, company_address: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-md ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    rows={2}
                    dir="ltr"
                  />
                </div>

                {/* Company Phone */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    {language === 'ar' ? 'هاتف الشركة' : 'Company Phone'}
                  </label>
                  <input
                    type="tel"
                    value={settings.company_phone || ''}
                    onChange={(e) => setSettings({ ...settings, company_phone: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-md ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    dir="ltr"
                  />
                </div>

                {/* Company Email */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    {language === 'ar' ? 'البريد الإلكتروني' : 'Email'}
                  </label>
                  <input
                    type="email"
                    value={settings.company_email || ''}
                    onChange={(e) => setSettings({ ...settings, company_email: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-md ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    dir="ltr"
                  />
                </div>

                {/* Company Website */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">
                    {language === 'ar' ? 'الموقع الإلكتروني' : 'Website'}
                  </label>
                  <input
                    type="text"
                    value={settings.company_website || ''}
                    onChange={(e) => setSettings({ ...settings, company_website: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-md ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    dir="ltr"
                    placeholder="tevasul.group"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountingManagement;