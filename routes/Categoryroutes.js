import express from "express";
import { categoryController, createCategoryController, deleteCategoryCOntroller, singleCategoryController, updateCategoryController } from "../controllers/categoryController.js";
import {requireSignIn,isAdmin} from "./../middleware/authMiddleware.js";
// import { productCategoryController } from "../controllers/productController.js";
const router = express.Router();
router.post("/create-category",requireSignIn,isAdmin,
    createCategoryController);
router.put("/update-category/:id",requireSignIn,isAdmin,updateCategoryController);
router.get("/get-category",categoryController);
router.get("/single-category",singleCategoryController);
router.delete("/delete-category/:id",requireSignIn,isAdmin,deleteCategoryCOntroller);
export default router;