import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { MessagesWsService } from './messages-ws.service';
import { Server, Socket } from 'socket.io';
import { NewMessageDto } from './dtos/new-message.dto';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from 'src/auth/interfaces/jwt-payload.interface';

@WebSocketGateway({cors: true})
export class MessagesWsGateway implements OnGatewayConnection, OnGatewayDisconnect {

  @WebSocketServer() wss: Server

  constructor(
    private readonly messagesWsService: MessagesWsService,
    private readonly jwtService: JwtService  
  ) {}
  
  
  //aca observamos que cliente se va conectando
  handleConnection(client: Socket) {
    //aca capturamos el token que debe ingresar el usuario para que pueda conectarse a la sala de chat
    const token = client.handshake.headers.authentication as string;
    let payload: JwtPayload
    try {
      payload = this.jwtService.verify(token)
      
    } catch (error) {
      
      client.disconnect();
      return;

    }

    

    //console.log('client connect', client.id)
    this.messagesWsService.registerClient(client, payload.id)
    
    this.wss.emit('clients-updated', this.messagesWsService.getConnectedClients() )
  }
  
  
  //aca observamos lo contrario, quien se pudo haber desconectado
  handleDisconnect(client: Socket) {
    //console.log('client disconnect', client.id)

    this.messagesWsService.removeClient(client.id)

    this.wss.emit('clients-updated', this.messagesWsService.getConnectedClients() )
  }


  @SubscribeMessage('message-from-client')
  handleMessageFromClient( client: Socket, payload: NewMessageDto  ) {

    //de esta manera mostramos los mensajes que emite el cliente y lo visualizamos por pantalla, colocandole el nombre de quien lo mando, y el cuerpo del mensaje(payload)
    this.wss.emit('message-from-server', {
      fullName: this.messagesWsService.getUserFullName(client.id),
      message: payload.message
    })

  }


  


}
