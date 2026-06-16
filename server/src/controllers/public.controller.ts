import { Request, Response, NextFunction } from 'express';
import Form from '../models/Form';
import ResponseModel from '../models/Response';

export const getPublicForm = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const form = await Form.findOne({ slug: req.params.slug, isPublished: true });
    
    if (!form) {
      return res.status(404).json({ success: false, message: 'Form not found or is not published' });
    }

    // Increment views
    form.views += 1;
    await form.save();

    res.status(200).json({ success: true, form });
  } catch (error) {
    next(error);
  }
};

export const submitForm = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const form = await Form.findOne({ slug: req.params.slug, isPublished: true });
    
    if (!form) {
      return res.status(404).json({ success: false, message: 'Form not found' });
    }

    const { data } = req.body;

    // Optional: Add backend validation based on form.fields here

    const newResponse = await ResponseModel.create({
      formId: form._id,
      data,
    });

    // Increment submissions
    form.submissions += 1;
    await form.save();

    res.status(201).json({ success: true, message: 'Response submitted successfully', responseId: newResponse._id });
  } catch (error) {
    next(error);
  }
};
