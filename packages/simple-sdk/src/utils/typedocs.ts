import { exec } from 'node:child_process';
import { promisify } from 'node:util';

const execAsync = promisify(exec);

export async function generateDocs(projectDir: string) {
  try {
    const { stdout } = await execAsync(`typedoc --out docs ${projectDir}/src`);
    console.log(stdout);
    console.log('Documentation generated successfully.');
  } catch (error) {
    console.error('Failed to generate documentation:', error);
  }
}