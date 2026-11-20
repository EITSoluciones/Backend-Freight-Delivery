/**
 * Códigos de roles del sistema que no pueden ser eliminados ni desactivados.
 */
export const SUPER_ADMIN_ROLE_CODE = 'SUPER_ADMIN';
export const DELIVERY_DRIVER_ROLE_CODE = 'DELIVERY_DRIVER';

export const PROTECTED_ROLE_CODES: string[] = [
  SUPER_ADMIN_ROLE_CODE,
  'ADMINISTRADOR',
  DELIVERY_DRIVER_ROLE_CODE,
];
