let express = require('express');
let app = express();
let PORT = 8080;

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

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: true}));

app.set('view engine', 'ejs');

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
    let templateVars = { URLs: urlDatabase,};
    res.render('urls_index', templateVars);
});

app.get('/urls/new', (req, res) => {
    res.render('urls_new');
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
        longURL: urlDatabase[req.params.shortURL]};
    res.render('urls_show', templateVars);
});

app.get('/u/:shortURL', (req, res) => {
    // const longURL = ...
    const longURL = urlDatabase[req.params.shortURL];
    res.redirect(longURL);
});