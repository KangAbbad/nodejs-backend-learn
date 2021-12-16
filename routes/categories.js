const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { Category } = require('../models/category');

router.get('/', (req, res) => {
  const { fields, categoryId } = req.query;
  const selectFields = fields ? fields.split(',').join(' ') : '';
  const find = {};
  if (categoryId) find._id = categoryId;

  Category
    .find(find)
    .select(selectFields)
    .sort({ dateCreated: -1 })
    .then((categoryList) => {
      const response = {
        data: [],
        status: 200,
        error: null,
      };

      if (categoryId) {
        if (categoryList.length) {
          response.data = categoryList[0];
        } else {
          response.data = null;
        }
      } else {
        response.data = categoryList;
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

router.post('/', (req, res) => {
  const newCategory = new Category({
    name: req.body.name,
    icon: req.body.icon,
    color: req.body.color,
  });

  newCategory.save()
    .then((category) => {
      res.status(201).json({
        data: category,
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
});

router.put('/', (req, res) => {
  if (!mongoose.isValidObjectId(req.query.categoryId)) {
    res.status(400).send({
      data: null,
      status: 400,
      error: 'Invalid category id!',
    });
  } else {
    Category
      .findByIdAndUpdate(
        req.query.categoryId,
        {
          name: req.body.name,
          icon: req.body.icon,
          color: req.body.color,
        },
        { new: true },
      )
      .then((category) => {
        res.status(200).json({
          data: category,
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

router.delete('/', (req, res) => {
  if (!mongoose.isValidObjectId(req.query.categoryId)) {
    res.status(400).send({
      data: null,
      status: 400,
      error: 'Invalid category id!',
    });
  } else {
    Category.findByIdAndRemove(req.query.categoryId)
      .then((category) => {
        res.status(200).json({
          data: {
            message: `${category.name} is successfully deleted!`,
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
