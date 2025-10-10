'use client'

import { useState, useEffect } from 'react'
import { Search, Smartphone, Download, QrCode, Award, Calendar, X } from 'lucide-react'
import type { Database } from '@/lib/types/database'
import QRCodeLib from 'qrcode'

type Member = Database['public']['Tables']['members']['Row'] & {
  wallet_passes?: Database['public']['Tables']['wallet_passes']['Row'][]
}

interface CardsListProps {
  members: Member[]
}

export default function CardsList({ members }: CardsListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showQR, setShowQR] = useState<string | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  const filteredMembers = members.filter((member) =>
    member.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.member_number.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Todas las tarjetas tienen fondo negro como la referencia
  const getMembershipColor = () => {
    return 'from-black to-neutral-900' // Negro para todas
  }

  const handleGenerateAppleWallet = async (member: Member) => {
    try {
      // Show loading state
      const button = document.querySelector(`[data-member-id="${member.id}"]`) as HTMLButtonElement;
      if (button) {
        button.disabled = true;
        button.textContent = 'Generando...';
      }

      // Call API to generate pass
      const response = await fetch(`/api/wallet/apple/${member.id}`);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.details || 'Error al generar el pass');
      }

      // Download the pass file
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `membership-${member.member_number}.pkpass`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      // Show success message
      alert(`✅ Tarjeta de Apple Wallet generada exitosamente para ${member.full_name}!\n\nEl archivo se ha descargado. Ábrelo en tu iPhone para agregarlo a Apple Wallet.`);
      
      // Refresh the page to show updated pass status
      window.location.reload();
    } catch (error) {
      console.error('Error generating Apple Wallet pass:', error);
      alert(`❌ Error al generar la tarjeta:\n${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      // Reset button state
      const button = document.querySelector(`[data-member-id="${member.id}"]`) as HTMLButtonElement;
      if (button) {
        button.disabled = false;
        button.textContent = 'Generar Apple Wallet';
      }
    }
  }

  const handleGenerateGoogleWallet = (member: Member) => {
    // TODO: Implementar generación de Google Wallet
    alert(`Generando tarjeta de Google Wallet para ${member.full_name}...\n\nEsta funcionalidad se implementará siguiendo la guía en WALLET_INTEGRATION.md`)
  }

  const handleShowQR = async (member: Member) => {
    const url = `${window.location.origin}/api/wallet/apple/${member.id}`;
    try {
      const qrCode = await QRCodeLib.toDataURL(url, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      });
      setQrDataUrl(qrCode);
      setShowQR(member.id);
    } catch (error) {
      console.error('Error generating QR code:', error);
      alert('Error al generar código QR');
    }
  };

  const closeQRModal = () => {
    setShowQR(null);
    setQrDataUrl('');
  };


  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="bg-neutral-800 border border-neutral-700 shadow rounded-lg p-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar por nombre, email o número de miembro..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full px-4 py-3 bg-neutral-700 border border-neutral-600 text-white rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent placeholder-neutral-400"
          />
        </div>
      </div>

      {/* Cards Grid */}
      {filteredMembers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMembers.map((member) => (
            <div
              key={member.id}
              className="bg-neutral-800 border border-neutral-700 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
            >
              {/* Card Preview - EXACTO a la referencia VIP */}
              <div className={`bg-gradient-to-br ${getMembershipColor()} p-6 relative min-h-[320px] flex flex-col`} style={{ color: '#F0DBC0' }}>
                {/* Header: Logo y Valid Until */}
                <div className="flex items-start justify-between mb-8">
                  <img 
                    src="/NEGRONI-Logo-hueso_png.png" 
                    alt="Negroni" 
                    className="h-8 w-auto object-contain"
                  />
                  <div className="text-right">
                    <div className="text-xs uppercase opacity-75 mb-1" style={{ color: '#F0DBC0' }}>VALID UNTIL</div>
                    <div className="text-base font-medium" style={{ color: '#F0DBC0' }}>
                      {member.expiry_date 
                        ? new Date(member.expiry_date).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric',
                            year: 'numeric' 
                          })
                        : 'Unlimited'
                      }
                    </div>
                  </div>
                </div>

                {/* Member's Name - Secondary field (tamaño mediano) */}
                <div className="mb-6">
                  <div className="text-xs uppercase opacity-75 mb-2" style={{ color: '#F0DBC0' }}>MEMBER'S NAME</div>
                  <div className="text-xl font-semibold leading-tight" style={{ color: '#F0DBC0' }}>
                    {member.full_name}
                  </div>
                </div>

                {/* Membership Tier - Secondary field (mismo tamaño) */}
                <div className="mb-8">
                  <div className="text-xs uppercase opacity-75 mb-2" style={{ color: '#F0DBC0' }}>MEMBERSHIP TIER</div>
                  <div className="text-xl font-bold" style={{ color: '#F0DBC0' }}>
                    {member.membership_type.toUpperCase()}
                  </div>
                </div>

                {/* QR Code */}
                <div className="mt-auto flex justify-center">
                  <div className="bg-white p-3 rounded-lg">
                    <QrCode className="w-28 h-28 text-black" strokeWidth={0.5} />
                  </div>
                </div>
              </div>

              {/* Card Info */}
              <div className="p-6 space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-neutral-300">
                    <span className="font-medium mr-2">Email:</span>
                    <span className="truncate">{member.email}</span>
                  </div>
                  {member.phone && (
                    <div className="flex items-center text-sm text-neutral-300">
                      <span className="font-medium mr-2">Teléfono:</span>
                      <span>{member.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center text-sm text-neutral-300">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>Miembro desde {new Date(member.joined_date).toLocaleDateString('es-ES')}</span>
                  </div>
                </div>

                {/* Wallet Status */}
                <div className="pt-4 border-t border-neutral-700">
                  <p className="text-xs text-neutral-400 mb-3">Estado de Tarjetas:</p>
                  <div className="space-y-2">
                    {member.wallet_passes && member.wallet_passes.length > 0 ? (
                      member.wallet_passes.map((pass) => (
                        <div key={pass.id} className="flex items-center justify-between text-sm">
                          <span className="text-neutral-200">
                            {pass.pass_type === 'apple' ? '🍎 Apple Wallet' : '📱 Google Wallet'}
                          </span>
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
                            Generada
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-neutral-400 italic">No hay tarjetas generadas</p>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-4 space-y-2">
                  <button
                    data-member-id={member.id}
                    onClick={() => handleGenerateAppleWallet(member)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-neutral-800 transition font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Smartphone className="w-4 h-4" />
                    Generar Apple Wallet
                  </button>
                  <button
                    onClick={() => handleGenerateGoogleWallet(member)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition font-medium text-sm"
                  >
                    <Download className="w-4 h-4" />
                    Generar Google Wallet
                  </button>
                  <button
                    onClick={() => handleShowQR(member)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-neutral-700 text-neutral-200 rounded-lg hover:bg-neutral-600 transition font-medium text-sm"
                  >
                    <QrCode className="w-4 h-4" />
                    Mostrar QR de Descarga
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-neutral-800 border border-neutral-700 shadow rounded-lg p-12 text-center">
          <Smartphone className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">
            {searchTerm ? 'No se encontraron miembros' : 'No hay miembros activos'}
          </h3>
          <p className="text-neutral-400">
            {searchTerm 
              ? 'Intenta con otro término de búsqueda'
              : 'Crea miembros primero para poder generar sus tarjetas digitales'
            }
          </p>
        </div>
      )}

      {/* Summary */}
      {filteredMembers.length > 0 && (
        <div className="bg-neutral-800 border border-neutral-700 shadow rounded-lg px-6 py-4">
          <p className="text-sm text-neutral-300">
            Mostrando <span className="font-medium">{filteredMembers.length}</span> de{' '}
            <span className="font-medium">{members.length}</span> miembros activos
          </p>
        </div>
      )}

      {/* QR Code Modal */}
      {showQR && qrDataUrl && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" onClick={closeQRModal}>
          <div className="bg-neutral-800 border border-neutral-700 rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center relative" onClick={(e) => e.stopPropagation()}>
            <button onClick={closeQRModal} className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-300">
              <X className="w-6 h-6" />
            </button>
            <h3 className="text-2xl font-bold text-white mb-2">Escanear para Descargar</h3>
            <p className="text-neutral-300 mb-6">Abre la cámara de tu iPhone y apunta al código QR para agregar la tarjeta a tu Wallet.</p>
            <div className="p-2 bg-neutral-700 rounded-lg inline-block">
              <img src={qrDataUrl} alt="QR Code para descargar pass" className="w-64 h-64" />
            </div>
            <p className="text-xs text-neutral-400 mt-4">Este código es único para este miembro.</p>
          </div>
        </div>
      )}
    </div>
  )
}
