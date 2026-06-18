import { Request, Response, NextFunction } from 'express';
import Form from '../models/Form';
import ResponseModel from '../models/Response';
import cloudinary from '../lib/cloudinary';

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

    const { data, respondentEmail } = req.body;

    // Optional: Add backend validation based on form.fields here
    for (const field of form.fields) {
      if (field.type === 'file' && data[field.id]) {
        try {
          const uploadRes = await cloudinary.uploader.upload(data[field.id], {
            folder: `formbuilder/${form._id}`,
          });
          data[field.id] = uploadRes.secure_url;
        } catch (uploadError) {
          console.error('Cloudinary upload error:', uploadError);
        }
      }
    }

    const newResponse = await ResponseModel.create({
      formId: form._id,
      respondentEmail: respondentEmail || 'Anonymous',
      data,
    });

    // Increment submissions
    form.submissions += 1;
    await form.save();

    // Emit real-time notification
    const io = req.app.get('io');
    if (io) {
      console.log(`Emitting new_submission to room: ${form.createdBy.toString()}`);
      io.to(form.createdBy.toString()).emit('new_submission', {
        formId: form._id,
        formTitle: form.title,
        message: `New response received for "${form.title}"`
      });
    } else {
      console.log('Socket IO instance not found on req.app');
    }

    res.status(201).json({ success: true, message: 'Response submitted successfully', responseId: newResponse._id });
  } catch (error) {
    next(error);
  }
};
