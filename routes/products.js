const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { Product } = require('../models/product');
const { Category } = require('../models/category');
// const { objectKeySorter } = require('../utils');

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
        error
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

router.post('/', async (req, res) => {
  Category.findById(req.body.category)
    .then(async () => {
      const newProduct = new Product({
        name: req.body.name,
        description: req.body.description,
        richDescription: req.body.richDescription,
        image: req.body.image,
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
});

router.put('/', async (req, res) => {
  if (!mongoose.isValidObjectId(req.query.productId)) {
    res.status(400).send({
      data: null,
      status: 400,
      error: 'Invalid product id!',
    });
  } else {
    Category.findById(req.body.category)
      .then(() => {
        Product
          .findByIdAndUpdate(
            req.query.productId,
            {
              name: req.body.name,
              description: req.body.description,
              richDescription: req.body.richDescription,
              image: req.body.image,
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
      })
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
