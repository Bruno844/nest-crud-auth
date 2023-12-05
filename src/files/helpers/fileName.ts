import { v4 as uuid } from "uuid";



export const fileName = (req: Request, file: Express.Multer.File, callback: Function ) => {

    if (!file) return callback(new Error('file is empty'), false);

   const fileExtension = file.mimetype.split('/')[1];

   //guarda una id unico con la extension de la imagen,sea png o jpg
   const fileName = `${uuid()}.${fileExtension}`


    callback(null, 'nuevo nombre')

}