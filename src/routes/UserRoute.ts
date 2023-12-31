import express, { Request, Response, NextFunction } from "express";
import {
  UserLogin,
  AddPrompt,
  UserSignUp,
  // GetPrompts,
  GetLatestPrompts,
  GetPrompts,
  GetPromptByAuthorId,
  GetPromptById,
  UpdatePrompt,
  RatePrompt,
  UpdateComments,
} from "../controllers/UserController";

const router = express.Router();

router.get("/", (req: Request, res: Response, next: NextFunction) => {
  res.status(200).json({
    message: "Welcome to the API",
  });
});


/*-------------------- Add Admin ----*/
router.post("/add-admin", UserSignUp);

/* ------------------- Login --------------------- */
router.post("/login", UserLogin);

/* ------------------- Forget Password --------------------- */

/* ------------------- Add prompt --------------------- */
router.post("/add-prompt", AddPrompt);

/* ------------------- Get Prompts --------------------- */
router.post("/get-prompts", GetPrompts);

router.get("/get-prompts-newest", GetLatestPrompts);

router.get("/get-myprompts/:authorId", GetPromptByAuthorId);

router.get("/get-promptbyid/:Id", GetPromptById);

router.patch("/update-prompt/:Id", UpdatePrompt);

router.post("/rate-prompt", RatePrompt);

router.patch("/update-comment/:promptId", UpdateComments);



export { router as UserRoute };
