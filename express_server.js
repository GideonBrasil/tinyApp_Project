let express = require('express');
let app = express();
let PORT = 8080;
var cookieParser = require('cookie-parser');
app.use(cookieParser());
app.set('view engine', 'ejs');

app.get('/login', (req, res) => {
    let templateVars = {
        username: req.cookies['username'],
    };
    res.render('login', templateVars);
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
// parses the input URL so that we can visualize it in req.body
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: true}));


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
        username: req.cookies['username']};
    res.render('urls_index', templateVars);
});

app.post('/urls/:shortURL/delete', (req, res) => {
    delete  urlDatabase[req.params.shortURL];
    res.redirect('/urls');
});

app.get('/urls/new', (req, res) => {
    let templateVars = {
        username: req.cookies['username']
    };
    res.render('urls_new', templateVars);
});

app.post('/login', (req, res) => {
    // set a cookie named username to the string 
    // incoming from the request body via the login form
    res.cookie('username', req.body.username);
    // console.log('Cookie username:', req.body.username);
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
        username: req.cookies['username']};
    res.render('urls_show', templateVars);
});

// post request for the edit form
app.post('/urls/:id/edit', (req, res) => {
    console.log('THIS IS THE REQ.PARAMS', req.params);
    urlDatabase[req.params.id] = req.body.longURL;
    res.redirect('/urls');
});