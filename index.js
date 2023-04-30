import { insert, getData } from './firebase.js';
import puppeteer from 'puppeteer';
import schedule from 'node-schedule';

const getArticles = async (page, sectionName) => {
  const data = [];
  const titles = await page.$$eval(`${sectionName} article .title`, (els) =>
    els.map((el) => el.textContent)
  );
  const images = await page.$$eval(`${sectionName} article img`, (els) =>
    els.map((el) => el.getAttribute('src'))
  );
  const cats = await page.$$eval(`${sectionName} article .cat`, (els) =>
    els.map((el) => el.textContent.split(' '))
  );
  const dates = await page.$$eval(`${sectionName} article .post-date`, (els) =>
    els.map((el) => el.getAttribute('title'))
  );
  const links = await page.$$eval(`${sectionName} article .title a`, (els) =>
    els.map((el) => el.getAttribute('href'))
  );

  for (let i = 0; i < titles.length; i++) {
    data.push({
      title: titles[i],
      url: images[i],
      category: cats[i],
      date: dates[i],
      link: links[i],
    });
  }

  return data;
};

const getArticleDetail = async (page, link) => {
  await page.goto(link);

  const images = await page.$$eval('.content .desc img', (els) =>
    els.map((el) => el.getAttribute('src'))
  );
  let content = await page.$eval('.content .desc', (el) => el.innerHTML);

  content = content
    .replace(/(?:\r\n|\r|\n)/g, '<br/>')
    .replace(/<img[^>]*>/g, '')
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script\s*>/gi, '');

  for (let i = 0; i < images.length - 1; i++) {
    content = content.replace(
      /<noscript\b[^<]*(?:(?!<\/noscript>)<[^<]*)*<\/noscript\s*>/,
      `<img src="${images[i]}" alt="img" />`
    );
  }

  return content;
};

const excute = async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('https://abmedia.io/blog');
  const docs = await getData();

  let res = [
    ...(await getArticles(page, '.loop-grid')),
    ...(await getArticles(page, '.loop-post')),
  ];

  res = res.filter((item) => !item.title.startsWith('EP'));

  for (let i = 0; i < res.length; i++) {
    const content = await getArticleDetail(page, res[i].link);
    res[i].content = content;
    await insert(res[i], docs);
  }
  await browser.close();
};

schedule.scheduleJob('30 * * * * *', function () {
  excute();
});
