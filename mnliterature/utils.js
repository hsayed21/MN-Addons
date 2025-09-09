class literatureUtils {
  /**
   * 
   * @param {string} fullPath 
   * @returns {string}
   */
  static getExtensionFolder(fullPath) {
      // 找到最后一个'/'的位置
      let lastSlashIndex = fullPath.lastIndexOf('/');
      // 从最后一个'/'之后截取字符串，得到文件名
      let fileName = fullPath.substring(0,lastSlashIndex);
      return fileName;
  }

  static checkMNUtilsFolder(fullPath){
    let extensionFolder = this.getExtensionFolder(fullPath)
    let folderExist = MNUtil.isfileExists(extensionFolder+"/marginnote.extension.mnutils/main.js")
    if (!folderExist) {
      literatureUtils.showHUD("MN Literature: Please install 'MN Utils' first!",5)
    }
    return folderExist
  }

  static checkLiteratureController(){
    if (!this.literatureController) {
      this.literatureController = literatureController.new();
      this.literatureController.view.hidden = true
    }
    if (!MNUtil.isDescendantOfStudyView(this.literatureController.view)) {
      MNUtil.studyView.addSubview(this.literatureController.view)
    }
  }

  static setFrame(target,frame){
    target.view.frame = frame
    target.currentFrame = frame
  }

  /**
   * 
   * @param {UIView} view 
   */
  static ensureView(view){
    if (!MNUtil.isDescendantOfStudyView(view)) {
      view.hidden = true
      MNUtil.studyView.addSubview(view)
    }
  }
}