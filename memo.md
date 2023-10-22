## はじめに
cosmosDBを利用した簡単なtodoアプリを作成します

## 前提

* データストアとしてAzure Cosmos DBのMongoDB APIを利用します。

## やってみたこと

* 必要なライブラリやミドルウェアをインストール

```shell
$ npm init -y
$ npm install express mongoose body-parser cors --save
```

### Azure Cosmos DBの設定

   - Azure Portalにログインし、Cosmos DBアカウントを作成します。
   - MongoDB APIを選択します。
   - 必要な情報（URLとプライマリキー）を取得します。

### メインロジックの作成

フロントエンドとバックエンドのコードを作成します。

#### フロントエンド

```index.html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ToDo App</title>
</head>
<body>

    <h1>ToDo App</h1>

    <form id="todo-form">
        <input type="text" id="todo-input" placeholder="Enter todo" required>
        <button type="submit">Add ToDo</button>
    </form>

    <ul id="todo-list"></ul>

    <script src="app.js"></script>
</body>
</html>

```

```style.css
#app {
    max-width: 600px;
    margin: 50px auto;
    padding: 20px;
    border: 1px solid #ccc;
    border-radius: 10px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    text-align: center;
}

h1 {
    margin-bottom: 20px;
}

#todo-form {
    margin-bottom: 20px;
}

#todo-input {
    padding: 10px;
    width: 70%;
    border: 1px solid #ccc;
    border-radius: 5px;
}

button {
    padding: 10px 20px;
    background-color: #4CAF50;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
}

button:hover {
    background-color: #45a049;
}

#todo-list {
    list-style-type: none;
    padding: 0;
}
```

```app.js
document.getElementById('todo-form').addEventListener('submit', async function (e) {
    e.preventDefault();

    const title = document.getElementById('todo-input').value;
    const res = await fetch('http://localhost:3000/todos', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title }),
    });

    const todo = await res.json();
    renderTodo(todo);
    document.getElementById('todo-input').value = '';
});

async function loadTodos() {
    const res = await fetch('http://localhost:3000/todos');
    const todos = await res.json();

    todos.forEach(renderTodo);
}

function renderTodo(todo) {
    const list = document.getElementById('todo-list');

    const li = document.createElement('li');
    li.innerHTML = `
        ${todo.title}
        <button onclick="updateTodo('${todo._id}')">Update</button>
        <button onclick="deleteTodo('${todo._id}')">Delete</button>
    `;

    list.appendChild(li);
}

async function updateTodo(id) {
    const newTitle = prompt('Enter new title:');
    if (newTitle) {
        await fetch(`http://localhost:3000/todos/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ title: newTitle }),
        });

        clearTodos();
        loadTodos();
    }
}

async function deleteTodo(id) {
    await fetch(`http://localhost:3000/todos/${id}`, {
        method: 'DELETE',
    });

    clearTodos();
    loadTodos();
}

function clearTodos() {
    document.getElementById('todo-list').innerHTML = '';
}

loadTodos();
```

#### バックエンド

```.env
COSMOSDB_USER = "<Azure Cosmos DB account's user name, usually the database account name>"
COSMOSDB_PASSWORD = "<Azure Cosmos DB account password, this is one of the keys specified in your account>"
COSMOSDB_DBNAME = "<Azure Cosmos DB database name>"
COSMOSDB_HOST= "<Azure Cosmos DB Host name>"
COSMOSDB_PORT=10255
```
See: https://learn.microsoft.com/ja-jp/azure/cosmos-db/mongodb/connect-using-mongoose#set-up-your-nodejs-application

```server.js
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
```

### デプロイ

* Azure Static Web Appsの設定
* Azure Portalにログインします。
* 新しい「Static Web App」リソースを作成します。
* GitHubリポジトリを指定し、自動デプロイを設定します。
* アプリがデプロイされると、公開URLが提供されます。


### テスト

```shell
$ node back/app.js
$ open front/index.html
```

## 最後に
(ここへ感想などを一言)

## 参考
- (参考となる一次情報へのリンク)
