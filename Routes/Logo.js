import express from "express";
import { deleteLogo, editLogo, myLogos, newLogo } from "../Controllers/Logo.js";
import { isAuthenticated } from "../Middlewares/auth.js";
const router = express.Router();

router.post("/new", isAuthenticated, newLogo);
router.get("/my/all", isAuthenticated, myLogos);
router.delete("/delete/:id", isAuthenticated, deleteLogo);

router.put("/edit/:id", isAuthenticated, editLogo);

export default router;
