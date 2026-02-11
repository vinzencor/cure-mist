import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Load Razorpay credentials from environment variables
        const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || '';
        const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || '';

        // Validate credentials are loaded
        if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
            console.error('Razorpay credentials not configured');
            return res.status(500).json({ error: 'Payment gateway not configured' });
        }

        const { amount, currency = 'INR', receipt } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({ error: 'Invalid amount' });
        }

        // Razorpay expects amount in paise (smallest currency unit)
        const amountInPaise = Math.round(amount * 100);

        const auth = Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString('base64');

        const response = await fetch('https://api.razorpay.com/v1/orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Basic ${auth}`,
            },
            body: JSON.stringify({
                amount: amountInPaise,
                currency,
                receipt: receipt || `receipt_${Date.now()}`,
            }),
        });

        // Handle empty or malformed responses
        const responseText = await response.text();
        let order;

        try {
            order = responseText ? JSON.parse(responseText) : {};
        } catch (parseError) {
            console.error('Failed to parse Razorpay response:', responseText);
            return res.status(500).json({ error: 'Invalid response from payment gateway' });
        }

        if (!response.ok) {
            console.error('Razorpay order creation failed:', order);
            return res.status(response.status).json({
                error: order.error?.description || 'Failed to create order'
            });
        }

        return res.json({
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            key: RAZORPAY_KEY_ID,
        });
    } catch (err: any) {
        console.error('Razorpay order error:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
