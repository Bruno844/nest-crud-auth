import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ProductImage } from "./product-image.entity";
import { User } from "src/auth/entities/user.entity";

//este entity archivo es como una tabla en postgres,definimos los parametros
@Entity()
export class Product {

    @PrimaryGeneratedColumn('uuid')
    id: string;


    @Column('text', {
        unique: true
    })
    title: string;

    @Column('float',{
        default: 0
    })
    price: number;

    @Column()
    description: string;

    @Column('text',{
        unique:true
    })
    slug: string;

    @Column('int',{
        default: 0
    })
    stock: number;

    @Column('text',{
        array: true
    })
    sizes: string[];

    @Column('text')
    gender:string;


    @Column('text',{
        array: true,
        default: []

    })
    tags: string[];

    @OneToMany(
        () => ProductImage,
        productImage => productImage.product,
        {cascade: true, eager: true}
    )
    images?: ProductImage[];


    //muchos a uno, muchos prod puede tener un solo user
    @ManyToOne(
        () => User, //con que tabla se relaciona
        (user) => user.product,
        {eager: true} //actualiza la relacion automaticamente en la base de datos
    )
    user: User


}
