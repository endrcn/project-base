const passport = require("passport");
const passportJWT = require("passport-jwt");
const ExtractJwt = passportJWT.ExtractJwt;
const Strategy = passportJWT.Strategy;

const config = require("./");
const User = require("../db/models/Users");
const UserRoles = require("../db/models/UserRoles");
const Enum = require("../config/Enum");
const Response = require("../lib/Response");
const Error = require("../lib/Error");
const i18n = require("../i18n");
const RolePrivileges = require("../db/models/RolePrivileges");

let params = {
    secretOrKey: config.JWT.SECRET,
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken()
}

module.exports = function () {
    let strategy = new Strategy(params, async (payload, done) => {
        try {

            let users = await User.find({ _id: payload.id }) || [];
            if (users && users.length > 0) {

                let user = users[0];

                let userRoles = await UserRoles.find({ user_id: user._id });

                let privileges = (await RolePrivileges.find({ role_id: { $in: userRoles.map(x => x.role_id) } }).lean()).map(x => {
                    x.privilege = Enum.Privileges.find(p => p.Key == x.permission);
                    return x;
                });

                return done(null, {
                    id: user._id,
                    email: user.email,
                    first_name: user.first_name,
                    last_name: user.last_name,
                    roles: privileges,
                    exp: parseInt(Date.now() / 1000) + config.TOKEN_EXPIRE_TIME
                });

            } else {
                console.log(new Error(i18n.USERS.USER_NOT_FOUND));
                return done(null, null);
            }
        } catch (error) {
            console.log("ERR:", new Error(error));
            return done(null, null);
        }
    });
    passport.use(strategy);
    return {
        initialize: function () {
            return passport.initialize();
        },
        authenticate: function () {
            return passport.authenticate("jwt", config.JWT.SESSION);
        },
        checkRole: (...expectedRoles) => {
            return (req, res, next) => {
                let i = 0;
                var privileges = req.user.roles.map(x => x.privilege).map(x => x.Key);


                while (i < expectedRoles.length && !privileges.includes(expectedRoles[i])) i++;
                if (i < expectedRoles.length) {
                    return next();
                } else {
                    let response = new Response().generateError(new Error(Enum.HTTP_CODES.FORBIDDEN, i18n.AUTH.NEED_PERMISSION_TITLE, i18n.AUTH.NEED_PERMISSION_INFO));
                    return res.status(response.code).json(response);
                }
            }
        }
    };
};