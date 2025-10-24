// scripts/update-env.js
import fs from 'fs'
import os from 'os'

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

const ip = getLocalIP()
const envContent = `
VITE_API_BASE_URL=http://${ip}:7286
VITE_BASE_URL=http://${ip}:5173
`

fs.writeFileSync('.env', envContent.trim())
console.log(`✅ Updated .env with IP: ${ip}`)