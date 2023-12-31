import { IsEmail } from "class-validator";
import { Product } from "src/products/entities";
import { BeforeInsert, BeforeUpdate, Column, Entity, OneToMany, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";

@Entity('users') //como se va a llamar en la base de datos
export class User {

    @PrimaryGeneratedColumn('uuid')
    id: string;


    @Column('text',{
        unique: true
    })
    @IsEmail()
    email:string;

    @Column('text',{
        select: false
    })
    password:string;

    @Column('text')
    fullName: string;


    @Column('bool',{

        default: true
    })
    isActive: boolean;


    @Column('text', {
        array: true,
        default: ['user'] //todos los usuarios que cree, van a tener el rol de user por default
    })
    roles: string[];


    //uno a muchos, un usuario puede tener muchos prod
    @OneToMany(
        () => Product, //con que tabla se relaciona
        (product) => product.user //apunta a un user que este relacionado en la otra tabla
    ) 
    product: Product;




    //lo que hace es que antes de guardar el mail en la base de datos, convierta el mail todo a minuscula, en caso que el usuario haya ingresa mayusculas
    @BeforeInsert()
    checkFieldsBeforeInsert(){
        this.email = this.email.toLowerCase().trim()
    }
    //el .trim limpia espacios adelante y atras del texto
    

    //lo mismo que el de arriba, pero este es antes de actualizar el mail
    @BeforeUpdate()
    checkfieldsBeforeUpdate(){
        this.checkFieldsBeforeInsert
    }
}
