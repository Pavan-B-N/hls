const ffmpeg = require("fluent-ffmpeg")
const ffmpegInstaller = require("@ffmpeg-installer/ffmpeg")
ffmpeg.setFfmpegPath(ffmpegInstaller.path);
const {Transcoder}=require("simple-hls")
async function transcode(){
    const input="big_buck.mp4"
    const output="demo"
    const t=new Transcoder(input,output,{showLogs:false});
    try{
        const hlsPath=await t.transcode();
    }catch(e){
        console.log("error\n",e)
    }
}
transcode()