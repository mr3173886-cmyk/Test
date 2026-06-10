const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "chutiya",
    aliases: ["toxic", "gali"],
    version: "1.5.0",
    author: "Mr.King 🎭",
    countDown: 2,
    role: 0,
    category: "fun",
    guide: {
      en: "{pn} (reply to someone) - To roast\n{pn} add (reply) - Give permission\n{pn} remove (reply) - Take permission\n{pn} remove all - Clear list"
    }
  },

  onStart: async function ({ api, event, args, message }) {
    const { threadID, messageID, senderID, messageReply, mentions } = event;
    const adminUID = "100025325472659"; // তোর মেইন আইডি
    const filePath = path.join(__dirname, "cache/permitted_users.json");

    // ফাইল চেক ও ডাটা লোড
    if (!fs.existsSync(filePath)) fs.writeFileSync(filePath, JSON.stringify([adminUID]));
    let permittedUsers = JSON.parse(fs.readFileSync(filePath));

    // ১. পারমিশন ম্যানেজমেন্ট (শুধুমাত্র তুই পারবি)
    if (args[0] === "add") {
      if (senderID !== adminUID) return message.reply("Hop mc stan er nati , Boss er Kase permission niye ay 🥭👶🏼👈🏼");
      if (!messageReply) return message.reply("⚠️ কারে পারমিশন দিবি তারে রিপ্লাই দে!");
      
      const targetID = messageReply.senderID;
      if (!permittedUsers.includes(targetID)) {
        permittedUsers.push(targetID);
        fs.writeFileSync(filePath, JSON.stringify(permittedUsers, null, 2));
        return message.reply("✅ ওরে পারমিশন দেওয়া হইছে, এখন ও কোপাইতে পারবে!");
      } else {
        return message.reply("⚠️ ও তো অলরেডি লিস্টে আছে!");
      }
    }

    if (args[0] === "remove") {
      if (senderID !== adminUID) return message.reply("Hop mc stan er nati , Boss er Kase permission niye ay 🥭👶🏼👈🏼");
      if (args[1] === "all") {
        fs.writeFileSync(filePath, JSON.stringify([adminUID]));
        return message.reply("🧹 পারমিশন লিস্ট ক্লিয়ার করা হইছে। এখন শুধু বস পারবে!");
      }
      if (!messageReply) return message.reply("⚠️ কার পারমিশন কাটবি তারে রিপ্লাই দে!");
      
      const targetID = messageReply.senderID;
      permittedUsers = permittedUsers.filter(id => id !== targetID);
      fs.writeFileSync(filePath, JSON.stringify(permittedUsers, null, 2));
      return message.reply("🚫 ওর পারমিশন কেড়ে নেওয়া হইছে!");
    }

    // ২. গালি দেওয়ার মেইন লজিক
    if (!permittedUsers.includes(senderID)) {
      return message.reply("Hop mc stan er nati , Boss er Kase permission niye ay 🥭👶🏼👈🏼");
    }

    if (!messageReply) return message.reply("⚠️ কারে গালি দিবি তারে রিপ্লাই তো দে আগে!");

    const targetUID = messageReply.senderID;
    const info = await api.getUserInfo(targetUID);
    const name = info[targetUID].name;

    const galiList = [
      "Abe chomu gf namok jinis ta to nai, guitar e to bajas. 🎸",
      "Hop fawl sop faltu Kotha Koy, tor kothar dam 2 takar o nai! 💩",
      "Jokoni mukh khule gondho e choray, akta mask pore ay agey. 😷",
      "Biye hoibo but bacchar bap Tawhid Hobe, tui sudhu side e thakbi. 👶🏼",
      "Tor moto faltu polapain rasta ghate 100 ta pawa jay, fuaa diley ure jabi! 🌀",
      "Abe tor chehara to dekhte tikitikir lej er moto, r kotha kos neta neta. 🦎",
      "Brain e kisu thakle to kotha koiti, bhitore to sudhu gobor bhara. 🧠🗑️",
      "Tor kotha sunle mone hoy speaker e keu p*d diche, thama tor gayer gondho! 💨",
      "Gf nai dekhe guitar e bajash, ekhon guitar er tar die nijere fashi de. 🎸💀",
      "Tor thobra dekhle mone hoy cycle er tyre e hawa dewar pump, faltu kothakar! 🚲"
    ];

    // ১০টা গালি লুপ করে ট্যাগ সহ পাঠানো
    for (let i = 0; i < galiList.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 1500)); // ১.৫ সেকেন্ড গ্যাপ যাতে বট মিউট না হয়
      api.sendMessage({
        body: `@${name} ${galiList[i]}`,
        mentions: [{ tag: `@${name}`, id: targetUID }]
      }, threadID);
    }
  }
};