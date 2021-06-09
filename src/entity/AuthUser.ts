import {Column, DeleteDateColumn, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn} from "typeorm";
import { AuthRole, UserRole } from "./AuthRole";

@Entity('user_logins')
export class AuthUser {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    username: string

    @Column()
    email: string

    @Column()
    salt: string

    @Column()
    passwordHash: string

    @DeleteDateColumn()
    deletedAt: Date

    @ManyToOne(type => AuthRole, aurole => aurole.users)
    @JoinColumn()
    role: AuthRole

}
