import { IWorldOptions, World, setWorldConstructor } from '@cucumber/cucumber';
import request from 'supertest';
import path from 'path';
import fs from 'fs/promises';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const app = require(path.resolve(__dirname, '../../backend/src/app')).default;

export class CustomWorld extends World {
  request: any;
  lastResponse: any = null;
  context: Record<string, unknown> = {};

  constructor(options: IWorldOptions) {
    super(options);
    this.request = request(app);
  }

  async resetData() {
    const files = [
      '../../backend/data/students.json',
      '../../backend/data/classes.json',
      '../../backend/data/evaluations.json',
      '../../backend/data/emailQueue.json',
      '../../backend/data/emailLog.json'
    ];

    for (const relative of files) {
      const filePath = path.resolve(__dirname, relative);
      await fs.writeFile(filePath, '[]', 'utf-8');
    }
  }
}

setWorldConstructor(CustomWorld);
