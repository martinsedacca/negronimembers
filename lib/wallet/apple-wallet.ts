import { PKPass } from 'passkit-generator';
import path from 'path';
import fs from 'fs';
import type { Database } from '@/lib/types/database';

type Member = Database['public']['Tables']['members']['Row'];

// Todos los tipos tendrán fondo negro como la referencia
const getMembershipColor = (): string => {
  return 'rgb(0, 0, 0)'; // Negro para todos
};

// Get the base URL for the web service (for pass updates)
const getWebServiceURL = (): string => {
  return process.env.NEXT_PUBLIC_APP_URL || 'https://your-domain.com';
};

// Read certificates from env vars (production) or files (development)
const getCertificates = (): { wwdr: Buffer; signerCert: Buffer; signerKey: Buffer } => {
  // Check if certificates are in environment variables (base64 encoded)
  if (process.env.APPLE_WWDR_CERT && process.env.APPLE_SIGNER_CERT && process.env.APPLE_SIGNER_KEY) {
    return {
      wwdr: Buffer.from(process.env.APPLE_WWDR_CERT, 'base64'),
      signerCert: Buffer.from(process.env.APPLE_SIGNER_CERT, 'base64'),
      signerKey: Buffer.from(process.env.APPLE_SIGNER_KEY, 'base64'),
    };
  }
  
  // Fall back to file system (development)
  return {
    wwdr: fs.readFileSync(path.resolve(process.cwd(), 'certificates/wwdr.pem')),
    signerCert: fs.readFileSync(path.resolve(process.cwd(), 'certificates/signerCert.pem')),
    signerKey: fs.readFileSync(path.resolve(process.cwd(), 'certificates/signerKey.pem')),
  };
};

export async function generateApplePass(member: Member, authToken?: string, pushMessage?: string): Promise<Buffer> {
  try {
    // Read certificates
    const { wwdr, signerCert, signerKey } = getCertificates();

    // Create a temporary directory for this pass - MUST end with .pass
    const os = require('os');
    const tempDirName = `apple-pass-${Date.now()}-${Math.random().toString(36).substr(2, 9)}.pass`;
    const tempDir = path.join(os.tmpdir(), tempDirName);
    
    // Ensure temp directory exists
    fs.mkdirSync(tempDir, { recursive: true });
    
    try {
      // Copy template files to temp directory
      const templatePath = path.resolve(process.cwd(), 'wallet-templates/apple.pass');
      const files = fs.readdirSync(templatePath);
      
      for (const file of files) {
        const srcPath = path.join(templatePath, file);
        const destPath = path.join(tempDir, file);
        
        if (file === 'pass.json') {
          // Modify pass.json with member-specific values
          const passTemplate = JSON.parse(fs.readFileSync(srcPath, 'utf8'));
          passTemplate.serialNumber = member.member_number;
          passTemplate.description = 'Tarjeta de Membresía Negroni';
          passTemplate.backgroundColor = getMembershipColor(); // Negro
          passTemplate.foregroundColor = 'rgb(240, 219, 192)'; // #F0DBC0
          passTemplate.labelColor = 'rgb(240, 219, 192)'; // #F0DBC0 para labels
          // Eliminar logoText para que solo muestre el logo
          delete passTemplate.logoText;
          // Eliminar groupingIdentifier - no soportado para storeCard
          delete passTemplate.groupingIdentifier;
          passTemplate.barcode.message = member.member_number;
          
          // Add web service URL for automatic updates (MUST be in pass.json template)
          // Apple constructs URLs like: {webServiceURL}/v1/devices/{deviceId}/registrations/...
          // Our endpoints are at /api/v1/... so webServiceURL should be {domain}/api
          // Do NOT add trailing slash - Apple adds the path after
          if (authToken) {
            const wsUrl = `${getWebServiceURL()}/api`;
            passTemplate.webServiceURL = wsUrl;
            passTemplate.authenticationToken = authToken;
            console.log('🔗 [Wallet] Adding to pass.json - webServiceURL:', wsUrl);
          }
          
          const passJsonContent = JSON.stringify(passTemplate, null, 2);
          fs.writeFileSync(destPath, passJsonContent);
          console.log('📄 [Wallet] pass.json saved to:', destPath);
          console.log('📄 [Wallet] pass.json content keys:', Object.keys(passTemplate));
          console.log('📄 [Wallet] webServiceURL in saved file:', passTemplate.webServiceURL);
          console.log('📄 [Wallet] authenticationToken in saved file:', passTemplate.authenticationToken ? 'YES' : 'NO');
        } else {
          // Copy other files as-is
          fs.copyFileSync(srcPath, destPath);
        }
      }

      // Create pass from the temp template (webServiceURL is already in pass.json)
      const pass = await PKPass.from({
        model: tempDir,
        certificates: {
          wwdr,
          signerCert,
          signerKey,
        },
      });

      // Log the pass props to verify webServiceURL was loaded
      const passProps = pass.props;
      console.log('🎫 [Wallet] PKPass props keys:', Object.keys(passProps));
      console.log('🎫 [Wallet] PKPass webServiceURL:', passProps.webServiceURL);
      console.log('🎫 [Wallet] PKPass authenticationToken:', passProps.authenticationToken ? 'YES' : 'NO');

      // DEBUG: Log all member fields to identify null values
      console.log('🔍 [Wallet] Member fields debug:');
      console.log('  - full_name:', member.full_name, '| type:', typeof member.full_name);
      console.log('  - member_number:', member.member_number, '| type:', typeof member.member_number);
      console.log('  - email:', member.email, '| type:', typeof member.email);
      console.log('  - membership_type:', member.membership_type, '| type:', typeof member.membership_type);
      console.log('  - expiry_date:', member.expiry_date, '| type:', typeof member.expiry_date);
      console.log('  - joined_date:', member.joined_date, '| type:', typeof member.joined_date);
      console.log('  - phone:', member.phone, '| type:', typeof member.phone);
      console.log('  - id:', member.id, '| type:', typeof member.id);

      // Set pass type
      pass.type = 'storeCard';
      
      // Remove groupingIdentifier if it exists - not supported for storeCard type
      // This prevents the Apple Wallet warning: "groupingIdentifier is only supported for 
      // boardingPass, eventTicket, and healthPass styles"
      if ('groupingIdentifier' in pass.props) {
        delete (pass.props as Record<string, unknown>).groupingIdentifier;
      }

      // Header field - Valid Until
      if (member.expiry_date) {
        pass.headerFields.push({
          key: 'expiry_date',
          label: 'VALID UNTIL',
          value: member.expiry_date,
          dateStyle: 'PKDateStyleMedium',
        });
      } else {
        pass.headerFields.push({
          key: 'expiry_date',
          label: 'VALID UNTIL',
          value: 'Unlimited',
        });
      }

      // NO usar Primary field - dejar vacío para más espacio

      // Secondary fields - Member name and number (primera fila)
      pass.secondaryFields.push({
        key: 'member_name',
        label: "MEMBER'S NAME",
        value: member.full_name || 'Member',
      });
      
      pass.secondaryFields.push({
        key: 'member_number',
        label: 'MEMBER #',
        value: member.member_number,
        textAlignment: 'PKTextAlignmentRight',
      });

      // Auxiliary field - Membership tier
      pass.auxiliaryFields.push({
        key: 'membership_tier',
        label: 'TIER',
        value: member.membership_type?.toUpperCase() || 'MEMBER',
      });

      // Back fields - Additional info
      pass.backFields.push(
        {
          key: 'email',
          label: 'Email',
          value: member.email || 'No email',
        },
        {
          key: 'joined_date',
          label: 'Miembro desde',
          value: member.joined_date || new Date().toISOString().split('T')[0],
          dateStyle: 'PKDateStyleMedium',
        }
      );

      if (member.phone) {
        pass.backFields.push({
          key: 'phone',
          label: 'Teléfono',
          value: member.phone,
        });
      }

      // Push notification message field - this triggers visible notifications when changed
      // The changeMessage property makes Apple show a notification when this field changes
      // IMPORTANT: This field must ALWAYS be present for changeMessage to work
      pass.backFields.push({
        key: 'latest_update',
        label: 'Último mensaje',
        value: pushMessage || 'Bienvenido a Negroni Members',
        changeMessage: '%@', // %@ is replaced with the new value, shown as notification
      });

      pass.backFields.push({
        key: 'terms',
        label: 'Términos y Condiciones',
        value: 'Esta tarjeta es personal e intransferible. Válida solo para el titular. Para más información visita nuestro sitio web.',
      });

      // Add barcode - Use member ID for unique identification
      pass.setBarcodes({
        message: member.id,
        format: 'PKBarcodeFormatQR',
        messageEncoding: 'iso-8859-1',
      });

      // Generate and return the pass buffer
      const buffer = pass.getAsBuffer();
      return buffer;
    } finally {
      // Clean up temporary directory
      try {
        fs.rmSync(tempDir, { recursive: true, force: true });
      } catch (cleanupError) {
        console.error('Error cleaning up temp directory:', cleanupError);
      }
    }
  } catch (error) {
    console.error('Error generating Apple Wallet pass:', error);
    throw new Error(`Failed to generate Apple Wallet pass: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
