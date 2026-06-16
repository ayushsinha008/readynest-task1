import express from 'express';
import { getResponses, deleteResponse } from '../controllers/response.controller';
import { protect } from '../middleware/auth.middleware';

const router = express.Router();

router.use(protect);

// GET all responses for a specific form
router.route('/form/:formId').get(getResponses);

// DELETE a specific response by its own ID
router.route('/:id').delete(deleteResponse);

export default router;
