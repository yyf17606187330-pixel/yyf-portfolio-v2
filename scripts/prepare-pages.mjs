import { cpSync, existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { resolve, relative, join } from 'node:path';

// Keep production sources intact; assemble an isolated Pages upload.
const root = process.cwd();
const commit = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
const source = resolve(root, 'dist');
const output = resolve(root, '.agent-state', 'pages-deploy', commit);
if (!existsSync(join(source, 'index.html'))) throw new Error('Run npm run build first.');
if (existsSync(output)) throw new Error('Upload directory already exists; use the existing verified package or a new commit.');
const redirects = [];
let files = 0;
function copy(directory) {
  for (const name of readdirSync(directory)) {
    const path = join(directory, name);
    if (statSync(path).isDirectory()) { copy(path); continue; }
    const asset = relative(source, path).replaceAll('\\', '/');
    if (statSync(path).size > 25 * 1024 * 1024) {
      if (!asset.startsWith('media/') || !asset.endsWith('.mp4')) throw new Error(`Unsupported oversized asset: ${asset}`);
      const gitPath = `public/${asset}`;
      const pointer = execFileSync('git', ['show', `${commit}:${gitPath}`], { encoding: 'utf8' });
      if (!pointer.startsWith('version https://git-lfs.github.com/spec/v1')) throw new Error(`Expected committed LFS media: ${gitPath}`);
      redirects.push(`/${asset} https://media.githubusercontent.com/media/yyf17606187330-pixel/yyf-portfolio-v2/${commit}/${gitPath} 302`);
    } else {
      const destination = join(output, asset);
      mkdirSync(resolve(destination, '..'), { recursive: true });
      cpSync(path, destination);
      files++;
    }
  }
}
copy(source);
writeFileSync(join(output, '_redirects'), redirects.join('\n') + '\n');
writeFileSync(join(output, 'deployment.json'), JSON.stringify({ commit, largeMediaOrigin: 'GitHub LFS', redirectedVideos: redirects.length }) + '\n');
console.log(JSON.stringify({ output, commit, files, redirectedVideos: redirects.length }, null, 2));
