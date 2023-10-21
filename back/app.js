// use dotenv
require('dotenv').config();   //Use the .env file to load the variables

// app.js
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors'); // Import the `cors` module

mongoose.connect("mongodb://"+process.env.COSMOSDB_HOST+":"+process.env.COSMOSDB_PORT+"/"+process.env.COSMOSDB_DBNAME+"?ssl=true&replicaSet=globaldb", {
   auth: {
     username: process.env.COSMOSDB_USER,
     password: process.env.COSMOSDB_PASSWORD
   },
  useNewUrlParser: true,
  useUnifiedTopology: true,
  retryWrites: false
 })
 .then(() => console.log('Connection to CosmosDB successful'))
 .catch((err) => console.error(err));

const TodoSchema = new mongoose.Schema({
    title: String
});

const Todo = mongoose.model('Todo', TodoSchema);

const app = express();
app.use(cors()); 
app.use(bodyParser.json());


// GET /todos
app.get('/todos', async (req, res) => {
    const todos = await Todo.find();
    res.send(todos);
});

// POST /todos
app.post('/todos', async (req, res) => {
    const todo = new Todo(req.body);
    await todo.save();
    res.status(201).send(todo);
});

// PUT /todos/:id
app.put('/todos/:id', async (req, res) => {
    const todo = await Todo.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.send(todo);
});

// DELETE /todos/:id
app.delete('/todos/:id', async (req, res) => {
    await Todo.findByIdAndDelete(req.params.id);
    res.status(204).send();
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
