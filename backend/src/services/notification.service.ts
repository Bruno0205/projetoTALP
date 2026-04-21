import EmailService from './email.service';

export default class NotificationService {
  private emailService = new EmailService();

  async endOfDay(date?: string) {
    const triggerDate = date ?? new Date().toISOString();
    return this.emailService.flushDaily(triggerDate);
  }
}
