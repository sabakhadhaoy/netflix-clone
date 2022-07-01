const router = require('express').Router();
const User = require('../models/User');
const CryptoJS = require('crypto-js');

// UPDATE
router.put('/:id', (req, res) => {
  if (req.user.id === req.params.id || req.user.isAdmin) {
    if (req.body.password) {
      req.body.password = CryptoJS.AES.encrypt(
        req.body.password,
        process.env.SECRET_KEY
      ).toString();
    }

    return User.findByIdAndUpdate(req.params.id, { $set: req.body })
      .then(user => res.status(200).json(user))
      .catch(err => res.status(500).json(err));
  } else {
    res.status(403).json('You can only update your account');
  }
});
// DELETE
// GET
// GET ALL
// GET USER STATS
