import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import {validate as isUUID} from 'uuid'

@Injectable()
export class ProductsService {

  constructor(

    //va a saber que los datos a manejar son del tipo PRODUCT entity
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,


  ){}


  async create(createProductDto: CreateProductDto) {
    
    try {

      const product = this.productRepository.create(createProductDto);

      await this.productRepository.save(product);

      return product;

      
    } catch (error) {
      console.log(error)
      throw new InternalServerErrorException('ayuda')
    }


  }

  findAll(paginationDTO: PaginationDto) {

    const {limit = 10, offset = 0} = paginationDTO

    /*pagina los datos para que no los traiga todos, de esta manera es mas eficiente nuestro servidor,
    el take es tomar el limite como minimo de diez datos,
    y el skip toma el offset, que arranque desde el dato 1,
    si quiero offset: 2, muestre los siguientes dos datos*/
    
    return this.productRepository.find({
      take: limit,
      skip: offset,
      //todo: relaciones
    })
  }

  async findOne(term: string) {

    let product : Product;

    //busca por terminos como UUID o por el slug que tenga ese dato a traer, basicamente filtramos por dos termino o mas si queremos
    if( isUUID(term) ){
      product = await this.productRepository.findOneBy({id: term})
    } else{
      const queryBuilder = this.productRepository.createQueryBuilder();
      product = await queryBuilder
      .where(`title =:title or slug =:slug`, {
        title: term,
        slug: term,
      }).getOne();
    }

    if(!product)
      throw new NotFoundException('product with id not found');

    return product
    
  }



  async update(id: string, updateProductDto: UpdateProductDto) {

    //el preload lo que hace es tomar como argumentos los datos que debe actualizar, es como que los prepara para ser actualizado, preload: pre-carga
    //reconoce el id y los datos del updateprodDto
    const product = await this.productRepository.preload({
      id:id,
      ...updateProductDto
    });

    if(!product) throw new NotFoundException(`Product with id ${id} not found`);

    try {
      await this.productRepository.save(product);
      return product
    } catch (error) {
      
      throw new BadRequestException({error})

    }

  }





  async remove(id: string) {

    const product = await this.findOne(id);

    await this.productRepository.remove(product);
    
  }
}
