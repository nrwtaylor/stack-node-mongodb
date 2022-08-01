//import { verifySignUp } from  "../middleware/index.js"
import verifySignUp from "../middleware/verifySignUp.js";
import {signin, signup} from  "../controllers/auth.controller.js";

export const authRoutes = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.post(
    "/auth/signup",
    [
      verifySignUp.checkDuplicateUsernameOrEmail,
      verifySignUp.checkRolesExisted
    ],
    signup
  );

  app.post("/auth/signin", signin);

};

export default authRoutes;
