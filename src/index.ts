import "reflect-metadata";
import {createConnection, getRepository} from "typeorm";
import * as express from "express";
import * as bodyParser from "body-parser";
import {Request, Response} from "express";
import {Routes} from "./routes";
import { AuthRole, UserRole } from "./entity/AuthRole";
import { AuthUser } from "./entity/AuthUser";
import { pbkdf2Sync, randomBytes } from "crypto";

createConnection().then(async connection => {

    // create express app
    const app = express();
    app.use(bodyParser.json());

    // register express routes from defined application routes
    Routes.forEach(route => {
        (app as any)[route.method](route.route, (req: Request, res: Response, next: Function) => {
            const result = (new (route.controller as any))[route.action](req, res, next);
            if (result instanceof Promise) {
                result.then(result => result !== null && result !== undefined ? res.send(result) : undefined);

            } else if (result !== null && result !== undefined) {
                res.json(result);
            }
        });
    });

    // the first time this is run, register auth roles for each level...
    const authRepo = getRepository(AuthRole)
    // find available roles
    authRepo.find().then((roles) => {
        if (roles.length === 0) {
            // if no roles are found
            // create customer role
            const customerRole = new AuthRole()
            customerRole.name = UserRole.CUSTOMER
            authRepo.save(customerRole).then((resp) => {
                console.log('✅ Customer Role created\n')
            })

            // create admin role
            const adminRole = new AuthRole()
            adminRole.name = UserRole.ADMIN
            authRepo.save(adminRole).then((resp) => {
                console.log('✅ Administrator Role created\n')
            })

            // create customer role
            const stylist = new AuthRole()
            stylist.name = UserRole.STYLIST
            authRepo.save(stylist).then((resp) => {
                console.log('✅ Stylist Role created\n')
            })
            
            // default admin role
            const superAdminRole = new AuthRole()
            superAdminRole.name = UserRole.SUPERADMIN
            authRepo.save(superAdminRole).then((resp) => {
                console.log('✅ Super Admin Role created\n')
            })

            // create a default super user too
            const userRepo = getRepository(AuthUser)
            const superAdminUser = new AuthUser()
            superAdminUser.email = "seanbaraka@gmail.com"
            superAdminUser.username = "sean_.baraka"
            superAdminUser.salt = randomBytes(16).toString('hex')
            superAdminUser.passwordHash = pbkdf2Sync('Developer@1425', superAdminUser.salt, 1000, 32, 'SHA512').toString('hex')
            superAdminUser.role = superAdminRole
            userRepo.save(superAdminUser).then((resp) => {
                console.log('✅ Default User Created\n')
            })
        }
    })


    // start express server
    const port = process.env.PORT
    app.listen(port);

    console.log(`😎👊 Server started \nOpen http://localhost:${port}/`);

}).catch(error => console.log(error));
