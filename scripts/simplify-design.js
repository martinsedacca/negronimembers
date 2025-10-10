const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

const supabase = createClient(supabaseUrl, supabaseKey);

async function simplifyDesign() {
  console.log('Simplificando diseño a UNO solo para todas las membresías...');
  
  const { data, error } = await supabase
    .from('card_design_config')
    .update({
      // UN SOLO color para todas las membresías (negro elegante como la tarjeta que te gustó)
      colors: {
        bg: 'rgb(20, 20, 20)',      // Negro
        fg: 'rgb(255, 255, 255)',    // Texto blanco
        label: 'rgb(180, 180, 180)'  // Labels gris claro
      },
      
      // Logo
      logo_text: 'NEGRONI',
      organization_name: 'Negroni Membership',
      description: 'Tarjeta de Membresía Negroni',
      
      // Header: Fecha arriba derecha
      header_fields: [
        { key: 'expiry_date', label: 'VALID UNTIL', source: 'expiry_date', dateStyle: 'PKDateStyleMedium' }
      ],
      
      // Primary: Nombre del miembro
      primary_fields: [
        { key: 'member_name', label: "MEMBER'S NAME", source: 'full_name' }
      ],
      
      // Secondary: Tipo de membresía
      secondary_fields: [
        { key: 'membership_type', label: 'MEMBERSHIP TIER', source: 'membership_type', transform: 'uppercase' }
      ],
      
      // Auxiliary: vacío (diseño más limpio)
      auxiliary_fields: [],
      
      // Back fields
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
  
  console.log('✅ Diseño simplificado!');
  console.log('\n🎨 Ahora TODAS las membresías (Basic/Silver/Gold/Platinum) usan:');
  console.log('   - Fondo negro elegante');
  console.log('   - Texto blanco');
  console.log('   - Mismo diseño');
  console.log('\n�� Próximo: Agregar subida de imagen de fondo desde /dashboard/design');
}

simplifyDesign();
