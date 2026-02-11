import { Request, Response } from "express";
import crypto from "crypto";

const RAZORPAY_KEY_ID = "rzp_live_SCoOWhO22Q4yKo";
const RAZORPAY_KEY_SECRET = "Geg9KY61FhTuvOKd7qLFRgfu";

// POST /api/create-razorpay-order
export async function createRazorpayOrder(req: Request, res: Response) {
    try {
        const { amount, currency = "INR", receipt } = req.body;

        if (!amount || amount <= 0) {
            res.status(400).json({ error: "Invalid amount" });
            return;
        }

        // Razorpay expects amount in paise (smallest currency unit)
        const amountInPaise = Math.round(amount * 100);

        const auth = Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString("base64");

        const response = await fetch("https://api.razorpay.com/v1/orders", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Basic ${auth}`,
            },
            body: JSON.stringify({
                amount: amountInPaise,
                currency,
                receipt: receipt || `receipt_${Date.now()}`,
            }),
        });

        const order = await response.json();

        if (!response.ok) {
            console.error("Razorpay order creation failed:", order);
            res.status(response.status).json({ error: order.error?.description || "Failed to create order" });
            return;
        }

        res.json({
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            key: RAZORPAY_KEY_ID,
        });
    } catch (err: any) {
        console.error("Razorpay order error:", err);
        res.status(500).json({ error: "Internal server error" });
    }
}

// POST /api/verify-razorpay-payment
export async function verifyRazorpayPayment(req: Request, res: Response) {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            res.status(400).json({ verified: false, error: "Missing required fields" });
            return;
        }

        // Verify the payment signature
        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac("sha256", RAZORPAY_KEY_SECRET)
            .update(body)
            .digest("hex");

        const isValid = expectedSignature === razorpay_signature;

        if (isValid) {
            res.json({ verified: true });
        } else {
            res.status(400).json({ verified: false, error: "Invalid signature" });
        }
    } catch (err: any) {
        console.error("Razorpay verification error:", err);
        res.status(500).json({ verified: false, error: "Internal server error" });
    }
}
