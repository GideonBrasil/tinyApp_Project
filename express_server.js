const express = require('express');
const app = express();
const PORT = 8080;
const cookieParser = require('cookie-parser');
app.use(cookieParser());
app.set('view engine', 'ejs');

app.get('/login', (req, res) => {
    let templateVars = {
        username: users[req.cookies['user_id']],
    };
    res.render('urls_login', templateVars);
});

function generateRandomString() {
    //generates a string of 6 random alphanumeric characters
    let holder = '';
    let randomPosibilities = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 6; i++) {
        holder += randomPosibilities.charAt(Math.floor(Math.random() * randomPosibilities.length));
    }
    // console.log(holder);
    return holder;    
}

// write function checkEmptyString and checkEmail   

// parses the input URL so that we can visualize it in req.body
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: true}));

const users = {
    'userID': {
        id: 'userID',
        email: 'userEmail',
        password: 'userPassword'
    }
};

// object to store TinyURLs and full URLs 
let urlDatabase = {
    'b2xVn2': 'http://www.lighthouselabs.ca',
    '9sm5xK': 'http://www.google.com'
};

app.get('/', (req, res) => {
    res.send('I love dis');
});

app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}!`);
});

app.get('/urls.json', (req, res) => {
    res.json(urlDatabase);
});

app.get('/hello', (req, res) => {
    res.send('<html><body>Hello <b>World</b></body></html>\n');
});

app.get('/urls', (req, res) => {
    let templateVars = { URLs: urlDatabase, 
        username: users[req.cookies['user_id']]};
    res.render('urls_index', templateVars);
});

app.get('/register', (req, res) => {
    let templateVars = { URLs: urlDatabase, 
        username: users[req.cookies['user_id']]};
    res.render('urls_register', templateVars);
});

app.post('/urls/:shortURL/delete', (req, res) => {
    delete  urlDatabase[req.params.shortURL];
    res.redirect('/urls');
});

app.post('/logout', (req, res) => {
    res.clearCookie('user_id');
    res.redirect('/urls');
});

// post /register that 
// 1. store new user objects from form
// 2. adds new user object to global user object
//      - user object should include id, email, password 
//      - request body of keys output by forms in /register
//      - use generateRandomString to generate random IDs for users
// 3. set a user_id cookie with the newly generated IDs
// 4. redirect user to /urls


app.post('/register', (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    const id = generateRandomString();
    if (email === '' || password === '') {
        res.sendStatus(400);
    }
    for (let user in users) {
        if (email === users[user].email) {
            res.sendStatus(400);
        }
    }

    let userData = {
        id,
        email,
        password,
    };
    users[id] = userData;

    res.cookie('user_id', id);
    res.redirect('/urls');
});

app.get('/urls/new', (req, res) => {
    let templateVars = {
        username: users[req.cookies['user_id']]
    };
    if (users[req.cookies['user_id']]) {
        res.render('urls_new', templateVars);
    } else {
        res.redirect('/login');
    }
    
});

app.post('/login', (req, res) => {
    // set a cookie named username to the string 
    // incoming from the request body via the login form
    // res.cookie('username', req.body.username);
    // console.log('Cookie username:', req.body.username);
    const email = req.body.email;
    const password = req.body.password;
    for (let storedUser in users) {
        if (users[storedUser].email === email) {
            res.cookie('user_id', storedUser);
        }
    }
    if (email === '' || password === '') {
        res.sendStatus(400);
    }
    for (let user in users) {
        if (email === users[user].email) {
            res.sendStatus(400);
        }
    }
    res.redirect('urls');
});

app.post('/urls', (req, res) => {
    // console.log(req.body);  // Log the POST request body to the console
    // put the random string function into a variable
    let randomURL = generateRandomString();
    // pass TinyURL into database as an object and request body of longURL
    urlDatabase[randomURL] = req.body.longURL;
    // redirect to urls_index
    res.redirect(`/urls/${randomURL}`);
    // console.log(urlDatabase);
});

app.get('/urls/:shortURL', (req, res) => {
    let templateVars = 
    { shortURL: req.params.shortURL, 
        longURL: urlDatabase[req.params.shortURL],
        username: users[req.cookies['user_id']]};
    res.render('urls_show', templateVars);
});

// post request for the edit form
app.post('/urls/:id/edit', (req, res) => {

    urlDatabase[req.params.id] = req.body.longURL;
    res.redirect('/urls');
});