import { Navigate, useLocation } from 'react-router-dom'
import AppLayout from '@/components/Layout'
import { useAuthStore } from '@/stores/auth'

// 登录守卫：未登录（无 token / 未认证）不允许进入系统，重定向到登录页并记录来源路径
export default function RequireAuth() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const token = useAuthStore((s) => s.token)
  const location = useLocation()

  if (!isAuthenticated || !token) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return <AppLayout />
}
