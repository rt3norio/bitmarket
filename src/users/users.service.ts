import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from './user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findOne(username: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { username } });
  }
  
  async findById(id: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }
  
  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async create(username: string, password: string, email?: string, role: UserRole = UserRole.USER): Promise<User> {
    // Check if username already exists
    const existingUser = await this.findOne(username);
    if (existingUser) {
      throw new ConflictException('Username already exists');
    }

    // Only check for duplicate email if one was provided
    if (email) {
      const existingUserWithEmail = await this.findByEmail(email);
      if (existingUserWithEmail) {
        throw new ConflictException('Email already in use');
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create new user entity
    const user = this.usersRepository.create({
      username,
      password: hashedPassword,
      email,
      role
    });
    
    // Save to database
    return await this.usersRepository.save(user);
  }

  async update(id: string, userData: Partial<User>): Promise<User> {
    const user = await this.findById(id);
    
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    
    // If changing password, hash it
    if (userData.password) {
      userData.password = await bcrypt.hash(userData.password, 10);
    }
    
    // Update user properties
    Object.assign(user, userData);
    
    // Save to database
    return await this.usersRepository.save(user);
  }
  
  async remove(id: string): Promise<void> {
    const result = await this.usersRepository.delete(id);
    
    if (result.affected === 0) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
  }
}