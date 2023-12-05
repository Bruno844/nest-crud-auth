import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

import * as bcrypt from 'bcryptjs'
import { LoginUserDto } from './dto/login-user.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {

  //todo el codigo funciona!!

  constructor(
    //lo que hace esta dos lineas es poder configurar nuestra entrada de datos con la entidad user, de esa manera llamamos a los metodos de typeORM, es como un schema en sequelize por ejemplo, donde te trae los metodos del orm.
    @InjectRepository(User)
    private readonly userRepository:  Repository<User>,

    private readonly jwtService: JwtService
  ){}

  
  //funcion para registrar un usuario
  async create(createUserDto: CreateUserDto) {
    
    try {

      const {password, ...userData} = createUserDto
      
     //prepara el modelo de datos a guardar 
     const user = this.userRepository.create({
      ...userData,
      password: bcrypt.hashSync(password, 10) //hashea la contraseña(encriptado)
     });

     //aca lo guarda
     await this.userRepository.save(user)
     delete user.password //para no mostrar la contra en la respuesta

     //lo retornamos
     return {
      ...user,
      token: this.getJwtToken({email: user.email})
    }


    } catch (error) {
      this.handleDBErrors(error)
    }


  }


  async login(loginuserDto: LoginUserDto) {

    const {password, email} = loginuserDto;

    const user = await this.userRepository.findOne({
      where: {email},
      select: {email: true, password: true}
      //selecciono solo los campos que quiero que me muestre cuando hago un login, que solo se base en ello
    });

    //compara si el mail es correcto
    if(!user){
      throw new UnauthorizedException('credentials not valid')
    }

    //compara la contraseña ingresada con la que esta en la db
    if(!bcrypt.compareSync(password, user.password)){
      throw new UnauthorizedException('credentials not valid')
    }


    return {
      ...user,
      token: this.getJwtToken({email: user.email})
    }



  }


  //se usa la palabra private cuando solo se va a usar en solo ese archivo, nunca se va a usar afuera
  private getJwtToken(payload: JwtPayload){

    //relacion con el payload del token
    const token = this.jwtService.sign(payload);
    return token

  }








  //manejo de errores globlaes, optimiza los mensajes de error
  private handleDBErrors(error:any): never {

    if(error.code === '23505'){
      throw new BadRequestException(error.detail)
    }
    else{
      console.log(error)
      throw new InternalServerErrorException('please check server logs')
    }

  }

}
