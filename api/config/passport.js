// we import passport packages required for authentication
import PassportLocal from 'passport-local';
import passport from 'passport';

import { getRepository } from 'typeorm';
import User from '../entities/user';

const init = () => {
  // Telling passport we want to use a Local Strategy. In other words,
  // we want login with a username/email and password
  passport.use(new PassportLocal.Strategy(
    // Our user will sign in using an email, rather than a "username"
    {
      usernameField: 'email',
    },
    (email, password, done) => {
      const repo = getRepository(User);
      return repo.findOneOrFail({ where: { email } }).then(
        (dbUser) => {
          if (dbUser.password !== password) {
            return done(null, false, {
              message: 'Incorrect password.',
            });
          }
          // If none of the above, return the user
          return done(null, dbUser);
        },
        () => done(null, false, { message: 'no user found' }),
      );
    },
  ));
  //
  // In order to help keep authentication state across HTTP requests,
  // Sequelize needs to serialize and deserialize the user
  // Just consider this part boilerplate needed to make it all work
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });
  //
  passport.deserializeUser((id, done) => getRepository(User).findOneOrFail(id).then(
    (foundUser) => {
      done(null, foundUser);
    },
  ));
};
//
// Exporting our configured passport
export default init;
