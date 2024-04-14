const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 8080;
const videop = 'D:\jianpianDownload';

// 设置静态文件目录
app.use(express.static('public'));
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
    console.log(`fuck ${req.rawHeaders}`)

    // 检查文件是否存在
    if (!fs.existsSync(videoPath)) {
        return res.status(404).send('Video not found');
    }

    // 设置响应头
    res.setHeader('Content-Type', 'video/mp4');
    res.setHeader('Accept-Ranges', 'bytes');
    // res.setHeader('Content-length', '100000000000000')

    // 读取视频文件并流式传输
    const videoStream = fs.createReadStream(videoPath);
    videoStream.pipe(res);
});

// 启动服务器
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
