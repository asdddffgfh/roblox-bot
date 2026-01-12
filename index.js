const noblox = require("noblox.js");

// CONFIG
const SOURCE_GROUP_ID = 11411158; // Group A (required group)
const TARGET_GROUP_ID = 11994785; // Group B (ranked here)
const TARGET_RANK_ID = 246       // Rank to give in Group B
const CHECK_INTERVAL = 60 * 1000;

let previousMembers = new Set();

async function start() {
    const cookie = process.env.ROBLOSECURITY;
    await noblox.setCookie(cookie);
    console.log("🤖 Bot logged in");
    await syncMembers();
    setInterval(syncMembers, CHECK_INTERVAL);
}

async function syncMembers() {
    try {
        const members = await noblox.getMembers(SOURCE_GROUP_ID, "all");
        const currentMembers = new Set(members.map(m => m.userId));

        for (const userId of currentMembers) {
            if (!previousMembers.has(userId)) {
                const rank = await noblox.getRankInGroup(TARGET_GROUP_ID, userId);
                if (rank === 0) {
                    await noblox.setRank(TARGET_GROUP_ID, userId, TARGET_RANK_ID);
                    console.log(`✅ Ranked ${userId}`);
                }
            }
        }

        for (const userId of previousMembers) {
            if (!currentMembers.has(userId)) {
                const rank = await noblox.getRankInGroup(TARGET_GROUP_ID, userId);
                if (rank !== 0) {
                    await noblox.setRank(TARGET_GROUP_ID, userId, 0);
                    console.log(`❌ Unranked ${userId}`);
                }
            }
        }

        previousMembers = currentMembers;

    } catch (err) {
        console.error("⚠️ Error:", err.message);
    }
}

start();
