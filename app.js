const express = require('express');
const fs = require('fs');
const os = require('os');
const path = require('path');

const app = express();
const port = 8080;
const videop = 'D:\jianpianDownload';

// 设置静态文件目录
app.use(express.static(path.join(__dirname)));
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) =>{
    res.sendFile(__dirname + "/index.html")
});

// 路由：获取视频列表
app.get('/videos', (req, res) => {
    fs.readdir(videop , (err, files) => {
        if (err) {
            console.error('Error reading videos directory:', err);
            res.status(500).send('Error reading videos directory');
            return;
        }
        res.json(files.filter(file => file.endsWith('.mp4')));
    });
});


// 视频接口
app.get('/video/:filename', (req, res) => {
    const filename = req.params.filename;
    const videoPath = path.join(videop, '/', filename);
    console.log(`header is -> ${req.rawHeaders}`)
    console.log('-----------------\n')

    // 检查文件是否存在
    if (!fs.existsSync(videoPath)) {
        return res.status(404).send('Video not found');
    }

    // 获取文件信息
    const stat = fs.statSync(videoPath);
    const fileSize = stat.size;

    // 获取请求中的 range 参数
    const range = req.headers.range;

    // 如果请求中包含 range 参数
    if (range) {
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
        const chunkSize = (end - start) + 1;

        // 设置响应头部
        res.writeHead(206, {
            'Content-Range': `bytes ${start}-${end}/${fileSize}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': chunkSize,
            'Content-Type': 'video/mp4'
        });
        // 创建读取流并发送部分视频数据
        const stream = fs.createReadStream(videoPath, { start, end });
        stream.pipe(res);
    } else {
        // 如果请求中不包含 range 参数，直接发送整个视频文件
        res.writeHead(200, {
            'Content-Length': fileSize,
            'Accept-Ranges': 'bytes',
            'Content-Type': 'video/mp4'
        });
        const stream = fs.createReadStream(videoPath);
        stream.pipe(res);
    }
});

// 启动服务器
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);

    // 获取本地网络接口列表
    const networkInterfaces = os.networkInterfaces();

    // 遍历网络接口列表，查找 IPv4 地址
    Object.keys(networkInterfaces).forEach(interfaceName => {
        const interfaceInfos = networkInterfaces[interfaceName];
        interfaceInfos.forEach(interfaceInfo => {
            // 排除 IPv6 地址和 loopback 地址
            if (interfaceInfo.family === 'IPv4' && !interfaceInfo.internal) {
                console.log(`本地 IPv4 地址 (${interfaceName}): ${interfaceInfo.address}`);
            }
        });
    });
});
