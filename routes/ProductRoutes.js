import express from "express";
import { isAdmin, requireSignIn } from "../middleware/authMiddleware.js";
//  import{createProductController} from "../controllers/productController.js";
import createProductController, {
  brainTreePaymentController,
  braintreeTokenController,
  deleteProductController,
  getProductController,
  getSingleProductController,
  productCategoryController,
  productCountController,
  productFiltersController,
  productListController,
  productPhotoController,
  relatedProductController,
  searchController,
  updateProductController,
} from "../controllers/productController.js";
import formidable from "express-formidable";

const router = express.Router();

router.post(
  "/create-product",
  requireSignIn,
  isAdmin,
  formidable(),
  createProductController
);
router.get("/get-product", getProductController);

router.get("/product-list/:page", productListController);
router.get("/product-photo/:pid", productPhotoController);
router.get("/get-product/:slug", getSingleProductController);
router.put(
  "/update-product/:pid",
  updateProductController,
  formidable(),
  requireSignIn,
  isAdmin
);
router.delete("/product/:pid", deleteProductController);
router.post("/product-filters", productFiltersController);
router.get("/product-count", productCountController);
router.get("/products-categories/:slug", productCategoryController);

router.get("/related-product/:pid/:cid", relatedProductController);

router.get("/search/:keyword", searchController);
router.get("/braintree/token",braintreeTokenController);
router.post("/braintree/payment",requireSignIn,brainTreePaymentController);

export default router;
