"use strict";
// import Stripe from "stripe";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendStripePayment = sendStripePayment;
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
/**
 * Sends payment using Stripe.
 * @param {string} to - The recipient's email.
 * @param {string} amount - The amount in USD.
 */
async function sendStripePayment(to, amount) {
    try {
        // Create a Stripe product
        const product = await stripe.products.create({
            name: "Some Product",
        });
        if (!product) {
            return { success: false, message: "Failed to create product" };
        }
        // Create a price object with the provided amount
        var price = await stripe.prices.create({
            product: `${product.id}`,
            unit_amount: parseFloat(amount) * 100, // Convert amount to cents
            currency: "inr",
        });
        if (!price) {
            return { success: false, message: "Failed to create price" };
        }
        // Create a checkout session
        if (price.id) {
        }
        const session = await stripe.checkout.sessions.create({
            line_items: [
                {
                    price: `${price.id}`, // Corrected the template string usage
                    quantity: 1,
                },
            ],
            mode: "payment",
            success_url: "http://localhost:3000/success",
            cancel_url: "http://localhost:3000/cancel",
            customer_email: to,
        });
        if (!session) {
            return { success: false, message: "Failed to create checkout session" };
        }
        return { success: true, sessionId: session.id, url: session.url };
    }
    catch (error) {
        console.error("Stripe Payment Error:", error);
        // @ts-ignore
        return { success: false, message: error.message };
    }
}
