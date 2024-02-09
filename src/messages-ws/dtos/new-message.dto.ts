import { IsString, MinLength } from "class-validator";

export class NewMessageDto {

    @IsString()
    @MinLength(5)
    message: string;

}