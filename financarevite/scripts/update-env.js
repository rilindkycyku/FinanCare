import fs from 'fs'
import os from 'os'
import { createServer } from 'net'

function getLocalIP() {
  const interfaces = os.networkInterfaces()
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address
      }
    }
  }
  return 'localhost'
}

function findAvailablePort(startPort = 5173) {
  return new Promise((resolve) => {
    const server = createServer()
    server.listen(startPort, () => {
      const port = server.address().port
      server.close(() => resolve(port))
    })
    server.on('error', () => {
      resolve(findAvailablePort(startPort + 1))
    })
  })
}

async function updateEnv() {
  const ip = getLocalIP()
  const port = await findAvailablePort(5173)
  
  const envContent = `
VITE_API_BASE_URL=http://${ip}:7286
VITE_BASE_URL=http://${ip}:${port}
`

  fs.writeFileSync('.env', envContent.trim())
  console.log(`✅ Updated .env with IP: ${ip}, Port: ${port}`)
}

updateEnv()