import express from "express";
import { AdminLogin, ApprovePrompt, DeletePrompt, GetStudentProfiles } from "../controllers";
import { Authenticate } from "../middleware";

const router = express.Router();

/* ------------------- Login --------------------- */
router.post("/login", AdminLogin);

/*------------------Get Prompts ------------------*/

// router.get("/prompts", GetPrompts);

/* ------------------- Authentication --------------------- */
router.use(Authenticate);

/*-------------------- Get All Student details ----*/

router.put("/approve-prompts/:id/:status", ApprovePrompt);

/*-------------------- Delete Prompt ----*/
router.delete("/delete-prompt/:id", DeletePrompt);

router.get("/students", GetStudentProfiles);

export { router as AdminRoute };
