import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { User } from "../entities/user.entity";
import { JwtPayload } from "../interfaces/jwt-payload.interface";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ConfigService } from "@nestjs/config";
import { Injectable, UnauthorizedException } from "@nestjs/common";


@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {

    constructor(

        @InjectRepository(User)
        private readonly userRepository: Repository<User>,

        configService: ConfigService
    ) {

        //es la manera de leer el token y en donde el usuario lo va a mandar, en este caso en el auth con la propiedad 'bearer token'
        super({
            secretOrKey: configService.get('JWT_SECRET'),
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        })
    }


    async validate(payload: JwtPayload): Promise<User> {

        const {id} = payload;

        const userId = await this.userRepository.findOneBy({id})

        if(!userId) {
            throw new UnauthorizedException('token not valid')
        }

        if(!userId.isActive){
            throw new UnauthorizedException('User is inactive, talk with an admin')
        }


        return userId;

    }

    
}