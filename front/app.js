// 現在のURLがHTTPサーバから配信されている場合、本番環境と見なし
// Azure FunctionsのURLを設定します。
// それ以外の場合（例えば、ファイルがローカルで開かれている場合）は、
// 開発環境と見なし、localhostのURLを設定します。
const BASE_URL = window.location.protocol.startsWith('http') ?
    'https://proud-pebble-02ad55800.4.azurestaticapps.net/api' :
    'http://localhost:3000';

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
    const res = await fetch(`${BASE_URL}/todos`);
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
