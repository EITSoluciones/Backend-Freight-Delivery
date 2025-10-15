import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto, LoginUserDto } from './dto';
import { log } from 'console';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { JwtService } from '@nestjs/jwt';



@Injectable()
export class AuthService {

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService
  ) {

  }

  async create(createUserDto: CreateUserDto) {

    try {

      const { password, ...userData } = createUserDto;

      const user = this.userRepository.create({
        ...userData,
        password: bcrypt.hashSync(password, 10)
      });

      const savedUser = await this.userRepository.save(user);
      const { password: _, ...userWithoutPassword } = savedUser;
      return userWithoutPassword;

    } catch (error) {
      console.log("error");
      this.handleDBErrors(error);
    }

    return 'This action adds a new auth';
  }

  async login(loginUserDto: LoginUserDto) {
    

      const {password, username} = loginUserDto;

      const user = await this.userRepository.findOne({
        where: {username},
        select: { username: true, password: true}
      });

      if(!user) throw new UnauthorizedException('Credentials are not valid (username)');

      if(!bcrypt.compareSync(password, user.password)) throw new UnauthorizedException('Credentials are not valid (password)');


      return {
        ...user,
        token: this.getJwtToken({email: user.email})       //Retornar el JWT

      }; 


  }

  private getJwtToken( payload: JwtPayload){
    const token = this.jwtService.sign(payload); //Genera Token
    return token;
  }


  private handleDBErrors(error: any): never { // never -> Nunca va regresar un valor el método 

    if (error.code === '23505') {
      throw new BadRequestException(error.detail);
    } else {
      console.log(error)

      throw new InternalServerErrorException('Please check server logs');
    }



  }



}
