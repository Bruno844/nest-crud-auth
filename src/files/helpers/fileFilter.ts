



export const fileFilter = (req: Request, file: Express.Multer.File, callback: Function ) => {

    if (!file) return callback(new Error('file is empty'), false);

    const fileException = file.mimetype.split('/')[1]
    const validExtension = ['jpg', 'jpeg','png', 'gif' ]

    if( validExtension.includes(fileException)) {
        return callback(null, true)
    }

    callback(null, false)

}