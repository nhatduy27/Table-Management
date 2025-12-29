import express from "express";
import { getGuestMenu } from "../../controllers/customer/guest.controller.js";

const router = express.Router();

router.get("/", getGuestMenu);

export default router;