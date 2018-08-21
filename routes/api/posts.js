const express = require('express')
const router = express.Router()
const passport = require('passport')

// Load Post model
const Post = require('../../models/Posts')
// Load Profile model
const Profile = require('../../models/Profile')

// Load Post validation
const postValidate = require('../../validation/post')

// @route   GET /api/posts/test
// @desc    Test post
// @access  Public
router.get('/test', (req, res) => res.send('posts'))

// @route   POST /api/posts
// @desc    Create posts
// @access  Private
router.post('/:id', passport.authenticate('jwt', { session: false }),
    (req, res) => {
      const {errors, isValid} = postValidate(req.body)
      if(!isValid){
        return res.status(400).json(errors)
      }

      const {text, name} = req.body
      const newPost = new Post({
        text: text,
        name: name,
        user: req.user.id
      })
      newPost.save().then(post => res.json(post))
    }
);

// @route   GET /api/posts/
// @desc    Get post
// @access  Public
router.get('/', (req, res) => {
  Post.find().sort({date: -1})
    .then(posts => res.json(posts))
    .catch(err => res.status(400).json({noPost: 'No Posts are found'}))
})

// @route   GET /api/posts/:id
// @desc    Get post by id
// @access  Public
router.get('/:id', (req, res) => {
  Post.findById(req.params.id)
    .then(post => res.json(post))
    .catch(err => res.status(400).json({noPost: `No Posts are found with this ${req.params.id}`}))
})

// @route   DELETE /api/posts/:id
// @desc    Delete post by id
// @access  Private
router.delete('/:id', passport.authenticate('jwt', { session: false }),
    (req, res) => {
      Post.findById(req.params.id)
      .then(post => {
        if(post.user.toString() !== req.user.id){
          return res.status(400).json({noAuth: 'No authorized'})
        }
        post.remove().then(() => res.json({success: true}))
      })
      .catch(err => res.status(400).json({noPost: 'No posts are found'}))
    }
);

module.exports = router