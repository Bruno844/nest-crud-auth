import { Injectable } from '@nestjs/common';
import { ProductsService,  } from 'src/products/products.service';
import { initialData } from './data/seed-data';



//ESTE SERVICIO SIRVE PARA HACER UNA ELIMINACION COMPLETA DE LOS DATOS DE LA BASE DE DATOS, SIRVE PARA DESARROLLO COMO PRACTICAS O EN ENTORNOS DONDE NECESITES BORRAR LOS DATOS SI SON NECESARIOS.

@Injectable()
export class SeedService {

  constructor(
    private readonly productService: ProductsService
  ) {}



  async runSeed() {

    await this.insertNewProducts()
    
    return 'SEED EXECUTED'
  }


  private async insertNewProducts() {

    //elimina todos los productos
    await this.productService.deleteAllProducts();

    //guarda en la constante los datos cargados en el archivo initialData
    const products = initialData.products

    //para guardar los datos como arreglo
    const insertPromises = []

    
    //recorro esos productos, y los guardo en la variable
    //insertPromises
    // products.forEach(product => {
    //   insertPromises.push(this.productService.create(product))
    // })

    //resuelvo todas las promesas anteriores en simultaneo, de esa manera es mas eficiente si tenemos muchas promesas en una funcion
    await Promise.all(insertPromises)

    //retorna en true que salio todo ok
    return true;

  }

}
