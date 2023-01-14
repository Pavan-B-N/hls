function upload(){
    const file=document.getElementById("file")[0]
    console.log(file)
    fetch("/upload","POST")
}