// Publishes the site to GitHub Pages: builds it for the /chhath-ghat/ sub-folder and force-pushes
// the result to the gh-pages branch, which Pages serves. Run with `npm run deploy`.
import { execSync } from 'node:child_process'
import { copyFileSync, rmSync, writeFileSync } from 'node:fs'

const REPO = 'https://github.com/swarajkumar001/chhath-ghat.git'
const run = (cmd, cwd = '.') => execSync(cmd, { cwd, stdio: 'inherit', env: { ...process.env, BASE_PATH: '/chhath-ghat/' } })

rmSync('dist', { recursive: true, force: true })
run('npx vite build')
writeFileSync('dist/.nojekyll', '') // serve the files as they are
copyFileSync('dist/index.html', 'dist/404.html')
run('git init -q -b gh-pages', 'dist')
run('git add -A', 'dist')
run('git commit -q -m "Publish site"', 'dist')
run(`git push -q -f ${REPO} gh-pages`, 'dist')
rmSync('dist', { recursive: true, force: true })
console.log('Published: https://swarajkumar001.github.io/chhath-ghat/ (live in about a minute)')
