const axios = require("axios");
const { parseString } = require("xml2js");
const cheerio = require("cheerio");

const convertTextToId = (val) => {
  const result = val
    .replace("Ğ", "g")
    .replaceAll("Ü", "u")
    .replaceAll("Ş", "s")
    .replaceAll("I", "i")
    .replaceAll("İ", "i")
    .replaceAll("Ö", "o")
    .replaceAll("Ç", "c")
    .replaceAll("ğ", "g")
    .replaceAll("ü", "u")
    .replaceAll("ş", "s")
    .replaceAll("ı", "i")
    .replaceAll("ö", "o")
    .replaceAll("ç", "c");

  const kebabCase = (text) =>
    text
      .match(
        /[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g
      )
      .map((x) => x.toLowerCase())
      .join("-");

  return kebabCase(result.toLowerCase());
};

const formatContent = (content) => {
  try {
    const result = cheerio.load(content);
    const imgSrc = result("img.type\\:primaryImage").attr("src");
    const imgAlt = result("img.type\\:primaryImage").attr("alt");

    return {
      image: imgSrc,
      imgAlt: imgAlt,
    };
  } catch (error) {
    console.error("Error parsing HTML content:", error.message);
    throw new Error("Error parsing HTML content");
  }
};

const fetchAndParseRSS = async (url) => {
  try {
    const response = await axios.get(url);
    const xmlData = response.data;
    let parsedData = await parseStringPromise(xmlData);

    let items;
    if (
      parsedData.rss &&
      parsedData.rss.channel &&
      parsedData.rss.channel[0].item
    ) {
      items = parsedData.rss.channel[0].item;
    } else if (parsedData.feed && parsedData.feed.entry) {
      items = parsedData.feed.entry;
    } else {
      throw new Error("Unknown XML feed format");
    }
    return items;
  } catch (error) {
    throw error;
  }
};

const parseStringPromise = (xml) => {
  return new Promise((resolve, reject) => {
    parseString(xml, (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });
};

const getRssByUrl = async (rssUrl) => {
  const feedData = await fetchAndParseRSS(rssUrl);

  const formattedData = feedData.map((item) => {
    const { image, imgAlt } = formatContent(item.content[0]._);

    return {
      id: convertTextToId(item.title[0]._),
      title: item.title[0]._,
      content: item.content[0]._,
      image: image,
      imageAlt: imgAlt,
    };
  });

  return formattedData;
};

module.exports = { getRssByUrl };
