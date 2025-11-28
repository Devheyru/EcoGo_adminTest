export interface PermissionActions {
  create?: boolean;
  read?: boolean;
  update?: boolean;
  delete?: boolean;
  view?: boolean;
  refund?: boolean;
  manage?: boolean; // Generic manage
  [key: string]: boolean | undefined;
}

export interface RolePermissions {
  [resource: string]: PermissionActions;
}

export interface RoleDocument {
  id: string; // e.g. 'admin', 'operator'
  name: string; // Display name
  description?: string;
  permissions: RolePermissions;
  createdAt: string;
  updatedAt?: string;
  status: "active" | "inactive";
}
