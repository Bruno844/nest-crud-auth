import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Req, SetMetadata } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from './decorator/get-user.decorator';
import { User } from './entities/user.entity';
import { RawHeaders } from './decorator/raw-headers.decorator';
import { RoleProtected } from './decorator/role-protected.decorator';
import { ValidRoles } from './interfaces/valid-roles';
import { UserRoleGuard } from './guards/user-role/user-role.guard';
import { Auth } from './decorator/auth.decorator';


@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  createUser(@Body() createUserDto: CreateUserDto) {
    return this.authService.create(createUserDto);
  }

  @Post('login')
  loginUser(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login( loginUserDto);
  }


  //verifica si el usuario esta en la db, y genera un nuevo token,
  //implementado en el auth.service
  @Get('check-status')
  @Auth()
  checkAuthStatus(
    @GetUser() user: User 
  ){

    return this.authService.checkAuthStatus(user)
  }



  //ruta para probar rutas protegidas usando guards y custom decorator
  @Get('private')
  @UseGuards(AuthGuard())
  testingPrivateRoute(

    //para mostrar todos los datos del user
    @GetUser() user: User,
    //para mostrar los datos que nosotros queremos en particular
    @GetUser('email') userEmail: string,
    //muestra todo el headers de la request, creado como un custom decorator 
    @RawHeaders() rawHeaders: string[]
  ){

    return {
      user,
      userEmail,
      rawHeaders
    }
    
  }


  @Get('private2')
  //custom decorator que valida que el usuario que ingrese a este endpoint, debe tener como rol el superUser
  //va a depender que rol configuremos, eso es lo copado
  @RoleProtected( ValidRoles.superUser)
  @UseGuards(AuthGuard(), UserRoleGuard)
  privateRoute2(
    @GetUser() user: User
  ){


    return {
      ok: true,
      user
    }

    
  }


  @Get('private3')
  //decorator que engloba todos los demas decorators del auth
  //verifica el token
  //si el usuario esta activo
  //si tiene los roles permitidos. Todos modularizados en un solo archivo
  @Auth()
  privateRoute3(
    @GetUser() user: User
  ){


    return {
      ok: true,
      user
    }

    
  }

}
