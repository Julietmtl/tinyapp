
const express = require("express");
const app = express();
const PORT = 8080;

const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const bcrypt = require('bcryptjs');
const { hash } = require("bcryptjs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser())
//const { createNewUser } = require("./helpers/authenticationHelpers")

// app.use(cookieSession({
//   name:'session',
//   keys:['key1', 'key2']
// }))
//const userID = req.session.userID
//req.session = null to clear session

app.set("view engine", "ejs");

const urlDatabase = {
  b6UTxQ: {
      longURL: "https://www.tsn.ca",
      userID: "aJ48lW"
  },
  i3BoGr: {
      longURL: "https://www.google.ca",
      userID: "aJ48lW"
  }
};

const password1 = bcrypt.hashSync("password", 10);
const password2 = bcrypt.hashSync("dishwasher-funk", 10)

const users = { 
  "aJ48lW": {
    id: "aJ48lW", 
    email: "user@example.com", 
    password: password1
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: password2
  }
}

app.get('/register', (req, res) => {
  const userid = req.cookies["user_id"]
  if (userid) {
    res.redirect('/urls')
  }
  const user = users[userid]
  const templateVars = { user: user};
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
  //new we create a new user back into our database of users
  const plainTextPassword = req.body.password;
  const hashedPassword = bcrypt.hashSync(plainTextPassword, 10)
  
  const userObject = {
    id: newID,
    email: req.body.email,
    password: hashedPassword
  }
    users[newID] = userObject

    console.log(userObject)
    console.log(users)
  
  //After adding the user, set a user_id cookie containing the user's newly generated ID.

    res.cookie("user_id", userObject.id)
    return res.redirect('/urls')
  
})

const urlsForUser = function(id) {
  //const id = req.cookies["user_id"];
  let usersURL = [];
  for (let shortURL in urlDatabase) {
    if(urlDatabase[shortURL].userID === id) {
      usersURL[shortURL] = urlDatabase[shortURL].longURL
    }
  }
  return usersURL;
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls", (req, res) => {
  const userid = req.cookies["user_id"]
  const user = users[userid]
  const usersURL = urlsForUser(userid)
  const templateVars = { urls: usersURL, user: user};
  res.render("urls_index", templateVars)
});

app.post("/urls", (req, res) => {
  const userid = req.cookies["user_id"]
  if (!userid) {
    console.log("Visitor is not logged in.")
    res.redirect('/login');
  }
 const newLongURL = req.body.longURL;
 if (newLongURL) {
  const shortURL = Math.random().toString(20).substr(2, 6);
  urlDatabase[shortURL] = { longURL: newLongURL, userID: userid } 
  res.redirect(`/urls/${shortURL}`);
 };    
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
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL, user: user};
  res.render("urls_show", templateVars)
});

app.get("/u/:shortURL", (req, res) => {
  if (!urlDatabase[req.params.shortURL]) {
    res.status(500).send({ error: 'Something failed!' }) /// double check this...Basic Permission Features
  }
  const longURL = urlDatabase[req.params.shortURL]["longURL"];
  res.redirect(longURL);
});

//this is the post for editing the long urls
app.post("/urls/:shortURL", (req, res) => {
  const uniqueShortURL = req.params.shortURL;
  const longURL = req.body.longURL;
  const userid = req.cookies["user_id"]
  if (userid === urlDatabase[uniqueShortURL].userID) {
    urlDatabase[uniqueShortURL].longURL = longURL;
    res.redirect('/urls')
  } else {
    res.status(403).send("<html><title>Error</title><body>You are not authorized to do that!</body></html></html>");
  }
});

app.post('/urls/:shortURL/delete', (req, res) => {
  const shortURL = req.params.shortURL;
  const userid = req.cookies["user_id"]
  const user = users[userid];
  if (!user) {
    return res.status(500).send({ Error: 'Only the creator of the URL can delete the link!' })
  }
  delete urlDatabase[shortURL];
  res.redirect('/urls');
});

app.get("/login", (req, res) => {
  const userid = req.cookies["user_id"]
  if (userid) {
    res.redirect('/urls')
  }

  const user = users[userid]
  const templateVars = { user: user};
  res.render("urls_login", templateVars)
});

app.post("/login", (req, res) => { 
  let foundUser;
  console.log("users: ", users)
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
    return res.status(403).send("<html><title>Error</title><body>No user found!</body></html></html>");
  }
    bcrypt.compare(req.body.password, foundUser.password, (err, success) => {
      // if passwords did not match
      if (!success) {
        return res.status(403).send("<html><title>Error</title><body>Password Invalid!</body></html></html>");
    }

      //If both checks pass, set the user_id cookie with the matching user's random ID, then redirect to /urls.

    res.cookie("user_id", foundUser.id)
    res.redirect('/urls');
  })
});


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