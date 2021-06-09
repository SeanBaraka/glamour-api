import { pbkdf2, pbkdf2Sync, randomBytes } from "crypto";
import {Request, Response} from "express";
import { getRepository } from "typeorm";
import { AuthUser } from "../entity/AuthUser";
import * as jwt from 'jsonwebtoken'
import { AuthRole, UserRole } from "../entity/AuthRole";

export class AuthController {
    private authRepo = getRepository(AuthUser)
    private roleRepo = getRepository(AuthRole)

    // logging in a user and authenticating the rest of the operations
    async login(req: Request, response: Response) {
        // get the user details from the request body, and proceed to login the user
        const email = req.body.email
        const password = req.body.password

        // attempt to find a user with the given email address
        const authuser = await this.authRepo.findOne({
            where: {
                email: email
            }
        })
        
        // if the user is found
        if (authuser !== undefined) {
            console.log(authuser);
            const salt = authuser.salt
            // generate a new hash based on the salt from the database and the password received
            const comparePassword = pbkdf2Sync(password, salt, 1000, 32, 'SHA512').toString('hex')
            if (comparePassword === authuser.passwordHash) {
                // if the two match
                const success = {
                    status: 200,
                    token: jwt.sign({user: authuser.username, irl: authuser.role}, process.env.SECRET, {
                        algorithm: 'HS512',
                        expiresIn: '1d'
                    })
                }

                return success // a user was found and returned
            } else {
                const passwordNotMatching = {
                    status: 400,
                    message: "The password you entered is incorrect",
                    remarks: "Fuck Off"
                }

                return passwordNotMatching // the password not matching error
            }

        } else {
            // no user was found, hence return a user not found error
            const userNotfound = {
                status: 404,
                message: 'the requested user was not found on this server'
            }
            return userNotfound
        }
    }

    // here we register a new user.. a system login user
    async register(request: Request, response: Response) {
        const systemuser = new AuthUser() // create an auth user object

        systemuser.email = request.body.email
        systemuser.username = request.body.username
        // here we generate a salt that we use for the user entity.
        // it will also be used to generate a password hash for the user
        const salt =  randomBytes(16).toString('hex')
        systemuser.salt = salt
        // generate a password hash from the salt and the given password. save the hash
        systemuser.passwordHash = pbkdf2Sync(request.body.password, salt, 1000, 32, 'SHA512').toString('hex')

        // get the role passed from the db 
        // FIXME: This one here throws an error when an invalid role is passed
        // FIXME: Pleeeeasssseeee.
        const role = await this.roleRepo.findOne({where: {
            name: request.body.role
        }})

        if (role === undefined) {
            const roleNotFound = {
                status: 400,
                message: `Bad input, request not completed`
            }
            return roleNotFound
        }
        // assign it to the user, the role i.e
        systemuser.role = role

        //assumming that all fields were filled well
        try {
            const addedUser = await this.authRepo.save(systemuser) // attempt to add a new user..
            // user is added, so return a new message.
            if (addedUser !== null) {
                const success = {
                    status: 201,
                    message: 'user registered successfully'
                }
                return success
            }
        } catch (error) {
            const someBadError = {
                status: 500,
                message: "Some Bad error occurred on the server. Please call +254724685059"
            }
            return someBadError // a bad error thrown on the server..
        }
    }
}