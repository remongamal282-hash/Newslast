
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const deployDir = path.join(rootDir, 'deploy_package');

// 1. Clean/Create deploy directory
if (fs.existsSync(deployDir)) {
    fs.rmSync(deployDir, { recursive: true, force: true });
}
fs.mkdirSync(deployDir);

console.log(`Created deployment directory: ${deployDir}`);

// 2. Helper to copy files/folders
function copy(src, dest) {
    const srcPath = path.join(rootDir, src);
    const destPath = path.join(deployDir, dest);

    if (!fs.existsSync(srcPath)) {
        console.warn(`Warning: Source not found: ${src}`);
        return;
    }

    const stat = fs.statSync(srcPath);
    if (stat.isDirectory()) {
        fs.cpSync(srcPath, destPath, { recursive: true });
    } else {
        fs.copyFileSync(srcPath, destPath);
    }
    console.log(`Copied: ${src} -> ${dest}`);
}

// 3. Copy files
console.log('Copying files...');
copy('dist', 'dist');
copy('api', 'api');
copy('server.js', 'server.js');
copy('package.json', 'package.json');
copy('.env.production', '.env'); // Rename to .env

// 4. Create a simple Readme for the server
const readmeContent = `
# تعليمات التشغيل على السيرفر

1. قم بفك الضغط عن هذا الملف في المجلد الرئيسي لموقعك (مثل public_html).
2. اذهب إلى لوحة التحكم (cPanel) -> Setup Node.js App.
3. أنشئ تطبيق جديد:
   - مسار التطبيق: هو المسار الذي فككت فيه الملفات.
   - ملف البدء (Startup File): server.js
   - الإصدار: Node.js 18 أو 20.
4. اضغط "Create".
5. اضغط "Run NPM Install" لتثبيت المكاتب.
6. اضغط "Restart".

مبروك! الموقع يعمل الآن مع دعم المشاركة.
`;

fs.writeFileSync(path.join(deployDir, 'README_SERVER.txt'), readmeContent.trim());
console.log('Created README_SERVER.txt');

console.log('Deployment package prepared successfully!');
