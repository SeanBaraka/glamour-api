import {Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn} from "typeorm";
import { AuthRole } from "./AuthRole";
import { AuthUser } from "./AuthUser";

export enum Gender {
    MALE = 'male',
    FEMALE = 'female'
}

@Entity('our_customers')
export class Customer {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    firstname: String

    @Column()
    lastname: String

    @Column()
    telephone: String

    @Column()
    address: String

    @Column({
        type: "enum",
        enum: Gender
    })
    gender: Gender

    @ManyToOne(type => AuthRole, arole => arole.users)
    role: AuthRole

    @OneToOne(type => AuthUser)
    @JoinColumn({name: 'login_id'})
    loginUser: AuthUser
}
