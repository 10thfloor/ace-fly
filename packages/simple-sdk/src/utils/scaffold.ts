import fs from 'node:fs';
import path from 'node:path';

export function scaffoldProject(templateName: string, targetDir: string) {
  const templatePath = path.join(__dirname, '..', 'templates', templateName);
  
  if (!fs.existsSync(templatePath)) {
    throw new Error(`Template ${templateName} does not exist.`);
  }

  fs.mkdirSync(targetDir, { recursive: true });
  
  for (const file of fs.readdirSync(templatePath)) {
    const src = path.join(templatePath, file);
    const dest = path.join(targetDir, file);
    fs.copyFileSync(src, dest);
  }

  console.log(`Project scaffolded using ${templateName} template at ${targetDir}`);
}