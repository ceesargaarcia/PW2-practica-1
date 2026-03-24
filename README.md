# 🛍️ GestiónProd – Práctica PW2 (Svelte 5 + Node.js)

Frontend SPA en **Svelte 5** con **Vite**, backend en **Node.js / Express / MongoDB**.  
No usa GraphQL; consume la API REST directamente desde el frontend.

---

## ⚙️ Requisitos previos

| Herramienta | Versión mínima |
|-------------|----------------|
| Node.js     | 18+            |
| npm         | 9+             |
| MongoDB     | local o Atlas  |

---

## 🚀 Instalación y ejecución (desarrollo)

### 1. Backend

```bash
cd backend
cp .env.example .env          # edita MONGODB_URI y JWT_SECRET
npm install
npm run dev                   # servidor en http://localhost:3000
```

### 2. Frontend (en otra terminal)

```bash
cd frontend
npm install
npm run dev                   # Vite en http://localhost:5173
```

El proxy de Vite redirige `/api/*` → `http://localhost:3000` automáticamente.

---

## 📦 Build de producción (frontend integrado en backend)

```bash
cd frontend && npm run build   # genera backend/public/
cd ../backend && npm start     # sirve todo desde http://localhost:3000
```

---

## 👤 Crear usuarios de prueba

```bash
# Admin
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","email":"admin@test.com","password":"Admin123","role":"admin"}'

# Usuario normal
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"usuario","email":"user@test.com","password":"User123","role":"user"}'
```

---

## 🌐 Endpoints de la API REST

### Autenticación (`/api/auth`)
| Método | Ruta        | Body requerido          | Acceso |
|--------|-------------|------------------------|--------|
| POST   | `/register` | username, email, password, role | Público |
| POST   | `/login`    | email, password        | Público |
| POST   | `/logout`   | —                      | Autenticado |

### Productos (`/api/products`)
| Método | Ruta    | Acceso     |
|--------|---------|-----------|
| GET    | `/`     | Autenticado |
| GET    | `/:id`  | Autenticado |
| POST   | `/`     | Admin      |
| PUT    | `/:id`  | Admin      |
| DELETE | `/:id`  | Admin      |

### Usuarios (`/api/users`)
| Método | Ruta            | Acceso |
|--------|-----------------|--------|
| GET    | `/`             | Admin  |
| GET    | `/me`           | Autenticado |
| PUT    | `/:id/role`     | Admin  |
| DELETE | `/:id`          | Admin  |

---

## 🧩 Runas de Svelte 5 utilizadas

### `$state()`
Estado reactivo local/global.

| Componente / archivo | Variable | Propósito |
|----------------------|----------|-----------|
| `lib/auth.svelte.js` | `authState` | Token JWT y datos del usuario (estado global persistido en `localStorage`) |
| `lib/toasts.svelte.js` | `toasts` | Lista de notificaciones toast global |
| `pages/ProductsPage.svelte` | `products`, `loading`, `search`, `filterStatus`, `showForm`, `editProduct`, `detailProd` | Estado completo de la página de productos |
| `pages/LoginPage.svelte` | `email`, `password`, `loading`, `errorMsg` | Campos del formulario de login |
| `pages/RegisterPage.svelte` | `username`, `email`, `password`, `role`, `loading`, `errorMsg` | Campos del formulario de registro |
| `pages/AdminUsersPage.svelte` | `users`, `loading`, `search`, `confirmId` | Estado del panel de administración |
| `pages/ProfilePage.svelte` | `profile`, `loading` | Datos del perfil propio |
| `components/ProductForm.svelte` | `form`, `errors`, `saving` | Campos y validación del formulario |
| `components/ProductCard.svelte` | `confirmDelete` | Confirmación de borrado |
| `App.svelte` | `currentPage` | Página activa de la SPA |

### `$derived()`
Valores calculados reactivamente sin efecto secundario.

| Componente | Variable derivada | Cálculo |
|------------|-------------------|---------|
| `pages/ProductsPage.svelte` | `filteredProducts` | Filtra por `search` + `filterStatus` |
| `pages/ProductsPage.svelte` | `totalCount`, `activeCount`, `visibleCount` | Contadores del stats bar |
| `pages/AdminUsersPage.svelte` | `filteredUsers`, `adminCount`, `userCount` | Lista filtrada + contadores |
| `pages/ProfilePage.svelte` | `isAdmin`, `joinDate` | Rol y fecha formateada |
| `components/Navbar.svelte` | `isAdmin`, `username`, `links` | Menú condicional por rol |
| `components/ProductCard.svelte` | `statusLabel`, `statusClass`, `stockClass` | Clases CSS dinámicas |
| `components/ProductForm.svelte` | `title` | "Editar" o "Nuevo" según prop |
| `App.svelte` | `isAuthenticated` | Determina si mostrar la Navbar |

### `$effect()`
Efectos secundarios reactivos.

| Componente | Disparador | Acción |
|------------|-----------|--------|
| `pages/LoginPage.svelte` | `authState.token` | Redirige a productos si ya está autenticado |
| `pages/ProductsPage.svelte` | `authState.token` | Carga productos; redirige si no autenticado |
| `pages/ProductsPage.svelte` | `authState.user?.role` | Recarga productos al cambiar rol |
| `pages/ProfilePage.svelte` | `authState.token` | Carga perfil propio; redirige si no autenticado |
| `pages/AdminUsersPage.svelte` | `authState.token` / `role` | Carga usuarios; redirige si no es admin |
| `App.svelte` | `authState.token` | Redirige al login si el token desaparece |

### `$props()`
Comunicación padre → hijo; **callbacks** para acciones hijo → padre.

| Componente | Props | Callbacks |
|------------|-------|-----------|
| `Navbar.svelte` | `currentPage`, `navigate` | — |
| `ProductCard.svelte` | `product`, `isAdmin` | `onEdit(product)`, `onDelete(id)` |
| `ProductForm.svelte` | `product` (o null) | `onSave(data)`, `onCancel()` |
| `ProductDetail.svelte` | `product` | `onClose()` |
| `LoginPage`, `RegisterPage`, `ProductsPage`, `ProfilePage`, `AdminUsersPage` | `navigate` | — |
