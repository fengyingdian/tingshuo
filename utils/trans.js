const textToVoice = content => {
  const plugin = requirePlugin("WechatSI")
  plugin.textToSpeech({
    lang: 'zh_CN',
    content: content,
    success: resTrans => {
      console.log("resTrans: ", resTrans)
      if (resTrans.retcode == 0) {
        const innerAudioContext = wx.createInnerAudioContext()
        innerAudioContext.obeyMuteSwitch = false
        innerAudioContext.src = resTrans.filename
        innerAudioContext.play()
      }
    }
  })
}

module.exports = {
  textToVoice: textToVoice,
}