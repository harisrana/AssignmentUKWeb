export interface Role {
  id: string;
  name: string;
  description?: string;
  permissions: string[];
  isSystem?: boolean;
  createdAt?: string;
}

export interface Permission {
  id: string;
  key: string;
  name: string;
  group: string;
  description?: string;
}
