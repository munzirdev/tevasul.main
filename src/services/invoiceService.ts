import { supabase } from '../lib/supabase';
import { 
  Invoice, 
  InvoiceItem, 
  CreateInvoiceData, 
  CreateInvoiceItemData,
  InvoiceTemplate 
} from '../lib/types';

export class InvoiceService {
  // Generate unique invoice number
  static generateInvoiceNumber(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `INV-${year}${month}${day}-${random}`;
  }

  // Get all invoices
  static async getInvoices(): Promise<Invoice[]> {
    console.log('Loading invoices...');
    
    const { data, error } = await supabase
      .from('invoices')
      .select(`
        *,
        items:invoice_items(*)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading invoices:', error);
      throw error;
    }
    
    console.log('Invoices loaded successfully:', data);
    return data || [];
  }

  // Get invoice by ID
  static async getInvoiceById(id: string): Promise<Invoice | null> {
    const { data, error } = await supabase
      .from('invoices')
      .select(`
        *,
        items:invoice_items(*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  // Get invoices by status
  static async getInvoicesByStatus(status: Invoice['status']): Promise<Invoice[]> {
    const { data, error } = await supabase
      .from('invoices')
      .select(`
        *,
        items:invoice_items(*)
      `)
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // Get overdue invoices
  static async getOverdueInvoices(): Promise<Invoice[]> {
    const today = new Date().toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('invoices')
      .select(`
        *,
        items:invoice_items(*)
      `)
      .in('status', ['sent'])
      .lt('due_date', today)
      .order('due_date', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  // Create new invoice
  static async createInvoice(invoiceData: CreateInvoiceData): Promise<Invoice> {
    console.log('Creating invoice with data:', invoiceData);
    
    const invoiceNumber = this.generateInvoiceNumber();
    console.log('Generated invoice number:', invoiceNumber);
    
    // Calculate totals
    const subtotal = invoiceData.items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
    const taxAmount = subtotal * (invoiceData.tax_rate / 100);
    const totalAmount = subtotal + taxAmount;

    console.log('Calculated totals:', { subtotal, taxAmount, totalAmount });

    // Create invoice
    const invoicePayload: any = {
      invoice_number: invoiceNumber,
      client_name: invoiceData.client_name,
      client_email: invoiceData.client_email,
      client_phone: invoiceData.client_phone,
      client_address: invoiceData.client_address,
      issue_date: invoiceData.issue_date,
      due_date: invoiceData.due_date,
      status: 'draft',
      subtotal,
      tax_rate: invoiceData.tax_rate,
      tax_amount: taxAmount,
      total_amount: totalAmount,
      notes_ar: invoiceData.notes_ar,
      notes_en: invoiceData.notes_en,
      notes_tr: invoiceData.notes_tr
    };
    
    // Add customer_id if provided
    if (invoiceData.customer_id) {
      invoicePayload.customer_id = invoiceData.customer_id;
    }
    
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .insert(invoicePayload)
      .select()
      .single();

    if (invoiceError) {
      console.error('Error creating invoice:', invoiceError);
      console.error('Error details:', {
        code: invoiceError.code,
        message: invoiceError.message,
        details: invoiceError.details,
        hint: invoiceError.hint
      });
      throw invoiceError;
    }

    console.log('Invoice created successfully:', invoice);

    // Create invoice items
    const itemsToInsert = invoiceData.items.map(item => ({
      invoice_id: invoice.id,
      description_ar: item.description_ar,
      description_en: item.description_en,
      description_tr: item.description_tr,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total_price: item.quantity * item.unit_price
    }));

    console.log('Creating invoice items:', itemsToInsert);

    const { error: itemsError } = await supabase
      .from('invoice_items')
      .insert(itemsToInsert);

    if (itemsError) {
      console.error('Error creating invoice items:', itemsError);
      console.error('Items error details:', {
        code: itemsError.code,
        message: itemsError.message,
        details: itemsError.details,
        hint: itemsError.hint
      });
      throw itemsError;
    }

    console.log('Invoice items created successfully');

    // Return complete invoice with items
    const completeInvoice = await this.getInvoiceById(invoice.id);
    console.log('Complete invoice:', completeInvoice);
    return completeInvoice as Invoice;
  }

  // Update invoice
  static async updateInvoice(id: string, invoiceData: Partial<CreateInvoiceData>): Promise<Invoice> {
    // If items are being updated, recalculate totals
    let updateData: any = { ...invoiceData };
    
    if (invoiceData.items) {
      const subtotal = invoiceData.items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
      const taxRate = invoiceData.tax_rate || 0;
      const taxAmount = subtotal * (taxRate / 100);
      const totalAmount = subtotal + taxAmount;

      updateData.subtotal = subtotal;
      updateData.tax_amount = taxAmount;
      updateData.total_amount = totalAmount;
    }

    const { data, error } = await supabase
      .from('invoices')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Update items if provided
    if (invoiceData.items) {
      // Delete existing items
      await supabase
        .from('invoice_items')
        .delete()
        .eq('invoice_id', id);

      // Insert new items
      const itemsToInsert = invoiceData.items.map(item => ({
        invoice_id: id,
        description_ar: item.description_ar,
        description_en: item.description_en,
        description_tr: item.description_tr,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.quantity * item.unit_price
      }));

      await supabase
        .from('invoice_items')
        .insert(itemsToInsert);
    }

    return await this.getInvoiceById(id) as Invoice;
  }

  // Update invoice status
  static async updateInvoiceStatus(id: string, status: Invoice['status']): Promise<Invoice> {
    const { data, error } = await supabase
      .from('invoices')
      .update({
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return await this.getInvoiceById(id) as Invoice;
  }

  // Delete invoice
  static async deleteInvoice(id: string): Promise<void> {
    console.log('InvoiceService: Deleting invoice with ID:', id);
    
    try {
      // Delete items first
      console.log('InvoiceService: Deleting invoice items...');
      const { error: itemsError } = await supabase
        .from('invoice_items')
        .delete()
        .eq('invoice_id', id);

      if (itemsError) {
        console.error('InvoiceService: Error deleting invoice items:', itemsError);
        throw itemsError;
      }

      console.log('InvoiceService: Invoice items deleted successfully');

      // Delete invoice
      console.log('InvoiceService: Deleting invoice...');
      const { error: invoiceError } = await supabase
        .from('invoices')
        .delete()
        .eq('id', id);

      if (invoiceError) {
        console.error('InvoiceService: Error deleting invoice:', invoiceError);
        throw invoiceError;
      }

      console.log('InvoiceService: Invoice deleted successfully');
    } catch (error) {
      console.error('InvoiceService: Complete error details:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      });
      throw error;
    }
  }

  // Get invoice statistics
  static async getInvoiceStats(): Promise<{
    total: number;
    draft: number;
    sent: number;
    paid: number;
    overdue: number;
    cancelled: number;
    totalAmount: number;
    paidAmount: number;
    pendingAmount: number;
  }> {
    const invoices = await this.getInvoices();
    
    const stats = {
      total: invoices.length,
      draft: invoices.filter(i => i.status === 'draft').length,
      sent: invoices.filter(i => i.status === 'sent').length,
      paid: invoices.filter(i => i.status === 'paid').length,
      overdue: invoices.filter(i => i.status === 'overdue').length,
      cancelled: invoices.filter(i => i.status === 'cancelled').length,
      totalAmount: invoices.reduce((sum, i) => sum + i.total_amount, 0),
      paidAmount: invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.total_amount, 0),
      pendingAmount: invoices.filter(i => ['sent', 'overdue'].includes(i.status)).reduce((sum, i) => sum + i.total_amount, 0)
    };

    return stats;
  }

  // Get invoice templates
  static async getInvoiceTemplates(): Promise<InvoiceTemplate[]> {
    const { data, error } = await supabase
      .from('invoice_templates')
      .select('*')
      .order('is_default', { ascending: false })
      .order('name_ar');

    if (error) throw error;
    return data || [];
  }

  // Create invoice template
  static async createInvoiceTemplate(templateData: Omit<InvoiceTemplate, 'id' | 'created_at' | 'updated_at'>): Promise<InvoiceTemplate> {
    const { data, error } = await supabase
      .from('invoice_templates')
      .insert(templateData)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Update invoice template
  static async updateInvoiceTemplate(id: string, templateData: Partial<InvoiceTemplate>): Promise<InvoiceTemplate> {
    const { data, error } = await supabase
      .from('invoice_templates')
      .update({
        ...templateData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Delete invoice template
  static async deleteInvoiceTemplate(id: string): Promise<void> {
    const { error } = await supabase
      .from('invoice_templates')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // Format currency
  static formatCurrency(amount: number, currency: string = 'TRY'): string {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: currency === 'TRY' ? 'TRY' : 'USD'
    }).format(amount);
  }

  // Format date
  static formatDate(date: string | Date): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('tr-TR');
  }

  // Get current date
  static getCurrentDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  // Get due date (30 days from now by default)
  static getDefaultDueDate(): string {
    const date = new Date();
    date.setDate(date.getDate() + 30);
    return date.toISOString().split('T')[0];
  }
}
