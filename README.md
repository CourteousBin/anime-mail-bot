# Azuki Anime 批量邮箱注册脚本

欢迎使用 **Azuki Anime 批量邮箱注册脚本**，该脚本帮助您快速获取白名单，方便您在 Anime 网站上进行批量邮箱注册。

**项目链接**: [Anime.com](https://www.anime.com)

---

## 📦 使用方法

请按照以下步骤设置和运行脚本：

1. **安装依赖包**  
   在项目根目录下运行以下命令：
   ```bash
   npm install
   ```

2. **导入邮箱**  
   将您的邮箱地址添加到 `emails.txt` 文件中。

3. **生成 IMAP 配置**  
   运行以下命令生成配置文件：
   ```bash
   npm run generateImapConfig
   ```

4. **查看配置文件**  
   打开生成的 `config.js` 文件，并检查以下内容：
   - 确保 `host` 设置与您的邮箱服务提供商一致。
   - 如果 `host` 不一致，请在 `generateImapConfig.js` 的第 18 行进行修改。

6. **配置 Chrome 默认地址**  

   查看 `index.js` 87 行浏览器默认地址：
   ```
   MAC:
   /Applications/Google Chrome.app/Contents/MacOS/Google Chrome

   WIN:
   C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe
   ```

7. **启动脚本**  
   运行以下命令开始执行脚本：
   ```bash
   npm run start
   ```

---

## ⚠️ 注意事项

- 确保您在 `emails.txt` 中的邮箱格式正确。
- 请根据您的需求调整 `generateImapConfig.js` 中的设置。
- 这是一个很简单的脚本，这意味着**你很可能会被女巫** 🧙‍♀️
