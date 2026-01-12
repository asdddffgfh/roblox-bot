// ================== IMPORT ==================
const noblox = require("noblox.js");

// ================== CONFIG ==================
const GROUP_A_ID = 11994785; // Replace with your Group A ID
const GROUP_B_ID = 11411158; // Replace with your Group B ID
const GROUP_A_RANK = 246;    // Rank number to give in Group A
const CHECK_INTERVAL = 60 * 1000; // Check every 60 seconds
// ============================================

// Read Roblox cookie from environment variable
const COOKIE = process.env.ROBLOSECURITY;
if (!COOKIE) {
  console.error("Error: ROBLOSECURITY environment variable is missing!");
  process.exit(1);
}

// ================== LOGIN ==================
async function login() {
  try {
    const currentUser = await noblox.setCookie(COOKIE);
    console.log("Logged in as:", currentUser.UserName);
  } catch (err) {
    console.error("Login failed:", err);
    process.exit(1);
  }
}

// ================== GET GROUP B MEMBERS ==================
async function getGroupBUsers() {
  try {
    const members = await noblox.getPlayers(GROUP_B_ID);
    return members.map(m => m.userId);
  } catch (err) {
    console.error("Failed to get Group B members:", err);
    return [];
  }
}

// ================== RANKING LOGIC ==================
async function checkAndRank() {
  try {
    const groupBUsers = await getGroupBUsers();
    const rankedUsers = await noblox.getPlayers(GROUP_A_ID);

    // Rank users who are in Group B but not in Group A
    for (const userId of groupBUsers) {
      const alreadyRanked = rankedUsers.some(u => u.userId === userId);
      if (!alreadyRanked) {
        try {
          await noblox.setRank(GROUP_A_ID, userId, GROUP_A_RANK);
          console.log(`Ranked user ${userId} in Group A!`);
        } catch (err) {
          console.error(`Failed to rank user ${userId}:`, err);
        }
      }
    }

    // Unrank users who left Group B
    for (const user of rankedUsers) {
      if (!groupBUsers.includes(user.userId)) {
        try {
          await noblox.setRank(GROUP_A_ID, user.userId, 0); // 0 = leave group
          console.log(`Unranked user ${user.userId} because they left Group B.`);
        } catch (err) {
          console.error(`Failed to unrank user ${user.userId}:`, err);
        }
      }
    }
  } catch (err) {
    console.error("Error in checkAndRank:", err);
  }
}

// ================== BOT START ==================
async function startBot() {
  await login();
  console.log("Bot is running...");

  // Initial check
  await checkAndRank();

  // Repeat every CHECK_INTERVAL
  setInterval(checkAndRank, CHECK_INTERVAL);
}

startBot();

