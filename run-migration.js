#!/usr/bin/env node

/**
 * Script para ejecutar la migración completa en Supabase Cloud
 * Uso: node run-migration.js
 */

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Credenciales de Supabase Cloud
const SUPABASE_URL = 'https://hlfqsserfifjnarboqfj.supabase.co'
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhsZnFzc2VyZmlmam5hcmJvcWZqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjMwNDM3MSwiZXhwIjoyMDc3ODgwMzcxfQ.oebQeZRe11g88TYJoMs6nd9E-ZXHQdbYlBWoEZdwV3k'

console.log('🚀 Iniciando migración a Supabase Cloud...\n')

// Crear cliente con service role key
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function executeSqlFile(filePath) {
  console.log(`📄 Leyendo archivo: ${filePath}`)
  
  const sql = fs.readFileSync(filePath, 'utf8')
  
  console.log(`📊 Tamaño del script: ${sql.length} caracteres`)
  console.log('⏳ Ejecutando migración... (esto puede tomar 30-60 segundos)\n')

  try {
    // Nota: Supabase no tiene un endpoint directo para ejecutar SQL arbitrario
    // desde el cliente. La forma correcta es usar el SQL Editor del dashboard
    // o usar la Management API
    
    console.log('⚠️  IMPORTANTE:')
    console.log('El cliente de Supabase no puede ejecutar SQL arbitrario directamente.')
    console.log('Necesitas ejecutar el script en el Dashboard de Supabase.\n')
    
    console.log('📋 PASOS:')
    console.log('1. Ve a: https://supabase.com/dashboard/project/hlfqsserfifjnarboqfj')
    console.log('2. Click en "SQL Editor" en el menú lateral')
    console.log('3. Click en "+ New Query"')
    console.log('4. Abre el archivo: FULL_PRODUCTION_MIGRATION.sql')
    console.log('5. Copia TODO el contenido (Cmd+A → Cmd+C)')
    console.log('6. Pega en el SQL Editor')
    console.log('7. Click en "RUN" (esquina inferior derecha)')
    console.log('8. Espera 30-60 segundos\n')
    
    console.log('✅ Deberías ver: "Success. No rows returned"\n')
    
    // Intentar verificar la conexión
    console.log('🔍 Verificando conexión a Supabase...')
    const { data, error } = await supabase
      .from('pg_tables')
      .select('tablename')
      .eq('schemaname', 'public')
      .limit(1)
    
    if (error) {
      console.log('❌ Error al verificar conexión:', error.message)
      console.log('\nPara ejecutar queries SQL administrativos, usa el SQL Editor del Dashboard.')
    } else {
      console.log('✅ Conexión exitosa a Supabase')
      console.log(`📊 Tablas actuales encontradas: ${data.length > 0 ? 'Sí' : 'No'}`)
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

async function main() {
  const sqlFile = path.join(__dirname, 'FULL_PRODUCTION_MIGRATION.sql')
  
  if (!fs.existsSync(sqlFile)) {
    console.error('❌ No se encontró el archivo:', sqlFile)
    process.exit(1)
  }
  
  await executeSqlFile(sqlFile)
  
  console.log('\n' + '='.repeat(60))
  console.log('📚 ALTERNATIVA: Usar curl con Management API')
  console.log('='.repeat(60))
  console.log('\nSi tienes acceso token de la Management API, ejecuta:')
  console.log('\ncurl -X POST https://api.supabase.com/v1/projects/hlfqsserfifjnarboqfj/database/query \\')
  console.log('  -H "Authorization: Bearer YOUR_MANAGEMENT_API_TOKEN" \\')
  console.log('  -H "Content-Type: application/json" \\')
  console.log('  -d @migration-payload.json\n')
}

main().catch(console.error)
