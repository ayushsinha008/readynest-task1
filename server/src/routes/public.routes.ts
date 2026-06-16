import express from 'express';
import { getPublicForm, submitForm } from '../controllers/public.controller';

const router = express.Router();

router.get('/forms/:slug', getPublicForm);
router.post('/forms/:slug/submit', submitForm);

export default router;
