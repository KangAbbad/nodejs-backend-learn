const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models/user');

router.get('/', (req, res) => {
  const { fields } = req.query;
  const selectFields = fields ? fields.split(',').join(' ') : '-password';

  User
    .find()
    .sort({ dateCreated: -1 })
    .select(selectFields)
    .then((userList) => {
      res.status(200).json({
        data: userList,
        status: 200,
        error: null,
      });
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
  User.countDocuments()
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

router.post('/register', (req, res) => {
  const newUser = new User({
    name: req.body.name,
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, 8),
    phone: req.body.phone,
    street: req.body.street,
    apartment: req.body.apartment,
    city: req.body.city,
    country: req.body.country,
    zip: req.body.zip,
    isAdmin: req.body.isAdmin,
  });

  newUser.save()
    .then((createdUser) => {
      const { password, ...restData } = createdUser.toObject();
      res.status(201).json({
        data: {
          id: createdUser.id,
          ...restData,
        },
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

router.post('/login', (req, res) => {
  User.findOne({ email: req.body.email })
    .then((user) => {
      if (user && bcrypt.compareSync(req.body.password, user.password)) {
        const { password, ...restData } = user.toObject();
        const jwtToken = jwt.sign(
          {
            userId: user.id,
            isAdmin: user.isAdmin,
          },
          process.env.JWT_SECRET,
          { expiresIn: '1d' },
        );

        res.status(200).json({
          data: {
            id: user.id,
            ...restData,
            authToken: jwtToken,
          },
          status: 200,
          error: null,
        });
      } else {
        res.status(400).json({
          data: null,
          status: 400,
          error: 'Email or Password is incorrect!',
        });
      }
    })
    .catch((error) => {
      res.status(500).json({
        data: null,
        status: 500,
        error,
      });
    });
});

router.put('/', (req, res) => {
  if (!mongoose.isValidObjectId(req.query.userId)) {
    res.status(400).send({
      data: null,
      status: 400,
      error: 'Invalid user id!',
    });
  } else {
    User
      .findByIdAndUpdate(
        req.query.userId,
        {
          name: req.body.name,
          email: req.body.email,
          // password: req.body.password ? bcrypt.hashSync(req.body.password, 8) : '',
          phone: req.body.phone,
          street: req.body.street,
          apartment: req.body.apartment,
          city: req.body.city,
          country: req.body.country,
          zip: req.body.zip,
          isAdmin: req.body.isAdmin,
        },
        { new: true },
      )
      .then((user) => {
        res.status(200).json({
          data: user,
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
  if (!mongoose.isValidObjectId(req.query.userId)) {
    res.status(400).send({
      data: null,
      status: 400,
      error: 'Invalid user id!',
    });
  } else {
    User.findByIdAndRemove(req.query.userId)
      .then((user) => {
        res.status(200).json({
          data: {
            message: `${user.name} is successfully deleted!`,
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
