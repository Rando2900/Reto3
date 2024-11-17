const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const fs = require('fs');


const app = express();
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

app.use(
  session({
    secret: 'secretKey',
    resave: false,
    saveUninitialized: false,
  })
);

// Middleware de autenticación
function isAuthenticated(req, res, next) {
  if (req.session.user) {
    next();
  } else {
    res.redirect('/login');
  }
}

// Carga de datos
const movies = JSON.parse(fs.readFileSync('./data/movies.json', 'utf-8'));
const users = JSON.parse(fs.readFileSync('./data/users.json', 'utf-8'));

// Ruta de Login
app.get('/login', (req, res) => res.render('login'));

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(
    (u) => u.username === username && u.password === password
  );
  if (user) {
    req.session.user = user;
    res.redirect('/movies');
  } else {
    res.send('Credenciales inválidas');
  }
});

// Listado de Películas
app.get('/movies', isAuthenticated, (req, res) => {
  res.render('movies', { movies });
});

// Detalle de Película
app.get('/movies/:id', isAuthenticated, (req, res) => {
  const movie = movies.find((m) => m.id == req.params.id);
  res.render('movie-detail', { movie });
});

// Logout
app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/login');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
