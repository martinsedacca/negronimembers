# 🎯 Prompt Completo para Desarrollo de App iOS Nativa

**Para:** Desarrollador iOS / Agente IA  
**Contexto:** Convertir PWA web a app iOS nativa

---

## 📱 Descripción del Proyecto

Eres un desarrollador iOS experto. Tu tarea es crear una **app iOS nativa** para un sistema de membresías de fidelización llamado **Negroni**.

La app ya existe como PWA (Progressive Web App) en Next.js, pero necesitamos una versión nativa de iOS para mejor performance y acceso a funcionalidades nativas.

---

## 🎯 Objetivo

Crear app iOS que permita a clientes:
1. Registrarse con su número de teléfono (login con SMS)
2. Completar un formulario de onboarding dinámico
3. Ver su tarjeta de membresía digital con QR code
4. Ver su nivel actual de fidelización y progreso
5. Explorar beneficios disponibles por nivel
6. Ver historial de actividad
7. Agregar su tarjeta a Apple Wallet

---

## 🏗️ Arquitectura Requerida

### Stack Tecnológico

- **Lenguaje:** Swift 5.9+
- **UI Framework:** SwiftUI (100% SwiftUI, sin UIKit)
- **Arquitectura:** MVVM (Model-View-ViewModel)
- **Target:** iOS 15.0+
- **Networking:** URLSession con async/await
- **Storage:** UserDefaults + Keychain (para tokens)
- **Notificaciones:** UserNotifications framework
- **Wallet:** PassKit framework
- **QR Generation:** Core Image (CIFilter.qrCodeGenerator)

### Estructura de Carpetas

```
NegroniMembership/
├── App/
│   └── NegroniMembershipApp.swift
├── Core/
│   ├── Network/
│   ├── Auth/
│   └── Utils/
├── Models/
├── ViewModels/
├── Views/
├── Components/
└── Resources/
```

---

## 🔐 Sistema de Autenticación

### Flujo de Login con SMS

**Pantalla 1: Phone Input**
- Campo de texto para número de teléfono
- Formato: +54 9 11 1234-5678 (Argentina)
- Botón "Enviar código"
- Al presionar: llamada a `POST /api/auth/send-code`

**Pantalla 2: Code Verification**
- Campo de 6 dígitos para código SMS
- Auto-focus al cargar
- Llamada a `POST /api/auth/verify-code`
- Si correcto: guarda JWT token en Keychain
- Si onboarding_completed = false → Onboarding
- Si onboarding_completed = true → Pass Principal

### Endpoints de Auth

```
POST /api/auth/send-code
Body: { "phone": "+541112345678" }
Response: { "success": true }

POST /api/auth/verify-code
Body: { "phone": "+541112345678", "code": "123456" }
Response: {
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5...",
  "member_id": "uuid",
  "onboarding_completed": false
}
```

### Almacenamiento de Token

```swift
// Guardar en Keychain (seguro)
func saveToken(_ token: String) {
    let data = token.data(using: .utf8)!
    let query: [String: Any] = [
        kSecClass as String: kSecClassGenericPassword,
        kSecAttrAccount as String: "auth_token",
        kSecValueData as String: data
    ]
    SecItemAdd(query as CFDictionary, nil)
}
```

---

## 📝 Onboarding Dinámico

### Flujo

1. Obtener preguntas: `GET /api/onboarding/questions`
2. Renderizar formulario dinámicamente
3. Campo fijo: Fecha de nacimiento (siempre primero)
4. Campos dinámicos según respuesta del API
5. Validar campos requeridos
6. Enviar respuestas: `POST /api/onboarding/complete`

### Tipos de Pregunta

| Tipo | UI Component | Ejemplo |
|------|--------------|---------|
| `text` | TextField | "¿Algún comentario?" |
| `select` | Picker/Menu | "¿Bebida favorita?" → Café, Té, Smoothie |
| `multi_select` | Multiple checkboxes | "¿Qué te gusta?" → Varios |
| `rating` | Star rating (1-5) | "Califica tu experiencia" |
| `yes_no` | Toggle/Switch | "¿Tienes restricciones alimenticias?" |
| `date` | DatePicker | "¿Cuándo es tu cumpleaños?" |

### Modelo de Pregunta

```swift
struct OnboardingQuestion: Codable {
    let id: String
    let questionText: String
    let questionType: QuestionType
    let options: [String]?
    let isRequired: Bool
    let displayOrder: Int
    
    enum QuestionType: String, Codable {
        case text, select, multiSelect = "multi_select"
        case rating, yesNo = "yes_no", date
    }
}
```

### Endpoint de Completado

```
POST /api/onboarding/complete
Headers: Authorization: Bearer {token}
Body: {
  "member_id": "uuid",
  "date_of_birth": "1990-01-15",
  "answers": {
    "question_uuid_1": "Café",
    "question_uuid_2": ["Trabajo", "Estudio"],
    "question_uuid_3": 5
  }
}
```

---

## 🎫 Pantalla Principal (Pass)

### Diseño

```
┌──────────────────────────────┐
│     Hola, Juan!              │
│     Free • Nivel 2 ⭐        │
├──────────────────────────────┤
│                              │
│     [PANEL DESPLEGABLE]      │
│          MI TEA PASS         │
│                              │
│      ┌──────────────────┐   │
│      │                  │   │
│      │   [QR CODE]      │   │
│      │   [Grande 280x]  │   │
│      │                  │   │
│      └──────────────────┘   │
│         9GEEK2XUC8           │
│                              │
│    [Agregar a Apple Wallet]  │
│                              │
├──────────────────────────────┤
│  Beneficios Activos:         │
│  🎁 10% descuento            │
│  ☕ Café gratis cada 5       │
│  🍷 Copa de vino gratis      │
├──────────────────────────────┤
│  [Progreso] [Beneficios]     │
│  [Historial]                 │
└──────────────────────────────┘
```

### Componentes Clave

**QR Code Generation**
```swift
func generateQRCode(from string: String) -> UIImage? {
    let data = string.data(using: .utf8)
    let filter = CIFilter.qrCodeGenerator()
    filter.setValue(data, forKey: "inputMessage")
    filter.setValue("H", forKey: "inputCorrectionLevel")
    
    guard let outputImage = filter.outputImage else { return nil }
    
    let transform = CGAffineTransform(scaleX: 10, y: 10)
    let scaledImage = outputImage.transformed(by: transform)
    
    let context = CIContext()
    guard let cgImage = context.createCGImage(scaledImage, from: scaledImage.extent) else {
        return nil
    }
    
    return UIImage(cgImage: cgImage)
}
```

**Level Badge**
```swift
struct LevelBadge: View {
    let level: Int
    let name: String
    let color: Color
    
    var body: some View {
        HStack(spacing: 8) {
            Text("Nivel \(level)")
                .font(.headline)
            Text(name)
                .font(.subheadline)
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 8)
        .background(color.opacity(0.2))
        .foregroundColor(color)
        .cornerRadius(20)
        .overlay(
            RoundedRectangle(cornerRadius: 20)
                .stroke(color, lineWidth: 2)
        )
    }
}
```

### Endpoints

```
GET /api/members/{id}
Response: {
  "id": "uuid",
  "full_name": "Juan Pérez",
  "membership_type": "Free",
  "current_level": 2,
  "points": 150,
  "visits_in_current_period": 10,
  ...
}

GET /api/levels/{levelId}/benefits
Response: [
  {
    "id": "uuid",
    "title": "10% descuento",
    "description": "En todas las bebidas",
    "icon": "🎁"
  }
]
```

---

## 📊 Pantalla de Progreso

### Diseño

Círculo de progreso grande (250x250) mostrando:
- Visitas actuales vs requeridas
- Porcentaje completado
- Texto: "3 visitas más para Nivel 3"
- Fecha de expiración
- Lista de beneficios del nivel actual

### Círculo de Progreso Animado

```swift
struct CircleProgressView: View {
    let current: Int
    let required: Int
    @State private var animatedProgress: CGFloat = 0
    
    private var progress: CGFloat {
        CGFloat(current) / CGFloat(required)
    }
    
    var body: some View {
        ZStack {
            Circle()
                .stroke(Color.gray.opacity(0.2), lineWidth: 20)
            
            Circle()
                .trim(from: 0, to: animatedProgress)
                .stroke(
                    LinearGradient(
                        colors: [.blue, .purple],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    ),
                    style: StrokeStyle(lineWidth: 20, lineCap: .round)
                )
                .rotationEffect(.degrees(-90))
                .animation(.easeInOut(duration: 1.5), value: animatedProgress)
            
            VStack {
                Text("\(current)")
                    .font(.system(size: 60, weight: .bold))
                Text("de \(required)")
                    .foregroundColor(.secondary)
            }
        }
        .frame(width: 250, height: 250)
        .onAppear {
            animatedProgress = min(progress, 1.0)
        }
    }
}
```

---

## 🎁 Explorador de Beneficios

### Diseño

Tabs horizontales: Nivel 1, Nivel 2, Nivel 3

Cada tab muestra:
- Título del nivel
- Descripción ("ARRANCAMOS", "YA NOS CONOCEMOS", etc.)
- Lista de beneficios con íconos
- Indicador visual de nivel actual

### TabView con Swipe Gestures

```swift
struct BenefitsView: View {
    let levels: [Level]
    @State private var selectedTab = 0
    
    var body: some View {
        VStack(spacing: 0) {
            // Custom tab bar
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 20) {
                    ForEach(levels.indices, id: \.self) { index in
                        Text("Nivel \(levels[index].levelNumber)")
                            .font(selectedTab == index ? .headline : .body)
                            .foregroundColor(selectedTab == index ? .primary : .secondary)
                            .onTapGesture {
                                withAnimation {
                                    selectedTab = index
                                }
                            }
                    }
                }
                .padding()
            }
            
            // Content
            TabView(selection: $selectedTab) {
                ForEach(levels.indices, id: \.self) { index in
                    LevelBenefitsView(level: levels[index])
                        .tag(index)
                }
            }
            .tabViewStyle(.page(indexDisplayMode: .never))
        }
    }
}
```

---

## 📜 Historial (Timeline)

### Diseño

Timeline vertical con eventos:
- 🗺️ Visitas (azul)
- 🛒 Compras (verde)
- 🎁 Promociones canjeadas (morado)
- ⭐ Subidas de nivel (amarillo)

Cada evento muestra:
- Ícono y color
- Título
- Fecha relativa ("Hace 2 horas")
- Puntos ganados
- Monto (si es compra)
- Notas

### Timeline Component

```swift
struct TimelineEventRow: View {
    let event: ActivityEvent
    let isLast: Bool
    
    var body: some View {
        HStack(alignment: .top, spacing: 16) {
            VStack(spacing: 0) {
                Circle()
                    .fill(event.color)
                    .frame(width: 12, height: 12)
                
                if !isLast {
                    Rectangle()
                        .fill(Color.gray.opacity(0.3))
                        .frame(width: 2)
                }
            }
            
            VStack(alignment: .leading, spacing: 8) {
                HStack {
                    Text(event.icon)
                    Text(event.title)
                        .font(.headline)
                    
                    Spacer()
                    
                    if event.pointsEarned > 0 {
                        Text("+\(event.pointsEarned) pts")
                            .foregroundColor(.orange)
                    }
                }
                
                Text(event.date, style: .relative)
                    .font(.caption)
                    .foregroundColor(.secondary)
                
                if let amount = event.amount {
                    Text("$\(amount, specifier: "%.2f")")
                        .font(.subheadline)
                        .foregroundColor(.green)
                }
            }
        }
    }
}
```

### Endpoint

```
GET /api/members/{id}/history
Response: [
  {
    "id": "uuid",
    "type": "visit",
    "date": "2025-01-15T14:30:00Z",
    "points_earned": 10,
    "notes": "Visita registrada"
  },
  {
    "id": "uuid",
    "type": "purchase",
    "date": "2025-01-15T14:35:00Z",
    "amount": 125.50,
    "points_earned": 25,
    "notes": "Compra de café y medialunas"
  }
]
```

---

## 🎫 Apple Wallet Integration

### Agregar Pass

```swift
import PassKit

func addToWallet(passURL: URL) async throws {
    let (data, _) = try await URLSession.shared.data(from: passURL)
    
    guard let pass = try? PKPass(data: data) else {
        throw WalletError.invalidPass
    }
    
    let passLibrary = PKPassLibrary()
    
    if passLibrary.containsPass(pass) {
        throw WalletError.alreadyExists
    }
    
    try await passLibrary.addPasses([pass])
}
```

### Endpoint

```
GET /api/wallet/apple/{memberId}
Response: Binary .pkpass file
```

---

## 🔔 Notificaciones

### Local Notifications

Mostrar cuando:
- Cliente sube de nivel
- Nuevo beneficio disponible
- Nivel está por expirar

```swift
func showLevelUpNotification(newLevel: Int) {
    let content = UNMutableNotificationContent()
    content.title = "¡Felicitaciones! 🎉"
    content.body = "Subiste a Nivel \(newLevel)"
    content.sound = .default
    
    let trigger = UNTimeIntervalNotificationTrigger(timeInterval: 1, repeats: false)
    let request = UNNotificationRequest(
        identifier: UUID().uuidString,
        content: content,
        trigger: trigger
    )
    
    UNUserNotificationCenter.current().add(request)
}
```

---

## 🎨 Diseño y Colores

### Color Palette

```swift
extension Color {
    // Brand
    static let negroniPrimary = Color(hex: "FF6B35")
    static let negroniBackground = Color(hex: "1A1A1A")
    static let negroniSurface = Color(hex: "2D2D2D")
    
    // Levels
    static let level1 = Color(hex: "8FA888") // Verde
    static let level2 = Color(hex: "E8955E") // Naranja
    static let level3 = Color(hex: "E8C55E") // Amarillo
}
```

### Typography

```swift
.font(.largeTitle) // Títulos principales
.font(.headline) // Sección headers
.font(.body) // Texto normal
.font(.caption) // Texto secundario
```

### Spacing

- Padding estándar: 16pt
- Spacing entre elementos: 12pt
- Corner radius: 12pt
- Border width: 2pt

---

## 📡 Networking

### Base URL

```
https://tu-app.vercel.app/api
```

### Headers

```
Content-Type: application/json
Authorization: Bearer {jwt_token}
```

### Error Handling

```swift
enum NetworkError: Error {
    case invalidResponse
    case unauthorized
    case serverError(Int)
    case decodingError
    case noConnection
}

func handleError(_ error: Error) -> String {
    switch error {
    case NetworkError.unauthorized:
        return "Sesión expirada. Por favor inicia sesión nuevamente."
    case NetworkError.noConnection:
        return "Sin conexión a internet"
    case NetworkError.serverError(let code):
        return "Error del servidor (\(code))"
    default:
        return "Error desconocido"
    }
}
```

---

## ✅ Requisitos Funcionales

### Must Have (Imprescindible)

- [ ] Login con SMS
- [ ] Onboarding dinámico
- [ ] Pass con QR code
- [ ] Level badge
- [ ] Progreso visual
- [ ] Lista de beneficios
- [ ] Historial de actividad
- [ ] Botón "Agregar a Wallet"
- [ ] Dark mode por defecto

### Should Have (Importante)

- [ ] Animaciones suaves
- [ ] Pull to refresh
- [ ] Error handling robusto
- [ ] Loading states
- [ ] Notificaciones locales
- [ ] Caché de imágenes

### Nice to Have (Deseable)

- [ ] Modo offline básico
- [ ] Haptic feedback
- [ ] Widget de Home Screen
- [ ] Siri Shortcuts
- [ ] App Clips

---

## 🧪 Testing

Crear tests para:
- [ ] Auth flow (login con SMS)
- [ ] QR generation
- [ ] Progress calculation
- [ ] Networking (mock API)
- [ ] Keychain storage
- [ ] Navigation flow

---

## 📦 Deliverables

1. Xcode project completo
2. App funcionando en simulador
3. README con setup instructions
4. TestFlight build (beta)
5. Screenshots para App Store
6. Privacy policy compliance
7. Documentación de API endpoints usados

---

## 🚀 Deployment Checklist

- [ ] Configurar App ID en Apple Developer
- [ ] Habilitar capabilities (Push, Wallet, Associated Domains)
- [ ] Generar provisioning profiles
- [ ] Configurar Info.plist (permisos)
- [ ] Subir a TestFlight
- [ ] Beta testing (10+ testers)
- [ ] Screenshots + descripción App Store
- [ ] Submission a review

---

## 📞 Contacto Backend

**Base URL:** https://tu-app.vercel.app/api

**Documentación completa:** Ver `/docs/API_REFERENCE.md`

**Soporte:** Ver `/docs/PLAN_PROYECTO.md`

---

## 💡 Tips de Implementación

1. **Usar async/await** para todas las llamadas de red
2. **Keychain** para almacenar tokens (nunca UserDefaults)
3. **SwiftUI @Published** para reactive UI
4. **Modularizar** ViewModels (un ViewModel por pantalla)
5. **Loading states** en todas las operaciones async
6. **Error handling** con mensajes user-friendly
7. **Dark mode** obligatorio, claro mode opcional
8. **Accessibility** (VoiceOver, Dynamic Type)
9. **Performance** (lazy loading, pagination)
10. **Memory management** (avoid retain cycles)

---

**¿Preguntas? Consulta:**
- [PLAN_PROYECTO.md](./PLAN_PROYECTO.md)
- [ESPECIFICACIONES_IOS.md](./ESPECIFICACIONES_IOS.md)
