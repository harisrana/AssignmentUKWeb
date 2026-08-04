export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName?: string;
  avatarUrl?: string | null;
  phoneNumber?: string | null;
  bio?: string | null;
  roles: string[];
  permissions: string[];
  isActive: boolean;
  createdAt?: string;
  lastLoginAt?: string | null;
}

export interface UserProfile extends User {
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  postCode?: string;
  country?: string;
  bio?: string;
}

export interface CreateUserRequest {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  roles: string[];
}

export interface UpdateProfileRequest {
  firstName: string;
  lastName: string;
  phoneNumber?: string | null;
  bio?: string | null;
}

export interface UpdateUserRequest {
  id: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string | null;
  roles: string[];
  isActive: boolean;
}
