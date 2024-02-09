import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Socket } from 'socket.io';
import { User } from 'src/auth/entities/user.entity';
import { Repository } from 'typeorm';

interface ConnnectedClients {

    [id:string] : {
        socket: Socket,
        user: User
    }


}



@Injectable()
export class MessagesWsService {


    private connectedClients: ConnnectedClients = {}

    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>
    ) {}


    async registerClient(client: Socket, userId: string){

        //consulta a la base de datos si el usuario a conectarse existe en nuestro servidor
        const user = await this.userRepository.findOneBy({id: userId})
        if(!user) throw new Error('User not found')

        this.checkUserConnection(user)

        //se esta manera la conexion no solo es por conectarse asi nomas, si no que se basa tambien el la entidad de user, que buscamos en el servidor
        this.connectedClients[client.id] = {
            socket: client,
            user
        };

    }


    removeClient(clientId: string) {

        delete this.connectedClients[clientId]

    }


    //retorna en numeros los usuarios conectados en nuestro servidor
    getConnectedClients(): string[] {

        return Object.keys(this.connectedClients);

    }


    //aca capturamos el nombre de usuario que tenga la persona en la base de datos, gracias a la entidad user y llmando a la interfaz connectedClients
    getUserFullName(socketId: string){
        return this.connectedClients[socketId].user.fullName
    }


    //funcion que chequea que dos usuarios iguales no pueden conectarse en una misma computadora o en una misma sesion
    private checkUserConnection(user: User) {

        for (const clientId of Object.keys(this.connectedClients) ) {
            
            const connectedClient = this.connectedClients[clientId];

            //verifica si el id que esta ya conectado es igual al que ingresa el usuario por input
            if(connectedClient.user.id === user.id){
                connectedClient.socket.disconnect();
                break;
            }

        }

    }



}
