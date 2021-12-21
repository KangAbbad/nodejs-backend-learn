const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');
const { Product } = require('../models/product');
const { Category } = require('../models/category');
// const { objectKeySorter } = require('../utils');

const FILE_TYPE_MAP = {
  'image/png': 'png',
  'image/jpeg': 'jpeg',
  'image/jpg': 'jpg',
};

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const isValid = FILE_TYPE_MAP[file.mimetype];
    let uploadError = new Error('Invalid image type');

    if (isValid) {
      uploadError = null;
    }

    cb(uploadError, 'public/uploads');
  },
  filename: function (req, file, cb) {
    const fileName = file.originalname.split(' ').join('-');
    const extension = FILE_TYPE_MAP[file.mimetype];
    cb(null, `${fileName}-${Date.now()}.${extension}`);
  },
});

const uploadOptions = multer({ storage });

router.get('/', (req, res) => {
  const { fields, productId, isFeatured } = req.query;
  const selectFields = fields ? fields.split(',').join(' ') : '';
  const find = {};
  if (productId) find._id = productId;
  if (isFeatured) find.isFeatured = isFeatured;

  Product
    .find(find)
    .populate('category')
    .select(selectFields)
    .sort({ dateCreated: -1 })
    .then((productList) => {
      const response = {
        data: [],
        status: 200,
        error: null,
      };

      if (productId && isFeatured === undefined) {
        if (productList.length) {
          response.data = productList[0];
        } else {
          response.data = null;
        }
      } else {
        response.data = productList;
      }

      res.status(200).json(response);
    })
    .catch((error) => {
      res.status(500).json({
        data: [],
        status: 500,
        error,
      });
    });
});

router.get('/get/count', (req, res) => {
  Product.countDocuments()
    .then((count) => {
      res.status(200).json({
        data: { count },
        status: 200,
        error: null,
      });
    })
    .catch((error) => {
      res.status(500).json({
        data: 0,
        status: 500,
        error
      });
    })
});

router.post('/', uploadOptions.single('image'), (req, res) => {
  if (!mongoose.isValidObjectId(req.body.category)) {
    res.status(400).send({
      data: null,
      status: 400,
      error: 'Invalid category id!',
    });
  } else {
    Category.findById(req.body.category)
      .then(() => {
        if (!req.file) {
          res.status(400).json({
            data: null,
            status: 400,
            error: 'Image is required!',
          });
        }

        const baseUrl = `${req.protocol}://${req.get('host')}/public/uploads`;
        const imageFileName = `${baseUrl}/${req.file.filename}`;

        const newProduct = new Product({
          name: req.body.name,
          description: req.body.description,
          richDescription: req.body.richDescription,
          image: imageFileName,
          brand: req.body.brand,
          price: req.body.price,
          category: req.body.category,
          countInStock: req.body.countInStock,
          rating: req.body.rating,
          numReviews: req.body.numReviews,
          isFeatured: req.body.isFeatured,
        });
  
        newProduct.save()
          .then((product) => {
            res.status(201).json({
              data: product,
              status: 201,
              error: null,
            });
          })
          .catch((error) => {
            res.status(500).json({
              data: null,
              status: 500,
              error: error,
            });
          });
      })
      .catch((error) => {
        res.status(400).json({
          data: null,
          status: 400,
          error,
        });
      });
  }
});

router.put('/', uploadOptions.single('image'), (req, res) => {
  if (!mongoose.isValidObjectId(req.query.productId)) {
    res.status(400).send({
      data: null,
      status: 400,
      error: 'Invalid product id!',
    });
  } else {
    Product
      .findById(req.query.productId)
      .then((product) => {
        Category.findById(req.body.category)
          .then(() => {
            let imageFileName = product.image;

            if (req.file) {
              const baseUrl = `${req.protocol}://${req.get('host')}/public/uploads`;
              imageFileName = `${baseUrl}/${req.file.filename}`;
            }

            Product
              .findByIdAndUpdate(
                req.query.productId,
                {
                  name: req.body.name,
                  description: req.body.description,
                  richDescription: req.body.richDescription,
                  image: imageFileName,
                  brand: req.body.brand,
                  price: req.body.price,
                  category: req.body.category,
                  countInStock: req.body.countInStock,
                  rating: req.body.rating,
                  numReviews: req.body.numReviews,
                  isFeatured: req.body.isFeatured,
                },
                { new: true },
              )
              .then((product) => {
                res.status(200).json({
                  data: product,
                  status: 200,
                  error: null,
                });
              })
              .catch((error) => {
                res.status(500).json({
                  data: null,
                  status: 500,
                  error,
                });
              });
          })
          .catch((error) => {
            res.status(400).json({
              data: null,
              status: 400,
              error,
            });
          });
      })
      .catch((error) => {
        res.status(404).json({
          data: null,
          status: 404,
          error,
        });
      });
  }
});

router.put('/gallery', uploadOptions.array('images', 10), (req, res) => {
  if (!mongoose.isValidObjectId(req.query.productId)) {
    res.status(400).send({
      data: null,
      status: 400,
      error: 'Invalid product id!',
    });
  } else {
    let imagesFileName = [];

    if (req.files) {
      const baseUrl = `${req.protocol}://${req.get('host')}/public/uploads`;
      req.files.forEach((file, fileIndex) => {
        imagesFileName[fileIndex] = `${baseUrl}/${file.filename}`;
      });
    }

    Product
      .findByIdAndUpdate(
        req.query.productId,
        {
          images: imagesFileName,
        },
        { new: true }
      )
      .then((product) => {
        res.status(200).json({
          data: product,
          status: 200,
          error: null,
        });
      })
      .catch((error) => {
        res.status(500).json({
          data: null,
          status: 500,
          error,
        });
      });;
  }
});

router.delete('/', (req, res) => {
  if (!mongoose.isValidObjectId(req.query.productId)) {
    res.status(400).send({
      data: null,
      status: 400,
      error: 'Invalid product id!',
    });
  } else {
    Product.findByIdAndRemove(req.query.productId)
      .then((product) => {
        res.status(200).json({
          data: {
            message: `${product.name} is successfully deleted!`,
          },
          status: 200,
          error: null,
        });
      })
      .catch((error) => {
        res.status(500).json({
          data: null,
          status: 500,
          error,
        });
      });
  }
});

module.exports = router;
