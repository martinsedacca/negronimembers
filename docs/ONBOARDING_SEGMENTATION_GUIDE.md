# 🎯 Guía: Onboarding + Segmentación

## 📍 Dónde Configurar las Preguntas

### Dashboard de Onboarding
**URL:** `/dashboard/onboarding`

Aquí puedes:
- ✅ Ver todas las preguntas de onboarding
- ✅ Crear nuevas preguntas (Click "New Question")
- ✅ Editar preguntas existentes
- ✅ Reordenar con drag & drop
- ✅ Activar/desactivar preguntas
- ✅ Eliminar preguntas
- ✅ Ver estadísticas de respuestas

---

## 💾 Dónde se Guardan las Respuestas

### Tabla: `member_onboarding_responses`

```sql
CREATE TABLE member_onboarding_responses (
  id UUID PRIMARY KEY,
  member_id UUID → members(id),
  question_id UUID → onboarding_questions(id),
  response_value TEXT,
  created_at TIMESTAMPTZ
);
```

**Ejemplo de Query:**
```sql
-- Ver respuestas de un miembro
SELECT 
  oq.question_text,
  mor.response_value
FROM member_onboarding_responses mor
JOIN onboarding_questions oq ON mor.question_id = oq.id
WHERE mor.member_id = 'abc-123';

-- Ver respuestas agregadas de una pregunta
SELECT 
  response_value,
  COUNT(*) as count
FROM member_onboarding_responses
WHERE question_id = 'question-id'
GROUP BY response_value
ORDER BY count DESC;
```

---

## 🎯 Usar en Segmentación

### Página de Segmentos
**URL:** `/dashboard/segments`

### ¿Cómo funciona?

1. **Configura filtros** en el panel izquierdo
2. **Incluye respuestas de onboarding** (nueva sección)
3. **Click "Aplicar Filtros"**
4. **Ve los miembros** que coinciden

---

## 🔧 Flujo Completo (Ejemplo Práctico)

### 1. Crear Pregunta de Onboarding

**Dashboard → `/dashboard/onboarding` → "New Question"**

```
Question Text: "What's your favorite drink?"
Type: Single Choice
Options: Coffee, Tea, Juice, Smoothie
Required: Yes
```

Save → La pregunta aparece en la lista

---

### 2. Miembros Responden

**App Móvil → `/member/onboarding`**

```
Miembro A: Selecciona "Coffee"
Miembro B: Selecciona "Coffee"
Miembro C: Selecciona "Tea"
Miembro D: Selecciona "Juice"
```

Respuestas guardadas en `member_onboarding_responses`:
```
| member_id | question_id | response_value |
|-----------|-------------|----------------|
| member-a  | q-1         | Coffee         |
| member-b  | q-1         | Coffee         |
| member-c  | q-1         | Tea            |
| member-d  | q-1         | Juice          |
```

---

### 3. Crear Segmento Basado en Respuestas

**Dashboard → `/dashboard/segments`**

**Panel de Filtros:**
```
Onboarding Responses:
  ☑ What's your favorite drink?
    ☑ Coffee
    ☐ Tea
    ☐ Juice
    ☐ Smoothie

Click "Aplicar Filtros"
```

**Resultado:**
```
2 Miembros encontrados:
- Miembro A (respondió Coffee)
- Miembro B (respondió Coffee)
```

---

## 🎨 Tipos de Preguntas que se Pueden Filtrar

### ✅ Filtrables:
- **Single Choice** (select) - Una opción
- **Multiple Choice** (multi_select) - Varias opciones
- **Yes/No** (yes_no) - Sí o No
- **Rating** (rating) - 1-5 estrellas ⭐

### ❌ No filtrables (por ahora):
- **Text Input** - Respuesta libre (requiere búsqueda de texto)

---

## 📊 Casos de Uso Reales

### Caso 1: Campaign para Coffee Lovers
```
Filtro:
- Favorite drink = Coffee
- Visits last 30 days >= 3

Acción:
→ Enviar push: "20% off your next coffee order!"
```

### Caso 2: Veganos/Vegetarianos
```
Filtro:
- Dietary restrictions = Yes
- Total spent >= $100

Acción:
→ Asignar promoción especial: "New vegan menu items"
```

### Caso 3: Morning Regulars
```
Filtro:
- Favorite time to visit = Morning
- Total visits >= 10

Acción:
→ Enviar a Wallet: "Breakfast special for you!"
```

### Caso 4: Coffee Experts (Rating)
```
Filtro:
- Coffee knowledge rating = 4 ⭐⭐⭐⭐ OR 5 ⭐⭐⭐⭐⭐
- Visits last 30 days >= 5

Acción:
→ Invitar a evento: "Exclusive coffee tasting event for experts"
```

### Caso 5: Beginners (Low Rating)
```
Filtro:
- Coffee knowledge rating = 1 ⭐ OR 2 ⭐⭐
- Total visits <= 3

Acción:
→ Enviar push: "Learn about coffee! Free barista Q&A this Saturday"
```

---

## 🔄 Flujo Técnico

### Frontend (SegmentBuilder)

1. Fetch preguntas de onboarding:
```typescript
fetch('/api/onboarding/questions')
// Returns: [{ id, question_text, question_type, options }]
```

2. Mostrar checkboxes para cada opción

3. Al aplicar filtros:
```typescript
fetch('/api/segments/preview', {
  body: JSON.stringify({
    filters: {
      onboarding_responses: {
        'question-id-1': ['Coffee', 'Tea'],
        'question-id-2': ['Yes']
      }
    }
  })
})
```

### Backend (API)

**File:** `/app/api/segments/preview/route.ts`

```typescript
// 1. Filtrar miembros por otros criterios (visitas, gasto, etc.)
let filteredMembers = await query.execute()

// 2. Filtrar por respuestas de onboarding
if (filters.onboarding_responses) {
  for each (questionId, selectedOptions) {
    // Query responses
    const responses = await supabase
      .from('member_onboarding_responses')
      .select('member_id, response_value')
      .eq('question_id', questionId)
      .in('response_value', selectedOptions)
    
    // Keep only matching members
    filteredMembers = filteredMembers.filter(
      m => responses.includes(m.id)
    )
  }
}

return filteredMembers
```

---

## 📈 Ventajas de este Sistema

### 1. **Flexible**
- Crear preguntas sin código
- Cambiar opciones dinámicamente
- Activar/desactivar según temporada

### 2. **Targeteable**
- Segmentar miembros por intereses
- Campañas personalizadas
- Promociones relevantes

### 3. **Analizable**
- Ver distribución de respuestas
- Identificar tendencias
- Medir engagement

### 4. **Escalable**
- Agregar preguntas ilimitadas
- Combinar múltiples filtros
- Integrar con otros sistemas

---

## 🎯 Mejores Prácticas

### Al Crear Preguntas:

1. **Sé específico**
   - ❌ "What do you like?"
   - ✅ "What's your favorite drink?"

2. **Opciones claras**
   - ❌ "Yes", "No", "Maybe", "Sometimes", "It depends"
   - ✅ "Yes", "No"

3. **Relevante para negocio**
   - ✅ "Favorite time to visit?" → Campaign targeting
   - ✅ "Dietary restrictions?" → Menu recommendations
   - ❌ "Favorite color?" → No actionable insights

### Al Crear Segmentos:

1. **Combina filtros**
   ```
   Favorite drink = Coffee
   + Visits last 30 days >= 5
   + Total spent >= $100
   = "High-value coffee lovers"
   ```

2. **Testea primero**
   - Aplica filtros
   - Ve el número de miembros
   - Ajusta si necesario
   - Guarda el segmento

3. **Nombra descriptivamente**
   - ❌ "Segment 1"
   - ✅ "Coffee Lovers - High Frequency"

---

## 📝 Archivos Clave

### Backend:
- `supabase/migrations/20241104_onboarding_questions_system.sql` - Tablas
- `app/api/onboarding/questions/route.ts` - Get questions
- `app/api/segments/preview/route.ts` - Filter members

### Frontend:
- `app/dashboard/onboarding/page.tsx` - Manage questions
- `app/dashboard/segments/page.tsx` - Segmentation page
- `components/segments/SegmentBuilder.tsx` - Filter UI

### App:
- `app/member/onboarding/page.tsx` - Members answer questions

---

## 🧪 Cómo Probar

### 1. Crear pregunta de prueba:
```
1. Dashboard → /dashboard/onboarding
2. Click "New Question"
3. Question: "Test drink preference"
4. Type: Single Choice
5. Options: Coffee, Tea
6. Save
```

### 2. Simular respuestas:
```sql
-- Inserta respuestas de prueba
INSERT INTO member_onboarding_responses (member_id, question_id, response_value)
VALUES 
  ('member-1-id', 'question-id', 'Coffee'),
  ('member-2-id', 'question-id', 'Coffee'),
  ('member-3-id', 'question-id', 'Tea');
```

### 3. Filtrar en Segmentos:
```
1. Dashboard → /dashboard/segments
2. Scroll down en filtros
3. Ver "Onboarding Responses"
4. Seleccionar "Coffee"
5. Click "Aplicar Filtros"
6. Debería mostrar 2 miembros
```

---

## 🚀 Próximas Mejoras (Opcional)

1. **Filtros de texto**
   - Buscar en respuestas tipo "text"
   - Ej: "Contains", "Starts with"

2. **Filtros de rating avanzados** ✅ (Ya implementado básico)
   - Rating >= 4 stars (seleccionar 4 y 5)
   - Rating <= 2 stars (seleccionar 1 y 2)
   - Sugerencia: Agregar slider de rango

3. **Lógica AND/OR**
   - Coffee AND Tea (respondió ambas en multi_select)
   - Coffee OR Tea (respondió alguna) ← Ya funciona así

4. **Filtros por fecha**
   - Respondió en los últimos 30 días
   - Nunca respondió

5. **Comparadores numéricos**
   - Rating >= X
   - Rating < X
   - Rating entre X y Y

---

## ✅ Resumen

### Tu pregunta 1: ¿Dónde configurar?
**R:** `/dashboard/onboarding`

### Tu pregunta 2: ¿Dónde se guarda?
**R:** Tabla `member_onboarding_responses`

### Tu pregunta 3: ¿Puedo filtrar en segmentos?
**R:** ✅ **¡SÍ! Ya está implementado.**

En `/dashboard/segments` verás una nueva sección:
```
Onboarding Responses
├── What's your favorite drink?
│   ☐ Coffee
│   ☐ Tea
│   ☐ Juice
├── Do you have dietary restrictions?
│   ☐ Yes
│   ☐ No
└── How would you rate your coffee knowledge?
    ☐ 1 ⭐
    ☐ 2 ⭐⭐
    ☐ 3 ⭐⭐⭐
    ☐ 4 ⭐⭐⭐⭐
    ☐ 5 ⭐⭐⭐⭐⭐
```

**¡Listo para usar! 🎉**
