const express = require("express")
const app = express()
const hls = require("hls-server")
const fs = require("fs")
const cors = require("cors")
const port=process.env.PORT || 2000

const corsOptions ={
    origin:'http://localhost:3000', 
    credentials:true,            //access-control-allow-credentials:true
    optionSuccessStatus:200,
    XMLHttpRequest:'*'
}
app.use(cors("*"))

//
const ffmpeg = require("fluent-ffmpeg")
const ffmpegInstaller = require("@ffmpeg-installer/ffmpeg")
ffmpeg.setFfmpegPath(ffmpegInstaller.path);

const ejs=require("ejs")
app.set("view engine","ejs")

const multer = require("multer")
const storage = multer.diskStorage({
    filename: (req, file, cb) => {
        cb(null, file.originalname)
    },
    destination: (req, file, cb) => {
        cb(null, __dirname + "/cloud")
    }
})
const upload = multer({ storage: storage }).single("file")

app.get("/cloud", (req, res) => {
    res.render("index.ejs",{url:"/cloud/"+req.query.folder+"/"+req.query.file})
})

app.post("/upload", upload, (req, res) => {
    const file = req.file;
    const fileNameWithourExt=file.originalname.split(".")[0].split(" ")[0]
    const dirName="cloud/"+fileNameWithourExt;
    const fileName=file.originalname;
    //make directory
    fs.mkdir(dirName,(err)=>{});

    const inputFile="cloud/"+fileName
    const outputFile=dirName+"/"+fileNameWithourExt+".m3u8"

    const options=[
        '-map 0',
        '-profile:v baseline',
        '-level 3.0',
        
        '-s 640x360',
        '-c:v0 libx264',
        '-b:v0 1024k',
        
        '-hls_playlist_type vod',
        '-master_pl_name playlist.m3u8',

        '-start_number 0',
        '-hls_time 10',
        '-hls_list_size 0',
        '-f hls',
    ]

    ffmpeg(inputFile,{timeout:432000})
   
    .addOptions(options)
    .output(outputFile)
    .on("start",(cmd)=>{
        res.write('<h1>' + "Wait we are processing your video" + '</h1>');
    })
    .on('progress', function (progress) {
        console.log(fileName+" "+progress)
        res.write('<h1>' + progress +" % " + '</h1>');
    })
    .on("end",()=>{
        fs.unlink(inputFile,(err)=>{if(err) console.log(err)});
        res.end(outputFile)
     })
     .on("error",(err)=>{
         console.log("err from ffmpeg\n",err)
     })
    .run()
})

const server = app.listen(port, () => console.log('server started'))


//hls server
new hls(server, {
    provider: {
        exists: (req, cb) => {
            const ext = req.url.split('.').pop()
            if (ext != "m3u8" || ext != 'ts') {
                return cb(null, true)
            }
            fs.access(__dirname + req.url, fs.constants.F_OK, (err) => {
                if (err) {
                    console.log('file doesnt exist')
                    return cb(null, false)
                }
                cb(null, true)
            })
        },

        getManifestStream: (req, cb) => {
            const stream = fs.createReadStream(__dirname + req.url)
            cb(null, stream)
        },

        getSegmentStream: (req, cb) => {
            const stream = fs.createReadStream(__dirname + req.url)
            cb(null, stream)
        }

    }
})