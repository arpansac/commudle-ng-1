export enum EHmsRoles {
  // VIEWER = 'viewer',
  VIEWER_NEAR_REALTIME = 'viewer-near-realtime',
  HOST = 'host', // Can edit everything
  HOST_VIEWER = 'hostviewer', // Can edit everything but only view
  GUEST = 'guest', // Temporary host permissions (not all)
}
