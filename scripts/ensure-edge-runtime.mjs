import fs from 'fs'
import path from 'path'

const ROOT = path.join(process.cwd(), 'src', 'app')
const EDGE = "export const runtime = 'edge'\n\n"
const HAS_EDGE = /export\s+const\s+runtime\s*=\s*['"]edge['"]/
const NODEJS = /\n?export const runtime = 'nodejs'\s*\n/g

function walk(dir) {
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name)
    if (fs.statSync(full).isDirectory()) {
      walk(full)
      continue
    }
    if (!/^(route\.ts|page\.tsx|layout\.tsx)$/.test(name)) continue
    let text = fs.readFileSync(full, 'utf8')
    const before = text
    text = text.replace(NODEJS, '\n')
    text = text.replace(/^(export const runtime = 'edge'\s*\n){2,}/m, EDGE)
    if (!HAS_EDGE.test(text)) {
      text = EDGE + text
    }
    if (text !== before) {
      fs.writeFileSync(full, text)
      console.log('fixed:', path.relative(process.cwd(), full))
    }
  }
}

walk(ROOT)
