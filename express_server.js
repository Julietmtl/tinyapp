
const express = require("express");
const app = express();
const PORT = 8080;

const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser())
//const { createNewUser } = require("./helpers/authenticationHelpers")


app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
}

app.get('/register', (req, res) => {
  const userid = req.cookies["user_id"]
  const user = users[userid]
  const templateVars = { urls: urlDatabase, user: user};
  res.render("urls_register", templateVars)
})

app.post('/register', (req, res) => {
  //add a new user object to the global users object. should include the user's id, 
  //email and password.
  
  const newID = Math.random().toString(20).substr(2, 6);
  
  const userObject = {
    id: newID,
    email: req.body.email,
    password: req.body.password
  }
    users[newID] = userObject



  
  //After adding the user, set a user_id cookie containing the user's newly generated ID.

    res.cookie("user_id", userObject.id)
    return res.redirect('/urls')
  
})


app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls", (req, res) => {
  const userid = req.cookies["user_id"]
  const user = users[userid]
  const templateVars = { urls: urlDatabase, user: user};
  res.render("urls_index", templateVars)
});

app.post("/urls", (req, res) => {
 const longURL = req.body.longURL;
 if (longURL) {
  const createShortURL = Math.random().toString(20).substr(2, 6);
  urlDatabase[createShortURL] = longURL;
 }
 res.redirect("/urls");        
});

app.get("/urls/new", (req, res) => {
  const userid = req.cookies["user_id"]
  const user = users[userid]
  const templateVars = { user: user };
  res.render("urls_new", templateVars);
});


app.get("/urls/:shortURL", (req, res) => {
  const userid = req.cookies["user_id"]
  const user = users[userid]
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], user: user};
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

app.post('/urls/:shortURL/delete', (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect('/urls');
})

app.post("/login", (req, res) => {
  const user_id = req.body.user_id;
  res.cookie("user_id", user_id)
  res.redirect('/urls');
})

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
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




app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`)
}); 