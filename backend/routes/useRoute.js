// import express from 'express';
// import { adminLogin, loginUser, registerUser } from '../controllers/userController.js';

// const userRouter = express.Router();

// userRouter.post('/register', registerUser);
// userRouter.post('/login', loginUser);
// userRouter.post('/admin', adminLogin);

// export default userRouter;

import express from 'express';
import userAuth from '../middleware/userAuth.js';
import { getUserData, adminLogin, registerUser, loginUser } from '../controllers/userController.js';

const userRouter = express.Router();


userRouter.get('/data', userAuth, getUserData);
userRouter.post('/admin', adminLogin);

export default userRouter;