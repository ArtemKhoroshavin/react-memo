const leaderboardURL = "https://wedev-api.sky.pro/api/v2/leaderboard";

export async function getLeaders() {
  const response = await fetch(leaderboardURL, {
    method: "GET",
  });
  if (response.status !== 200) {
    throw new Error("Ошибка получения данных");
  } else {
    const data = await response.json();

    return data;
  }
}

export async function addLeader({ name, time, achievements }) {
  const response = await fetch(leaderboardURL, {
    method: "POST",
    body: JSON.stringify({ name, time, achievements }),
  });
  if (response.status === 201) {
    const data = await response.json();
    return data;
  } else {
    throw new Error("Ошибка получения данных");
  }
}
