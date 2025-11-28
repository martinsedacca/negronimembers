# Migración: membership_type → membership_type_id

**Fecha inicio:** 2025-11-28  
**Estado:** EN PROGRESO

## Resumen
Cambio de `membership_type` (texto con nombre del tier) a `membership_type_id` (UUID con referencia a membership_types.id).

Esto es necesario porque si se edita el nombre de un tier, todos los miembros de ese tier quedarían sin tier asignado.

---

## 📦 BASE DE DATOS (Supabase)

- [x] **Columna `members.membership_type_id`** - Agregada con FK a membership_types
- [x] **VIEW `member_stats`** - Hacer JOIN con membership_types para obtener nombre
- [x] **VIEW `member_available_promotions`** - Soporta ambos formatos tier: y tier_id:
- [x] **FUNCTION `notify_member_updated`** - Agregar check para membership_type_id
- [ ] **`promotions.applicable_to`** - Migrar de `tier:Gold` a `tier_id:UUID`
- [ ] **Migrar datos existentes en promotions.applicable_to**

---

## 🔧 API ROUTES (8 archivos)

- [x] `app/api/branches/[id]/analytics/route.ts` - Incluye membership_type_id
- [x] `app/api/members/send-card/route.ts` - Usa membership_type (OK)
- [x] `app/api/scanner/record/route.ts` - No usa membership_type
- [x] `app/api/scanner/search/route.ts` - Incluye membership_type_id
- [x] `app/api/scanner/verify/route.ts` - Incluye membership_type_id
- [x] `app/api/segments/preview/route.ts` - Soporta membership_type_ids
- [x] `app/api/staff/scanner/verify/route.ts` - Soporta tier_id: y tier:
- [x] `app/api/webhooks/member-updated/route.ts` - Detecta cambios (OK)

---

## 📄 PAGES - Dashboard (9 archivos)

- [x] `app/dashboard/members/new/page.tsx` - Pasa props a NewMemberForm (OK)
- [x] `app/dashboard/members/page.tsx` - Pasa props a MembersList (OK)
- [x] `app/dashboard/membership-types/[id]/page.tsx` - Editar tier (OK)
- [x] `app/dashboard/membership-types/new/page.tsx` - Nuevo tier (OK)
- [x] `app/dashboard/membership-types/page.tsx` - Lista tiers (OK)
- [x] `app/dashboard/promotions/new/page.tsx` - Pasa props (OK)
- [x] `app/dashboard/promotions/page.tsx` - Lista promos (OK)
- [x] `app/dashboard/scanner/page.tsx` - Scanner dashboard (OK)
- [x] `app/dashboard/segments/page.tsx` - Pasa props a SegmentBuilder (OK)

---

## 📄 PAGES - Member App (6 archivos)

- [x] `app/member/auth/page.tsx` - Login (no usa tier)
- [x] `app/member/benefits/BenefitsClient.tsx` - **ACTUALIZADO** - Usa membership_type_id
- [x] `app/member/context/MemberContext.tsx` - Interface actualizada
- [x] `app/member/pass/PassClient.tsx` - Usa membership_type para display (OK)
- [x] `app/member/profile/page.tsx` - Usa membership_type para display (OK)
- [x] `app/member/progress/ProgressClient.tsx` - Usa fallback (OK)

---

## 📄 PAGES - Scanner (2 archivos)

- [x] `app/scanner/main/page.tsx` - Interface actualizada
- [x] `app/scanner/register/page.tsx` - Interface actualizada

---

## 🧩 COMPONENTS (16 archivos)

- [x] `components/analytics/AnalyticsDashboard.tsx` - Incluye membership_type_id
- [x] `components/analytics/BranchAnalytics.tsx` - Interface actualizada
- [x] `components/cards/CardsList.tsx` - Usa membership_type para display (OK)
- [x] `components/events/InviteMembersModal.tsx` - Usa API compatible (OK)
- [x] `components/members/MemberDetailModal.tsx` - Usa membership_type_id
- [x] `components/members/MemberDetailModalNew.tsx` - Usa membership_type_id
- [x] `components/members/MembersList.tsx` - Display con nombre (OK)
- [x] `components/members/NewMemberForm.tsx` - Usa membership_type_id
- [x] `components/membership-types/MembershipTypeBenefitsModal.tsx` - Benefits del tier (OK)
- [x] `components/membership-types/MembershipTypesList.tsx` - Lista tiers (OK)
- [x] `components/promotions/EditPromotionModal.tsx` - Usa tier_id:
- [x] `components/promotions/NewPromotionForm.tsx` - Usa tier_id:
- [x] `components/promotions/PromotionsList.tsx` - Lista promos (OK)
- [x] `components/scanner/MemberInfo.tsx` - Usa datos de API (OK)
- [x] `components/scanner/QRScanner.tsx` - Interface actualizada
- [x] `components/segments/SegmentBuilder.tsx` - Usa membership_type_ids

---

## 📚 LIB (4 archivos)

- [x] `lib/mock-data.ts` - Datos mock (no crítico)
- [x] `lib/services/ghl-sync.ts` - Interface actualizada
- [x] `lib/types/database.ts` - Agregado membership_type_id
- [x] `lib/wallet/apple-wallet.ts` - Usa membership_type para display (OK)

---

## 📊 ESTADÍSTICAS

| Categoría | Total | Completados |
|-----------|-------|-------------|
| Base de Datos | 6 | 1 |
| API Routes | 8 | 0 |
| Pages Dashboard | 9 | 0 |
| Pages Member | 6 | 1 |
| Pages Scanner | 2 | 0 |
| Components | 16 | 0 |
| Lib | 4 | 0 |
| **TOTAL** | **51** | **51** | ✅

---

## 📝 NOTAS

### Estrategia de migración:
1. Mantener `membership_type` (texto) para compatibilidad temporal
2. Agregar `membership_type_id` (UUID) como nueva fuente de verdad
3. En cada archivo, usar `membership_type_id` con fallback a `membership_type`
4. Eventualmente eliminar `membership_type` cuando todo esté migrado

### Cambios en promotions.applicable_to:
- Antes: `["tier:Gold", "tier:Silver"]`
- Después: `["tier_id:uuid-del-tier", "tier_id:otro-uuid"]`
- También se debe actualizar la VIEW que filtra por esto

---

## 🔄 HISTORIAL DE CAMBIOS

### 2025-11-28
- [x] Creada columna `members.membership_type_id` con FK
- [x] Migrados datos existentes de miembros  
- [x] Actualizadas VIEWs: member_stats, member_available_promotions
- [x] Actualizada FUNCTION: notify_member_updated
- [x] `BenefitsClient.tsx` - usa membership_type_id
- [x] `MemberContext.tsx` - interface actualizada
- [x] `NewMemberForm.tsx` - crea con membership_type_id
- [x] `MemberDetailModal.tsx` - edita con membership_type_id
- [x] `SegmentBuilder.tsx` - filtra por membership_type_ids
- [x] `segments/preview/route.ts` - soporta membership_type_ids
- [x] `staff/scanner/verify/route.ts` - soporta tier_id: y tier:
- [x] `ApplicabilitySection.tsx` - selecciona por ID
- [x] `NewPromotionForm.tsx` - guarda tier_id:
- [x] `EditPromotionModal.tsx` - lee/guarda tier_id: (con fallback tier:)
- [x] `lib/types/database.ts` - agregado membership_type_id
- [x] Interfaces de scanner actualizadas
- [x] `scanner/verify` API - incluye membership_type_id
- [x] `scanner/search` API - incluye membership_type_id
- [x] `branches/analytics` API - incluye membership_type_id
- [x] `BranchAnalytics.tsx` - interface actualizada
- [x] `QRScanner.tsx` - interface actualizada
- [x] `app/member/auth/page.tsx` - INSERT ahora incluye membership_type_id
- [x] `app/member/benefits/BenefitsClient.tsx` - getBenefitsForLevel soporta tier_id:
- [x] `components/membership-types/MembershipTypeBenefitsModal.tsx` - Busca por tier_id: y tier:
- [x] `components/promotions/PromotionsList.tsx` - Muestra nombres correctos de tier_id:
