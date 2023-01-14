//npm i fluent-ffmpeg
//npm i @ffmpeg-installer/ffmpeg
const ffmpeg=require("fluent-ffmpeg")
const ffmpegInstaller=require("@ffmpeg-installer/ffmpeg")
ffmpeg.setFfmpegPath(ffmpegInstaller.path);

const inputFile="journey.mp4"
const outputFile="chunks/output.m3u8"
const options=[
    '-profile:v baseline',
    '-level 3.0',
    '-start_number 0',
    '-hls_time 10',
    '-hls_list_size 0',
    '-f hls'
]
ffmpeg(inputFile,{timeout:432000}).addOptions(options).output(outputFile).on("end",()=>{
    console.log("done")
}).run();