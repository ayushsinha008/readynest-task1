import express from 'express';
import { createForm, getForms, getFormById, updateForm, deleteForm, duplicateForm } from '../controllers/form.controller';
import { protect } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { createFormSchema, updateFormSchema } from '../schemas/form.schema';

const router = express.Router();

router.use(protect);

router.route('/')
  .post(validate(createFormSchema), createForm)
  .get(getForms);

router.route('/:id')
  .get(getFormById)
  .put(validate(updateFormSchema), updateForm)
  .delete(deleteForm);

router.post('/:id/duplicate', duplicateForm);

export default router;
