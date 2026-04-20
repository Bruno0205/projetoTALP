import path from 'path';
import { PendingEmailChange, SentEmailLog } from '../models/email';
import { readJson, writeJson } from '../utils/storage';

const PENDING_FILE = path.resolve(__dirname, '../../data/emailQueue.json');
const LOG_FILE = path.resolve(__dirname, '../../data/emailLog.json');

export default class EmailRepository {
  async listPending(): Promise<PendingEmailChange[]> {
    return readJson<PendingEmailChange[]>(PENDING_FILE, []);
  }

  async addPending(change: PendingEmailChange): Promise<void> {
    const all = await this.listPending();
    all.push(change);
    await writeJson(PENDING_FILE, all);
  }

  async overwritePending(changes: PendingEmailChange[]): Promise<void> {
    await writeJson(PENDING_FILE, changes);
  }

  async listLogs(): Promise<SentEmailLog[]> {
    return readJson<SentEmailLog[]>(LOG_FILE, []);
  }

  async appendLog(log: SentEmailLog): Promise<void> {
    const all = await this.listLogs();
    all.push(log);
    await writeJson(LOG_FILE, all);
  }
}
