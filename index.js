const Stripe = require("stripe");
const express = require("express");
const cors = require("cors");
const app = express();

require("dotenv").config();
const stripe = Stripe(process.env.STRIPE);
app.use(cors());
app.use(express.json());
app.post("/create-checkout-session", async (req, res) => {
  const { orders, billId } = req.body;
  const lineItems = orders.map((room) => {
    return {
      price_data: {
        currency: "thb",
        unit_amount: (room.price * room.totalRoom) * 100,
        product_data: {
          name: room?.roomName || "unknow",
          // images: [room.coverImage],
          metadata: {
            id: room.id,
          },
        },
      },
      quantity: room.amountDay,
    };
  });
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    shipping_address_collection: {
      allowed_countries: ["TH"],
    },
    phone_number_collection: {
      enabled: true,
    },
    success_url: `${process.env.CLIENT_URL}/success/${billId}`,
    cancel_url: `${process.env.CLIENT_URL}/cart`,
    line_items: lineItems,
  });
  res.send({ url: session.url, sessionId: session.id });
});

app.listen(3000, () => {
  console.log("Running on port 3000");
});
