import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import FacebookProvider from "next-auth/providers/facebook"
import { createClient } from "@supabase/supabase-js"
import bcrypt from "bcryptjs"
import type { User } from "next-auth"
import type { AdapterUser } from "next-auth/adapters"

// Extend the built-in types
declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
    }
  }

  interface User {
    id: string
  }
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          // Get user from Supabase
          const { data: user, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', credentials.email)
            .single()

          if (error || !user) {
            return null
          }

          // Verify password
          const isPasswordValid = await bcrypt.compare(credentials.password, user.password)
          
          if (!isPasswordValid) {
            return null
          }

          // Update last login
          await supabase
            .from('users')
            .update({ last_login: new Date().toISOString() })
            .eq('id', user.id)

          return {
            id: user.id,
            email: user.email,
            name: user.name,
          }
        } catch (error) {
          console.error('Auth error:', error)
          return null
        }
      }
    }),
    
    // Google OAuth Provider (optional)
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET ? [
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      })
    ] : []),
    
    // Facebook OAuth Provider (optional)
    ...(process.env.FACEBOOK_CLIENT_ID && process.env.FACEBOOK_CLIENT_SECRET ? [
      FacebookProvider({
        clientId: process.env.FACEBOOK_CLIENT_ID,
        clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
      })
    ] : []),
  ],

  callbacks: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async jwt(params: any) {
      const { token, user } = params
      if (user) {
        token.id = user.id
      }
      return token
    },
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async session(params: any) {
      const { session, token } = params;
      // Ensure user object exists and has id
      if (session?.user) {
        session.user.id = token.id as string;
      }
      return session;
    },

    async signIn({ user, account }: { user: User | AdapterUser; account: { provider?: string } | null }) {
      if (account?.provider === "google" || account?.provider === "facebook") {
        try {
          // Check if user exists
          const { data: existingUser } = await supabase
            .from('users')
            .select('*')
            .eq('email', user.email!)
            .single()

          if (!existingUser) {
            // Create new user for OAuth
            const { error } = await supabase
              .from('users')
              .insert({
                email: user.email!,
                name: user.name!,
                password: '' // Empty for OAuth users
              })

            if (error) {
              console.error('Error creating OAuth user:', error)
              return false
            }
          }
        } catch (error) {
          console.error('OAuth sign in error:', error)
          return false
        }
      }
      return true
    },
  },

  pages: {
    signIn: '/auth/signin',
  },

  session: {
    strategy: 'jwt' as const,
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  secret: process.env.NEXTAUTH_SECRET,
} 