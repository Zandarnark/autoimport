import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { useAuthStore } from './store/authStore'
import Layout from './components/layout/Layout'
import Home from './pages/Home'
import Cars from './pages/Cars'
import CarDetail from './pages/CarDetail'
import Parts from './pages/Parts'
import PartDetail from './pages/PartDetail'
import Calculator from './pages/Calculator'
import Request from './pages/Request'
import Compare from './pages/Compare'
import News from './pages/News'
import NewsDetail from './pages/NewsDetail'
import Login from './pages/Login'
import Register from './pages/Register'
import Profile from './pages/profile/Profile'
import Orders from './pages/profile/Orders'
import OrderDetail from './pages/profile/OrderDetail'
import Favorites from './pages/profile/Favorites'
import AdminDashboard from './pages/admin/Dashboard'
import AdminCars from './pages/admin/Cars'
import AdminCarForm from './pages/admin/CarForm'
import AdminParts from './pages/admin/Parts'
import AdminPartForm from './pages/admin/PartForm'
import AdminOrders from './pages/admin/Orders'
import AdminOrderDetail from './pages/admin/OrderDetail'
import AdminUsers from './pages/admin/Users'
import AdminNews from './pages/admin/News'
import AdminCalculator from './pages/admin/Calculator'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { refetchOnWindowFocus: false, retry: 1 },
  },
})

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <>{children}</>
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuthStore()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (user?.role !== 'ADMIN') return <Navigate to="/" replace />
  return <>{children}</>
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/cars" element={<Cars />} />
            <Route path="/cars/:id" element={<CarDetail />} />
            <Route path="/parts" element={<Parts />} />
            <Route path="/parts/:id" element={<PartDetail />} />
            <Route path="/calculator" element={<Calculator />} />
            <Route path="/request" element={<Request />} />
            <Route path="/compare" element={<Compare />} />
            <Route path="/news" element={<News />} />
            <Route path="/news/:id" element={<NewsDetail />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/profile/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
            <Route path="/profile/orders/:id" element={<ProtectedRoute><OrderDetail /></ProtectedRoute>} />
            <Route path="/profile/favorites" element={<ProtectedRoute><Favorites /></ProtectedRoute>} />

            <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            <Route path="/admin/cars" element={<AdminRoute><AdminCars /></AdminRoute>} />
            <Route path="/admin/cars/new" element={<AdminRoute><AdminCarForm /></AdminRoute>} />
            <Route path="/admin/cars/:id/edit" element={<AdminRoute><AdminCarForm /></AdminRoute>} />
            <Route path="/admin/parts" element={<AdminRoute><AdminParts /></AdminRoute>} />
            <Route path="/admin/parts/new" element={<AdminRoute><AdminPartForm /></AdminRoute>} />
            <Route path="/admin/parts/:id/edit" element={<AdminRoute><AdminPartForm /></AdminRoute>} />
            <Route path="/admin/orders" element={<AdminRoute><AdminOrders /></AdminRoute>} />
            <Route path="/admin/orders/:id" element={<AdminRoute><AdminOrderDetail /></AdminRoute>} />
            <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
            <Route path="/admin/news" element={<AdminRoute><AdminNews /></AdminRoute>} />
            <Route path="/admin/calculator" element={<AdminRoute><AdminCalculator /></AdminRoute>} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" toastOptions={{ duration: 3000, style: { borderRadius: '12px', background: '#0F172A', color: '#fff' } }} />
    </QueryClientProvider>
  )
}

export default App
