import type { User } from '../../models/types.js';
import type { IUserRepository } from '../interfaces.js';
export declare class MockUserRepository implements IUserRepository {
    private users;
    findAll(): Promise<User[]>;
    findById(id: string): Promise<User | null>;
    findByEmail(email: string): Promise<User | null>;
    create(data: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User>;
    update(id: string, data: Partial<User>): Promise<User | null>;
    delete(id: string): Promise<boolean>;
}
//# sourceMappingURL=user.repository.d.ts.map