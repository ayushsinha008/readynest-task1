import { Request, Response, NextFunction } from 'express';
import Stripe from 'stripe';
import User from '../models/User';

const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2025-01-27.acacia' as any }) 
  : null;

export const createCheckoutSession = async (req: any, res: Response, next: NextFunction) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ message: 'Unauthorized' });

    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    
    // Read plan from request body, default to pro
    const plan = req.body.plan === 'premium' ? 'premium' : 'pro';
    const unitAmount = plan === 'premium' ? 99900 : 49900;
    const planName = plan === 'premium' ? 'Premium Plan Subscription' : 'Pro Plan Subscription';

    // If no Stripe keys, use a Mock checkout
    if (!stripe) {
      console.log('No STRIPE_SECRET_KEY found. Using Mock Checkout.');
      
      // Update immediately for mock
      await User.findByIdAndUpdate(user.id, {
        subscriptionStatus: 'active',
        plan: plan,
        subscriptionId: 'sub_mock_' + Date.now(),
      });

      return res.status(200).json({ url: `${clientUrl}/success?session_id=mock_session_123` });
    }

    const dbUser = await User.findById(user.id);

    // Create a new Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      customer_email: dbUser?.email, // Pre-fill email
      metadata: {
        userId: user.id,
        plan: plan
      },
      line_items: [
        {
          price_data: {
            currency: 'inr',
            product_data: {
              name: planName,
              description: 'Unlimited forms, responses, and premium features',
            },
            unit_amount: unitAmount,
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        },
      ],
      success_url: `${clientUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${clientUrl}/cancel`,
      client_reference_id: user.id,
    });

    res.status(200).json({ url: session.url });
  } catch (error) {
    console.error('Error in createCheckoutSession:', error);
    res.status(500).json({ message: 'Server error creating checkout session' });
  }
};

export const getSubscriptionStatus = async (req: Request, res: Response) => {
  try {
    // @ts-ignore
    const user = req.user;
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

export const handleWebhook = async (req: Request, res: Response) => {
  if (!stripe) {
    return res.status(400).send('Webhook error: Stripe is not configured.');
  }

  const sig = req.headers['stripe-signature'] as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    // req.body must be raw string or buffer here
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret!);
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as any;
        const userId = session.client_reference_id;
        const subscriptionId = session.subscription as string;
        const customerId = session.customer as string;
        const plan = session.metadata?.plan || 'pro';

        if (userId) {
          await User.findByIdAndUpdate(userId, {
            stripeCustomerId: customerId,
            subscriptionId: subscriptionId,
            subscriptionStatus: 'active',
            plan: plan
          });
        }
        break;
      }
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as any;
        const customerId = subscription.customer as string;
        const status = subscription.status; // 'active', 'canceled', 'past_due'
        
        await User.findOneAndUpdate(
          { stripeCustomerId: customerId },
          { 
            subscriptionStatus: status,
            plan: status === 'active' ? 'pro' : 'free'
          }
        );
        break;
      }
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({ message: 'Webhook processing error' });
  }
};
