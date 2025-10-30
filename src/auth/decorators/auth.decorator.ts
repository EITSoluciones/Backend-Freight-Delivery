import { applyDecorators, UseGuards } from "@nestjs/common";
import { Permissions, ValidRoles } from "../interfaces";
import { RoleProtected } from "./role-protected.decorator";
import { AuthGuard } from "@nestjs/passport";
import { UserRoleGuard } from "../guards/user-role/user-role.guard";


export function Auth(...permissions: Permissions[]){

    return applyDecorators(
         RoleProtected(...permissions),
         UseGuards(AuthGuard(), UserRoleGuard)
    );

}