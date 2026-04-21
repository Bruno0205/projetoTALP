import EmailRepository from '../repositories/email.repository';
import { PendingEmailChange, SentEmailLog } from '../models/email';
import nodemailer, { Transporter } from 'nodemailer';

function getDateKey(dateString: string): string {
  return dateString.slice(0, 10);
}

export default class EmailService {
  private repo = new EmailRepository();
  private transporter: Transporter | null = null;

  private getTransporter(): Transporter {
    if (this.transporter) {
      return this.transporter;
    }

    const user = process.env.EMAIL_USER;
    const pass = process.env.EMAIL_PASS;
    if (!user || !pass) {
      throw new Error('EMAIL_USER and EMAIL_PASS must be configured to send emails');
    }

    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user, pass }
    });

    return this.transporter;
  }

  private async sendConsolidatedEmail(params: {
    studentName: string;
    studentEmail: string;
    changes: PendingEmailChange[];
  }): Promise<void> {
    const transporter = this.getTransporter();
    const user = process.env.EMAIL_USER as string;

    const lines = [
      `Hello, ${params.studentName}`,
      '',
      'Daily Evaluation Updates',
      '',
      'Class | Goal | Old | New'
    ];

    for (const change of params.changes) {
      lines.push(`${change.className} | ${change.goal} | ${change.oldCode} | ${change.newCode}`);
    }

    await transporter.sendMail({
      from: user,
      to: params.studentEmail,
      subject: 'Daily Evaluation Updates',
      text: lines.join('\n')
    });
  }

  async queueChange(change: PendingEmailChange): Promise<void> {
    await this.repo.addPending(change);
  }

  async flushDaily(date: string): Promise<SentEmailLog[]> {
    const pending = await this.repo.listPending();
    if (pending.length === 0) return [];

    // Validate sender configuration once before processing students.
    this.getTransporter();

    const dateKey = getDateKey(date);

    const grouped = new Map<string, {
      studentEmail: string;
      studentName: string;
      changes: PendingEmailChange[];
    }>();
    for (const change of pending) {
      const key = change.studentCpf;
      const bucket = grouped.get(key);
      if (!bucket) {
        grouped.set(key, {
          studentEmail: change.studentEmail,
          studentName: change.studentName || change.studentCpf,
          changes: [change]
        });
      } else {
        bucket.changes.push(change);
      }
    }

    const sentLogs: SentEmailLog[] = [];
    const sentCpfs = new Set<string>();
    for (const [studentCpf, bucket] of grouped.entries()) {

      // Consolidate repeated updates for same class+goal in the same day.
      const compactByGoal = new Map<string, PendingEmailChange>();
      for (const change of bucket.changes.sort((a, b) => a.changedAt.localeCompare(b.changedAt))) {
        const itemKey = `${change.className}|${change.goal}`;
        const existing = compactByGoal.get(itemKey);
        if (!existing) {
          compactByGoal.set(itemKey, { ...change });
        } else {
          compactByGoal.set(itemKey, { ...existing, newCode: change.newCode, changedAt: change.changedAt });
        }
      }

      const consolidated = [...compactByGoal.values()];
      const log: SentEmailLog = {
        studentCpf,
        studentEmail: bucket.studentEmail,
        date: dateKey,
        changes: consolidated,
        sentAt: `${dateKey}T23:59:59`
      };

      try {
        await this.sendConsolidatedEmail({
          studentName: bucket.studentName,
          studentEmail: bucket.studentEmail,
          changes: consolidated
        });

        await this.repo.appendLog(log);
        sentLogs.push(log);
        sentCpfs.add(studentCpf);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(`Failed to send email to ${bucket.studentEmail}`, error);
      }
    }

    const keep = pending.filter(change => {
      return !sentCpfs.has(change.studentCpf);
    });

    await this.repo.overwritePending(keep);
    return sentLogs;
  }

  async listPending(): Promise<PendingEmailChange[]> {
    return this.repo.listPending();
  }

  async listLogs(): Promise<SentEmailLog[]> {
    return this.repo.listLogs();
  }
}
