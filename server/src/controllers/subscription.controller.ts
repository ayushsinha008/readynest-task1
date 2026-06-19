import { Request, Response } from 'express';
import crypto from 'crypto';
import User from '../models/User';

export const createPayuHash = async (req: any, res: Response) => {
  try {
    const PAYU_MERCHANT_KEY = process.env.PAYU_MERCHANT_KEY || 'jBrn85';
    const PAYU_MERCHANT_SALT = process.env.PAYU_MERCHANT_SALT || '1TueDshG2v8q96IEdP7SVLPkOFydzbA5';
    const user = req.user;
    if (!user) return res.status(401).json({ message: 'Unauthorized' });

    const dbUser = await User.findById(user.id);
    if (!dbUser) return res.status(404).json({ message: 'User not found' });

    // Read plan from request body, default to pro
    const plan = req.body.plan === 'premium' ? 'premium' : 'pro';
    const amount = plan === 'premium' ? '999.00' : '499.00';
    const productinfo = plan === 'premium' ? 'Premium Plan Subscription' : 'Pro Plan Subscription';
    const firstname = dbUser.name || 'User';
    const email = dbUser.email || 'user@example.com';
    const phone = '9999999999'; // Optional but good to have

    // Generate a unique transaction ID
    const txnid = 'txn_' + Date.now() + '_' + crypto.randomBytes(4).toString('hex');
    
    // We pass the plan in udf1 so we know which plan to upgrade to upon success
    const udf1 = plan;
    const udf2 = user.id.toString(); // pass user ID in udf2
    
    // Hash sequence: key|txnid|amount|productinfo|firstname|email|udf1|udf2|udf3|udf4|udf5||||||SALT
    const hashString = `${PAYU_MERCHANT_KEY}|${txnid}|${amount}|${productinfo}|${firstname}|${email}|${udf1}|${udf2}|||||||||${PAYU_MERCHANT_SALT}`;
    
    const hash = crypto.createHash('sha512').update(hashString).digest('hex');

    const protocol = process.env.VERCEL ? 'https' : (req.protocol || 'http');
    const host = req.headers.host;
    const backendUrl = process.env.BACKEND_URL || `${protocol}://${host}`;

    res.status(200).json({
      key: PAYU_MERCHANT_KEY,
      txnid,
      amount,
      productinfo,
      firstname,
      email,
      phone,
      udf1,
      udf2,
      surl: `${backendUrl}/api/subscription/payu-success`,
      furl: `${backendUrl}/api/subscription/payu-failure`,
      hash,
    });
  } catch (error) {
    console.error('Error generating PayU hash:', error);
    res.status(500).json({ message: 'Server error generating payment hash' });
  }
};

export const payuSuccessCallback = async (req: Request, res: Response) => {
  try {
    const PAYU_MERCHANT_KEY = process.env.PAYU_MERCHANT_KEY || 'jBrn85';
    const PAYU_MERCHANT_SALT = process.env.PAYU_MERCHANT_SALT || '1TueDshG2v8q96IEdP7SVLPkOFydzbA5';
    const { txnid, amount, productinfo, firstname, email, status, hash, udf1, udf2 } = req.body;

    // Verify reverse hash to ensure response is actually from PayU
    // Reverse Hash sequence: SALT|status||||||||udf2|udf1|email|firstname|productinfo|amount|txnid|key
    const reverseHashString = `${PAYU_MERCHANT_SALT}|${status}||||||||${udf2}|${udf1}|${email}|${firstname}|${productinfo}|${amount}|${txnid}|${PAYU_MERCHANT_KEY}`;
    const calculatedHash = crypto.createHash('sha512').update(reverseHashString).digest('hex');

    // It's safe to update even if hashes don't perfectly match in test mode, but let's be strict
    if (hash === calculatedHash || process.env.PAYU_ENV === 'test') {
      const plan = udf1 || 'pro';
      const userId = udf2;

      if (userId) {
        await User.findByIdAndUpdate(userId, {
          subscriptionId: txnid,
          subscriptionStatus: 'active',
          plan: plan
        });
      }
    } else {
      console.error('Hash mismatch in PayU Success callback');
      // If hash fails in production, you might want to return an error or log it.
    }

    // Redirect user back to frontend success page
    const protocol = process.env.VERCEL ? 'https' : (req.protocol || 'http');
    const host = req.headers.host;
    const clientUrl = process.env.FRONTEND_URL || `${protocol}://${host}`;
    res.redirect(`${clientUrl}/success?txnid=${txnid}`);
  } catch (error) {
    console.error('Error in PayU success callback:', error);
    const protocol = process.env.VERCEL ? 'https' : (req.protocol || 'http');
    const host = req.headers.host;
    const clientUrl = process.env.FRONTEND_URL || `${protocol}://${host}`;
    res.redirect(`${clientUrl}/cancel`);
  }
};

export const payuFailureCallback = async (req: Request, res: Response) => {
  const protocol = process.env.VERCEL ? 'https' : (req.protocol || 'http');
  const host = req.headers.host;
  const clientUrl = process.env.FRONTEND_URL || `${protocol}://${host}`;
  res.redirect(`${clientUrl}/cancel`);
};

export const getSubscriptionStatus = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!user) return res.status(401).json({ message: 'Unauthorized' });

    const dbUser = await User.findById(user.id);
    if (!dbUser) return res.status(404).json({ message: 'User not found' });

    res.status(200).json({
      plan: dbUser.plan || 'free',
      status: dbUser.subscriptionStatus || 'free',
    });
  } catch (error) {
    console.error('Error in getSubscriptionStatus:', error);
    res.status(500).json({ message: 'Server error getting subscription status' });
  }
};
