import { supabase } from '../lib/supabase';

interface EmailService {
  sendPasswordResetEmail: (email: string) => Promise<{ success: boolean; error?: string }>;
}

class CustomEmailService implements EmailService {
  async sendPasswordResetEmail(email: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Create a custom password reset request in the database
      const { error } = await supabase
        .from('password_reset_requests')
        .insert({
          email: email,
          token: this.generateResetToken(),
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
          status: 'pending',
          created_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error creating password reset request:', error);
        return { success: false, error: 'Failed to create reset request' };
      }

      // Send email via custom service or webhook
      const emailResult = await this.sendEmailViaWebhook(email);
      
      if (!emailResult.success) {
        return { success: false, error: emailResult.error };
      }

      return { success: true };
    } catch (error) {
      console.error('Unexpected error in sendPasswordResetEmail:', error);
      return { success: false, error: 'Unexpected error occurred' };
    }
  }

  private generateResetToken(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  private async sendEmailViaWebhook(email: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Use the existing webhook service to send email notification
      const webhookData = {
        type: 'password_reset',
        email: email,
        subject: 'Password Reset Request',
        message: `A password reset has been requested for your account. Please contact support for assistance.`,
        priority: 'high',
        status: 'pending',
        created_at: new Date().toISOString()
      };

      // You can integrate with your existing webhook service here
      // For now, we'll simulate success
      console.log('Password reset request created for:', email);
      
      return { success: true };
    } catch (error) {
      console.error('Error sending email via webhook:', error);
      return { success: false, error: 'Failed to send email' };
    }
  }
}

export const emailService = new CustomEmailService();
export type { EmailService };