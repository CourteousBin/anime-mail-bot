import puppeteer from 'puppeteer-core';
import Imap from 'imap';
import { simpleParser } from 'mailparser';
import { imapConfig } from './config.js';

// 获取最新邮件的内容
async function fetchLatestEmail(imap, emailId) {
  return new Promise((resolve, reject) => {
    const fetch = imap.fetch(emailId, { bodies: '' });
    fetch.on('message', (msg) => {
      msg.on('body', (stream) => {
        simpleParser(stream, (err, mail) => {
          if (err) return reject(err);
          console.log('Subject:', mail.subject);
          console.log('From:', mail.from.text);
          console.log('Date:', mail.date);
          console.log('Text:', mail.text);

          if (mail.subject.includes('is your login code for Anime.com')) {
            const codeMatch = mail.text.match(/(\d{6})/);
            if (codeMatch) {
              const loginCode = codeMatch[1];
              console.log('Login code extracted:', loginCode);
              return resolve(loginCode);
            } else {
              console.log('No login code found in the email text.');
              return resolve(null);
            }
          } else {
            console.log('Email subject does not match.');
            return resolve(null);
          }
        });
      });
    });

    fetch.on('end', () => {
      console.log('Done fetching the latest message!');
    });
  });
}

// 启动 IMAP 连接并监听新邮件
async function startEmailListener(imapConfig) {
  const imap = new Imap(imapConfig);
  let lastEmailId = null;

  return new Promise((resolve, reject) => {
    function openInbox(cb) {
      imap.openBox('INBOX', true, cb);
    }

    imap.once('ready', () => {
      openInbox((err) => {
        if (err) return reject(err);
        imap.search(['ALL'], (err, results) => {
          if (err) return reject(err);
          if (results.length > 0) {
            lastEmailId = results[results.length - 1];
            console.log('Last email ID saved:', lastEmailId);
          }
          console.log('Inbox opened. Listening for new emails...');
          resolve(imap); // 连接成功，解析 Promise
        });
      });
    });

    imap.once('error', (err) => {
      console.error('Connection error:', err);
      reject(err); // 连接错误，拒绝 Promise
    });

    imap.once('end', () => {
      console.log('Connection ended');
    });

    imap.connect();
  });
}

// 使用 Puppeteer 输入邮箱并请求发送验证码
async function requestVerificationCode(email, imap) {
  const browser = await puppeteer.launch({
    // 请注意自己的 Chrome 路径
    // win默认路径在这里：'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
    // 默认 Mac 路径
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: false,
  });

  const page = await browser.newPage();
  await page.goto('https://www.anime.com/');
  await new Promise(resolve => setTimeout(resolve, 3000));
  await page.waitForSelector('.relative.flex.flex-row.flex-grow');

  const emailInput = await page.$('input[name="email"]');
  if (!emailInput) throw new Error('emailInput Not Valid');
  await emailInput.click({ clickCount: 3 });
  await page.keyboard.press('Backspace');
  await emailInput.type(email);
  await new Promise(resolve => setTimeout(resolve, 1000));

  const submitButton = await page.$('button[type="submit"]');
  if (!submitButton) throw new Error('submitButton Not Valid');
  await submitButton.click();
  console.log('Verification email sent.');

  const loginCode = await waitForVerificationCode(imap, page);
  // await browser.close(); // 关闭浏览器
  return loginCode;
}

// 等待验证码
async function waitForVerificationCode(imap, page) {
  return new Promise((resolve) => {
    imap.on('mail', async () => {
      console.log(`New mail received`);
      imap.search(['UNSEEN'], async (err, results) => {
        if (err) throw err;
        if (results.length > 0) {
          const latestEmailId = results[results.length - 1];
          const loginCode = await fetchLatestEmail(imap, latestEmailId);
          if (loginCode) {
            await enterVerificationCodeInPuppeteer(loginCode, page);
            resolve(loginCode);
          }
        }
      });
    });
  });
}

// 在 Puppeteer 中输入验证码
async function enterVerificationCodeInPuppeteer(loginCode, page) {
  console.log('enterVerificationCodeInPuppeteer: ' + loginCode);
  await page.type('input[name="otp"]', loginCode);

  await new Promise(resolve => setTimeout(resolve, 5000));

  const buttonSpik = await page.$('.relative.z-20.font-medium.flex.items-center.shadow-lg.justify-center.w-full.text-xl.text-black.bg-white.rounded-lg.focus\\:outline-none.focus\\:ring-0.focus-visible\\:ring-0.py-\\[14px\\].shadow.disabled\\:opacity-40');
  if (buttonSpik) {
    console.log('ButtonSpik found. Clicking it...');
    await buttonSpik.click();
  } else {
    console.log('Button not found.');
  }
}

// 主函数
(async () => {
  try {
    const promises = imapConfig.map(async (config) => {
      const imap = await startEmailListener(config); // 启动邮箱监听
      return await requestVerificationCode(config.user, imap); // 请求验证码
    });

    const results = await Promise.all(promises);
    console.log('All login codes received:', results);
  } catch (error) {
    console.error('Error:', error);
  }
})();
