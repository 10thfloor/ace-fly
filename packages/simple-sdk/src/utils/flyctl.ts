import { exec } from "node:child_process";
import { promisify } from "node:util";

const execAsync = promisify(exec);

export async function flyctlExecute(
  command: string,
  retries = 3
): Promise<void> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const { stdout, stderr } = await execAsync(command);
      if (stdout) {
        console.log(stdout);
      }
      if (stderr) {
        console.error(stderr);
      }
      return;
    } catch (error) {
      if (attempt === retries) {
        throw new Error(
          `Command failed after ${retries} attempts: ${command}\n${error}`
        );
      }
      console.warn(`Attempt ${attempt} failed. Retrying...`);
      await new Promise((res) => setTimeout(res, 1000 * attempt));
    }
  }
}
