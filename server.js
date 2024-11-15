import app from './app.js';
import { connectDatabase } from './config/database.js';
import { PORT } from './config/siteEnv.js';

connectDatabase()
  .then(() => {
    console.log('DB Connected!');
    app.listen(PORT, () => console.log(`Server Started on the Port: ${PORT}`));
  })
  .catch((error) => console.log(error.message));
