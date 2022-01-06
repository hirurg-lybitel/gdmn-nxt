require('dotenv').config({ path: '../../../../.env' });

export const config = {
  username: process.env.ISC_USER,
  password: process.env.ISC_PASSWORD,
  host: process.env.NODE_FB_TEST_HOST,
  port: process.env.NODE_FB_TEST_PORT,
  tmpDir: process.env.NODE_FB_TEST_TMP_DIR,
  db: process.env.NODE_FB_TEST_DB
};