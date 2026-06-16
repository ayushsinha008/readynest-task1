import express from 'express';
import { createForm, getForms, getFormById, updateForm, deleteForm } from '../controllers/form.controller';
import { protect } from '../middleware/auth.middleware';

const router = express.Router();

router.use(protect);

router.route('/')
  .post(createForm)
  .get(getForms);

router.route('/:id')
  .get(getFormById)
  .put(updateForm)
  .delete(deleteForm);

export default router;
