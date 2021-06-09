import { AuthController } from "./controller/AuthController";

export const Routes = [{
    method: "post",
    route: "/api/auth/register",
    controller: AuthController,
    action: "register"
}, {
    method: "post",
    route: "/api/auth/login",
    controller: AuthController,
    action: "login"
}];