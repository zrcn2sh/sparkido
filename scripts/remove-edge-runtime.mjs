import fs from 'fs'
import path from 'path'

const ROOT = path.join(process.cwd(), 'src', 'app')
const EDGE_LINE = /^export const runtime = 'edge'\s*\n\n?/m

function walk(dir) {
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name)
    if (fs.statSync(full).isDirectory()) {
      walk(full)
      continue
    }
    if (!/^(route\.ts|page\.tsx|layout\.tsx)$/.test(name)) continue
    const before = fs.readFileSync(full, 'utf8')
    const after = before.replace(EDGE_LINE, '')
    if (after !== before) {
      fs.writeFileSync(full, after)
      console.log('removed edge:', path.relative(process.cwd(), full))
    }
  }
}

walk(ROOT)
