// src/lib/subscription.ts
import Stripe from 'stripe';
import dbConnect from './db';
import Subscription from '@/models/Subscription';
import Channel from '@/models/Channel';
import User from '@/models/User';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export async function createSubscription(
  userId: string,
  channelId: string,
  paymentMethodId: string
) {
  await dbConnect();
  
  const channel = await Channel.findById(channelId);
  if (!channel) {
    throw new Error('Channel not found');
  }
  
  if (channel.isFree) {
    return await createFreeSubscription(userId, channelId);
  }
  
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }
  
  try {
    const customer = await getOrCreateCustomer(user);
    
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price_data: {
        currency: 'usd',
        product_data: {
          name: channel.name,
          description: channel.description,
        },
        unit_amount: channel.price * 100,
        recurring: { interval: 'month' },
      }}],
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent'],
    });
    
    const dbSubscription = await Subscription.create({
      userId,
      channelId,
      stripeSubscriptionId: subscription.id,
      status: 'pending',
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      autoRenew: true,
      amount: channel.price,
      paymentMethod: 'stripe',
      nextPaymentDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });
    
    return {
      subscriptionId: subscription.id,
      clientSecret: (subscription.latest_invoice as any)?.payment_intent?.client_secret,
      dbSubscription,
    };
  } catch (error) {
    console.error('Stripe subscription error:', error);
    throw new Error('Failed to create subscription');
  }
}

async function getOrCreateCustomer(user: any) {
  const customers = await stripe.customers.list({ email: user.email, limit: 1 });
  
  if (customers.data.length > 0) {
    return customers.data[0];
  }
  
  return stripe.customers.create({
    email: user.email,
    name: user.name,
    metadata: { userId: user._id.toString() },
  });
}

async function createFreeSubscription(userId: string, channelId: string) {
  const existingSubscription = await Subscription.findOne({
    userId,
    channelId,
    status: 'active',
  });
  
  if (existingSubscription) {
    return existingSubscription;
  }
  
  return Subscription.create({
    userId,
    channelId,
    status: 'active',
    startDate: new Date(),
    endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    autoRenew: false,
    amount: 0,
    paymentMethod: 'free',
  });
}

export async function cancelSubscription(subscriptionId: string) {
  await dbConnect();
  
  const subscription = await Subscription.findOne({ stripeSubscriptionId: subscriptionId });
  if (!subscription) {
    throw new Error('Subscription not found');
  }
  
  if (subscription.stripeSubscriptionId) {
    await stripe.subscriptions.update(subscriptionId, { cancel_at_period_end: true });
  }
  
  subscription.status = 'cancelled';
  subscription.autoRenew = false;
  await subscription.save();
  
  return subscription;
}

export async function handleWebhook(event: Stripe.Event) {
  await dbConnect();
  
  switch (event.type) {
    case 'invoice.payment_succeeded':
      const invoice = event.data.object as Stripe.Invoice;
      await handleSuccessfulPayment(invoice);
      break;
      
    case 'customer.subscription.deleted':
      const subscription = event.data.object as Stripe.Subscription;
      await handleSubscriptionDeletion(subscription);
      break;
      
    case 'invoice.payment_failed':
      const failedInvoice = event.data.object as Stripe.Invoice;
      await handleFailedPayment(failedInvoice);
      break;
  }
}

async function handleSuccessfulPayment(invoice: Stripe.Invoice) {
  const subscriptionId = invoice.subscription as string;
  const dbSubscription = await Subscription.findOne({ stripeSubscriptionId: subscriptionId });
  
  if (dbSubscription) {
    dbSubscription.status = 'active';
    dbSubscription.lastPaymentDate = new Date();
    dbSubscription.nextPaymentDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    await dbSubscription.save();
  }
}

async function handleSubscriptionDeletion(subscription: Stripe.Subscription) {
  const dbSubscription = await Subscription.findOne({ stripeSubscriptionId: subscription.id });
  
  if (dbSubscription) {
    dbSubscription.status = 'expired';
    dbSubscription.autoRenew = false;
    await dbSubscription.save();
  }
}

async function handleFailedPayment(invoice: Stripe.Invoice) {
  const subscriptionId = invoice.subscription as string;
  const dbSubscription = await Subscription.findOne({ stripeSubscriptionId: subscriptionId });
  
  if (dbSubscription) {
    dbSubscription.status = 'pending';
    await dbSubscription.save();
  }
}