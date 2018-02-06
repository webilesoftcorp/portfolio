const success = require('../response').success;
const reject = require('../response').reject;
const TokenService = require('../../services/token');
const UsersService = require('../../services/users');
const extractToken = require('../../helpers/jwt_token').extractToken;
const formatUserBalance = require('../../formatters/users').formatUserBalance;
const formatUserForResponse = require('../../formatters/users').formatUserForResponse;

async function getProfile(req, res) {
    try {
        const token = extractToken(req);

        const userId = await TokenService.extractIdFromToken(token);
        let userWithBalance = await UsersService.getUser(userId);

        userWithBalance = formatUserForResponse(userWithBalance);
        userWithBalance = formatUserBalance(userWithBalance);

        return success(res, { user: userWithBalance });
    } catch (error) {
        return reject(res, { error });
    }
}

module.exports = {
    getProfile,
};
