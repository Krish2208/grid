const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const userRoutes = require('./routes/user');
const authMiddleware = require('./middleware/auth');

const { MONGO_URI } = require("./config");
mongoose
  .connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.use('/user', userRoutes);
app.get('/api/protected', authMiddleware, (req, res) => {
  res.json({ message: 'Protected route' });
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
