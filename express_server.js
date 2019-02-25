const express = require('express');
const app = express();
const PORT = 8080;
const cookieSession = require('cookie-session');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');

app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs');
//Cookie session for encrypted passwords
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
    let randomString = '';
    let randomPosibilities = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 6; i++) {
        randomString += randomPosibilities.charAt(Math.floor(Math.random() * randomPosibilities.length));
    }
    return randomString;    
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
    res.redirect('/login');
});

app.get('/urls.json', (req, res) => {
    res.json(urlDatabase);
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
    console.log('email:', email);
    const password = bcrypt.hashSync(req.body.password, 10);
    console.log('password:', password);
    const id = generateRandomString();
    if (!email && !req.body.password) {
        res.send('You need an email and a password to create a new account');
        res.sendStatus(400);
    }
    if (!email) {
        res.send('Use an email to create a new account');
        res.sendStatus(400);
    }
    if (req.body.password === '') {
        res.send('Your new account can\'t have a blank password');
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

    res.redirect('/urls');
});

app.get('/login', (req, res) => {
    let templateVars = {
        username: req.session['user_id'],
    };
    res.render('urls_login', templateVars);
});

app.post('/login', (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    for (let storedUser in users) {
        if ((users[storedUser].email === email) && bcrypt.compareSync(password, users[storedUser].password)) {
            req.session.user_id = (req.session.user_id) ? req.session.user_id : storedUser;
            res.redirect('/urls');
        }       
    }
    if (!req.session.user_id) {
        res.sendStatus(400);
    }
});

app.post('/logout', (req, res) => {
    req.session = null;
    res.redirect('/urls');
});

app.get('/urls', (req, res) => {
    let templateVars = { 
        URLs: urlDatabase,
        username: users[req.session['user_id']],
        userID: req.session.user_id
    };
    res.render('urls_index', templateVars);
});

app.post('/urls', (req, res) => {
    let randomURL = generateRandomString();
    urlDatabase[randomURL] = {
        longURL: req.body.longURL,
        userID: req.session.user_id
    };
    res.redirect(`/urls/${randomURL}`);
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
    if (urlDatabase[randomShortURL].userID === req.session.user_id) {
        delete urlDatabase[randomShortURL];
        res.redirect('/urls');
    } else {
        res.send('You don\'t have the permission to delete TinyURLs');
    }
});

app.post('/urls/:id/edit', (req, res) => {
    let shortURL = req.params.id;
    let longURL = req.body.longURL;
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