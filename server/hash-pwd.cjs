const bcrypt = require('bcrypt');

bcrypt.hash('agentforce26!', 10).then(hash => {
  console.log(hash);
}).catch(err => {
  console.error(err);
  process.exit(1);
});
