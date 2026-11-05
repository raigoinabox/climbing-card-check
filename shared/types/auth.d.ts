declare module "#auth-utils" {
  interface User {
    name: string | undefined;
    email: string | undefined;
    admin: boolean;
  }

  interface SecureSessionData {
    broken: string;
  }

  interface UserSession {
    /**
     * Session ID
     */
    id: string;
    /**
     * User session data, available on client and server
     */
    user: User;
    /**
     * Private session data, only available on server/ code
     */
    secure?: SecureSessionData;
  }
}
