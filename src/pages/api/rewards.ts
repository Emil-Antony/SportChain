import fs from "fs";
import path from "path";
import { NextApiRequest, NextApiResponse } from "next";
import nodemailer from "nodemailer"

const giftCardsFile = path.join(process.cwd(), "public", "giftcards.json");

function readGiftCards() {
  if (!fs.existsSync(giftCardsFile)) return [];
  return JSON.parse(fs.readFileSync(giftCardsFile, "utf-8"));
}

function writeGiftCards(data:any) {
  fs.writeFileSync(giftCardsFile, JSON.stringify(data, null, 2));
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST" && req.body.admin) {
    // Admin adds a new gift card
    const { name, price} = req.body;
    const giftCards = readGiftCards();
    giftCards.push({ name, price});
    writeGiftCards(giftCards);
    return res.status(200).json({ message: "Gift card added successfully" });
  }

  if (req.method === "DELETE") {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Reward name is required" });
    }

    let rewards = readGiftCards();
    const updatedRewards = rewards.filter((reward: any) => reward.name !== name);

    if (rewards.length === updatedRewards.length) {
      return res.status(404).json({ error: "Reward not found" });
    }

    writeGiftCards(updatedRewards);
    return res.status(200).json({ message: "Reward removed successfully" });
  }


  if (req.method === "GET") {
    const giftCards = readGiftCards();
    return res.status(200).json(giftCards);
  }

  if (req.method === "POST" && req.body.redeem) {
    // User purchases a gift card
    const { email, name } = req.body;
    let giftCards = readGiftCards();
    let cardIndex = giftCards.findIndex(c => c.name === name);

    if (cardIndex === -1) return res.status(400).json({ error: "Gift card unavailable" });

    function generateGiftCardCode() {
      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
      const segment = (length) => Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
      return `${segment(4)}-${segment(6)}-${segment(5)}`;
    }
    
    let giftCard = giftCards[cardIndex];
    let giftCardCode = generateGiftCardCode();

    // Send email with the gift card code
    let transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: { user: "SportChainOfficial@gmail.com", pass: "oquu ohic xkoz wopz" }
    });

    await transporter.sendMail({
      from: "noreply@yourdomain.com",
      to: email,
      subject: "Your Gift Card",
      text: `You've received a ${giftCard.name} gift card! Code: ${giftCardCode}`
    });

    return res.status(200).json({ message: "Gift card sent successfully" });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
