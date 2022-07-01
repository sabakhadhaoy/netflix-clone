const router = require('express').Router();
const User = require('../models/User');
const CryptoJS = require('crypto-js');
const jwt = require('jsonwebtoken');

// REGISTER
router.post('/register', (req, res) => {
  return new User({
    username: req.body.username,
    email: req.body.email,
    password: CryptoJS.AES.encrypt(
      req.body.password,
      process.env.SECRET_KEY
    ).toString(),
  })
    .save()
    .then(user => res.status(201).json(user))
    .catch(err => res.status(500).json(err));
});

// LOGIN
router.post('/login', (req, res) => {
  return User.findOne({ email: req.body.email })
    .then(user => {
      if (!user) return res.status(401).json('Incorrect username or password');

      const bytes = CryptoJS.AES.decrypt(user.password, process.env.SECRET_KEY);
      const originalPassword = bytes.toString(CryptoJS.enc.Utf8);

      if (originalPassword !== req.body.password)
        return res.status(401).json('Incorrect username or password');

      const accessToken = jwt.sign(
        { id: user._id, isAdmin: user.isAdmin },
        process.env.SECRET_KEY,
        { expiresIn: '5d' }
      );

      const { password, ...info } = user._doc;

      res.status(200).json({ ...info, accessToken });
    })
    .catch(err => res.status(500).json(err));
});

module.exports = router;
