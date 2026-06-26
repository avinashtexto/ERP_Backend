/**
 * User Profile Types
 * Defines name, email, and phone number fields for user profiles
 */

export interface UserProfile {
  /** Unique identifier */
  id: string;
  /** Display name / username */
  name: string;
  /** Email address */
  email: string;
  /** Phone / mobile number */
  phone: string;
}

export interface UserProfileInput {
  name: string;
  email: string;
  phone: string;
}

export interface UserProfileResponse {
  success: boolean;
  user?: UserProfile;
  message?: string;
}
