const API = (process.env.API_URL ?? "http://localhost:8000").replace(/\/+$/, "");

const USERS = [
  { email: "listener@example.com", username: "listener", password: "listener-pass-1" },
  { email: "critic@example.com", username: "critic", password: "critic-pass-1" },
];

const TRACKS = [
  ["Пустой перрон", 214],
  ["Ночной экспресс до Выборга", 287],
  ["Сигнальные огни", 198],
  ["Диспетчер", 251],
  ["Пять минут стоянки", 302],
  ["Туман над насыпью", 365],
  ["Обходчик", 176],
  ["Последняя электричка", 243],
  ["Конечная", null],
  ["Депо", 412],
];

const RATINGS = [
  [9, { 1: 9, 2: 10, 3: 7, 4: 8, 6: 9, 8: 10 }],
  [7, { 1: 8, 2: 9, 3: 6, 5: 7, 6: 8, 10: 6 }],
];

async function call(method, path, { token, json, form } = {}) {
  const headers = {};
  let body;
  if (token) headers.Authorization = `Bearer ${token}`;
  if (json) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(json);
  }
  if (form) body = new URLSearchParams(form);

  const response = await fetch(`${API}${path}`, { method, headers, body });
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;
  if (!response.ok) {
    const error = new Error(`${method} ${path} → ${response.status}: ${text}`);
    error.status = response.status;
    throw error;
  }
  return data;
}

async function signIn(user) {
  try {
    await call("POST", "/auth/register", { json: user });
    console.log(`  создан пользователь ${user.email}`);
  } catch (error) {
    if (error.status !== 409) throw error;
    console.log(`  пользователь ${user.email} уже есть`);
  }
  const { access_token } = await call("POST", "/auth/login", {
    form: { username: user.email, password: user.password },
  });
  return access_token;
}

async function main() {
  console.log(`API: ${API}\n`);
  console.log("Пользователи");
  const tokens = [];
  for (const user of USERS) tokens.push(await signIn(user));
  const [owner] = tokens;

  console.log("\nКаталог");
  const artist = await call("POST", "/artists", { token: owner, json: { name: "Северная ветка" } });
  const album = await call("POST", "/albums", {
    token: owner,
    json: { title: "Ночные станции", artist_id: artist.id, album_type: "album", release_date: "2019-11-08" },
  });
  const tracks = [];
  for (const [index, [title, duration]] of TRACKS.entries()) {
    tracks.push(
      await call("POST", `/albums/${album.id}/tracks`, {
        token: owner,
        json: { title, track_number: index + 1, duration_sec: duration },
      }),
    );
  }
  const emptyEp = await call("POST", "/albums", {
    token: owner,
    json: { title: "Черновики", artist_id: artist.id, album_type: "ep" },
  });
  console.log(`  исполнитель «${artist.name}», альбом «${album.title}» (${tracks.length} треков), EP без треков`);

  console.log("\nОценки");
  for (const [i, [albumRating, trackRatings]] of RATINGS.entries()) {
    const token = tokens[i];
    await call("PUT", `/albums/${album.id}/rating/me`, { token, json: { rating: albumRating } });
    for (const [number, rating] of Object.entries(trackRatings)) {
      await call("PUT", `/tracks/${tracks[number - 1].id}/rating/me`, { token, json: { rating } });
    }
    console.log(`  ${USERS[i].email}: альбом ${albumRating}, треков оценено ${Object.keys(trackRatings).length}`);
  }

  console.log("\nГотово. Откройте:");
  console.log(`  http://localhost:5173/albums/${album.id}   — альбом с треками`);
  console.log(`  http://localhost:5173/albums/${emptyEp.id}   — альбом без треков`);
  console.log(`  http://localhost:5173/albums/999999   — несуществующий альбом`);
}

main().catch((error) => {
  console.error(`\nОшибка: ${error.message}`);
  if (error.cause?.code === "ECONNREFUSED") {
    console.error("Бэкенд не отвечает. Запустите его: docker compose up --build");
  }
  process.exit(1);
});
