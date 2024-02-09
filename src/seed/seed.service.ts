import { Injectable } from '@nestjs/common';
import { ProductsService,  } from 'src/products/products.service';
import { initialData } from './data/seed-data';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/auth/entities/user.entity';
import {Repository } from 'typeorm';
import { CreateUserDto } from 'src/auth/dto/create-user.dto';
import * as bcrypt from 'bcryptjs'



//ESTE SERVICIO SIRVE PARA HACER UNA ELIMINACION COMPLETA DE LOS DATOS DE LA BASE DE DATOS, SIRVE PARA DESARROLLO COMO PRACTICAS O EN ENTORNOS DONDE NECESITES BORRAR LOS DATOS SI SON NECESARIOS.

@Injectable()
export class SeedService {

  constructor(
    private readonly productService: ProductsService,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) {}



  async runSeed() {

    await this.deleteTables()
    const adminUser = await this.insertUsers();
    await this.insertNewProducts(adminUser)
    
    return 'SEED EXECUTED'
  }


  private async deleteTables(){

    await this.productService.deleteAllProducts();

    const queryBuilder = this.userRepository.createQueryBuilder();

    //elimina los usuarios de la base de datos
    await queryBuilder
      .delete()
      .where({})
      .execute()
    

  }

  private async insertUsers(){

    const seedUser = initialData.users;
    
    const users : User[] = [];

    seedUser.forEach(user => {
      users.push(this.userRepository.create(user)
    )
    });

    const dbUser = await this.userRepository.save(seedUser)

    return dbUser[0]

  }




  private async insertNewProducts(user: User) {

    //elimina todos los productos
    await this.productService.deleteAllProducts();

    //guarda en la constante los datos cargados en el archivo initialData
    const products = initialData.products

    //para guardar los datos como arreglo
    const insertPromises = []

    
    //recorro esos productos, y los guardo en la variable
    //insertPromises
    products.forEach(product => {
      insertPromises.push(this.productService.create   (product, user))
    })

    //resuelvo todas las promesas anteriores en simultaneo, de esa manera es mas eficiente si tenemos muchas promesas en una funcion
    await Promise.all(insertPromises)

    //retorna en true que salio todo ok
    return true;

  }

}
