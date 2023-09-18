const express = require("express");
const cors = require("cors");
const menuList = require("./data/menuList.json");
const fs = require("fs");
const users = require("./data/auth/Users.json");
const app = express();
const port = 5000;
const jwt = require("jsonwebtoken");

const { getRssByUrl } = require("./utils/index");

app.use(cors());
app.use(express.json());

const rssFeeds = {
  gundem: "https://www.ntv.com.tr/gundem.rss",
  dunya: "https://www.ntv.com.tr/dunya.rss",
  finans: "https://www.ntv.com.tr/ekonomi.rss",
  spor: "https://www.ntv.com.tr/spor.rss", // spor
  teknoloji: "https://www.ntv.com.tr/teknoloji.rss",
  egitim: "https://www.ntv.com.tr/egitim.rss ",
};

app.get(`/api/egitim`, async (req, res) => {
  try {
    const feedData = await getRssByUrl(rssFeeds.egitim);
    res.json(feedData);
  } catch (error) {
    console.error("Detailed error:", error);
    res.status(500).json({ error: "Error fetching or parsing the RSS feed" });
  }
});

app.get(`/api/teknoloji`, async (req, res) => {
  try {
    const feedData = await getRssByUrl(rssFeeds.teknoloji);
    res.json(feedData);
  } catch (error) {
    console.error("Detailed error:", error);
    res.status(500).json({ error: "Error fetching or parsing the RSS feed" });
  }
});

app.get(`/api/spor`, async (req, res) => {
  try {
    const feedData = await getRssByUrl(rssFeeds["spor"]);
    res.json(feedData);
  } catch (error) {
    console.error("Detailed error:", error);
    res.status(500).json({ error: "Error fetching or parsing the RSS feed" });
  }
});

app.get(`/api/finans`, async (req, res) => {
  try {
    const feedData = await getRssByUrl(rssFeeds["finans"]);
    res.json(feedData);
  } catch (error) {
    console.error("Detailed error:", error);
    res.status(500).json({ error: "Error fetching or parsing the RSS feed" });
  }
});

app.get(`/api/dunya`, async (req, res) => {
  try {
    const feedData = await getRssByUrl(rssFeeds["dunya"]);
    res.json(feedData);
  } catch (error) {
    console.error("Detailed error:", error);
    res.status(500).json({ error: "Error fetching or parsing the RSS feed" });
  }
});

app.get(`/api/gundem`, async (req, res) => {
  try {
    const feedData = await getRssByUrl(rssFeeds["gundem"]);
    res.json(feedData);
  } catch (error) {
    console.error("Detailed error:", error);
    res.status(500).json({ error: "Error fetching or parsing the RSS feed" });
  }
});

app.get("/detail", async (req, res) => {
  try {
    const { feedUrl, id } = req.query;
    const feedData = await getRssByUrl(rssFeeds[feedUrl]);

    const test = feedData.find((d) => d.id === id);
    res.json(test);
  } catch (error) {
    console.error("Detailed error:", error);
    res.status(500).json({ error: "Error fetching or parsing the RSS feed" });
  }
});

app.get("/menu-list", (req, res) => {
  res.json(menuList);
});

app.get("/users", (req, res) => {
  res.json(users);
});

app.post("/users/login", (req, res) => {
  const { username, password } = req.body;

  const user = users.find(
    (u) => u.username === username && u.password === password
  );

  if (user) {
    // JWT oluşturma
    const token = jwt.sign({ username: user.username }, "YOUR_SECRET_KEY", {
      expiresIn: "1h",
    });

    res.json({ token });
  } else {
    res.status(401).json({ error: "Geçersiz bilgi" });
  }
});

app.post("/users", (req, res) => {
  const loginData = req.body;
  console.log("Gelen veriler", loginData);

  const loginJson = fs.readFileSync("./data/auth/Users.json", "utf-8");
  const data = JSON.parse(loginJson);

  data.push(loginData);

  const updatedLoginData = JSON.stringify(data, null, 2);
  fs.writeFileSync("./data/auth/Users.json", updatedLoginData, "utf-8");

  console.log("Veri kaydetme başarılı");
  res.status(200).json({ message: "veri başarıyla kaydedildi" });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something went wrong!");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
