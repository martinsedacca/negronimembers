#!/usr/bin/env node

/**
 * Script de migración directa a Supabase Cloud usando PostgreSQL
 * Ejecuta: node migrate-to-production.js
 */

const fs = require('fs')
const path = require('path')

console.log('🚀 MIGRACIÓN A SUPABASE CLOUD - Negroni Membership\n')
console.log('=' .repeat(60))

const SUPABASE_PROJECT_REF = 'hlfqsserfifjnarboqfj'
const SUPABASE_URL = `https://${SUPABASE_PROJECT_REF}.supabase.co`

// Para ejecutar SQL necesitamos la connection string de PostgreSQL
// Esta NO está disponible con solo el anon key o service role key
// Necesitas obtenerla del Dashboard

console.log('📋 INFORMACIÓN DE CONEXIÓN:')
console.log(`   Project URL: ${SUPABASE_URL}`)
console.log(`   Project Ref: ${SUPABASE_PROJECT_REF}\n`)

console.log('⚠️  IMPORTANTE:')
console.log('Para ejecutar migraciones SQL, necesitas la DATABASE PASSWORD.\n')

console.log('📝 OPCIÓN 1: Ejecutar manualmente en el Dashboard (RECOMENDADO)')
console.log('=' .repeat(60))
console.log('1. Ve a: https://supabase.com/dashboard/project/' + SUPABASE_PROJECT_REF)
console.log('2. Click en "SQL Editor" (menú lateral)')
console.log('3. Click en "+ New Query"')
console.log('4. Abre: FULL_PRODUCTION_MIGRATION.sql')
console.log('5. Copia TODO (Cmd+A → Cmd+C)')
console.log('6. Pega en SQL Editor')
console.log('7. Click "RUN"')
console.log('8. Espera 30-60 segundos')
console.log('9. Deberías ver: "Success. No rows returned" ✅\n')

console.log('📝 OPCIÓN 2: Usar psql con connection string')
console.log('=' .repeat(60))
console.log('1. Ve a: Settings → Database en tu Dashboard de Supabase')
console.log('2. Copia el "Connection string" (URI)')
console.log('3. Ejecuta:')
console.log('   psql "postgresql://postgres:[PASSWORD]@db.' + SUPABASE_PROJECT_REF + '.supabase.co:5432/postgres" < FULL_PRODUCTION_MIGRATION.sql\n')

console.log('📝 OPCIÓN 3: Usar este script con pg (Node.js)')
console.log('=' .repeat(60))
console.log('1. Instala pg: npm install pg')
console.log('2. Obtén la connection string del Dashboard')
console.log('3. Ejecuta: CONNECTION_STRING="postgresql://..." node migrate-with-pg.js\n')

// Crear script companion que usa pg
const pgScript = `#!/usr/bin/env node

/**
 * Ejecuta la migración usando pg (PostgreSQL client)
 * Uso: CONNECTION_STRING="postgresql://..." node migrate-with-pg.js
 */

const { Client } = require('pg')
const fs = require('fs')
const path = require('path')

const connectionString = process.env.CONNECTION_STRING

if (!connectionString) {
  console.error('❌ Error: Falta CONNECTION_STRING')
  console.error('\\nUso: CONNECTION_STRING="postgresql://postgres:[PASSWORD]@db.hlfqsserfifjnarboqfj.supabase.co:5432/postgres" node migrate-with-pg.js')
  process.exit(1)
}

async function migrate() {
  const client = new Client({ connectionString })
  
  try {
    console.log('🔌 Conectando a Supabase...')
    await client.connect()
    console.log('✅ Conectado\\n')
    
    console.log('📄 Leyendo script de migración...')
    const sql = fs.readFileSync(
      path.join(__dirname, 'FULL_PRODUCTION_MIGRATION.sql'),
      'utf8'
    )
    
    console.log(\`📊 Tamaño: \${sql.length} caracteres\`)
    console.log('⏳ Ejecutando migración... (30-60 segundos)\\n')
    
    await client.query(sql)
    
    console.log('✅ MIGRACIÓN COMPLETADA EXITOSAMENTE\\n')
    
    // Verificar tablas creadas
    console.log('🔍 Verificando tablas creadas...')
    const result = await client.query(\`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public'
      ORDER BY tablename
    \`)
    
    console.log(\`✅ Tablas creadas: \${result.rows.length}\\n\`)
    
    result.rows.forEach((row, i) => {
      console.log(\`   \${i + 1}. \${row.tablename}\`)
    })
    
    console.log('\\n🎉 ¡Migración exitosa!')
    
  } catch (error) {
    console.error('❌ Error durante la migración:')
    console.error(error.message)
    console.error('\\nRevisa el error y contacta soporte si es necesario.')
    process.exit(1)
  } finally {
    await client.end()
  }
}

migrate()
`

fs.writeFileSync(
  path.join(__dirname, 'migrate-with-pg.js'),
  pgScript
)

console.log('✅ Archivos creados:')
console.log('   - migrate-with-pg.js (para usar con pg)\n')

console.log('💡 RECOMENDACIÓN:')
console.log('La forma más rápida y segura es usar la OPCIÓN 1 (Dashboard).')
console.log('Solo toma 2 minutos y no necesitas configuración adicional.\n')

console.log('=' .repeat(60))
console.log('📞 ¿Necesitas ayuda? Pídeme asistencia específica.')
console.log('=' .repeat(60))
