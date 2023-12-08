import { ExecutionContext, InternalServerErrorException, createParamDecorator } from "@nestjs/common";



export const GetUser = createParamDecorator(
    (data: string, ctx: ExecutionContext) => {
        
        const req = ctx.switchToHttp().getRequest();
        const user = req.user;
    

        //si no existe user, lance error interno de servidor
        if(!user) {
            throw new InternalServerErrorException('user not found (request)')
        }

        //si no existe data, devuelve user o tambien los datos del arreglo user que especifiquemos en la ruta get del auth.controller
        return (!data)
            ? user
            : user[data]
    }
);