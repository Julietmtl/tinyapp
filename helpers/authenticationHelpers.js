const createNewUser = (users, userObject) => {
  if (!users[userObject.email]) {
    users[email] = userObject
    return userObject
  }
  return null
}

const findUser = (userDatabase, email) => {
  const user = userDatabase[email] ? userDatabase[email] : {}

  return user
}

module.exports = { createNewUser }