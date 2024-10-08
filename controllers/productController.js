import productModel from "../models/ProductModels.js";
import categoryModel from "../models/categoryModel.js";
import orderModel from "../models/OrderModel.js";
import slugify from "slugify";
import fs from "fs";
import braintree from "braintree";
import dotenv from "dotenv";


dotenv.config();

var gateway = new braintree.BraintreeGateway({
  environment: braintree.Environment.Sandbox,
  merchantId: process.env.BRAINTREE_MERCHANTID,
  publicKey: process.env.BRAINTREE_PUBLIC_KEY,
  privateKey: process.env.BRAINTREE_PRIVATE_KEY,
});
// Create Product Controller
export const createProductController = async (req, res) => {
  try {
    const { name, description, price, category, quantity, shipping } =
      req.fields;
    const { photo } = req.files;
    //alidation
    switch (true) {
      case !name:
        return res.status(500).send({ error: "Name is Required" });
      case !description:
        return res.status(500).send({ error: "Description is Required" });
      case !price:
        return res.status(500).send({ error: "Price is Required" });
      case !category:
        return res.status(500).send({ error: "Category is Required" });
      case !quantity:
        return res.status(500).send({ error: "Quantity is Required" });
      case photo && photo.size > 1000000:
        return res
          .status(500)
          .send({ error: "photo is Required and should be less then 1mb" });
    }

    const products = new productModel({ ...req.fields, slug: slugify(name) });
    if (photo) {
      products.photo.data = fs.readFileSync(photo.path);
      products.photo.contentType = photo.type;
    }
    await products.save();
    res.status(201).send({
      success: true,
      message: "Product Created Successfully",
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error in crearing product",
    });
  }
};
export const getSingleProductController = async (req, res) => {
  try {
    const product = await productModel
      .findOne({ slug: req.params.slug })
      .populate("category");

    if (!product) {
      return res
        .status(404)
        .send({ success: false, message: "Product not found" });
    }

    res.status(200).send({
      success: true,
      message: "Single Product Fetched",
      product, // Ensure you're returning the single product
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while getting single product",
      error,
    });
  }
};

export const updateProductController = async (req, res) => {
  try {
    const { name, description, price, category, quantity, shipping } = req.body;

    // Validation checks
    if (!name) return res.status(400).send({ error: "Name is required" });
    if (!description)
      return res.status(400).send({ error: "Description is required" });
    if (!price) return res.status(400).send({ error: "Price is required" });
    if (!category)
      return res.status(400).send({ error: "Category is required" });
    if (!quantity)
      return res.status(400).send({ error: "Quantity is required" });

    // Update product
    const updatedProduct = await productModel.findByIdAndUpdate(
      req.params.pid,
      { ...req.body, slug: slugify(name, { lower: true }) },
      { new: true, runValidators: true }
    );

    if (!updatedProduct) {
      return res.status(404).send({ error: "Product not found" });
    }

    res.status(200).send({
      success: true,
      message: "Product updated successfully",
      product: updatedProduct,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in updating product",
      error: error.message,
    });
  }
};

// Delete Product Controller
export const deleteProductController = async (req, res) => {
  try {
    const product = await productModel.findByIdAndDelete(req.params.id);

    if (!product) {
      return res
        .status(404)
        .send({ success: false, message: "Product not found" });
    }

    res.status(200).send({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in deleting product",
      error: error.message,
    });
  }
};

// Product Filter Controller
export const productFiltersController = async (req, res) => {
  try {
    const { checked, radio } = req.body;
    let args = {};
    if (checked.length > 0) args.category = checked;
    if (radio.length) args.price = { $gte: radio[0], $lte: radio[1] };
    const products = await productModel.find(args);
    res.status(200).send({
      success: true,
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: "Error WHile Filtering Products",
      error,
    });
  }
};

export const getProductController = async (req, res) => {
  try {
    const product = await productModel
      .find({})
      .populate("category")

      .limit(12)
      .sort({ createdAt: -1 });
    res.status(200).send({
      success: true,
      counTotal: product.length,
      message: "ALlProducts ",
      product,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Erorr in getting products",
      error: error.message,
    });
  }
};

// Product List with Pagination Controller
export const productListController = async (req, res) => {
  try {
    const perPage = 2;
    const page = req.params.page ? parseInt(req.params.page) : 1;

    const products = await productModel
      .find({})
      .skip((page - 1) * perPage)
      .limit(perPage)
      .sort({ createdAt: -1 });

    res.status(200).send({
      success: true,
      message: "List of products fetched successfully",
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in listing products",
      error: error.message,
    });
  }
};

// Product Search Controller
export const searchController = async (req, res) => {
  try {
    const { keyword } = req.params;

    const result = await productModel.find({
      $or: [
        { name: { $regex: keyword, $options: "i" } },
        { description: { $regex: keyword, $options: "i" } },
      ],
    });

    res.status(200).send({
      success: true,
      message: "Search results fetched successfully",
      result,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in search",
      error: error.message,
    });
  }
};
export const relatedProductController = async (req, res) => {
  try {
    const { pid, cid } = req.params;
    const products = await productModel
      .find({
        category: cid,
        _id: { $ne: pid },
      })
      .select("-photo")
      .limit(3)
      .populate("category");
    res.status(200).send({
      success: true,
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: "error while geting related product",
      error,
    });
  }
};

// Get Product Count Controller
export const productCountController = async (req, res) => {
  try {
    const total = await productModel.estimatedDocumentCount();

    res.status(200).send({
      success: true,
      message: "Product count fetched successfully",
      total,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in product count",
      error: error.message,
    });
  }
};

// Get Product Photo Controller
export const productPhotoController = async (req, res) => {
  try {
    const product = await productModel.findById(req.params.pid).select("photo");
    if (product.photo && product.photo.data) {
      res.set("Content-Type", product.photo.contentType);
      return res.status(200).send(product.photo.data);
    }
    res.status(404).send({ success: false, message: "Photo not found" });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while getting photo",
      error: error.message,
    });
  }
};
// Braintree Token Controller
export const braintreeTokenController = async (req, res) => {
  try {
    gateway.clientToken.generate({}, (err, response) => {
      if (err) {
        console.error("Error generating Braintree client token:", err);
        return res.status(500).send({ error: "Failed to generate client token." });
      }
      res.send(response);
    });
  } catch (error) {
    console.error("Unexpected error in token generation:", error);
    res.status(500).send({ error: "Internal Server Error." });
  }
};

// Braintree Payment Controller
export const brainTreePaymentController = async (req, res) => {
  try {
    const { nonce, cart } = req.body;
    let total = 0;
    cart.map((i) => {
      total += i.price;
    });
    let newTransaction = gateway.transaction.sale(
      {
        amount: total,
        paymentMethodNonce: nonce,
        options: {
          submitForSettlement: true,
        },
      },
      function (error, result) {
        if (result) {
          const order = new orderModel({
            products: cart,
            payment: result,
            buyer: req.user._id,
          }).save();
          res.json({ ok: true });
        } else {
          res.status(500).send(error);
        }
      }
    );
  } catch (error) {
    console.log(error);
  }
};




// export const relatedProductController = async (req, res) => {
//   try {
//     const { pid, cid } = req.params;
//     const products = await productModel
//       .find({
//         category: cid,
//         _id: { $ne: pid },
//       })
//       .select("-photo")
//       .limit(3)
//       .populate("category");
//     res.status(200).send({
//       success: true,
//       products,
//     });
//   } catch (error) {
//     console.log(error);
//     res.status(400).send({
//       success: false,
//       message: "error while geting related product",
//       error,
//     });
//   }
// };
export const productCategoryController = async (req, res) => {
  try {
    const categories = await categoryModel.findOne({ slug: req.params.slug });

    if (!categories) {
      return res.status(404).send({
        success: false,
        message: "Categories not found",
      });
    }

    const products = await productModel
      .find({ category: categories._id })
      .populate("category");

    res.status(200).send({
      success: true,
      categories,
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: "Category products not found",
      error,
    });
  }
};

export default createProductController;
