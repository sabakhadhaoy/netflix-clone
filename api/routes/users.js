const router = require('express').Router();
const User = require('../models/User');
const CryptoJS = require('crypto-js');
const verify = require('../verifyToken');

// UPDATE
router.put('/:id', verify, (req, res) => {
  if (req.user.id === req.params.id || req.user.isAdmin) {
    if (req.body.password) {
      req.body.password = CryptoJS.AES.encrypt(
        req.body.password,
        process.env.SECRET_KEY
      ).toString();
    }

    return User.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    )
      .then(user => res.status(200).json(user))
      .catch(err => res.status(500).json(err));
  } else {
    res.status(403).json('You can only update your account');
  }
});

// DELETE
router.delete('/:id', verify, (req, res) => {
  if (req.user.id === req.params.id || req.user.isAdmin) {
    return User.findByIdAndDelete(req.params.id)
      .then(() => res.status(200).json('User deleted'))
      .catch(err => res.status(500).json(err));
  } else {
    res.status(403).json('You can only delete your account');
  }
});

// GET
router.get('/:id', (req, res) => {
  return User.findById(req.params.id)
    .then(user => {
      const { password, ...info } = user._doc;
      res.status(200).json(info);
    })
    .catch(err => res.status(500).json(err));
});

// GET ALL
router.get('/', verify, (req, res) => {
  const query = req.query.new;
  if (req.user.isAdmin) {
    return query
      ? User.find().sort({ _id: -1 }).limit(10)
      : User.find()
          .then(users => res.status(200).json(users))
          .catch(err => res.status(500).json(err));
  } else {
    res.status(403).json('You are not an admin');
  }
});

// GET USER STATS

module.exports = router;
