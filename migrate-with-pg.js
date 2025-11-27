#!/usr/bin/env node

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
  console.error('\nUso: CONNECTION_STRING="postgresql://postgres:[PASSWORD]@db.hlfqsserfifjnarboqfj.supabase.co:5432/postgres" node migrate-with-pg.js')
  process.exit(1)
}

async function migrate() {
  const client = new Client({ connectionString })
  
  try {
    console.log('🔌 Conectando a Supabase...')
    await client.connect()
    console.log('✅ Conectado\n')
    
    console.log('📄 Leyendo script de migración...')
    const sql = fs.readFileSync(
      path.join(__dirname, 'FULL_PRODUCTION_MIGRATION.sql'),
      'utf8'
    )
    
    console.log(`📊 Tamaño: ${sql.length} caracteres`)
    console.log('⏳ Ejecutando migración... (30-60 segundos)\n')
    
    await client.query(sql)
    
    console.log('✅ MIGRACIÓN COMPLETADA EXITOSAMENTE\n')
    
    // Verificar tablas creadas
    console.log('🔍 Verificando tablas creadas...')
    const result = await client.query(`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public'
      ORDER BY tablename
    `)
    
    console.log(`✅ Tablas creadas: ${result.rows.length}\n`)
    
    result.rows.forEach((row, i) => {
      console.log(`   ${i + 1}. ${row.tablename}`)
    })
    
    console.log('\n🎉 ¡Migración exitosa!')
    
  } catch (error) {
    console.error('❌ Error durante la migración:')
    console.error(error.message)
    console.error('\nRevisa el error y contacta soporte si es necesario.')
    process.exit(1)
  } finally {
    await client.end()
  }
}

migrate()
