// Renders showcase/showcase-1920x1200.mp4 from scripts/showcase/out/{master.mp4,events.json}.
// Remotion requires a paid company license for companies with more than 3 people.
import { bundle } from '@remotion/bundler'
import { renderMedia, selectComposition } from '@remotion/renderer'
import { copyFileSync, mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs'
import path from 'node:path'
import { buildEdit } from './timeline.mjs'

const here = path.dirname(new URL(import.meta.url).pathname)
const root = path.resolve(here, '../../..')
const outDir = path.join(root, 'scripts/showcase/out')
const log = JSON.parse(readFileSync(path.join(outDir, 'events.json'), 'utf8'))
const edit = buildEdit(log)
writeFileSync(path.join(outDir, 'edit.json'), JSON.stringify({ moments: edit.moments, factor: edit.factor, seconds: edit.durationInFrames / 30 }, null, 1))
console.log(`edit: ${(edit.durationInFrames / 30).toFixed(1)}s, speed factor ${edit.factor}`)

mkdirSync(path.join(here, 'public'), { recursive: true })
copyFileSync(path.join(outDir, 'master.mp4'), path.join(here, 'public/master.mp4'))

const browserExecutable = process.env.REMOTION_BROWSER ?? ['/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell'].find(existsSync)
const serveUrl = await bundle({ entryPoint: path.join(here, 'src/index.jsx'), publicDir: path.join(here, 'public') })
const inputProps = { frames: edit.frames }
const composition = await selectComposition({ serveUrl, id: 'Showcase', inputProps, browserExecutable })
const output = process.env.SHOWCASE_OUTPUT ?? path.join(root, 'showcase/showcase-1920x1200.mp4')
mkdirSync(path.dirname(output), { recursive: true })
let last = -1
await renderMedia({
  serveUrl, composition, inputProps, browserExecutable, codec: 'h264', crf: 14, muted: true, enforceAudioTrack: false,
  imageFormat: 'png', pixelFormat: 'yuv420p', concurrency: process.env.CONCURRENCY ? Number(process.env.CONCURRENCY) : null, outputLocation: output,
  frameRange: process.env.FRAME_RANGE ? process.env.FRAME_RANGE.split('-').map(Number) : undefined,
  onProgress: ({ progress }) => { const p = Math.floor(progress * 10); if (p !== last) { last = p; process.stdout.write(`${p * 10}% `) } },
})
console.log(`\n${path.relative(root, output)}`)
