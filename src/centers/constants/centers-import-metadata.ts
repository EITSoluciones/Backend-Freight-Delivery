import { ImportFieldRule } from 'src/common/interfaces/column-metadata.interface';

export const CENTERS_IMPORT_METADATA: ImportFieldRule[] = [
  { field: 'code', label: 'Código', required: true, description: 'Identificador único del centro', example: 'CEDIS-001', validValues: 'Texto, máx. 10 caracteres', validation: { type: 'text', maxLength: 10 } },
  { field: 'name', label: 'Nombre', required: true, description: 'Nombre del centro de distribución', example: 'Centro de Distribución Norte', validValues: 'Texto, máx. 100 caracteres', validation: { type: 'text', maxLength: 100 } },
  { field: 'description', label: 'Descripción', required: false, description: 'Descripción del centro', example: 'Centro principal de operaciones', validValues: 'Texto, máx. 255 caracteres', validation: { type: 'text', maxLength: 255 } },
  { field: 'latitude', label: 'Latitud', required: false, description: 'Coordenada de latitud del centro', example: '19.427', validValues: 'Número entre -90 y 90', validation: { type: 'number', min: -90, max: 90 } },
  { field: 'longitude', label: 'Longitud', required: false, description: 'Coordenada de longitud del centro', example: '-99.1677', validValues: 'Número entre -180 y 180', validation: { type: 'number', min: -180, max: 180 } },
  { field: 'street', label: 'Calle', required: false, description: 'Calle del domicilio', example: 'Avenida Reforma', validValues: 'Texto, máx. 255 caracteres', validation: { type: 'text', maxLength: 255 } },
  { field: 'internal_number', label: 'Número interior', required: false, description: 'Número interior del domicilio', example: '12', validValues: 'Texto, máx. 50 caracteres', validation: { type: 'text', maxLength: 50 } },
  { field: 'external_number', label: 'Número exterior', required: false, description: 'Número exterior del domicilio', example: '123', validValues: 'Texto, máx. 50 caracteres', validation: { type: 'text', maxLength: 50 } },
  { field: 'neighborhood', label: 'Colonia', required: false, description: 'Colonia del domicilio', example: 'Juárez', validValues: 'Texto, máx. 255 caracteres', validation: { type: 'text', maxLength: 255 } },
  { field: 'district', label: 'Delegación/Municipio', required: false, description: 'Delegación o municipio', example: 'Cuauhtémoc', validValues: 'Texto, máx. 255 caracteres', validation: { type: 'text', maxLength: 255 } },
  { field: 'city', label: 'Ciudad', required: false, description: 'Ciudad del centro', example: 'Ciudad de México', validValues: 'Texto, máx. 255 caracteres', validation: { type: 'text', maxLength: 255 } },
  { field: 'state', label: 'Estado', required: false, description: 'Estado del centro', example: 'Ciudad de México', validValues: 'Texto, máx. 255 caracteres', validation: { type: 'text', maxLength: 255 } },
  { field: 'country', label: 'País', required: false, description: 'País del centro', example: 'México', validValues: 'Texto, máx. 255 caracteres', validation: { type: 'text', maxLength: 255 } },
  { field: 'postal_code', label: 'Código postal', required: false, description: 'Código postal del domicilio', example: '06600', validValues: 'Texto, máx. 12 caracteres', validation: { type: 'text', maxLength: 12 } },
  { field: 'is_active', label: 'Activo', required: false, description: 'Estado del centro. Por defecto: true', example: 'true', validValues: 'true o false', validation: { type: 'boolean' } },
];
