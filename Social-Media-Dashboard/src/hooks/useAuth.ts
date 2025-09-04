import { useSession, signIn, signOut } from "next-auth/react"

export function useAuth() {
  const { data: session, status } = useSession()
  
  const login = async (email: string, password: string) => {
    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    })
    
    return result
  }

  const register = async (name: string, email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Registration failed')
      }

      // Auto-login after successful registration
      const loginResult = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      return { success: true, data: loginResult }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Registration failed' 
      }
    }
  }

  const logout = () => {
    signOut({ redirect: false })
  }

  return {
    user: session?.user || null,
    isLoading: status === 'loading',
    isAuthenticated: !!session,
    login,
    register,
    logout,
  }
} 