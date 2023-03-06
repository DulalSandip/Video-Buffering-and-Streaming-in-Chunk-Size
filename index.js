const app = require("express")()

const fs = require("fs")
app.set("view engine", "ejs")

app.get("/", (req, res) => {
    res.render("video")
})


app.get("/chunk/video", function (req, res) {

    // Ensure= there is a range given for the chunk video
    const range = req.headers.range

    if (!range) {
        res.status(416).send("Requires Range header")
    }


    const videoPath = "playvideo.mp4"
    const videoSize = fs.statSync(videoPath).size


    // Parse Range

    const CHUNK_SIZE = 10 ** 6 // 1MB
    const start = Number(range.replace(/\D/g, "")) // remove non digit /D for globally /g
    console.log(start, "start")
    const end = Math.min(start + CHUNK_SIZE, videoSize - 1)
    console.log(end, "end")

    // Create headers
    const contentLength = end - start + 1
    const headers = {
        "Content-Range": `bytes ${start}-${end}/${videoSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": contentLength,
        "Content-Type": "video/mp4",
    }

    // HTTP Status 206 for Partial Content
    res.writeHead(206, headers)

    // create video read stream for this particular chunk
    const videoStream = fs.createReadStream(videoPath, { start, end })

    // Stream the video chunk to the client
    videoStream.pipe(res)
})


const PORT = 4000
app.listen(PORT, () => {
    console.log(`Server Listening on port ${PORT}`)
})