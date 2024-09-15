import { exec } from 'node:child_process';
import { promisify } from 'node:util';

const execAsync = promisify(exec);

/**
 * Executes a Fly.io CLI command with retry logic.
 * @param command The Fly.io CLI command to execute.
 * @param retries Number of retry attempts if the command fails.
 * @param silent If true, suppresses the command output.
 * @returns An object containing `stdout` and `stderr` from the command execution.
 * @throws An error if the command fails after all retry attempts.
 */
export async function flyctlExecute(
  command: string,
  retries = 3,
  silent = false
): Promise<{ stdout: string; stderr: string }> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      if (!silent) {
        console.log(`Executing: ${command}`);
      }

      const { stdout, stderr } = await execAsync(command);

      if (stdout && !silent) {
        console.log(stdout);
      }

      if (stderr && !silent) {
        console.error(stderr);
      }

      return { stdout, stderr };
    } catch (error: any) {
      if (attempt === retries) {
        const enhancedError = new Error(
          `Command failed after ${retries} attempts: ${command}\n${error.stderr || error.message}`
        );
        throw enhancedError;
      }

      if (!silent) {
        console.warn(`Attempt ${attempt} failed. Retrying in ${1000 * attempt} ms...`);
      }

      // Exponential backoff before next retry
      await new Promise((res) => setTimeout(res, 1000 * attempt));
    }
  }

  // Fallback in case all retries fail (shouldn't be reached)
  throw new Error(`flyctlExecute: All ${retries} retry attempts failed for command: ${command}`);
}