export function checkPermission(allPermissions: string[] | undefined, permissionToCheck: string) {
  if (allPermissions?.includes(permissionToCheck)) {
    return true;
  } else {
    return false;
  }
}
