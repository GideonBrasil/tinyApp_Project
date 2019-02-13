let express = require('express');
let app = express();
let PORT = 8080;

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

app.get('/urls/:shortURL', (req, res) => {
    let templateVars = 
    { shortURL: req.params.shortURL, 
        longURL: urlDatabase[req.params.shortURL]};
    res.render('urls_show', templateVars);
});

app.post('/urls', (req, res) => {
    console.log(req.body);  // Log the POST request body to the console
    let templateVars = {
        URLs: urlDatabase,
    };
    res.status(200).send(templateVars);         // Respond with 'Ok' (we will replace this)
    console.log(res);
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
generateRandomString();