import React from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart
} from 'recharts';
import { useLanguage } from '../../hooks/useLanguage';

interface ChartData {
  name: string;
  income?: number;
  expense?: number;
  value?: number;
  [key: string]: any;
}

interface AccountingChartsProps {
  incomeExpenseData?: ChartData[];
  categoryData?: ChartData[];
  cashFlowData?: ChartData[];
  monthlyTrends?: ChartData[];
  isDarkMode?: boolean;
}

const COLORS = ['#10b981', '#ef4444', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

export const IncomeExpenseTrendChart: React.FC<{
  data: ChartData[];
  isDarkMode?: boolean;
}> = ({ data, isDarkMode }) => {
  const { language } = useLanguage();
  
  return (
    <ResponsiveContainer width="100%" height={350}>
      <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
          </linearGradient>
          <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#e5e7eb'} />
        <XAxis 
          dataKey="name" 
          stroke={isDarkMode ? '#9ca3af' : '#6b7280'}
          tick={{ fill: isDarkMode ? '#9ca3af' : '#6b7280' }}
        />
        <YAxis 
          stroke={isDarkMode ? '#9ca3af' : '#6b7280'}
          tick={{ fill: isDarkMode ? '#9ca3af' : '#6b7280' }}
        />
        <Tooltip 
          contentStyle={{
            backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
            border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
            borderRadius: '8px',
            color: isDarkMode ? '#f3f4f6' : '#111827'
          }}
        />
        <Legend />
        <Area 
          type="monotone" 
          dataKey="income" 
          stroke="#10b981" 
          fillOpacity={1} 
          fill="url(#colorIncome)"
          name={language === 'ar' ? 'الواردات' : 'Income'}
        />
        <Area 
          type="monotone" 
          dataKey="expense" 
          stroke="#ef4444" 
          fillOpacity={1} 
          fill="url(#colorExpense)"
          name={language === 'ar' ? 'الصادرات' : 'Expense'}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export const CategoryBreakdownChart: React.FC<{
  data: ChartData[];
  isDarkMode?: boolean;
}> = ({ data, isDarkMode }) => {
  const { language } = useLanguage();
  
  return (
    <ResponsiveContainer width="100%" height={350}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
          outerRadius={100}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip 
          contentStyle={{
            backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
            border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
            borderRadius: '8px',
            color: isDarkMode ? '#f3f4f6' : '#111827'
          }}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
};

export const CashFlowChart: React.FC<{
  data: ChartData[];
  isDarkMode?: boolean;
}> = ({ data, isDarkMode }) => {
  const { language } = useLanguage();
  
  return (
    <ResponsiveContainer width="100%" height={350}>
      <ComposedChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#e5e7eb'} />
        <XAxis 
          dataKey="name" 
          stroke={isDarkMode ? '#9ca3af' : '#6b7280'}
          tick={{ fill: isDarkMode ? '#9ca3af' : '#6b7280' }}
        />
        <YAxis 
          stroke={isDarkMode ? '#9ca3af' : '#6b7280'}
          tick={{ fill: isDarkMode ? '#9ca3af' : '#6b7280' }}
        />
        <Tooltip 
          contentStyle={{
            backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
            border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
            borderRadius: '8px',
            color: isDarkMode ? '#f3f4f6' : '#111827'
          }}
        />
        <Legend />
        <Bar 
          dataKey="income" 
          fill="#10b981" 
          name={language === 'ar' ? 'الواردات' : 'Income'}
          radius={[8, 8, 0, 0]}
        />
        <Bar 
          dataKey="expense" 
          fill="#ef4444" 
          name={language === 'ar' ? 'الصادرات' : 'Expense'}
          radius={[8, 8, 0, 0]}
        />
        <Line 
          type="monotone" 
          dataKey="balance" 
          stroke="#3b82f6" 
          strokeWidth={3}
          name={language === 'ar' ? 'الرصيد' : 'Balance'}
          dot={{ fill: '#3b82f6', r: 5 }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
};

export const MonthlyTrendsChart: React.FC<{
  data: ChartData[];
  isDarkMode?: boolean;
}> = ({ data, isDarkMode }) => {
  const { language } = useLanguage();
  
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#e5e7eb'} />
        <XAxis 
          dataKey="name" 
          stroke={isDarkMode ? '#9ca3af' : '#6b7280'}
          tick={{ fill: isDarkMode ? '#9ca3af' : '#6b7280' }}
        />
        <YAxis 
          stroke={isDarkMode ? '#9ca3af' : '#6b7280'}
          tick={{ fill: isDarkMode ? '#9ca3af' : '#6b7280' }}
        />
        <Tooltip 
          contentStyle={{
            backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
            border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
            borderRadius: '8px',
            color: isDarkMode ? '#f3f4f6' : '#111827'
          }}
        />
        <Legend />
        <Bar 
          dataKey="income" 
          fill="#10b981" 
          name={language === 'ar' ? 'الواردات' : 'Income'}
          radius={[8, 8, 0, 0]}
        />
        <Bar 
          dataKey="expense" 
          fill="#ef4444" 
          name={language === 'ar' ? 'الصادرات' : 'Expense'}
          radius={[8, 8, 0, 0]}
        />
        <Bar 
          dataKey="profit" 
          fill="#3b82f6" 
          name={language === 'ar' ? 'الربح' : 'Profit'}
          radius={[8, 8, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
};

export const ProfitMarginChart: React.FC<{
  data: ChartData[];
  isDarkMode?: boolean;
}> = ({ data, isDarkMode }) => {
  const { language } = useLanguage();
  
  return (
    <ResponsiveContainer width="100%" height={350}>
      <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#e5e7eb'} />
        <XAxis 
          dataKey="name" 
          stroke={isDarkMode ? '#9ca3af' : '#6b7280'}
          tick={{ fill: isDarkMode ? '#9ca3af' : '#6b7280' }}
        />
        <YAxis 
          stroke={isDarkMode ? '#9ca3af' : '#6b7280'}
          tick={{ fill: isDarkMode ? '#9ca3af' : '#6b7280' }}
          label={{ 
            value: language === 'ar' ? 'نسبة الربح (%)' : 'Profit Margin (%)', 
            angle: -90, 
            position: 'insideLeft',
            fill: isDarkMode ? '#9ca3af' : '#6b7280'
          }}
        />
        <Tooltip 
          contentStyle={{
            backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
            border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
            borderRadius: '8px',
            color: isDarkMode ? '#f3f4f6' : '#111827'
          }}
          formatter={(value: number) => `${value.toFixed(2)}%`}
        />
        <Legend />
        <Line 
          type="monotone" 
          dataKey="profitMargin" 
          stroke="#8b5cf6" 
          strokeWidth={3}
          name={language === 'ar' ? 'نسبة الربح' : 'Profit Margin'}
          dot={{ fill: '#8b5cf6', r: 6 }}
          activeDot={{ r: 8 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export const DailyTransactionsChart: React.FC<{
  data: ChartData[];
  isDarkMode?: boolean;
}> = ({ data, isDarkMode }) => {
  const { language } = useLanguage();
  
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#e5e7eb'} />
        <XAxis 
          dataKey="name" 
          stroke={isDarkMode ? '#9ca3af' : '#6b7280'}
          tick={{ fill: isDarkMode ? '#9ca3af' : '#6b7280' }}
        />
        <YAxis 
          stroke={isDarkMode ? '#9ca3af' : '#6b7280'}
          tick={{ fill: isDarkMode ? '#9ca3af' : '#6b7280' }}
        />
        <Tooltip 
          contentStyle={{
            backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
            border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
            borderRadius: '8px',
            color: isDarkMode ? '#f3f4f6' : '#111827'
          }}
        />
        <Legend />
        <Bar 
          dataKey="count" 
          fill="#06b6d4" 
          name={language === 'ar' ? 'عدد المعاملات' : 'Transaction Count'}
          radius={[8, 8, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
};



