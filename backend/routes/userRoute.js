// // import express from 'express';
// // import { adminLogin, loginUser, registerUser } from '../controllers/userController.js';

// // const userRouter = express.Router();

// // userRouter.post('/register', registerUser);
// // userRouter.post('/login', loginUser);
// // userRouter.post('/admin', adminLogin);

// // export default userRouter;

// import express from 'express';
// import userAuth from '../middleware/userAuth.js';
// import { getUserData, adminLogin } from '../controllers/userController.js';

// const userRouter = express.Router();


// userRouter.get('/data', userAuth, getUserData);
// userRouter.post('/admin', adminLogin);

// export default userRouter;

import express from 'express';
import userAuth from '../middleware/userAuth.js';
import { getUserData, adminLogin } from '../controllers/userController.js';

const userRouter = express.Router();

// Return user data
userRouter.get('/data', userAuth, getUserData);

// NEW: Small route to confirm valid cookie
userRouter.get('/is-auth', userAuth, (req, res) => {
    return res.json({ success: true });
});

// Admin login endpoint
userRouter.post('/admin', adminLogin);

export default userRouter;
