// Package the Angular SSR server (commudle-admin/server) and browser assets
// (commudle-admin/browser) into a deployable Elastic Beanstalk bundle.
//
// The build step should produce:
//   dist/apps/commudle-admin/browser
//   dist/apps/commudle-admin/server
//
// This script stages the deploy bundle under dist/prod-server-bundle and zips it
// into prod-server.zip at the repo root.
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..', '..');
const commudleAdminDist = path.join(root, 'dist', 'apps', 'commudle-admin');
const bundleRoot = path.join(root, 'dist', 'prod-server-bundle');
const bundleCommudleAdmin = path.join(bundleRoot, 'commudle-admin');

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

function resetDir(p) {
  if (fs.existsSync(p)) {
    fs.rmSync(p, { recursive: true, force: true });
  }
  ensureDir(p);
}

function copyDir(src, dest) {
  if (!fs.existsSync(src)) {
    return;
  }
  ensureDir(dest);
  fs.cpSync(src, dest, { recursive: true });
}

function copyFile(src, dest) {
  if (!fs.existsSync(src)) {
    return;
  }
  ensureDir(path.dirname(dest));
  fs.copyFileSync(src, dest);
}

function getPackageNameFromImport(specifier) {
  if (!specifier || typeof specifier !== 'string') return null;
  // Ignore relative/absolute paths.
  if (specifier.startsWith('.') || specifier.startsWith('/') || specifier.startsWith('file:')) return null;
  // Normalize node: protocol to the bare builtin name.
  const normalized = specifier.startsWith('node:') ? specifier.slice('node:'.length) : specifier;
  // Scoped packages: @scope/name/...
  if (normalized.startsWith('@')) {
    const parts = normalized.split('/');
    return parts.length >= 2 ? `${parts[0]}/${parts[1]}` : null;
  }
  // Unscoped: name/...
  return normalized.split('/')[0];
}

function collectRuntimeDependenciesFromServerBundle(serverMainPath, declaredDependencies) {
  if (!fs.existsSync(serverMainPath)) {
    return {};
  }

  const bundle = fs.readFileSync(serverMainPath, 'utf8');

  // A conservative extractor: look for literal require() calls (including webpack externals)
  // and __non_webpack_require__ usages.
  const importSpecifiers = new Set();
  const patterns = [/__non_webpack_require__\((['"])([^'"]+)\1\)/g, /\brequire\((['"])([^'"]+)\1\)/g];

  for (const re of patterns) {
    let match;
    while ((match = re.exec(bundle)) !== null) {
      importSpecifiers.add(match[2]);
    }
  }

  const runtimeDeps = {};
  for (const specifier of importSpecifiers) {
    const pkgName = getPackageNameFromImport(specifier);
    if (!pkgName) continue;
    if (!declaredDependencies[pkgName]) continue;
    runtimeDeps[pkgName] = declaredDependencies[pkgName];
  }

  return runtimeDeps;
}

if (!fs.existsSync(commudleAdminDist)) {
  throw new Error(
    `Expected ${commudleAdminDist} to exist. Build commudle-admin SSR first (nx run commudle-admin:server:production).`,
  );
}

resetDir(bundleRoot);
copyDir(commudleAdminDist, bundleCommudleAdmin);

// Keep EB infra config in a dedicated deploy/ location (avoid coupling to legacy prerender app).
copyDir(path.join(root, 'deploy', 'elastic-beanstalk', '.ebextensions'), path.join(bundleRoot, '.ebextensions'));
// Some EB environments benefit from unsafe-perm (node-gyp) during install.
copyFile(path.join(root, 'deploy', 'elastic-beanstalk', '.npmrc'), path.join(bundleRoot, '.npmrc'));

// Create a deploy-time package.json at the bundle root that starts the Angular SSR server.
// Elastic Beanstalk will run `npm install` + `npm start` from the bundle root.
const rootPackageJson = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));

// The SSR server produced by @nx/angular:webpack-server is typically a webpack bundle.
// In that case, most (or all) npm dependencies are already bundled into
// dist/apps/commudle-admin/server/main.js, and the deploy-time package.json can be lean.
//
// We only include dependencies that are still required via runtime require() calls in
// the built server bundle (e.g., webpack externals).
const serverMainPath = path.join(commudleAdminDist, 'server', 'main.js');
const workspaceDependencies = rootPackageJson.dependencies || {};
const runtimeDependencies = collectRuntimeDependenciesFromServerBundle(serverMainPath, workspaceDependencies);
const deployPackageJson = {
  name: rootPackageJson.name || 'commudle',
  version: rootPackageJson.version || '0.0.0',
  private: true,
  scripts: {
    start: 'node commudle-admin/server/main.js',
  },
  // Match repo guidance (Node 18+) and Angular 19 support.
  engines: {
    node: '>=18.0.0',
  },
  dependencies: runtimeDependencies,
};

fs.writeFileSync(path.join(bundleRoot, 'package.json'), JSON.stringify(deployPackageJson, null, 2));

// zip all files in dist/prod-server-bundle and save to prod-server.zip
const archiver = require('archiver');
const output = fs.createWriteStream(path.join(root, 'prod-server.zip'));
const archive = archiver('zip', { zlib: { level: 9 } });
output.on('close', () => console.log((archive.pointer() / 1024).toFixed(2) + ' KB'));
archive.on('error', (err) => {
  throw err;
});
archive.pipe(output);
archive.directory(bundleRoot, false);
archive.finalize().then(() => console.log('done archiving'));
