import { BadRequestException, Injectable } from '@nestjs/common';
import { existsSync } from 'fs';
import { join } from 'path';


@Injectable()
export class FilesService {


    getStaticProductImage(imageName: string){

        //path fisico donde se encuentra las img
        const path = join(__dirname, '../../static/products', imageName)

        //si no encuentra la ruta,lanza error
        if(!existsSync(path)){
            throw new BadRequestException('no product found image')
        }

        //si lo encuentra lo retorna
        return path

    }

}
