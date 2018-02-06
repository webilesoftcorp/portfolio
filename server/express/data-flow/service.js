const one = require('../db').one;
const oneOrNone = require('../db').oneOrNone;
const manyOrNone = require('../db').manyOrNone;
const getSelectUserByIdQuery = require('../sql-helpers/users').getSelectUserByIdQuery;
const getSelectAllUsersQuery = require('../sql-helpers/users').getSelectAllUsersQuery;
const getSelectUserByNameQuery = require('../sql-helpers/users').getSelectUserByNameQuery;
const getSelectUserByEmailQuery = require('../sql-helpers/users').getSelectUserByEmailQuery;
const getSelectUserByWalletQuery = require('../sql-helpers/users').getSelectUserByWalletQuery;
const getInsertUserQuery = require('../sql-helpers/users').getInsertUserQuery;
const getUpdateUserByIdQuery = require('../sql-helpers/users').getUpdateUserByIdQuery;
const getDeleteUserByIdQuery = require('../sql-helpers/users').getDeleteUserByIdQuery;
const getSelectUserByEmailConfirmationTokenQuery = require('../sql-helpers/users').getSelectUserByEmailConfirmationTokenQuery;

//User services
function getUser(id) {
    return oneOrNone(getSelectUserByIdQuery(id));
}

function getUserByName(userName) {
    return oneOrNone(getSelectUserByNameQuery(userName));
}

function getUserByEmail(email) {
    return oneOrNone(getSelectUserByEmailQuery(email));
}

function getUserByEmailConfirmationToken(emailConfirmationToken) {
    return oneOrNone(getSelectUserByEmailConfirmationTokenQuery(emailConfirmationToken));
}

function getUserByWallet(address) {
    return oneOrNone(getSelectUserByWalletQuery(address));
}

function getAllUsers() {
    return manyOrNone(getSelectAllUsersQuery());
}

function addUser(data) {
    return one(getInsertUserQuery(data));
}

function updateUser(id, update) {
    return one(getUpdateUserByIdQuery(id, update));
}

function deleteUser(id) {
    return one(getDeleteUserByIdQuery(id));
}

module.exports = {
    getUser,
    getUserByName,
    getUserByEmail,
    getAllUsers,
    addUser,
    updateUser,
    deleteUser,
    getUserByEmailConfirmationToken,
    getUserByWallet,
};
