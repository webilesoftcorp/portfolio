const squel = require('squel');
const TABLES = require('../constants/tables');

const squelPostgres = squel.useFlavour('postgres');

const table = TABLES.USERS;
const cols = table.COLUMNS;

function getSelectAllUsersQuery() {
    return squelPostgres.select()
        .from(table.NAME, 'u')
        .field('u.*')
        .field(`b.${TABLES.BALANCES.COLUMNS.BALANCE}`)
        .left_join(`${TABLES.BALANCES.NAME}`, 'b', `u.id = b.${TABLES.BALANCES.COLUMNS.SUBJECT_ID}`)
        .toString();
}

function getSelectUserByIdQuery(id) {
    return squelPostgres.select()
        .from(table.NAME, 'u')
        .field('u.*')
        .field(`b.${TABLES.BALANCES.COLUMNS.BALANCE}`)
        .where(`u.id = '${id}'`)
        .left_join(`${TABLES.BALANCES.NAME}`, 'b', `u.id = b.${TABLES.BALANCES.COLUMNS.SUBJECT_ID}`)
        .toString();
}

function getDeleteUserByIdQuery(id) {
    return squelPostgres.delete()
        .from(table.NAME)
        .where(`id = '${id}'`)
        .returning('*')
        .toString();
}

function getInsertUserQuery(values) {
    return squelPostgres.insert()
        .into(table.NAME)
        .setFields(values)
        .returning('*')
        .toString();
}

function getUpdateUserByIdQuery(id, values) {
    return squelPostgres.update()
        .table(table.NAME)
        .setFields(values)
        .where(`id = '${id}'`)
        .returning('*')
        .toString();
}

function getSelectUserByNameQuery(name) {
    return squelPostgres.select()
        .from(table.NAME, 'u')
        .field('u.*')
        .field(`b.${TABLES.BALANCES.COLUMNS.BALANCE}`)
        .where(`${cols.NAME} = '${name}'`)
        .left_join(`${TABLES.BALANCES.NAME}`, 'b', `u.id = b.${TABLES.BALANCES.COLUMNS.SUBJECT_ID}`)
        .toString();
}

function getSelectUserByEmailQuery(email) {
    return squelPostgres.select()
        .from(table.NAME, 'u')
        .field('u.*')
        .field(`b.${TABLES.BALANCES.COLUMNS.BALANCE}`)
        .where(`${cols.EMAIL} = '${email}'`)
        .left_join(`${TABLES.BALANCES.NAME}`, 'b', `u.id = b.${TABLES.BALANCES.COLUMNS.SUBJECT_ID}`)
        .toString();
}

function getSelectUserByEmailConfirmationTokenQuery(emailConfirmationToken) {
    return squelPostgres.select()
        .from(table.NAME, 'u')
        .field('u.*')
        .field(`b.${TABLES.BALANCES.COLUMNS.BALANCE}`)
        .where(`${cols.EMAIL_CONFIRMATION_TOKEN} = '${emailConfirmationToken}'`)
        .left_join(`${TABLES.BALANCES.NAME}`, 'b', `u.id = b.${TABLES.BALANCES.COLUMNS.SUBJECT_ID}`)
        .toString();
}

function getSelectUserByWalletQuery(address) {
    return squelPostgres.select()
        .from(table.NAME, 'u')
        .field('u.*')
        .field(`b.${TABLES.BALANCES.COLUMNS.BALANCE}`)
        .where(`${cols.WALLET} = '${address}'`)
        .left_join(`${TABLES.BALANCES.NAME}`, 'b', `u.id = b.${TABLES.BALANCES.COLUMNS.SUBJECT_ID}`)
        .toString();
}

module.exports = {
    getSelectAllUsersQuery,
    getSelectUserByIdQuery,
    getDeleteUserByIdQuery,
    getInsertUserQuery,
    getUpdateUserByIdQuery,
    getSelectUserByNameQuery,
    getSelectUserByEmailQuery,
    getSelectUserByEmailConfirmationTokenQuery,
    getSelectUserByWalletQuery,
};
