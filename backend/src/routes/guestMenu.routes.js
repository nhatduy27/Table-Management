import express from "express";
import { getGuestMenu } from "../controllers/guest.controller.js";

const router = express.Router();

router.get("/", getGuestMenu);

export default router;