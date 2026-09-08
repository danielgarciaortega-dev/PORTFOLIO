import { copyFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const root = process.cwd();
const input = path.join(root, 'input', 'assets');
const publicDir = path.join(root, 'public');

const directories = {
  profile: path.join(publicDir, 'images', 'profile'),
  projects: path.join(publicDir, 'images', 'projects'),
  companies: path.join(publicDir, 'images', 'companies'),
  education: path.join(publicDir, 'images', 'education'),
  moments: path.join(publicDir, 'images', 'moments'),
};

await Promise.all(
  Object.values(directories).map((directory) =>
    mkdir(directory, { recursive: true }),
  ),
);

const profileSource = path.join(input, 'profile', 'profile-main.jpg');

// Event photos used as a soft, blurred backdrop on /proyectos/.
// Moment 03 intentionally reuses the profile source because both files were
// byte-identical before the source-asset cleanup.
const momentNumbers = ['01', '02', '03', '04', '05', '06'];
const momentSource = (n) =>
  n === '03' ? profileSource : path.join(input, 'moments', `moment-${n}.jpg`);

await Promise.all([
  ...momentNumbers.map((n) =>
    sharp(momentSource(n))
      .rotate()
      .resize({ width: 1400, withoutEnlargement: true })
      .webp({ quality: 62 })
      .toFile(path.join(directories.moments, `moment-${n}.webp`)),
  ),
  sharp(profileSource)
    .rotate()
    .resize({ width: 1800, withoutEnlargement: true })
    .webp({ quality: 84 })
    .toFile(path.join(directories.profile, 'profile-main.webp')),
  sharp(profileSource)
    .rotate()
    .resize({ width: 900, withoutEnlargement: true })
    .webp({ quality: 82 })
    .toFile(path.join(directories.profile, 'profile-main-mobile.webp')),
  sharp(path.join(input, 'profile', 'profile-about.jpg'))
    .rotate()
    .resize({ width: 480, height: 480, fit: 'cover', position: 'top' })
    .webp({ quality: 86 })
    .toFile(path.join(directories.profile, 'profile-about.webp')),
  sharp(path.join(input, 'projects', 'al-lio.png'))
    .resize({
      width: 512,
      height: 512,
      fit: 'contain',
      withoutEnlargement: true,
    })
    .webp({ quality: 90, alphaQuality: 100 })
    .toFile(path.join(directories.projects, 'al-lio.webp')),
  sharp(path.join(input, 'projects', 'feedback2action.png'))
    .resize({ width: 480, fit: 'inside', withoutEnlargement: false })
    .webp({ quality: 90, alphaQuality: 100 })
    .toFile(path.join(directories.projects, 'feedback2action.webp')),
  sharp(path.join(input, 'projects', 'sidn-cost-control.png'))
    .resize({
      width: 640,
      height: 640,
      fit: 'contain',
      withoutEnlargement: true,
    })
    .webp({ quality: 88, alphaQuality: 100 })
    .toFile(path.join(directories.projects, 'sidn-cost-control.webp')),
  sharp(path.join(input, 'companies', 'konecta.jpg'))
    .resize({
      width: 300,
      height: 300,
      fit: 'contain',
      withoutEnlargement: false,
    })
    .webp({ quality: 88 })
    .toFile(path.join(directories.companies, 'konecta.webp')),
  sharp(path.join(input, 'companies', 'alcampo.jpg'))
    .resize({
      width: 400,
      height: 400,
      fit: 'contain',
      withoutEnlargement: true,
    })
    .webp({ quality: 88 })
    .toFile(path.join(directories.companies, 'alcampo.webp')),
  copyFile(
    path.join(input, 'companies', 'salunox.svg'),
    path.join(directories.companies, 'salunox.svg'),
  ),
  sharp(path.join(input, 'education', 'foc.png'))
    .resize({
      width: 320,
      height: 320,
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 },
      withoutEnlargement: true,
    })
    .png()
    .toFile(path.join(directories.education, 'foc.png')),
  sharp(path.join(input, 'education', 'adoratrices.png'))
    .resize({
      width: 320,
      height: 320,
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 },
      withoutEnlargement: true,
    })
    .png()
    .toFile(path.join(directories.education, 'adoratrices.png')),
]);

const ogPhoto = await sharp(profileSource)
  .rotate()
  .resize(540, 630, { fit: 'cover', position: 'center' })
  .webp({ quality: 86 })
  .toBuffer();

const ogText = Buffer.from(`
  <svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
    <rect width="720" height="630" fill="#f7f5f0"/>
    <rect x="68" y="78" width="72" height="7" rx="3.5" fill="#e76336"/>
    <text x="68" y="148" fill="#9a671d" font-family="Arial, sans-serif" font-size="28" font-weight="700" letter-spacing="5">DGO.</text>
    <text x="68" y="260" fill="#0e172a" font-family="Arial, sans-serif" font-size="62" font-weight="800">Daniel García</text>
    <text x="68" y="330" fill="#0e172a" font-family="Arial, sans-serif" font-size="62" font-weight="800">Ortega</text>
    <text x="68" y="404" fill="#5b6473" font-family="Arial, sans-serif" font-size="28">Desarrollador web full-stack</text>
    <circle cx="658" cy="527" r="9" fill="#1b8c82"/>
    <text x="68" y="535" fill="#0e172a" font-family="Arial, sans-serif" font-size="25">Granada, España</text>
  </svg>
`);

await sharp({
  create: {
    width: 1200,
    height: 630,
    channels: 3,
    background: '#f7f5f0',
  },
})
  .composite([
    { input: ogPhoto, left: 660, top: 0 },
    { input: ogText, left: 0, top: 0 },
  ])
  .webp({ quality: 88 })
  .toFile(path.join(publicDir, 'og-image.webp'));

console.log('Activos optimizados en public/images y public/og-image.webp');
