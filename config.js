require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/mern-todo-app';

module.exports = {
    MONGO_URI,
}