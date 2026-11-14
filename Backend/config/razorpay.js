import Razorpay from "razorpay";

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});


console.log("RAZORPAY ENV CHECK:", {
    keyExists: !!process.env.RAZORPAY_KEY_ID,
    secretExists: !!process.env.RAZORPAY_KEY_SECRET,
    keyPrefix: process.env.RAZORPAY_KEY_ID?.slice(0, 9)
});

console.log("RAZORPAY ENV CHECK:", {
    keyId: JSON.stringify(process.env.RAZORPAY_KEY_ID),
    secretLength: process.env.RAZORPAY_KEY_SECRET?.length,
});
export default razorpay;