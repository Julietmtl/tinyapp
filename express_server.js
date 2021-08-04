
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
    password: "password"
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

  //if new user puts in empty strings it should return 400 code
  if (req.body.email === "" || req.body.password === "") {
    res.sendStatus(400);
  }

  //if new user already had existing email should return 400 code
  for (let user in users) {
    if (req.body.email === users[user].email) {
      res.sendStatus(400)
    }
  }
  
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

app.get("/login", (req, res) => {
  const userid = req.cookies["user_id"]
  const user = users[userid]
  const templateVars = { user: user};
  res.render("urls_login", templateVars)
});

app.post("/login", (req, res) => { 
  let foundUser;
  //uses the new email and password fields, and sets an appropriate user_id cookie on successful login
  for (let user in users) {
    //If a user with that e-mail cannot be found, return a response with a 403 status code.
    if (req.body.email === users[user].email) {
      foundUser = users[user]
      //If a user with that e-mail address is located, compare the password given in the form with the existing user's password. 
      //If it does not match, return a response with a 403 status code.
    }
  }
  if (!foundUser) {
    res.sendStatus(403);
  }
    if (req.body.password !== foundUser.password) {
      res.sendStatus(403) 
    }

      //If both checks pass, set the user_id cookie with the matching user's random ID, then redirect to /urls.

    res.cookie("user_id", foundUser.id)
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