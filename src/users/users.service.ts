import { Injectable, ConflictException } from '@nestjs/common';
import { User } from './user.interface';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  private readonly users: User[] = [];
  private idCounter = 1;

  async findOne(username: string): Promise<User | undefined> {
    return this.users.find(user => user.username === username);
  }
  
  async findByEmail(email: string): Promise<User | undefined> {
    return this.users.find(user => user.email === email);
  }

  async create(username: string, password: string, email?: string): Promise<User> {
    // Only check for duplicate email if one was provided
    if (email) {
      const existingUserWithEmail = await this.findByEmail(email);
      if (existingUserWithEmail) {
        throw new ConflictException('Email already in use');
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user: User = {
      id: this.idCounter++,
      username,
      password: hashedPassword,
      email,
    };
    
    this.users.push(user);
    return user;
  }
}