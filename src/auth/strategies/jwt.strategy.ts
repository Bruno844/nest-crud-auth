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

        const {email} = payload;

        const user = await this.userRepository.findOneBy({email})

        if(!user) {
            throw new UnauthorizedException('token not valid')
        }

        if(!user.isActive){
            throw new UnauthorizedException('User is inactive, talk with an admin')
        }


        return user;

    }

    
}