import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

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
    gender:string

}
