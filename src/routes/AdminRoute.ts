import express from "express";
import {
  AdminLogin,
  ApprovePrompt,
  DeletePrompt,
  DeleteUser,
  GetAllPromptsAdmin,
  GetPrompts,
  GetUserProfiles,
  UpdatePromptByAdmin,
} from "../controllers";
import { Authenticate } from "../middleware";

const router = express.Router();

/* ------------------- Login --------------------- */
router.post("/login", AdminLogin);

/*------------------Get Prompts ------------------*/

router.get("/prompts", GetAllPromptsAdmin);

/* ------------------- Authentication --------------------- */
router.use(Authenticate);

/*-------------------- Get All Student details ----*/

router.put("/approve-prompts/:id/:status", ApprovePrompt);

/*-------------------- Delete Prompt ----*/
router.delete("/delete-prompt/:id", DeletePrompt);

/*-------------------- Delete User ----*/
router.delete("/delete-user/:id", DeleteUser);


router.get("/users", GetUserProfiles);

/*-------------------- Update Prompt By Admin ----*/
router.patch("/update-prompt-by-admin/:Id", UpdatePromptByAdmin);

export { router as AdminRoute };
