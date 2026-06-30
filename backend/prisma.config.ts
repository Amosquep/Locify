import { defineConfig } from '@prisma/config'
import { config } from 'dotenv'

// Esto obliga a Node.js a leer tu archivo .env
config()

export default defineConfig({
  datasource: {
    // Ahora sí llegará el string con tu conexión a PostgreSQL
    url: process.env.DATABASE_URL, 
  }
})