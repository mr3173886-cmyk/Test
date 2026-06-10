const axios = require('axios');

module.exports = {
    config: {
        name: "caption",
        version: "1.3",
        author: "Mr. King",
        countDown: 5,
        role: 0,
        shortDescription: "Caption system",
        longDescription: "Get and add captions. Use !cp or !Cp as aliases.",
        category: "Utility",
        aliases: ["cp", "Cp"]
    },

    onStart: async function({ api, event, args }) {
        const { threadID, messageID, senderID } = event;
        const ADMIN_UID = "61590317176239";
        const API_URL = "https://caption-sote.onrender.com/api/captions";

        // 1. ADD CAPTION LOGIC
        if (args[0] === "add") {
            if (senderID !== ADMIN_UID) return api.sendMessage("This command is only for the Admin!", threadID, messageID);
            
            const category = args[1];
            const text = args.slice(2).join(" ");
            
            if (!category || !text) return api.sendMessage("Format: !caption add [category] [text]", threadID);

            try {
                await axios.post(API_URL, { text, category });
                api.sendMessage(`✅ Caption successfully saved to ${category} category!`, threadID);
            } catch (e) {
                api.sendMessage("❌ Failed to save caption to the database.", threadID);
            }
            return;
        }

        // 2. LIST CATEGORIES LOGIC (If no category provided)
        if (!args[0]) {
            try {
                const res = await axios.get(API_URL); 
                const allData = res.data.captions || [];
                const categories = [...new Set(allData.map(c => c.category))];
                
                if (categories.length === 0) return api.sendMessage("No categories available yet.", threadID);
                return api.sendMessage("Available categories:\n" + categories.join(", "), threadID);
            } catch (e) {
                return api.sendMessage("Usage: !caption [category] (or !cp [category])", threadID);
            }
        }

        // 3. FETCH RANDOM CAPTION LOGIC (Case-Insensitive)
        try {
            const inputCategory = args[0];
            const res = await axios.get(API_URL);
            const allData = res.data.captions || [];

            // Case-insensitive filtering
            const filtered = allData.filter(c => c.category.toLowerCase() === inputCategory.toLowerCase());

            if (filtered.length === 0) return api.sendMessage(`No captions found for category: ${inputCategory}`, threadID);

            const randomCaption = filtered[Math.floor(Math.random() * filtered.length)].text;
            api.sendMessage(`${randomCaption}\n\n✨ CP by Mr.King🕊️`, threadID, messageID);
        } catch (e) {
            api.sendMessage("❌ Could not connect to the server or category not found.", threadID);
        }
    }
};
