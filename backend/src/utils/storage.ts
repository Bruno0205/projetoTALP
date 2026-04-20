import fs from 'fs/promises';

export async function readJson<T>(filePath: string, defaultValue: T): Promise<T> {
  try {
    const raw = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(raw) as T;
  } catch (err: any) {
    if (err.code === 'ENOENT') {
      await writeJson(filePath, defaultValue);
      return defaultValue;
    }
    throw err;
  }
}

export async function writeJson<T>(filePath: string, data: T): Promise<void> {
  const raw = JSON.stringify(data, null, 2);
  await fs.writeFile(filePath, raw, 'utf-8');
}
