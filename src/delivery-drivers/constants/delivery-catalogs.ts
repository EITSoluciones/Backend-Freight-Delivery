export const DELIVERY_DRIVER_PROFILES = [
  { code: 'default', label: 'Perfil por defecto' },
];

export const DELIVERY_DRIVER_TYPES = [
  { code: 'internal', label: 'Interno' },
  { code: 'external', label: 'Externo' },
];

export const DELIVERY_LICENSE_TYPES = [
  { code: 'automovilista', label: 'Automovilista' },
  { code: 'chofer', label: 'Chofer' },
  { code: 'moto', label: 'Moto' },
];

export const DELIVERY_DOCUMENT_TYPES = [
  { code: 'curp', label: 'CURP' },
  { code: 'rfc', label: 'RFC' },
  { code: 'dni', label: 'DNI' },
  { code: 'passport', label: 'Pasaporte' },
  { code: 'ine', label: 'INE' },
];

export const DELIVERY_DRIVER_STATUSES = [
  { code: 'active', label: 'Activo' },
  { code: 'inactive', label: 'Inactivo' },
  { code: 'suspended', label: 'Suspendido' },
];

export const DELIVERY_VEHICLE_TYPES = [
  { code: 'motorcycle', label: 'Motocicleta' },
  { code: 'car', label: 'Automovil' },
  { code: 'van', label: 'Van' },
  { code: 'truck', label: 'Camioneta' },
  { code: 'bicycle', label: 'Bicicleta' },
];

export const DELIVERY_VEHICLE_STATUSES = [
  { code: 'active', label: 'Activo' },
  { code: 'maintenance', label: 'Mantenimiento' },
  { code: 'inactive', label: 'Inactivo' },
];

export const DELIVERY_DRIVER_PROFILE_CODES = DELIVERY_DRIVER_PROFILES.map(
  (item) => item.code,
);
export const DELIVERY_DRIVER_TYPE_CODES = DELIVERY_DRIVER_TYPES.map(
  (item) => item.code,
);
export const DELIVERY_LICENSE_TYPE_CODES = DELIVERY_LICENSE_TYPES.map(
  (item) => item.code,
);
export const DELIVERY_DOCUMENT_TYPE_CODES = DELIVERY_DOCUMENT_TYPES.map(
  (item) => item.code,
);
export const DELIVERY_DRIVER_STATUS_CODES = DELIVERY_DRIVER_STATUSES.map(
  (item) => item.code,
);
export const DELIVERY_VEHICLE_TYPE_CODES = DELIVERY_VEHICLE_TYPES.map(
  (item) => item.code,
);
export const DELIVERY_VEHICLE_STATUS_CODES = DELIVERY_VEHICLE_STATUSES.map(
  (item) => item.code,
);

export const DELIVERY_CATALOGS = {
  driver_profiles: DELIVERY_DRIVER_PROFILES,
  driver_types: DELIVERY_DRIVER_TYPES,
  license_types: DELIVERY_LICENSE_TYPES,
  document_types: DELIVERY_DOCUMENT_TYPES,
  driver_statuses: DELIVERY_DRIVER_STATUSES,
  vehicle_types: DELIVERY_VEHICLE_TYPES,
  vehicle_statuses: DELIVERY_VEHICLE_STATUSES,
};
