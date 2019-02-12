const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber02).join('-') + '-' + [hour, minute, second].map(formatNumber02).join(':')
}

const dateTitle = date =>{
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  return [month, day, year].map(formatNumber02).join('/')
}

const dateDir = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  return [year, month, day].map(formatNumber02).join('')
}

const formatDate = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  return [year, month, day].map(formatNumber02).join('-')
}

const formatPreDate = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()-1
  return [year, month, day].map(formatNumber02).join('-')
}

const transformDate = date => {
  return date.replace("-", "")
}

const formatNumber02 = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

const formatNumber03 = n => {
  n = n.toString()
  var i = 1
  while (i < 3){
    n = n[i] ? n : '0' + n
    i = i + 1
  }
  return n
}

const formatNumber09 = n => {
  n = n.toString()
  var i = 1
  while (i < 9) {
    n = n[i] ? n : '0' + n
    i = i + 1
  }
  return n
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

function recordTime(date) {
  var month = date.getMonth() + 1
  var day = date.getDate()
  var hour = date.getHours()
  var minute = date.getMinutes()
  return [month, day].map(formatNumber).join('/') + ' ' + [hour, minute].map(formatNumber).join(':')
}

const varifyStr = str =>{
  console.log("原字符串：", str)
  str = str.replace(/\uD83C[\uDF00-\uDFFF]|\uD83D[\uDC00-\uDE4F]/g, "")
  console.log("过滤特殊字符：", str)
  str = str.replace(/(^\s*)|(\s*$)/g, "")
  console.log("删除空格：", str)
  for (var i = 0; i < str.length; i++){
    if (str[i] == "'"){
      console.log("find '")
    }
    if (str[i] == '"') {
      console.log('find "')
    }
  }
  str = str.replace(/'/g,"''")
  console.log("替换", str)
  if (str.length == 0) {
    str = "unknow"
    console.log("空字符串:", str)
  }
  return str
}

const sliceStrBySpace = str => {
  var temp1 = str.toString()
  var temp2 = []
  while (temp1.length > 0){
    var pos = temp1.indexOf(" ")
    if (pos > 0){
      temp2.push(temp1.slice(0, pos+1))
      temp1 = temp1.slice(pos + 1)
    }else{
      temp2.push(temp1)
      break
    }
  }
  //console.log(temp2)
  return temp2
}

const sentence2words = param => {
  var temp1 = param.str.replace(/[\ |\~|\`|\!|\@|\#|\$|\%|\^|\&|\*|\(|\)|\-|\_|\+|\=|\||\\|\[|\]|\{|\}|\;|\:|\"|\,|\<|\.|\>|\/|\?|\？]/g, " ")
  temp1 = temp1.replace(/\d+/g, " ").toLowerCase ()
  while (temp1.length > 0) {
    var pos = temp1.indexOf(" ")
    //console.log(pos, temp1)
    if (pos >= 0) {
      var temp = temp1.slice(0, pos).replace(" ", "")
      var pos1 = temp.indexOf("'")
      if (pos1 == 0){
        temp = temp.slice(1, temp.length)
      }
      if (pos1 == temp.length-1) {
        temp = temp.slice(0, temp.length-1)
      }
      //console.log("temp1: ", temp)
      if (temp != ""){
        if (param.collector.hasOwnProperty(temp)) {
          param.collector[temp] = param.collector[temp] + 1
        } else{
          param.collector[temp] = 1
        }
      }
      temp1 = temp1.slice(pos + 1)
    } else {
      var temp = temp1.replace(" ", "")
      var pos1 = temp.indexOf("'")
      if (pos1 == 0) {
        temp = temp.slice(1, temp.length)
      }
      if (pos1 == temp.length - 1) {
        temp = temp.slice(0, temp.length - 1)
      }
      //console.log("temp2: ", temp)
      if (temp!=""){
        if (param.collector.hasOwnProperty(temp)) {
          param.collector[temp] = param.collector[temp] + 1
        } else {
          param.collector[temp] = 1
        }
      }
      break
    }
  }
  return param.collector
}

const downLoadFile = url => {
  var resUrl = ""
  const downloadTask = wx.downloadFile({
    url: url,
    success: function (res) {
      console.log('下载数据1', res)
      resUrl = res.tempFilePath
      return resUrl 
    }
  })

  downloadTask.onProgressUpdate((res) => {
    console.log('下载数据2', res)
    console.log('下载进度', res.progress)
    console.log('已经下载的数据长度', res.totalBytesWritten)
    console.log('预期需要下载的数据总长度', res.totalBytesExpectedToWrite)
  })
}

module.exports = {
  formatTime: formatTime,
  formatDate: formatDate,
  recordTime: recordTime,
  formatPreDate: formatPreDate,
  dateDir: dateDir,
  dateTitle: dateTitle,
  formatNumber: formatNumber,
  formatNumber02: formatNumber02,
  formatNumber03: formatNumber03,
  formatNumber09: formatNumber09,
  varifyStr: varifyStr,
  sliceStrBySpace: sliceStrBySpace,
  downLoadFile: downLoadFile,
  sentence2words: sentence2words,
}
