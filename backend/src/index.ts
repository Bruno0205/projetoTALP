import 'dotenv/config';
import app from './app';

const port = process.env.PORT || 3000;
app.listen(Number(port), () => {
  // eslint-disable-next-line no-console
  console.log(`Server listening on http://localhost:${port}`);
});
