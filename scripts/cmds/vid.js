const axios = require("axios");

let currentIndex = 0;
let videoList = []; // ডাটাবেজের ভিডিও লিস্ট ক্যাশ করে রাখার জন্য

// ডাটাবেজ থেকে ভিডিও লোড করার কমন ফাংশন
async function syncDatabase(api, event, isManual = false) {
    try {
        const res = await axios.get("https://video-uy9p.onrender.com/api/videos");
        const data = res.data;

        if (!data || !data.success || !data.videos || data.videos.length === 0) {
            videoList = [];
            if (isManual) api.sendMessage("❌ ডাটাবেজে কোনো ভিডিও লিংক পাওয়া যায়নি ভাই!", event.threadID, event.messageID);
            return false;
        }

        videoList = data.videos;
        if (isManual) {
            api.sendMessage(`🔄 Sync Successful! ডাটাবেজ থেকে মোট ${videoList.length} টি ভিডিও লিংক বটের মেমরিতে লোড করা হয়েছে।`, event.threadID, event.messageID);
        }
        return true;
    } catch (err) {
        console.error(err);
        if (isManual) api.sendMessage("❌ ডাটাবেজ সিঙ্ক করতে সমস্যা হয়েছে! সার্ভার চেক করুন।", event.threadID, event.messageID);
        return false;
    }
}

module.exports.config = {
    name: "vid",
    aliases: ["lol"],
    version: "6.0",
    author: "Roni",
    role: 0,
    category: "media",
    guide: { en: "Use {p}vid to get video sequentially or {p}vid sync to refresh database." }
};

module.exports.onChat = async ({ api, event }) => {
    if (event.senderID == api.getCurrentUserID()) return;

    const message = event.body ? event.body.trim() : "";
    
    if (message === "👻") {
        try {
            api.setMessageReaction("👀", event.messageID, () => {}, true);
            
            // যদি মেমরিতে কোনো লিস্ট না থাকে, তবে অটো সিঙ্ক করে নিবে
            if (videoList.length === 0) {
                const isSynced = await syncDatabase(api, event, false);
                if (!isSynced) return;
            }

            if (currentIndex >= videoList.length) {
                currentIndex = 0;
            }

            const targetVideo = videoList[currentIndex];
            currentIndex++;

            const videoUrl = targetVideo.url;

            api.sendMessage({
                body: "Here is your video! 👻📹",
                attachment: [await global.utils.getStreamFromURL(videoUrl)]
            }, event.threadID, () => {
                api.setMessageReaction("🔥", event.messageID, () => {}, true);
            }, event.messageID);

        } catch (err) {
            console.error(err);
        }
    }
};

module.exports.onStart = async ({ api, event, args }) => {
    // যদি ইউজার '/vid sync' দেয়
    if (args[0] && args[0].toLowerCase() === "sync") {
        api.setMessageReaction("⏳", event.messageID, () => {}, true);
        return await syncDatabase(api, event, true);
    }

    try {
        api.setMessageReaction("👀", event.messageID, () => {}, true);

        // যদি মেমরিতে কোনো লিস্ট না থাকে, তবে অটো সিঙ্ক করে নিবে
        if (videoList.length === 0) {
            const isSynced = await syncDatabase(api, event, false);
            if (!isSynced) return;
        }

        if (currentIndex >= videoList.length) {
            currentIndex = 0;
        }

        const targetVideo = videoList[currentIndex];
        currentIndex++;

        const videoUrl = targetVideo.url;

        api.sendMessage({
            body: "Here is your video! 📹✨",
            attachment: [await global.utils.getStreamFromURL(videoUrl)]
        }, event.threadID, () => {
            api.setMessageReaction("🔥", event.messageID, () => {}, true);
        }, event.messageID);

    } catch (err) {
        console.error(err);
        api.sendMessage("❌ ভিডিওটি পাঠাতে সমস্যা হয়েছে বা লিংকটি নষ্ট!", event.threadID, event.messageID);
    }
};
