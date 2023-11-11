import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import {validate as isUUID} from 'uuid'
import { ProductImage } from './entities';

@Injectable()
export class ProductsService {

  constructor(

    //va a saber que los datos a manejar son del tipo PRODUCT entity
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    @InjectRepository(ProductImage) 
    private readonly productImageRepository: Repository<ProductImage>

  ){}


  async create(createProductDto: CreateProductDto) {
    
    try {

      const {images = [], ...productDetails} = createProductDto

      const product = this.productRepository.create({
        ...productDetails,
        images: images.map((image) => 
          this.productImageRepository.create({url: image})
        )
      });

      await this.productRepository.save(product);

      return {...product, images};

      
    } catch (error) {
      console.log(error)
      throw new InternalServerErrorException('ayuda')
    }


  }

  async findAll(paginationDTO: PaginationDto) {

    const {limit = 10, offset = 0} = paginationDTO

    /*pagina los datos para que no los traiga todos, de esta manera es mas eficiente nuestro servidor,
    el take es tomar el limite como minimo de diez datos,
    y el skip toma el offset, que arranque desde el dato 1,
    si quiero offset: 2, muestre los siguientes dos datos*/
    
    const products = await this.productRepository.find({
      take: limit,
      skip: offset,
      relations: {
        images: true
      }
    })

    //recorro el arreglo de imagenes y muestro solo la url, con ademas todos los datos anteriores.
    return products.map((product) => ({
      ...product, //traigo los demas datos sin alterar sus datos(operador spread)
      images: product.images.map(img => img.url) //la url
    }) )
  }

  async findOne(term: string) {

    let product : Product;

    //busca por terminos como UUID o por el slug que tenga ese dato a traer, basicamente filtramos por dos termino o mas si queremos
    if( isUUID(term) ){
      product = await this.productRepository.findOneBy({id: term})
    } else{
      const queryBuilder = this.productRepository.createQueryBuilder('prod');
      product = await queryBuilder
      .where(`title =:title or slug =:slug`, {
        title: term,
        slug: term,
      })
      .leftJoinAndSelect('prod.images', 'prodImages')
      .getOne();
    }

    if(!product)
    throw new NotFoundException('product with id not found');

    return product
    
  }

  async findOnePlain(term: string ) {
    const {images = [], ...rest} = await this.findOne(term);

    return {
      ...rest,
      images: images.map(img => img.url)
    }
  }



  async update(id: string, updateProductDto: UpdateProductDto) {

    //el preload lo que hace es tomar como argumentos los datos que debe actualizar, es como que los prepara para ser actualizado, preload: pre-carga
    //reconoce el id y los datos del updateprodDto
    const product = await this.productRepository.preload({
      id:id,
      ...updateProductDto,
      images: []
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
