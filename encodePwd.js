var Bcrypt= require('bcrypt');

Bcrypt.hash('1q2w3e', 10, function (err, hash) {
    console.log( hash);
});