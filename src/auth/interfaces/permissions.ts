export enum Permissions {
  //Dashboard
  DashboardView = 'dashboard:view',

  //Usuarios
  UsersView = 'users:view',
  UsersCreate = 'users:create',
  UsersUpdate = 'users:update',
  UsersDelete = 'users:delete',

  //Categorías de Módulos
  ModuleCategoriesView = 'modulecategories:view',
  ModuleCategoriesCreate = 'modulecategories:create',
  ModuleCategoriesUpdate = 'modulecategories:update',
  ModuleCategoriesDelete = 'modulecategories:delete',

  //Módulos
  ModulesView = 'modules:view',
  ModulesCreate = 'modules:create',
  ModulesUpdate = 'modules:update',
  ModulesDelete = 'modules:delete',

  //Roles
  RolesView = 'roles:view',
  RolesCreate = 'roles:create',
  RolesUpdate = 'roles:update',
  RolesDelete = 'roles:delete',

  //Bitácora
  LogsView = 'logs:view',

  //Clientes
  CustomersView = 'customers:view',
  CustomersCreate = 'customers:create',
  CustomersUpdate = 'customers:update',
  CustomersDelete = 'customers:delete',

  //Productos
  ProductsView = 'products:view',
  ProductsCreate = 'products:create',
  ProductsUpdate = 'products:update',
  ProductsDelete = 'products:delete',

  //Repartidores
  DeliveryDriversView = 'deliverydrivers:view',
  DeliveryDriversCreate = 'deliverydrivers:create',
  DeliveryDriversUpdate = 'deliverydrivers:update',
  DeliveryDriversDelete = 'deliverydrivers:delete',

  //Vehiculos de reparto
  DeliveryVehiclesView = 'deliveryvehicles:view',
  DeliveryVehiclesCreate = 'deliveryvehicles:create',
  DeliveryVehiclesUpdate = 'deliveryvehicles:update',
  DeliveryVehiclesDelete = 'deliveryvehicles:delete',

  //Empresa
  CompanyView = 'company:view',
  CompanyCreate = 'company:create',
  CompanyUpdate = 'company:update',
  CompanyDelete = 'company:delete',

  //Direcciones
  AddressesView = 'addresses:view',
  AddressesUpdate = 'addresses:update',
  AddressesDelete = 'addresses:delete',

  //Plataformas
  PlatformsView = 'platforms:view',
  PlatformsCreate = 'platforms:create',
  PlatformsUpdate = 'platforms:update',
  PlatformsDelete = 'platforms:delete',

  //App Config
  AppConfigView = 'appconfig:view',
  AppConfigUpdate = 'appconfig:update',

  //Test
  Test = 'test:view',
}
