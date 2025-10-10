const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

const supabase = createClient(supabaseUrl, supabaseKey);

async function updateDesign() {
  console.log('Actualizando diseño: colores por tipo, todo lo demás compartido...');
  
  const { data, error } = await supabase
    .from('card_design_config')
    .update({
      // Colores DIFERENTES por tipo (solo esto cambia)
      colors: {
        basic: { bg: 'rgb(75, 85, 99)', fg: 'rgb(255, 255, 255)', label: 'rgb(209, 213, 219)' },
        silver: { bg: 'rgb(156, 163, 175)', fg: 'rgb(31, 41, 55)', label: 'rgb(55, 65, 81)' },
        gold: { bg: 'rgb(245, 158, 11)', fg: 'rgb(120, 53, 15)', label: 'rgb(146, 64, 14)' },
        platinum: { bg: 'rgb(15, 23, 42)', fg: 'rgb(241, 245, 249)', label: 'rgb(148, 163, 184)' }
      },
      
      // Logo (compartido para todos)
      logo_text: 'NEGRONI',
      organization_name: 'Negroni Membership',
      description: 'Tarjeta de Membresía Negroni',
      
      // Campos compartidos para todos los tipos
      header_fields: [
        { key: 'expiry_date', label: 'VALID UNTIL', source: 'expiry_date', dateStyle: 'PKDateStyleMedium' }
      ],
      
      primary_fields: [
        { key: 'member_name', label: "MEMBER'S NAME", source: 'full_name' }
      ],
      
      secondary_fields: [
        { key: 'membership_type', label: 'MEMBERSHIP TIER', source: 'membership_type', transform: 'uppercase' }
      ],
      
      auxiliary_fields: [],
      
      back_fields: [
        { key: 'member_number', label: 'Número de Miembro', source: 'member_number' },
        { key: 'points', label: 'Puntos Acumulados', source: 'points' },
        { key: 'email', label: 'Email', source: 'email' },
        { key: 'phone', label: 'Teléfono', source: 'phone', optional: true },
        { key: 'joined_date', label: 'Miembro desde', source: 'joined_date', dateStyle: 'PKDateStyleMedium' },
        { key: 'terms', label: 'Términos y Condiciones', value: 'Esta tarjeta es personal e intransferible. Válida solo para el titular. Para más información visita nuestro sitio web.' }
      ]
    })
    .eq('is_default', true)
    .select();
  
  if (error) {
    console.error('Error:', error);
    process.exit(1);
  }
  
  console.log('✅ Diseño actualizado!');
  console.log('\n🎨 Configuración:');
  console.log('   - Colores: DIFERENTES por tipo (Basic, Silver, Gold, Platinum)');
  console.log('   - Campos, textos, imágenes: COMPARTIDOS para todos');
}

updateDesign();
