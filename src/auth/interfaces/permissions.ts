

export enum Permissions {

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
    RolesUpdate = 'roles:update',

    //Bitácora
    LogsView = 'logs:view',

    //Clientes
    CustomersView = 'customers:view',
    CustomersCreate = 'customers:create',
    CustomersUpdate = 'customers:update',
    CustomersDelete = 'customers:delete',

    //Test
    Test = 'test:view'

}