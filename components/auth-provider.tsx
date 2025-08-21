"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { API_BASE } from "@/lib/api"

export type UserRole = "admin" | "doctor" | "nurse" | "user"

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  department?: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  signup: (name: string, email: string, password: string) => Promise<boolean>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for stored user session
    const storedUser = localStorage.getItem("hms_user")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true)
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })
      if (res.ok) {
        const loggedIn = await res.json()
        setUser(loggedIn)
        localStorage.setItem("hms_user", JSON.stringify(loggedIn))
        return true
      }
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
    return false
  }

  const signup = async (name: string, email: string, password: string): Promise<boolean> => {
    setIsLoading(true)
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      })
      if (res.ok) {
        const newUser = await res.json()
        setUser(newUser)
        localStorage.setItem("hms_user", JSON.stringify(newUser))
        return true
      }
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
    return false
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("hms_user")
  }

  return <AuthContext.Provider value={{ user, login, signup, logout, isLoading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
