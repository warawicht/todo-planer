import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(userData: Partial<User>): Promise<User> {
    const user = this.usersRepository.create(userData);
    return this.usersRepository.save(user);
  }

  async findByEmail(email: string): Promise<User | undefined> {
    const user = await this.usersRepository.findOne({ where: { email } });
    return user || undefined;
  }

  async findById(id: string): Promise<User | undefined> {
    const user = await this.usersRepository.findOne({ where: { id } });
    return user || undefined;
  }

  async update(id: string, userData: Partial<User>): Promise<User> {
    await this.usersRepository.update(id, userData);
    const user = await this.findById(id);
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }

  async delete(id: string): Promise<void> {
    await this.usersRepository.delete(id);
  }

  async findByEmailVerificationToken(token: string): Promise<User | undefined> {
    const user = await this.usersRepository.findOne({ 
      where: { 
        emailVerificationToken: token 
      } 
    });
    return user || undefined;
  }

  async findByPasswordResetToken(token: string): Promise<User | undefined> {
    const user = await this.usersRepository.findOne({ 
      where: { 
        passwordResetToken: token 
      } 
    });
    return user || undefined;
  }

  async findOne(options: any): Promise<User | undefined> {
    const user = await this.usersRepository.findOne(options);
    return user || undefined;
  }
}