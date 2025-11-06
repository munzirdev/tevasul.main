import { supabase } from '../lib/supabase';
import { 
  Customer, 
  CreateCustomerData,
  CustomerFinancialSummary,
  Invoice
} from '../lib/types';
import { InvoiceService } from './invoiceService';

export class CustomerService {
  // Get all customers
  static async getCustomers(): Promise<Customer[]> {
    const { data: customers, error } = await supabase
      .from('customers')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading customers:', error);
      throw error;
    }

    if (!customers || customers.length === 0) {
      return [];
    }

    // Calculate financial summaries for each customer
    const customersWithStats = await Promise.all(
      customers.map(async (customer) => {
        const stats = await this.getCustomerFinancialStats(customer.id);
        return {
          ...customer,
          total_invoiced: stats.total_invoiced,
          total_paid: stats.total_paid,
          total_outstanding: stats.total_outstanding,
          invoices_count: stats.invoices_count,
          last_invoice_date: stats.last_invoice_date
        };
      })
    );

    return customersWithStats;
  }

  // Get customer by ID
  static async getCustomerById(id: string): Promise<Customer | null> {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error loading customer:', error);
      throw error;
    }

    if (!data) return null;

    const stats = await this.getCustomerFinancialStats(id);
    return {
      ...data,
      total_invoiced: stats.total_invoiced,
      total_paid: stats.total_paid,
      total_outstanding: stats.total_outstanding,
      invoices_count: stats.invoices_count,
      last_invoice_date: stats.last_invoice_date
    };
  }

  // Get customer financial statistics
  static async getCustomerFinancialStats(customerId: string): Promise<{
    total_invoiced: number;
    total_paid: number;
    total_outstanding: number;
    invoices_count: number;
    last_invoice_date?: string;
  }> {
    try {
      // Get all invoices for this customer
      const { data: invoices, error } = await supabase
        .from('invoices')
        .select('id, total_amount, status, issue_date, due_date')
        .eq('customer_id', customerId);

      if (error) {
        console.error('Error loading customer invoices:', error);
        return {
          total_invoiced: 0,
          total_paid: 0,
          total_outstanding: 0,
          invoices_count: 0
        };
      }

      const invoicesList = invoices || [];
      const total_invoiced = invoicesList.reduce((sum, inv) => sum + (inv.total_amount || 0), 0);
      const paid_invoices = invoicesList.filter(inv => inv.status === 'paid');
      const total_paid = paid_invoices.reduce((sum, inv) => sum + (inv.total_amount || 0), 0);
      const total_outstanding = total_invoiced - total_paid;
      
      // Get last invoice date
      const sortedInvoices = invoicesList.sort((a, b) => 
        new Date(b.issue_date).getTime() - new Date(a.issue_date).getTime()
      );
      const last_invoice_date = sortedInvoices.length > 0 ? sortedInvoices[0].issue_date : undefined;

      return {
        total_invoiced,
        total_paid,
        total_outstanding,
        invoices_count: invoicesList.length,
        last_invoice_date
      };
    } catch (error) {
      console.error('Error calculating customer stats:', error);
      return {
        total_invoiced: 0,
        total_paid: 0,
        total_outstanding: 0,
        invoices_count: 0
      };
    }
  }

  // Get customer financial summary
  static async getCustomerFinancialSummary(customerId: string): Promise<CustomerFinancialSummary> {
    const customer = await this.getCustomerById(customerId);
    if (!customer) {
      throw new Error('Customer not found');
    }

    // Get all invoices for this customer
    const { data: invoices, error } = await supabase
      .from('invoices')
      .select('*')
      .eq('customer_id', customerId)
      .order('issue_date', { ascending: false });

    if (error) {
      console.error('Error loading customer invoices:', error);
      throw error;
    }

    const invoicesList = invoices || [];
    const today = new Date().toISOString().split('T')[0];

    // Calculate statistics
    const total_invoiced = invoicesList.reduce((sum, inv) => sum + (inv.total_amount || 0), 0);
    const paid_invoices = invoicesList.filter(inv => inv.status === 'paid');
    const total_paid = paid_invoices.reduce((sum, inv) => sum + (inv.total_amount || 0), 0);
    const total_outstanding = total_invoiced - total_paid;

    const overdue_invoices = invoicesList.filter(inv => 
      inv.status === 'sent' && inv.due_date < today
    );
    const overdue_amount = overdue_invoices.reduce((sum, inv) => sum + (inv.total_amount || 0), 0);

    const pending_invoices = invoicesList.filter(inv => 
      inv.status === 'sent' || inv.status === 'draft'
    );

    const average_invoice_amount = invoicesList.length > 0 
      ? total_invoiced / invoicesList.length 
      : 0;

    // Get payment history from payments table
    const { data: payments, error: paymentsError } = await supabase
      .from('payments')
      .select('*')
      .eq('invoice_id', invoicesList.map(inv => inv.id))
      .order('payment_date', { ascending: false });

    const payment_history = payments?.map(payment => {
      const invoice = invoicesList.find(inv => inv.id === payment.invoice_id);
      return {
        date: payment.payment_date,
        amount: payment.amount,
        invoice_number: invoice?.invoice_number || ''
      };
    }) || [];

    const last_payment_date = payment_history.length > 0 ? payment_history[0].date : undefined;
    const last_invoice_date = invoicesList.length > 0 ? invoicesList[0].issue_date : undefined;

    const days_since_last_payment = last_payment_date
      ? Math.floor((new Date().getTime() - new Date(last_payment_date).getTime()) / (1000 * 60 * 60 * 24))
      : undefined;

    const customerName = customer.name_ar || customer.name_en || customer.name_tr || '';

    return {
      customer_id: customerId,
      customer_name: customerName,
      total_invoiced,
      total_paid,
      total_outstanding,
      overdue_amount,
      invoices_count: invoicesList.length,
      paid_invoices_count: paid_invoices.length,
      pending_invoices_count: pending_invoices.length,
      overdue_invoices_count: overdue_invoices.length,
      average_invoice_amount,
      last_payment_date,
      last_invoice_date,
      days_since_last_payment,
      payment_history
    };
  }

  // Create new customer
  static async createCustomer(customerData: CreateCustomerData): Promise<Customer> {
    try {
      // Check if table exists by trying to query it first
      const { error: checkError } = await supabase
        .from('customers')
        .select('id')
        .limit(1);

      if (checkError) {
        // Table doesn't exist - this is expected if migration hasn't been applied
        console.warn('Customers table not found. Please apply migration: 20250117_create_customers_table.sql');
        throw new Error('Customers table not found. Please apply the migration first.');
      }

      const { data, error } = await supabase
        .from('customers')
        .insert([{
          ...customerData,
          status: customerData.status || 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating customer:', error);
        throw error;
      }

      return {
        ...data,
        total_invoiced: 0,
        total_paid: 0,
        total_outstanding: 0,
        invoices_count: 0
      };
    } catch (error: any) {
      console.error('Error creating customer:', error);
      throw error;
    }
  }

  // Update customer
  static async updateCustomer(id: string, customerData: Partial<CreateCustomerData>): Promise<Customer> {
    const { data, error } = await supabase
      .from('customers')
      .update({
        ...customerData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating customer:', error);
      throw error;
    }

    const stats = await this.getCustomerFinancialStats(id);
    return {
      ...data,
      ...stats
    };
  }

  // Delete customer
  static async deleteCustomer(id: string): Promise<void> {
    const { error } = await supabase
      .from('customers')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting customer:', error);
      throw error;
    }
  }

  // Get customer invoices
  static async getCustomerInvoices(customerId: string): Promise<Invoice[]> {
    const { data, error } = await supabase
      .from('invoices')
      .select(`
        *,
        items:invoice_items(*)
      `)
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading customer invoices:', error);
      throw error;
    }

    return data || [];
  }

  // Format currency
  static formatCurrency(amount: number): string {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 2
    }).format(amount);
  }

  // Format date
  static formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}

