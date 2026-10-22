// Serves PostgREST under Supabase's /rest/v1 path so supabase-js works against the local dev DB.
import http from 'node:http'

const PORT = Number(process.env.GATEWAY_PORT || 54321)
const UPSTREAM = { host: '127.0.0.1', port: Number(process.env.POSTGREST_PORT || 54330) }

http.createServer((req, res) => {
  if (!req.url.startsWith('/rest/v1')) {
    res.writeHead(404, { 'content-type': 'application/json' })
    return res.end('{"message":"not available in local showcase stack"}')
  }
  const headers = { ...req.headers, host: `${UPSTREAM.host}:${UPSTREAM.port}` }
  if (!headers.authorization && headers.apikey) headers.authorization = `Bearer ${headers.apikey}`
  const up = http.request({ ...UPSTREAM, method: req.method, path: req.url.slice('/rest/v1'.length) || '/', headers }, (r) => {
    res.writeHead(r.statusCode, r.headers)
    r.pipe(res)
  })
  up.on('error', (e) => { res.writeHead(502); res.end(String(e)) })
  req.pipe(up)
}).listen(PORT, () => console.log(`gateway on :${PORT}`))
