
const express = require("express");
const app = express();
const PORT = 8080;

const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser())

function generateRandomString() {
  return  Math.random().toString(20).substr(2, 6)
}

app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase, username: req.cookies["username"]};
  res.render("urls_index", templateVars)
});

app.get("/urls/new", (req, res) => {
  const templateVars = { username: req.cookies["username"] }
  res.render("urls_new", templateVars);
});


app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL],username: req.cookies["username"] };
  res.render("urls_show", templateVars)
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});


app.post("/urls/:shortURL", (req, res) => {
  const uniqueShortURL = req.params.shortURL;
  const longURL = req.body.longURL;
  urlDatabase[uniqueShortURL] = longURL;
  res.redirect('/urls')
})

app.post("/login", (req, res) => {
  const username = req.body.username;
  res.cookie("username", username)
  res.redirect('/urls');
})

app.post("/logout", (req, res) => {
  res.clearCookie("username");
  res.redirect('/urls');
})

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n")
});

app.get("/set", (req, res) => {
  const a = 1;
  res.send(`a = ${a}`);
 });
 
 app.get("/fetch", (req, res) => {
  res.send(`a = ${a}`);
 });

 app.post("/urls", (req, res) => {
  console.log(req.body);
  res.send("Ok");        
});

app.post('/urls/:shortURL/delete', (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect('/urls');
})


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`)
}); 