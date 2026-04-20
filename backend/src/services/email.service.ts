import EmailRepository from '../repositories/email.repository';
import { PendingEmailChange, SentEmailLog } from '../models/email';

function getDateKey(dateString: string): string {
  return dateString.slice(0, 10);
}

export default class EmailService {
  private repo = new EmailRepository();

  async queueChange(change: PendingEmailChange): Promise<void> {
    await this.repo.addPending(change);
  }

  async flushDaily(date: string): Promise<SentEmailLog[]> {
    const pending = await this.repo.listPending();
    const dateKey = getDateKey(date);

    const toFlush = pending.filter(c => getDateKey(c.changedAt) === dateKey);
    const keep = pending.filter(c => getDateKey(c.changedAt) !== dateKey);

    const grouped = new Map<string, PendingEmailChange[]>();
    for (const change of toFlush) {
      const key = `${change.studentCpf}|${change.studentEmail}`;
      const list = grouped.get(key) ?? [];
      list.push(change);
      grouped.set(key, list);
    }

    const sentLogs: SentEmailLog[] = [];
    for (const [key, changes] of grouped.entries()) {
      const [studentCpf, studentEmail] = key.split('|');

      // Consolidate repeated updates for same class+goal in the same day.
      const compactByGoal = new Map<string, PendingEmailChange>();
      for (const change of changes.sort((a, b) => a.changedAt.localeCompare(b.changedAt))) {
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
        studentEmail,
        date: dateKey,
        changes: consolidated,
        sentAt: `${dateKey}T23:59:59`
      };

      // Simulated email send.
      // eslint-disable-next-line no-console
      console.log(`[EMAIL] to=${studentEmail} cpf=${studentCpf} date=${dateKey} updates=${consolidated.length}`);

      await this.repo.appendLog(log);
      sentLogs.push(log);
    }

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
