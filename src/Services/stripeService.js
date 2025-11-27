// import { loadStripe } from "@stripe/stripe-js";
// import axios from "axios";

// const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

// export const purchaseCoin = async (coin) => {
//   const stripe = await stripePromise;

//   try {
//     const res = await axios.post(
//       "http://localhost:5050/api/payment/create-checkout-session",
//       {
//         coin_id: coin.id,
//         coinName: coin.name,
//         coinPriceUSD: coin.current_price,
//         coinSymbol: coin.symbol,
//         image: coin.image,
//         user_id: coin.user_id,
//       }
//     );

//     if (res.data.sessionId) {
//       const result = await stripe.redirectToCheckout({
//         sessionId: res.data.sessionId,
//       });

//       if (result.error) {
//         console.error("Stripe Error:", result.error.message);
//       }
//     }
//   } catch (error) {
//     console.error("Stripe Checkout Error", error);
//   }
// };
