const express = require('express');
const app = express();
const PORT = 8080;
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const bcrypt = require('bcryptjs');
const { hash } = require('bcryptjs');
const { getUserByEmail, urlDatabase, users } = require('./helpers');

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name:'session',
  keys:['key1', 'key2']
}));

app.set('view engine', 'ejs');

app.get('/', (req, res) => {
  const userid = req.session['user_id'];
  if (userid) {
    res.redirect('/urls');
  }
  res.redirect('/login')
});

app.get('/register', (req, res) => {
  const userid = req.session['user_id'];
  if (userid) {
    res.redirect('/urls');
  }
  const user = users[userid];
  const templateVars = { user: user};
  res.render('urls_register', templateVars);
});

app.post('/register', (req, res) => {
  //add a new user object to the global users object. should include the user's id, email and password.
  const email = req.body.email;
  const newID = Math.random().toString(20).substr(2, 6);
  //if new user puts in empty strings it should return 400 code
  if (email === "" || req.body.password === "") {
    res.status(400).send("<html><title>Error</title><body>Please register with an email and password.</body></html></html>");
  }
  //if new user already had existing email should return 400 code
  const foundUser = getUserByEmail(email, users);
  if (foundUser) {
    res.status(400).send("<html><title>Error</title><body>This email is already in our database!</body></html></html>");
  }
  //new we create a new user back into our database of users and the passwords should be hashed
  const plainTextPassword = req.body.password;
  const hashedPassword = bcrypt.hashSync(plainTextPassword, 10);
  
  const userObject = {
    id: newID,
    email: email,
    password: hashedPassword
  };
  users[newID] = userObject;
  
  //After adding the user, set a user_id cookie containing the user's newly generated ID.
  req.session.user_id = userObject.id;
  return res.redirect('/urls');
});

// created a function so we can match the cookie session user_id and display their respective URLs
const urlsForUser = function(id) {
  let usersURL = [];
  for (let shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === id) {
      usersURL[shortURL] = urlDatabase[shortURL].longURL;
    }
  }
  return usersURL;
};

//the cookie session id is matched with our URL database and will show all the URLs belonging to the id matched to the session id
app.get('/urls', (req, res) => {
  const userid = req.session['user_id'];
  const user = users[userid];
  if (!user) {
    return res.status(400).send("<html><title>Error</title><body>Please register or login.</body></html></html>")
  }
  const usersURL = urlsForUser(userid);
  const templateVars = { urls: usersURL, user: user}; ///change it back to usersURL
  res.render('urls_index', templateVars);
});

app.post('/urls', (req, res) => {
  const userid = req.session['user_id'];
  if (!userid) {
  //if a client is not logged in, they will be redirected to the login page
    res.redirect('/login');
  }
  // A user that is logged in can create a new long and short url and it will appear on the /urls page
  const newLongURL = req.body.longURL;
  if (newLongURL) {
    const shortURL = Math.random().toString(20).substr(2, 6);
    urlDatabase[shortURL] = { longURL: newLongURL, userID: userid };
    res.redirect('/urls');
  }
});

//create new URLs
app.get('/urls/new', (req, res) => {
  const userid = req.session['user_id'];
  const user = users[userid];
//if user is not logged it, they will be redirected to the login page
  if (!userid) {
    res.redirect('/login')
  }
 //otherwise this page will show up for the users 
  const templateVars = { user: user };
  res.render('urls_new', templateVars);
});

app.get('/urls/:shortURL', (req, res) => {
  const userid = req.session['user_id'];
  const user = users[userid];
  //check to see if a shortURL exists, if not, there will be an error message
  if (!urlDatabase[req.params.shortURL]) {
    res.status(403).send("<html><title>Error</title><body>This short URL does not exist!</body></html></html>")
  }
  //if user owns this shorturl based on the urldatabase then it can be shown
  if (userid === urlDatabase[req.params.shortURL].userID) {
    const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL, user: user};
    res.render('urls_show', templateVars);
  } else {
  //if the short URL does not belong to the logged in user, or has no logged in person, it will show an error.
  res.status(404).send("<html><title>Error</title><body>Only the correct logged in user will be able to view this.</body></html></html>");
  }
});

app.get('/u/:shortURL', (req, res) => {
  if (!urlDatabase[req.params.shortURL]) {
    res.status(500).send("<html><title>Error</title><body>Try using another URL. This one does not exist.</body></html></html>");
  }
  const longURL = urlDatabase[req.params.shortURL]['longURL'];
  res.redirect(longURL);
});

//this is the post for editing the long urls
app.post('/urls/:shortURL', (req, res) => {
  const uniqueShortURL = req.params.shortURL;
  const longURL = req.body.longURL;
  const userid = req.session['user_id'];
  const matchedID = urlDatabase[uniqueShortURL].userID;
//only the onwner of the shortURL can make changes to it and then will be redirected to /urls
 if (!userid) {
   res.status(403).send("No user is logged in.")
 }
  else { if (userid === matchedID) {
    urlDatabase[uniqueShortURL].longURL = longURL;
    res.redirect('/urls');
     //If there is no matching userid with the shortURL, and no logged in user and error message would appear.
  } else {
    res.status(403).send("Page cannot be accessed if it is not the owner.");
  }}
});

app.post('/urls/:shortURL/delete', (req, res) => {
  const shortURL = req.params.shortURL;
  const userid = req.session['user_id'];
  const user = users[userid];
  const matchedID = urlDatabase[uniqueShortURL].userID;
  //If there is no logged in user, error message would appear.
  if (!user) {
    return res.status(403).send({ Error: 'Please log in to delete this link.' });
    //Owner can delete.
  } else { if (userid === matchedID) {
    delete urlDatabase[shortURL];
    res.redirect('/urls');
    //Logged in user, but not the owner, error will appear.
  } else {
    res.status(403).send("Only the owner can delete this link.");
  }}
  });

app.get('/login', (req, res) => {
  const userid = req.session['user_id'];
  if (userid) {
    res.redirect('/urls');
  }
  const user = users[userid];
  const templateVars = { user: user};
  res.render('urls_login', templateVars);
});

app.post('/login', (req, res) => {
  const foundUser = getUserByEmail(req.body.email, users);
  if (!foundUser) {
    //If a user with that e-mail cannot be found, return a response with a 403 status code.
    return res.status(403).send("<html><title>Error</title><body>No user found!</body></html></html>");
  }
  bcrypt.compare(req.body.password, users[foundUser].password, (err, success) => {
    //If a user with that e-mail address is located, compare the password given in the form with the existing user's password.
    // if passwords did not match return a response with a 403 status code.
    if (!success) {
      return res.status(403).send("<html><title>Error</title><body>Password Invalid!</body></html></html>");
    }
    //uses the new email and password fields, and sets an appropriate user_id cookie on successful login
    //If both checks pass, set the user_id cookie with the matching user's random ID, then redirect to /urls.
    req.session.user_id = users[foundUser].id;
    res.redirect('/urls');
  });
});

app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});