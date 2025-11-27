# 🧪 Testing Completo - Sistema Onboarding

**TODAS las funcionalidades están implementadas y deben funcionar.**

---

## ✅ Pre-requisitos

1. **Servidor corriendo:**
   ```bash
   npm run dev
   ```

2. **Migración aplicada:**
   ```bash
   cd ~/Desktop/Works/Programacion/Negroni/CascadeProjects/windsurf-project-2/membership-cards
   supabase db reset
   ```

3. **Dashboard abierto:**
   ```
   http://localhost:3001/dashboard
   ```

---

## 🧪 TEST 1: Crear Pregunta Multiple Choice

### Pasos:
1. Dashboard → Click "Onboarding" en el menú lateral
2. Click "New Question" (botón naranja arriba derecha)
3. Completa el formulario:
   ```
   Question Text: "What's your preferred meal time?"
   Question Type: Multiple Choice
   
   Options:
   - Breakfast
   - Lunch
   - Dinner
   - Late Night
   
   Help Text: "Select all that apply"
   ☑ This question is required
   ```
4. Click "Create Question"

### ✅ Resultado Esperado:
- Redirige a `/dashboard/onboarding`
- La pregunta aparece en la lista
- Muestra: #5 🩷 Multiple Choice [Required]
- Options: Breakfast • Lunch • Dinner • +1 more

### ❌ Si falla:
- Abre Developer Tools (F12) → Console
- Copia el error y envíamelo

---

## 🧪 TEST 2: Editar Pregunta

### Pasos:
1. En la lista de preguntas
2. Click en el icono ✏️ (Edit) de la pregunta que creaste
3. Cambia:
   ```
   Question Text: "When do you prefer to dine?"
   Add option: "Brunch"
   ```
4. Click "Update Question"

### ✅ Resultado Esperado:
- Redirige a `/dashboard/onboarding`
- La pregunta muestra el nuevo texto
- Options incluye "Brunch"

---

## 🧪 TEST 3: Reordenar Preguntas (Drag & Drop)

### Pasos:
1. En la lista de preguntas
2. Arrastra la pregunta #5 por el icono ⋮⋮
3. Suéltala encima de la pregunta #2

### ✅ Resultado Esperado:
- La página recarga
- La pregunta ahora es #2
- Las demás se reacomodan

---

## 🧪 TEST 4: Desactivar Pregunta

### Pasos:
1. En la lista de preguntas
2. Click en el icono 👁️ (Toggle) de cualquier pregunta

### ✅ Resultado Esperado:
- La página recarga
- La pregunta muestra badge "Inactive"
- El icono cambia a 👁️‍🗨️

---

## 🧪 TEST 5: Eliminar Pregunta SIN respuestas

### Pasos:
1. Crea una pregunta de prueba
2. Inmediatamente click 🗑️ (Delete)
3. Confirma en el diálogo

### ✅ Resultado Esperado:
- La pregunta desaparece de la lista
- Se eliminó de la BD

---

## 🧪 TEST 6: Eliminar Pregunta CON respuestas

### Pasos:
1. Agrega respuestas manualmente a una pregunta:
   ```sql
   INSERT INTO member_onboarding_responses (member_id, question_id, response_value)
   VALUES ('member-id', 'question-id', 'Coffee');
   ```
2. Intenta eliminar esa pregunta con 🗑️

### ✅ Resultado Esperado:
- Alerta: "Question has responses and was deactivated instead of deleted."
- La pregunta se marca como Inactive (no se elimina)

---

## 🧪 TEST 7: Crear Pregunta Rating

### Pasos:
1. Click "New Question"
2. Completa:
   ```
   Question Text: "How would you rate our service?"
   Question Type: Rating
   Help Text: "1 star = Poor, 5 stars = Excellent"
   ☑ This question is required
   ```
3. Click "Create Question"

### ✅ Resultado Esperado:
- La pregunta aparece con 🟠 Rating badge
- NO muestra opciones (rating usa 1-5 automático)

---

## 🧪 TEST 8: Crear Pregunta Text Input

### Pasos:
1. Click "New Question"
2. Completa:
   ```
   Question Text: "Any special dietary requirements?"
   Question Type: Text Input
   Placeholder: "e.g., Gluten-free, Vegan..."
   Help Text: "We'll do our best to accommodate"
   ☐ Not required
   ```
3. Click "Create Question"

### ✅ Resultado Esperado:
- La pregunta aparece con 🔵 Text Input badge
- NO muestra opciones
- NO aparece en filtros de segmentos

---

## 🧪 TEST 9: App Móvil consume preguntas

### Pasos:
1. Abre: `http://localhost:3001/member/auth`
2. Login con cualquier teléfono
3. Ingresa código: 123456
4. Llegas a `/member/onboarding`

### ✅ Resultado Esperado:
- Paso 1: Birthday (siempre primero)
- Paso 2-N: TODAS las preguntas activas que creaste
- Las preguntas inactivas NO aparecen
- El orden es el que configuraste (display_order)

---

## 🧪 TEST 10: Filtrar en Segmentos

### Pasos:
1. Dashboard → Segmentos
2. Scroll down en filtros → "Onboarding Responses"

### ✅ Resultado Esperado:
- Aparecen TODAS las preguntas tipo:
  - Single Choice
  - Multiple Choice
  - Yes/No
  - Rating
- NO aparecen:
  - Text Input

---

## 🔍 Debugging

### Si algo falla:

1. **Check console:**
   ```
   F12 → Console tab
   ```

2. **Check Network:**
   ```
   F12 → Network tab → Filter by Fetch/XHR
   Ver si las peticiones a /api/onboarding/* fallan
   ```

3. **Check Database:**
   ```sql
   SELECT * FROM onboarding_questions ORDER BY display_order;
   ```

4. **Errores comunes:**

   - **"Failed to save question"**
     → Check que options tenga valores si es select/multi_select/yes_no
   
   - **"Question not found"**
     → El ID no existe en la BD
   
   - **"Failed to reorder"**
     → La función SQL reorder_onboarding_question no existe
     → Re-aplica migración: `supabase db reset`

---

## 📊 Checklist Completo

### APIs Creadas:
- [x] `POST /api/onboarding` - Crear pregunta
- [x] `GET /api/onboarding` - Listar todas
- [x] `GET /api/onboarding/[id]` - Ver una
- [x] `PUT /api/onboarding/[id]` - Editar
- [x] `PATCH /api/onboarding/[id]` - Toggle active
- [x] `DELETE /api/onboarding/[id]` - Eliminar (soft si tiene respuestas)
- [x] `POST /api/onboarding/reorder` - Reordenar
- [x] `GET /api/onboarding/questions` - Para segmentos

### Páginas Creadas:
- [x] `/dashboard/onboarding` - Lista
- [x] `/dashboard/onboarding/new` - Crear
- [x] `/dashboard/onboarding/[id]` - Editar

### Componentes:
- [x] `QuestionsList` - Con drag & drop, toggle, delete
- [x] `QuestionForm` - Crear/editar con validaciones
- [x] `SegmentBuilder` - Filtros de onboarding

### Integración:
- [x] Link en menú lateral
- [x] App móvil consume preguntas
- [x] Filtros en segmentos
- [x] Todas las APIs conectadas (NO TODOs)

---

## ✅ READY TO TEST

**Todo está implementado. Si algo falla, avísame con el error específico.**
