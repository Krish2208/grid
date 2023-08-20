const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const authMiddleware = require("../middleware/auth");
const Vote = require("../models/vote");

const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const { name, email, password, isBrand } = req.body;

    // Check if the email is already in use
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({ message: "Email already in use" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const user = new User({
      name: name,
      email: email,
      password: hashedPassword,
      isBrand: isBrand,
      isApproved: isBrand ? true : false,
    });
    if (!isBrand) {
      vote = new Vote({
        userId: user._id,
      });
      await vote.save();
    }

    // Save the user to the database
    await user.save();

    res.status(201).json({ message: "User created" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find the user in the database
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Check if the password is correct
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate a JSON Web Token
    const token = jwt.sign({ email }, "secret", { expiresIn: "1h" });

    res.status(200).json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/is-brand", authMiddleware, async (req, res) => {
  try {
    const user = await User.findOne({ email: req.user.email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ isBrand: user.isBrand });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post('/vote/:id', authMiddleware, async (req, res) => {
  try {
    const votingUser = await User.findOne({ email: req.user.email });
    const user = await User.findById(req.params.id);
    const voteValue = req.body.value;
    const vote = await Vote.findOne({ userId: req.params.id });
    if (voteValue !== 1 && voteValue !== -1) {
      return res.status(400).json({ message: 'Invalid vote value' });
    }
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (user.isApproved || user.isBrand) {
      return res.status(400).json({ message: 'User is not pending' });
    }
    if (!votingUser.isApproved || votingUser.isBrand) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    if (vote) {
      if (vote.favor.includes(votingUser._id) || vote.against.includes(votingUser._id)) {
        return res.status(400).json({ message: 'Vote already cast' });
      }
      if (voteValue === 1) {
        vote.favor.push(votingUser._id);
      } else {
        vote.against.push(votingUser._id);
      }
      await vote.save();
    } else {
      res.status(400).json({ message: 'Vote not found' });
    }
    res.status(200).json({ message: 'Vote cast successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/votes/:id', authMiddleware, async (req, res) => {
  try {
    const user = await User.findOne({ email: req.user.email });
    const votes = await Vote.findOne({ userId: req.params.id });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (user.isBrand) {
      return res.status(400).json({ message: 'User is a brand' });
    }
    if (!user.isApproved) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const favorVotes = votes.favor.length;
    const againstVotes = votes.against.length;
    res.status(200).json({ favor: favorVotes, against: againstVotes });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/unapproved', authMiddleware, async (req, res) => {
  try {
    const user = await User.findOne({ email: req.user.email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (user.isBrand || !user.isApproved) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    var unapprovedUsers = await User.find({ isApproved: false });
    const unapprovedUserIds = unapprovedUsers.map((user) => user._id);
    const votes = await Vote.find({ userId: { $in: unapprovedUserIds } });

    const voteStatus = {};
    votes.map((vote) => {
      if (!voteStatus[vote.userId]) {
        voteStatus[vote.userId] = { favor: 0, against: 0, isVoted: false };
      }
      voteStatus[vote.userId].favor += vote.favor.length;
      voteStatus[vote.userId].against += vote.against.length;
      voteStatus[vote.userId].isVoted = vote.favor.includes(user._id) || vote.against.includes(user._id);
    });

    const unapprovedUsersWithVotes = unapprovedUsers.map((user) => ({
      ...user.toObject(),
      voteStatus: voteStatus[user._id] || { favor: 0, against: 0, isVoted: false },
    }));
    
    res.status(200).json({ unapprovedUsers: unapprovedUsersWithVotes });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
