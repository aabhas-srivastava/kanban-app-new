/**
 * Permission helpers based on the current user's board role.
 *
 * Roles (lowest → highest):
 *   viewer  – read-only
 *   member  – can create/edit/move/delete cards and comments
 *   owner   – full access including board settings and invites
 */
export type BoardRole = 'owner' | 'member' | 'viewer' | null;

export interface Permissions {
  /** Can create, rename or delete columns */
  canManageColumns: boolean;
  /** Can create, edit, move or delete cards */
  canManageCards: boolean;
  /** Can post or delete own comments */
  canComment: boolean;
  /** Can invite / remove board members */
  canInvite: boolean;
  /** Can drag cards between / within columns */
  canDragCards: boolean;
}

export function getPermissions(role: BoardRole): Permissions {
  switch (role) {
    case 'owner':
      return {
        canManageColumns: true,
        canManageCards: true,
        canComment: true,
        canInvite: true,
        canDragCards: true,
      };
    case 'member':
      return {
        canManageColumns: true,
        canManageCards: true,
        canComment: true,
        canInvite: false,
        canDragCards: true,
      };
    case 'viewer':
    default:
      return {
        canManageColumns: false,
        canManageCards: false,
        canComment: false,
        canInvite: false,
        canDragCards: false,
      };
  }
}
