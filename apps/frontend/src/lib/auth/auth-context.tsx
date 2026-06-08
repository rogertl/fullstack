/**
 * 认证上下文
 *
 * 管理全局认证状态
 */

'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import { authApi } from '@/lib/api'
import type { UserResponse } from '@contract-management/shared/schemas'

interface AuthContextType {
  user: UserResponse | null
  loading: boolean
  isAuthenticated: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => void
  refresh: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function AuthProvider({ children }: { children: ReactNode }): React.JSX.Element {
  const [user, setUser] = useState<UserResponse | null>(null)
  const [loading, setLoading] = useState<boolean>(true)

  const isAuthenticated = user !== null

  const login = async (username: string, password: string): Promise<void> => {
    const response = await authApi.login({ username, password })
    setUser(response.user)
  }

  const logout = (): void => {
    authApi.logout()
    setUser(null)
  }

  const refresh = async (): Promise<void> => {
    try {
      if (authApi.isAuthenticated() === true) {
        const currentUser = await authApi.getCurrentUser()
        setUser(currentUser)
      }
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void refresh()
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, isAuthenticated, login, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  )
}
