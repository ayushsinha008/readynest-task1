import { Request, Response, NextFunction } from 'express';
import ResponseModel from '../models/Response';
import Form from '../models/Form';

export const getResponses = async (req: any, res: Response, next: NextFunction) => {
  try {
    // Ensure the user owns the form
    const form = await Form.findOne({ _id: req.params.formId, createdBy: req.user.id });
    if (!form) {
      return res.status(404).json({ success: false, message: 'Form not found or access denied' });
    }
    
    // As requested, strictly block response fetching/CSV if the form is unpublished
    if (!form.isPublished) {
      return res.status(403).json({ success: false, message: 'Cannot fetch responses for an unpublished form' });
    }

    const responses = await ResponseModel.find({ formId: req.params.formId }).sort({ submittedAt: -1 });
    
    res.status(200).json({ success: true, count: responses.length, responses });
  } catch (error) {
    next(error);
  }
};

export const deleteResponse = async (req: any, res: Response, next: NextFunction) => {
  try {
    const response = await ResponseModel.findById(req.params.id);
    if (!response) {
      return res.status(404).json({ success: false, message: 'Response not found' });
    }

    // Verify ownership
    const form = await Form.findOne({ _id: response.formId, createdBy: req.user.id });
    if (!form) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    await ResponseModel.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Response deleted' });
  } catch (error) {
    next(error);
  }
};
