// Mock Google OAuth service for demo purposes
export interface GoogleUser {
  id: string
  email: string
  name: string
  picture: string
}

export class GoogleAuthService {
  private static instance: GoogleAuthService

  static getInstance(): GoogleAuthService {
    if (!GoogleAuthService.instance) {
      GoogleAuthService.instance = new GoogleAuthService()
    }
    return GoogleAuthService.instance
  }

  async signInWithGoogle(): Promise<GoogleUser | null> {
    // Mock Google OAuth flow
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simulate successful Google auth
        const mockGoogleUser: GoogleUser = {
          id: `google_${Date.now()}`,
          email: "user@gmail.com",
          name: "Google User",
          picture: "/diverse-user-avatars.png",
        }
        resolve(mockGoogleUser)
      }, 1500)
    })
  }

  async signOut(): Promise<void> {
    // Mock sign out
    return new Promise((resolve) => {
      setTimeout(resolve, 500)
    })
  }
}
