import { readFile, writeFile } from 'fs/promises';

async function generateImapConfig() {
    try {
        // 读取文件内容
        const data = await readFile('emails.txt', 'utf8');

        // 按行分割文件内容
        const inputStrings = data.trim().split('\n');

        // 解析输入字符串并生成 imapConfig
        const imapConfigs = inputStrings.map(input => {
            const [email, password] = input.split('----');

            return {
                user: email,
                password: password,
                host: 'imap-mail.outlook.com',
                port: 993,
                tls: true,
                connTimeout: 10000,
                authTimeout: 10000, // 可选，设置身份验证超时
            };
        });

        // 生成符合格式的输出
        const output = `export const imapConfig = ${JSON.stringify(imapConfigs, null, 2)};`;

        // 输出到文件
        await writeFile('config.js', output, 'utf8');
        console.log('imapConfig.js has been generated successfully.');
    } catch (err) {
        console.error('Error:', err);
    }
}

// 调用函数
generateImapConfig();