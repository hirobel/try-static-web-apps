const createHandler = require('azure-functions-express').createHandler;
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

// use dotenv
require('dotenv').config();

mongoose.connect("mongodb://" + process.env.COSMOSDB_HOST + ":" + process.env.COSMOSDB_PORT + "/" + process.env.COSMOSDB_DBNAME + "?ssl=true&replicaSet=globaldb", {
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

// Express routes
app.get('/todos/:id?', async (req, res) => {
    if (req.params.id) {
        const todo = await Todo.findById(req.params.id);
        res.send(todo);
    } else {
        const todos = await Todo.find();
        res.send(todos);
    }
});

app.post('/todos', async (req, res) => {
    const todo = new Todo(req.body);
    await todo.save();
    res.status(201).send(todo);
});

app.put('/todos/:id', async (req, res) => {
    const todo = await Todo.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.send(todo);
});

app.delete('/todos/:id', async (req, res) => {
    await Todo.findByIdAndDelete(req.params.id);
    res.status(204).send();
});

// Export the express app as an Azure Function
module.exports = createHandler(app);
