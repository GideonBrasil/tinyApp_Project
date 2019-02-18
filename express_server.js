const express = require('express');
const app = express();
const PORT = 8080;
const cookieSession = require('cookie-session');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs');

app.use(cookieSession({
    name: 'session',
    keys: ['secret'],
    user_id: '',
    // Cookie Options
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

//Functions used on server
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

function urlsForUser(id){
    let userURL = [];
    for (let shortURL in urlDatabase){
        if (urlDatabase[shortURL]['userID'] === id) {
            userURL.push({
                id,
                shortURL,
                link: urlDatabase[shortURL]['longURL']
            });
        }
    }
    return userURL;
}

//Server Databases
let users = {
    'userID': {
        id: 'userID',
        email: 'userEmail',
        password: 'userPassword'
    },
    'userID2': {
        id: 'userID2',
        email: 'userEmail2',
        password: 'userPassword2'
    }
};

let urlDatabase = {
    'b2xVn2': { 
        longURL: 'http://www.lighthouselabs.ca',
        userID: 'userID'
    },
    '9sm5xK': { 
        longURL: 'http://www.google.com', 
        userID: 'userID2'
    }
};

//Server routes
app.get('/', (req, res) => {
    res.send('I love dis');
});

app.get('/urls.json', (req, res) => {
    res.json(urlDatabase);
});

app.get('/hello', (req, res) => {
    res.send('<html><body>Hello <b>World</b></body></html>\n');
});

app.get('/register', (req, res) => {
    let templateVars = { 
        URLs: urlDatabase, 
        username: req.session['user_id']
    };
    res.render('urls_register', templateVars);
});

app.post('/register', (req, res) => {
    const email = req.body.email;
    const password = bcrypt.hashSync(req.body.password, 10);
    const id = generateRandomString();
    if (!email || !password) {
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
    req.session.user_id = id;
    // console.log('userData:', userData);
    // console.log('urlDatabase:', urlDatabase);
    // console.log('users; ', users);
    // console.log('urlDatabase: ', urlDatabase);
    // console.log('users: ', users);
    // res.cookie('user_id', id);
    res.redirect('/urls');
    console.log('Data users: ', users);
    console.log('Console user_id: ', req.session, req.session['user_id']);
});

app.get('/login', (req, res) => {
    // console.log('username:', users);
    let templateVars = {
        username: req.session['user_id'],
    };
    res.render('urls_login', templateVars);
});

app.post('/login', (req, res) => {
    // set a cookie named username to the string 
    // incoming from the request body via the login form
    // res.cookie('username', req.body.username);
    // console.log('Cookie username:', req.body.username);
    const email = req.body.email;
    // console.log('email:', email);
    const password = req.body.password;
    // console.log('password:', password);
    for (let storedUser in users) {
        if ((users[storedUser].email === email) && bcrypt.compareSync(password, users[storedUser].password)) {
            // res.cookie('user_id', storedUser);
            req.session.user_id = storedUser;
            res.redirect('/urls');
        }       
    }
    res.sendStatus(400);
});

app.post('/logout', (req, res) => {
    req.session = null;
    res.redirect('/urls');
});

app.get('/urls', (req, res) => {
    // console.log(req.cookies['user_id']);
    let templateVars = { 
        URLs: urlDatabase,
        username: users[req.session['user_id']],
        userID: req.session.user_id
    };
    // console.log('users data: ', users, users[req.session.user_id]);
    // console.log('urls GET -:', urlDatabase);
    // console.log('urls:users GET: ', users)
    res.render('urls_index', templateVars);
});

app.post('/urls', (req, res) => {
    // console.log(req.body);  // Log the POST request body to the consolpost
    // put the random string function into a variable
    let randomURL = generateRandomString();
    // pass TinyURL into database as an object and request body of longURL
    // console.log('create new url, user id: ', req.session.user_id);
    urlDatabase[randomURL] = {
        longURL: req.body.longURL,
        userID: req.session.user_id
    };
    // redirect to urls_index
    res.redirect(`/urls/${randomURL}`);
    // console.log(urlDatabase);
});

app.get('/urls/new', (req, res) => {
    let templateVars = {
        username: users[req.session.user_id]
    };
    if (users[req.session.user_id]) {
        res.render('urls_new', templateVars);
    } else {
        res.redirect('/login');
    }
});

app.get('/urls/:shortURL', (req, res) => {
    if (req.session.user_id === urlDatabase[req.params.shortURL].userID) {
        let templateVars = { 
            shortURL: req.params.shortURL, 
            longURL: urlDatabase[req.params.shortURL].longURL,
            username: users[req.session.user_id]
        };
        res.render('urls_show', templateVars);
    } else {
        res.redirect(urlDatabase[req.params.shortURL].longURL);
    }
    
});

app.post('/urls/:id/delete', (req, res) => {
    let randomShortURL = req.params.id;
    // console.log('POST delete: ', randomShortURL, urlDatabase, urlDatabase[randomShortURL]);
    if (urlDatabase[randomShortURL].userID === req.session.user_id) {
        delete urlDatabase[randomShortURL];
        res.redirect('/urls');
    } else {
        res.send('You don\'t have the permission to delete TinyURLs');
    }
});

// post request for the edit form
app.post('/urls/:id/edit', (req, res) => {
    let shortURL = req.params.id;
    // console.log('urlDatabase: ', urlDatabase);
    // console.log(shortURL);
    // console.log('cookies: ', req.session.user_id);
    let longURL = req.body.longURL;
    // urlDatabase[shortURL] = {longURL: longURL, userID: req.session.user_id};
    // console.log('compare:', req.session.user_id, urlDatabase, shortURL, urlDatabase[shortURL]);
    if (urlDatabase[shortURL].userID === req.session.user_id) {
        urlDatabase[shortURL]['longURL'] = longURL;
        res.redirect('/urls');
    } else {
        res.send('You must log in to be able to edit this link');
    }
});

app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}!`);
});