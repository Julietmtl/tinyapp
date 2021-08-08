const bcrypt = require('bcryptjs');
const { hash } = require('bcryptjs');

const getUserByEmail = function(email, database) {
  for (let user in database) {
    if (database[user].email === email) {
      return user;
    }
  }
};

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

const password1 = bcrypt.hashSync('password', 10);
const password2 = bcrypt.hashSync('dishwasher-funk', 10);

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
};


module.exports = { getUserByEmail, urlDatabase, users };
