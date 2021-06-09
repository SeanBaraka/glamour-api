import {Column, Entity, OneToMany, PrimaryGeneratedColumn} from "typeorm";
import { AuthUser } from "./AuthUser";
import { Customer } from "./Customer";

export enum UserRole {
    ADMIN = 'admin',
    CUSTOMER = 'customer',
    STYLIST = 'stylist',
    SUPERADMIN = 'superadmin'
}

@Entity('user_roles')
export class AuthRole {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        type: 'enum',
        enum: UserRole
    })
    name: UserRole

    @OneToMany(type => AuthUser, user => user.role)
    users: AuthUser[]
}
