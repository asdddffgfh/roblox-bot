const noblox = require("noblox.js");

// ========== CONFIG ==========
const COOKIE = "_|WARNING:-DO-NOT-SHARE-THIS.--Sharing-this-will-allow-someone-to-log-in-as-you-and-to-steal-your-ROBUX-and-items.|_CAEaAhADIhsKBGR1aWQSEzEzNjE4NTQ4NzIzNzMzMjExODAoAw.3CfKMiDECiYjgu5hEAwodeEkfKPlxcYDAmlRML8DgxYjCOs5vpjDnh7rT5TsqH8zIFnNYourYD0_ad9SlD7dSVZ6aVidb0UblvKvV7ayq5rfdbez1mT97g6G0lenSp53HDH0trXHRprdsw8VY3pgzlikNXdauXbKZWFqeQHsplh9TlF0vHNbFAoJrgMCizvk90hbJgI3xDJ-tUFODXc06vNo24LrrlCIy12HZpU-IJkRPykPLKZzYVbYFOoFU_q7OlKelOlrx6wMUTsUOi3Y6I9JNWkPN7IA3p-QHzGRxNy8mMd6B7HXwrpRK0QqNJH7TdoF6H1J--2l9Gwqu0LRXa1yDl1oCfgjLdvuQzPBlJSHH7GSokJInE2N7oHHkzNdxKo6ossQ3xCI5XlVACJAdJkkmnpICv3ZVEcTqbY5Y1HpbBbSBFPrWCB9blmJFTkPJeGch7bQF9PKpE6pvfTDjrm8Xw_UVZjHuWmre_ucUIAhvbqCVEbJY0ZF6nftRub__Q61knnGv1vVB_6CpuSb_OD-c5CGPhfy4rfNgXtyKKtgwNuDg5M68yXMlW453SHC3Vf8r2RHp56brmRTzC8HlsxJwgszd2FZMPNDBpMxBHHiJZCZGxSriodxx0mHQeKuPmFBn8ge7gfNAI0yXlchdF7fBNIdzUk7nzSV4WpQtED_pW99RNKmJzR3gvzWn2PvlXfSHWRRKtUiebpabDQRtm0rSYCTMgpgSZgj1ZNZXQG_6HONy8l9hMcs23yiYVrxWxht9q8fDEV_jBIkRr7cfxi4ZDg"; // Replace with your .ROBLOSECURITY
const GROUP_A_ID = 11994785; // Group to rank in
const GROUP_B_ID = 11411158; // Group to check
const GROUP_A_RANK = 246; // Rank number in Group A
const CHECK_INTERVAL = 60 * 1000; // Check every 60 seconds
// ============================

async function login() {
  try {
    const currentUser = await noblox.setCookie(COOKIE);
    console.log("Logged in as:", currentUser.UserName);
  } catch (err) {
    console.error("Login failed:", err);
    process.exit(1); // Stop bot if login fails
  }
}

async function getGroupBUsers() {
  try {
    const members = await noblox.getPlayers(GROUP_B_ID);
    return members.map(m => m.userId);
  } catch (err) {
    console.error("Failed to get Group B members:", err);
    return [];
  }
}

async function checkAndRank() {
  try {
    const groupBUsers = await getGroupBUsers();

    // Optional: keep track of who we ranked already
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

    // Optional: Unrank users who left Group B
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

async function startBot() {
  await login();
  console.log("Bot is running...");

  // Run the check immediately, then repeat every CHECK_INTERVAL
  await checkAndRank();
  setInterval(checkAndRank, CHECK_INTERVAL);
}

startBot();
