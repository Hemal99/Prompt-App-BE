import express, { Request, Response, NextFunction } from "express";
import {
  UserLogin,
  AddPrompt,
  UserSignUp,
  GetPrompts,
  GetLatestPrompts,
} from "../controllers/UserController";


const router = express.Router();


/*-------------------- Add Admin ----*/
router.post("/add-admin",UserSignUp);

/* ------------------- Login --------------------- */
router.post("/login", UserLogin);

/* ------------------- Forget Password --------------------- */

/* ------------------- Add prompt --------------------- */
router.post("/add-prompt", AddPrompt);

/* ------------------- Get Prompts --------------------- */
router.post("/get-prompts", GetPrompts);

router.get("/get-prompts-newest", GetLatestPrompts)


export { router as UserRoute };
