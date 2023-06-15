import express, { Request, Response, NextFunction } from "express";
import {
  UserLogin,
  AddPrompt,
  UserSignUp,
} from "../controllers/UserController";


const router = express.Router();


/*-------------------- Add Admin ----*/
router.post("/add-admin",UserSignUp);

/* ------------------- Login --------------------- */
router.post("/login", UserLogin);

/* ------------------- Forget Password --------------------- */

/* ------------------- Add prompt --------------------- */
router.post("/add-prompt", AddPrompt);


export { router as UserRoute };
