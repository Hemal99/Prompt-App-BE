import express from "express";
import { AdminLogin, GetPrompts, GetStudentProfiles } from "../controllers";
import { Authenticate } from "../middleware";

const router = express.Router();

/* ------------------- Login --------------------- */
router.post("/login", AdminLogin);

/*------------------Get Prompts ------------------*/

router.get("/prompts", GetPrompts);

/* ------------------- Authentication --------------------- */
router.use(Authenticate);

/*-------------------- Get All Student details ----*/

router.get("/students", GetStudentProfiles);

export { router as AdminRoute };
