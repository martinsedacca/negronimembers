# 📱 Especificaciones para App iOS Nativa - Negroni Membership

**Documento técnico para desarrollo iOS nativo**  
**Fecha:** Enero 2025  
**Target:** iOS 15+  
**Lenguaje:** Swift + SwiftUI

---

## 🎯 Resumen

App iOS nativa que replica la funcionalidad de la PWA web, optimizada para iPhone con:
- Integración nativa con Apple Wallet
- Mejor performance
- Acceso a funcionalidades nativas (cámara, notificaciones)
- Diseño 100% SwiftUI

---

## 📐 Arquitectura iOS

### Stack Tecnológico

- **UI Framework:** SwiftUI
- **Arquitectura:** MVVM (Model-View-ViewModel)
- **Networking:** URLSession + Async/Await
- **Storage Local:** UserDefaults + Keychain (tokens)
- **Database Cache:** Core Data (opcional, para offline)
- **Auth:** JWT tokens en Keychain
- **QR Generation:** Core Image
- **QR Scanning:** AVFoundation
- **Notificaciones:** UserNotifications framework
- **Wallet:** PassKit framework
- **Analytics:** Firebase Analytics (opcional)

### Estructura del Proyecto

```
NegroniMembership/
├── App/
│   ├── NegroniMembershipApp.swift
│   └── ContentView.swift
├── Core/
│   ├── Network/
│   │   ├── APIClient.swift
│   │   ├── Endpoints.swift
│   │   └── NetworkError.swift
│   ├── Auth/
│   │   ├── AuthManager.swift
│   │   └── TokenStorage.swift
│   └── Utils/
│       ├── Extensions.swift
│       └── Constants.swift
├── Models/
│   ├── Member.swift
│   ├── Level.swift
│   ├── Plan.swift
│   ├── Promotion.swift
│   └── OnboardingQuestion.swift
├── ViewModels/
│   ├── AuthViewModel.swift
│   ├── OnboardingViewModel.swift
│   ├── PassViewModel.swift
│   ├── ProgressViewModel.swift
│   └── BenefitsViewModel.swift
├── Views/
│   ├── Auth/
│   │   ├── PhoneInputView.swift
│   │   └── CodeVerificationView.swift
│   ├── Onboarding/
│   │   ├── OnboardingFlow.swift
│   │   └── QuestionView.swift
│   ├── Pass/
│   │   ├── PassMainView.swift
│   │   ├── QRCodeView.swift
│   │   └── LevelBadge.swift
│   ├── Progress/
│   │   ├── ProgressView.swift
│   │   └── CircleProgressView.swift
│   ├── Benefits/
│   │   ├── BenefitsView.swift
│   │   └── BenefitCard.swift
│   └── History/
│       └── HistoryTimelineView.swift
├── Components/
│   ├── CustomButton.swift
│   ├── LoadingView.swift
│   └── ErrorView.swift
└── Resources/
    ├── Assets.xcassets
    ├── Colors.xcassets
    └── Localizable.strings
```

---

## 🔐 Autenticación

### Flujo de Login con SMS

```swift
// AuthViewModel.swift
@MainActor
class AuthViewModel: ObservableObject {
    @Published var phoneNumber: String = ""
    @Published var verificationCode: String = ""
    @Published var isLoading: Bool = false
    @Published var errorMessage: String?
    @Published var showCodeInput: Bool = false
    
    private let authManager = AuthManager.shared
    
    func sendCode() async {
        isLoading = true
        defer { isLoading = false }
        
        do {
            try await authManager.sendVerificationCode(to: phoneNumber)
            showCodeInput = true
        } catch {
            errorMessage = error.localizedDescription
        }
    }
    
    func verifyCode() async -> Bool {
        isLoading = true
        defer { isLoading = false }
        
        do {
            let response = try await authManager.verifyCode(
                phone: phoneNumber,
                code: verificationCode
            )
            
            // Guardar token en Keychain
            try authManager.saveToken(response.token)
            
            // Verificar si completó onboarding
            return response.onboardingCompleted
        } catch {
            errorMessage = error.localizedDescription
            return false
        }
    }
}
```

### API Endpoints

```swift
enum Endpoint {
    case sendCode(phone: String)
    case verifyCode(phone: String, code: String)
    case getMember(id: String)
    case getOnboardingQuestions
    case submitOnboarding(memberId: String, answers: [String: Any])
    case getLevels
    case getBenefits(levelId: String)
    case getHistory(memberId: String)
    
    var url: URL {
        let base = "https://tu-app.vercel.app/api"
        switch self {
        case .sendCode:
            return URL(string: "\(base)/auth/send-code")!
        case .verifyCode:
            return URL(string: "\(base)/auth/verify-code")!
        case .getMember(let id):
            return URL(string: "\(base)/members/\(id)")!
        // ... resto de endpoints
        }
    }
}
```

---

## 🎨 Diseño UI

### Sistema de Colores

```swift
// Colors.swift
extension Color {
    static let negroniPrimary = Color("Primary") // #FF6B35 (naranja)
    static let negroniBackground = Color("Background") // #1A1A1A
    static let negroniSurface = Color("Surface") // #2D2D2D
    
    // Niveles
    static let level1 = Color(hex: "8FA888") // Verde
    static let level2 = Color(hex: "E8955E") // Naranja
    static let level3 = Color(hex: "E8C55E") // Amarillo
}
```

### Componentes Principales

#### 1. Phone Input View

```swift
struct PhoneInputView: View {
    @StateObject var viewModel: AuthViewModel
    
    var body: some View {
        VStack(spacing: 24) {
            Text("Bienvenido a Negroni")
                .font(.largeTitle)
                .fontWeight(.bold)
            
            Text("Ingresa tu número para continuar")
                .foregroundColor(.secondary)
            
            TextField("+54 9 11 1234-5678", text: $viewModel.phoneNumber)
                .keyboardType(.phonePad)
                .textFieldStyle(RoundedTextFieldStyle())
            
            Button("Enviar código") {
                Task {
                    await viewModel.sendCode()
                }
            }
            .buttonStyle(PrimaryButtonStyle())
            .disabled(viewModel.isLoading)
        }
        .padding()
    }
}
```

#### 2. QR Code View

```swift
struct QRCodeView: View {
    let memberId: String
    @State private var qrImage: UIImage?
    
    var body: some View {
        VStack(spacing: 16) {
            if let qrImage {
                Image(uiImage: qrImage)
                    .interpolation(.none)
                    .resizable()
                    .frame(width: 280, height: 280)
                    .background(Color.white)
                    .cornerRadius(12)
            }
            
            Text(memberId)
                .font(.system(.body, design: .monospaced))
                .foregroundColor(.secondary)
        }
        .onAppear {
            generateQRCode()
        }
    }
    
    private func generateQRCode() {
        let url = "https://tu-app.vercel.app/api/scanner/verify?member_id=\(memberId)"
        let data = url.data(using: .utf8)
        
        let filter = CIFilter.qrCodeGenerator()
        filter.setValue(data, forKey: "inputMessage")
        filter.setValue("H", forKey: "inputCorrectionLevel")
        
        if let outputImage = filter.outputImage {
            let transform = CGAffineTransform(scaleX: 10, y: 10)
            let scaledImage = outputImage.transformed(by: transform)
            
            let context = CIContext()
            if let cgImage = context.createCGImage(scaledImage, from: scaledImage.extent) {
                qrImage = UIImage(cgImage: cgImage)
            }
        }
    }
}
```

#### 3. Level Badge

```swift
struct LevelBadge: View {
    let level: Int
    let levelName: String
    let color: Color
    
    var body: some View {
        HStack(spacing: 8) {
            Text("\(level)")
                .font(.title2)
                .fontWeight(.bold)
            
            Text(levelName)
                .font(.subheadline)
        }
        .padding(.horizontal, 20)
        .padding(.vertical, 10)
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

#### 4. Círculo de Progreso

```swift
struct CircleProgressView: View {
    let currentVisits: Int
    let requiredVisits: Int
    @State private var animatedProgress: CGFloat = 0
    
    private var progress: CGFloat {
        CGFloat(currentVisits) / CGFloat(requiredVisits)
    }
    
    var body: some View {
        ZStack {
            // Background circle
            Circle()
                .stroke(Color.gray.opacity(0.2), lineWidth: 20)
            
            // Progress circle
            Circle()
                .trim(from: 0, to: animatedProgress)
                .stroke(
                    LinearGradient(
                        colors: [.level2, .level3],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    ),
                    style: StrokeStyle(lineWidth: 20, lineCap: .round)
                )
                .rotationEffect(.degrees(-90))
                .animation(.easeInOut(duration: 1.5), value: animatedProgress)
            
            // Center content
            VStack(spacing: 4) {
                Text("\(currentVisits)")
                    .font(.system(size: 60, weight: .bold))
                
                Text("de \(requiredVisits) visitas")
                    .font(.subheadline)
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

#### 5. Timeline de Historial

```swift
struct HistoryTimelineView: View {
    let events: [ActivityEvent]
    
    var body: some View {
        ScrollView {
            LazyVStack(alignment: .leading, spacing: 0) {
                ForEach(events) { event in
                    TimelineRow(event: event, isLast: event.id == events.last?.id)
                }
            }
            .padding()
        }
    }
}

struct TimelineRow: View {
    let event: ActivityEvent
    let isLast: Bool
    
    var body: some View {
        HStack(alignment: .top, spacing: 16) {
            // Timeline indicator
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
            
            // Content
            VStack(alignment: .leading, spacing: 8) {
                HStack {
                    Text(event.icon)
                        .font(.title2)
                    
                    Text(event.title)
                        .font(.headline)
                    
                    Spacer()
                    
                    if event.pointsEarned > 0 {
                        Text("+\(event.pointsEarned) pts")
                            .font(.caption)
                            .fontWeight(.semibold)
                            .foregroundColor(.negroniPrimary)
                    }
                }
                
                Text(event.date, style: .relative)
                    .font(.caption)
                    .foregroundColor(.secondary)
                
                if let notes = event.notes {
                    Text(notes)
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                }
            }
            .padding(.vertical, 12)
        }
    }
}
```

---

## 📦 Modelos de Datos

```swift
// Member.swift
struct Member: Codable, Identifiable {
    let id: String
    let fullName: String
    let email: String
    let phone: String
    let memberNumber: String
    let membershipType: String
    let currentLevel: Int
    let points: Int
    let visitsInCurrentPeriod: Int
    let levelExpiresAt: Date?
    let onboardingCompleted: Bool
    
    enum CodingKeys: String, CodingKey {
        case id
        case fullName = "full_name"
        case email
        case phone
        case memberNumber = "member_number"
        case membershipType = "membership_type"
        case currentLevel = "current_level"
        case points
        case visitsInCurrentPeriod = "visits_in_current_period"
        case levelExpiresAt = "level_expires_at"
        case onboardingCompleted = "onboarding_completed"
    }
}

// Level.swift
struct Level: Codable, Identifiable {
    let id: String
    let levelNumber: Int
    let name: String
    let description: String
    let visitsRequiredMin: Int
    let visitsRequiredMax: Int?
    let color: String
    let icon: String
    
    var swiftUIColor: Color {
        Color(hex: color)
    }
}

// OnboardingQuestion.swift
struct OnboardingQuestion: Codable, Identifiable {
    let id: String
    let questionText: String
    let questionType: QuestionType
    let options: [String]?
    let isRequired: Bool
    let displayOrder: Int
    
    enum QuestionType: String, Codable {
        case text
        case select
        case multiSelect = "multi_select"
        case rating
        case yesNo = "yes_no"
        case date
    }
}
```

---

## 🔔 Notificaciones Push

```swift
// NotificationManager.swift
class NotificationManager {
    static let shared = NotificationManager()
    
    func requestPermission() async -> Bool {
        let center = UNUserNotificationCenter.current()
        do {
            return try await center.requestAuthorization(options: [.alert, .sound, .badge])
        } catch {
            print("Error requesting notification permission: \(error)")
            return false
        }
    }
    
    func registerForRemoteNotifications() {
        DispatchQueue.main.async {
            UIApplication.shared.registerForRemoteNotifications()
        }
    }
    
    func showLocalNotification(title: String, body: String) {
        let content = UNMutableNotificationContent()
        content.title = title
        content.body = body
        content.sound = .default
        
        let trigger = UNTimeIntervalNotificationTrigger(timeInterval: 1, repeats: false)
        let request = UNNotificationRequest(identifier: UUID().uuidString, content: content, trigger: trigger)
        
        UNUserNotificationCenter.current().add(request)
    }
}
```

---

## 🎫 Integración Apple Wallet

```swift
import PassKit

class WalletManager {
    static let shared = WalletManager()
    
    func addPassToWallet(passURL: URL) async throws {
        let passData = try await downloadPass(from: passURL)
        
        guard let pass = try? PKPass(data: passData) else {
            throw WalletError.invalidPass
        }
        
        let passLibrary = PKPassLibrary()
        
        if passLibrary.containsPass(pass) {
            throw WalletError.passAlreadyExists
        }
        
        try await passLibrary.addPasses([pass])
    }
    
    private func downloadPass(from url: URL) async throws -> Data {
        let (data, _) = try await URLSession.shared.data(from: url)
        return data
    }
}

enum WalletError: Error {
    case invalidPass
    case passAlreadyExists
    case downloadFailed
}
```

---

## 🌐 Networking Layer

```swift
// APIClient.swift
class APIClient {
    static let shared = APIClient()
    private let baseURL = "https://tu-app.vercel.app/api"
    
    func request<T: Decodable>(
        _ endpoint: Endpoint,
        method: HTTPMethod = .get,
        body: Data? = nil
    ) async throws -> T {
        var request = URLRequest(url: endpoint.url)
        request.httpMethod = method.rawValue
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        // Add auth token if available
        if let token = TokenStorage.shared.getToken() {
            request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }
        
        if let body = body {
            request.httpBody = body
        }
        
        let (data, response) = try await URLSession.shared.data(for: request)
        
        guard let httpResponse = response as? HTTPURLResponse else {
            throw NetworkError.invalidResponse
        }
        
        guard (200...299).contains(httpResponse.statusCode) else {
            throw NetworkError.statusCode(httpResponse.statusCode)
        }
        
        let decoder = JSONDecoder()
        decoder.dateDecodingStrategy = .iso8601
        
        return try decoder.decode(T.self, from: data)
    }
}

enum HTTPMethod: String {
    case get = "GET"
    case post = "POST"
    case put = "PUT"
    case delete = "DELETE"
}

enum NetworkError: Error {
    case invalidResponse
    case statusCode(Int)
    case decodingError
}
```

---

## 📱 App Lifecycle

```swift
@main
struct NegroniMembershipApp: App {
    @UIApplicationDelegateAdaptor(AppDelegate.self) var appDelegate
    @StateObject private var authManager = AuthManager.shared
    
    var body: some Scene {
        WindowGroup {
            Group {
                if authManager.isAuthenticated {
                    if authManager.currentMember?.onboardingCompleted == true {
                        PassMainView()
                    } else {
                        OnboardingFlow()
                    }
                } else {
                    PhoneInputView(viewModel: AuthViewModel())
                }
            }
            .preferredColorScheme(.dark)
        }
    }
}

class AppDelegate: NSObject, UIApplicationDelegate {
    func application(
        _ application: UIApplication,
        didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey : Any]? = nil
    ) -> Bool {
        // Request notification permission
        Task {
            await NotificationManager.shared.requestPermission()
        }
        
        return true
    }
    
    func application(
        _ application: UIApplication,
        didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data
    ) {
        let token = deviceToken.map { String(format: "%02.2hhx", $0) }.joined()
        print("Device Token: \(token)")
        // Send to backend
        Task {
            try? await APIClient.shared.sendDeviceToken(token)
        }
    }
}
```

---

## 🧪 Testing

```swift
// Tests/PassViewModelTests.swift
import XCTest
@testable import NegroniMembership

class PassViewModelTests: XCTestCase {
    var viewModel: PassViewModel!
    var mockAPIClient: MockAPIClient!
    
    override func setUp() {
        super.setUp()
        mockAPIClient = MockAPIClient()
        viewModel = PassViewModel(apiClient: mockAPIClient)
    }
    
    func testLoadMemberData() async throws {
        // Given
        let expectedMember = Member.mock()
        mockAPIClient.memberToReturn = expectedMember
        
        // When
        await viewModel.loadMemberData()
        
        // Then
        XCTAssertEqual(viewModel.member?.id, expectedMember.id)
        XCTAssertFalse(viewModel.isLoading)
    }
    
    func testCalculateProgress() {
        // Given
        viewModel.currentVisits = 5
        viewModel.requiredVisits = 8
        
        // When
        let progress = viewModel.calculateProgress()
        
        // Then
        XCTAssertEqual(progress, 0.625, accuracy: 0.001)
    }
}
```

---

## 📦 Dependencies (Package.swift)

```swift
// Package.swift
dependencies: [
    .package(url: "https://github.com/Alamofire/Alamofire.git", from: "5.8.0"),
    .package(url: "https://github.com/onevcat/Kingfisher.git", from: "7.0.0"),
    .package(url: "https://github.com/firebase/firebase-ios-sdk.git", from: "10.0.0")
]
```

---

## 🚀 Deployment

### App Store Connect

1. Crear App ID en Developer Portal
2. Configurar capabilities:
   - Push Notifications
   - Wallet
   - Associated Domains (para deep links)
3. Generar provisioning profiles
4. Subir a TestFlight
5. Beta testing
6. Submission a App Store

### Info.plist

```xml
<key>NSCameraUsageDescription</key>
<string>Necesitamos acceso a la cámara para escanear códigos QR</string>

<key>NSUserNotificationsUsageDescription</key>
<string>Te notificaremos cuando subas de nivel o recibas beneficios</string>

<key>CFBundleURLTypes</key>
<array>
    <dict>
        <key>CFBundleURLSchemes</key>
        <array>
            <string>negroni</string>
        </array>
    </dict>
</array>
```

---

## 📚 Recursos Adicionales

- [SwiftUI Documentation](https://developer.apple.com/documentation/swiftui/)
- [PassKit Documentation](https://developer.apple.com/documentation/passkit/)
- [Core Image QR Code](https://developer.apple.com/documentation/coreimage/ciqrcodegenerator)
- [URLSession Async/Await](https://developer.apple.com/documentation/foundation/urlsession)

---

Ver también: [PLAN_PROYECTO.md](./PLAN_PROYECTO.md)
