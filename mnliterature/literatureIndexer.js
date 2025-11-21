// ========================================
// Literature Indexer
// 文献索引系统
// 实现分片索引构建和增量更新
// ========================================

class LiteratureIndexer {
  // ========================================
  // 常量定义
  // ========================================

  static get BATCH_SIZE() { return 500 }      // 批次大小
  static get PART_SIZE() { return 5000 }      // 分片大小
  static get TEMP_FILE_PREFIX() { return "lit-index-temp-" }

  // ========================================
  // 索引构建
  // ========================================

  /**
   * 构建搜索索引（分片模式）
   * @param {Array} notes - 卡片数组
   * @param {string} mode - 索引模式 ("light" 或 "full")
   * @returns {Object} manifest - 索引清单
   */
  static async buildSearchIndex(notes, mode = "light") {
    try {
      MNUtil.showHUD("开始构建索引...")

      // 创建清单
      const manifest = {
        metadata: {
          version: "1.0",
          mode: mode,
          totalCards: 0,
          totalParts: 0,
          updateTime: Math.floor(Date.now() / 1000),
          tempFiles: []
        },
        parts: []
      }

      let currentBatch = []
      let tempFileCount = 0
      let processedCount = 0
      let validCount = 0

      // ========================================
      // 阶段1：流式处理卡片，写入临时文件
      // ========================================

      for (let note of notes) {
        // TODO: 构建索引条目
        const entry = this.buildIndexEntry(note, mode)

        if (entry) {
          currentBatch.push(entry)
          validCount++
        }

        processedCount++

        // 批次满了，写入临时文件
        if (currentBatch.length >= this.BATCH_SIZE) {
          const tempFileName = `${this.TEMP_FILE_PREFIX}${tempFileCount}.json`
          const tempFilePath = MNUtil.tempFolder + "/" + tempFileName

          MNUtil.writeJSON(tempFilePath, {
            batchNumber: tempFileCount,
            data: currentBatch,
            count: currentBatch.length
          })

          manifest.metadata.tempFiles.push(tempFileName)
          tempFileCount++

          // 清空批次，释放内存
          currentBatch = []

          // 显示进度
          MNUtil.showHUD(`处理中... ${processedCount}/${notes.length}`)

          // 给 UI 时间更新
          await MNUtil.delay(0.001)
        }
      }

      // 保存最后一批
      if (currentBatch.length > 0) {
        const tempFileName = `${this.TEMP_FILE_PREFIX}${tempFileCount}.json`
        const tempFilePath = MNUtil.tempFolder + "/" + tempFileName

        MNUtil.writeJSON(tempFilePath, {
          batchNumber: tempFileCount,
          data: currentBatch,
          count: currentBatch.length
        })

        manifest.metadata.tempFiles.push(tempFileName)
        tempFileCount++
      }

      // ========================================
      // 阶段2：合并临时文件到最终分片
      // ========================================

      MNUtil.showHUD("正在合并索引文件...")
      await this.mergeTempFilesToParts(manifest, mode)

      // ========================================
      // 阶段3：清理临时文件
      // ========================================

      await this.cleanupTempFiles(manifest.metadata.tempFiles)

      // 更新元数据
      manifest.metadata.totalCards = validCount

      // 保存清单
      await this.saveIndexManifest(manifest, mode)

      MNUtil.showHUD(`✅ 索引构建完成！共 ${validCount} 条`)

      return manifest

    } catch (error) {
      MNUtil.showHUD("构建索引失败: " + error)
      MNUtil.copyJSON(error)
      return null
    }
  }

  /**
   * 合并临时文件到分片
   */
  static async mergeTempFilesToParts(manifest, mode) {
    let partNumber = 0
    let currentPart = []

    // 逐个读取临时文件
    for (const tempFileName of manifest.metadata.tempFiles) {
      const tempFilePath = MNUtil.tempFolder + "/" + tempFileName
      const tempData = MNUtil.readJSON(tempFilePath)

      if (!tempData || !tempData.data) continue

      // 将临时数据合并到当前分片
      for (const entry of tempData.data) {
        currentPart.push(entry)

        // 分片满了，保存
        if (currentPart.length >= this.PART_SIZE) {
          const { filename, sizeMB } = await this.saveIndexPart(
            currentPart,
            partNumber,
            mode
          )

          manifest.parts.push({
            partNumber: partNumber,
            filename: filename,
            cardCount: currentPart.length,
            sizeMB: sizeMB
          })

          partNumber++
          currentPart = []
        }
      }
    }

    // 保存最后一个分片
    if (currentPart.length > 0) {
      const { filename, sizeMB } = await this.saveIndexPart(
        currentPart,
        partNumber,
        mode
      )

      manifest.parts.push({
        partNumber: partNumber,
        filename: filename,
        cardCount: currentPart.length,
        sizeMB: sizeMB
      })

      partNumber++
    }

    manifest.metadata.totalParts = partNumber
  }

  /**
   * 保存单个分片
   */
  static async saveIndexPart(partData, partNumber, mode) {
    const filename = `lit-search-index-${mode}-part-${partNumber}.json`
    const filepath = MNUtil.dbFolder + "/data/" + filename

    const partContent = {
      partNumber: partNumber,
      mode: mode,
      count: partData.length,
      data: partData
    }

    MNUtil.writeJSON(filepath, partContent)

    // 计算文件大小
    const fileSize = MNUtil.getFileSize(filepath) || 0
    const sizeMB = (fileSize / (1024 * 1024)).toFixed(2)

    return { filename, sizeMB }
  }

  /**
   * 保存清单文件
   */
  static async saveIndexManifest(manifest, mode) {
    const filepath = MNUtil.dbFolder + `/data/lit-search-index-${mode}-manifest.json`

    // 添加时间戳
    manifest.metadata.updateTime = Math.floor(Date.now() / 1000)
    manifest.metadata.lastUpdated = new Date().toISOString()

    MNUtil.writeJSON(filepath, manifest)

    MNUtil.log("索引清单已保存: " + filepath)

    return filepath
  }

  /**
   * 清理临时文件
   */
  static async cleanupTempFiles(tempFiles) {
    for (const tempFileName of tempFiles) {
      try {
        const tempFilePath = MNUtil.tempFolder + "/" + tempFileName
        if (MNUtil.isfileExists(tempFilePath)) {
          MNUtil.deleteFile(tempFilePath)
        }
      } catch (error) {
        MNUtil.log("清理临时文件失败: " + tempFileName)
      }
    }

    MNUtil.log("临时文件清理完成")
  }

  // ========================================
  // 索引条目构建（TODO: 待实现具体逻辑）
  // ========================================

  /**
   * 构建索引条目
   * @param {MNNote} note - 卡片对象
   * @param {string} mode - 索引模式
   * @returns {Object} entry - 索引条目
   */
  static buildIndexEntry(note, mode) {
    // TODO: 从卡片中提取文献信息
    // - 解析 BibTeX
    // - 解析引文格式
    // - 提取 DOI、作者、标题等

    // 暂时返回基础结构
    return {
      id: note.noteId,
      type: "article",  // TODO: 识别文献类型
      title: note.noteTitle || "",
      authors: [],  // TODO: 提取作者
      year: null,  // TODO: 提取年份
      journal: "",  // TODO: 提取期刊
      searchText: note.noteTitle || "",  // TODO: 构建完整搜索文本
      noteId: note.noteId
    }
  }

  /**
   * 从卡片中提取文献数据
   * @param {MNNote} note - 卡片对象
   * @returns {Object} literatureData - 文献数据
   */
  static extractLiteratureData(note) {
    // TODO: 具体的数据提取逻辑
    // 1. 尝试解析 BibTeX
    // 2. 尝试解析引文格式
    // 3. 尝试提取结构化字段

    return null
  }

  // ========================================
  // 索引加载
  // ========================================

  /**
   * 加载索引清单
   * @param {string} mode - 索引模式
   * @returns {Object} manifest - 索引清单
   */
  static loadIndexManifest(mode = "light") {
    try {
      const filepath = MNUtil.dbFolder + `/data/lit-search-index-${mode}-manifest.json`

      if (!MNUtil.isfileExists(filepath)) {
        MNUtil.log("索引清单不存在: " + filepath)
        return null
      }

      const manifest = MNUtil.readJSON(filepath)

      if (!manifest || !manifest.metadata) {
        MNUtil.log("索引清单格式错误")
        return null
      }

      return manifest

    } catch (error) {
      MNUtil.log("加载索引清单失败: " + error)
      return null
    }
  }

  /**
   * 加载索引分片
   * @param {string} filename - 分片文件名
   * @returns {Object} part - 分片数据
   */
  static loadIndexPart(filename) {
    try {
      const filepath = MNUtil.dbFolder + "/data/" + filename

      if (!MNUtil.isfileExists(filepath)) {
        MNUtil.log("索引分片不存在: " + filepath)
        return null
      }

      const part = MNUtil.readJSON(filepath)

      if (!part || !part.data) {
        MNUtil.log("索引分片格式错误")
        return null
      }

      return part

    } catch (error) {
      MNUtil.log("加载索引分片失败: " + error)
      return null
    }
  }

  /**
   * 加载完整索引数据
   * @param {string} mode - 索引模式
   * @returns {Array} allEntries - 所有索引条目
   */
  static async loadFullIndex(mode = "light") {
    try {
      let allEntries = []

      // 1. 加载清单
      const manifest = this.loadIndexManifest(mode)

      if (manifest && manifest.parts) {
        // 2. 逐个加载分片
        for (const partInfo of manifest.parts) {
          const part = this.loadIndexPart(partInfo.filename)

          if (part && part.data) {
            allEntries = allEntries.concat(part.data)
          }
        }
      }

      // 3. 加载增量索引（如果存在）
      const incrementalPath = MNUtil.dbFolder + "/data/lit-incremental-index.json"
      if (MNUtil.isfileExists(incrementalPath)) {
        const incrementalIndex = MNUtil.readJSON(incrementalPath)

        if (incrementalIndex && incrementalIndex.entries) {
          // 去重合并
          const existingIds = new Set(allEntries.map(entry => entry.id))
          let addedCount = 0

          for (const entry of incrementalIndex.entries) {
            if (!existingIds.has(entry.id)) {
              allEntries.push(entry)
              addedCount++
            }
          }

          if (addedCount > 0) {
            MNUtil.log(`从增量索引加载了 ${addedCount} 条新数据`)
          }
        }
      }

      MNUtil.log(`完整索引加载完成，共 ${allEntries.length} 条`)

      return allEntries

    } catch (error) {
      MNUtil.log("加载完整索引失败: " + error)
      return []
    }
  }
}

// ========================================
// 增量索引管理
// ========================================

class IncrementalIndexer {
  /**
   * 添加文献到增量索引
   * @param {MNNote} note - 新增的卡片
   */
  static addToIndex(note) {
    try {
      // TODO: 检查卡片类型（是否为文献卡片）

      // 构建索引条目
      const entry = LiteratureIndexer.buildIndexEntry(note, "light")
      if (!entry) {
        return
      }

      // 加载现有增量索引
      const incrementalPath = MNUtil.dbFolder + "/data/lit-incremental-index.json"
      let incrementalIndex = MNUtil.readJSON(incrementalPath) || {
        metadata: {
          version: "1.0",
          updateTime: 0,
          totalEntries: 0
        },
        entries: []
      }

      // 检查是否已存在
      const existingIndex = incrementalIndex.entries.findIndex(e => e.id === note.noteId)
      if (existingIndex >= 0) {
        // 更新现有条目
        incrementalIndex.entries[existingIndex] = entry
        MNUtil.log("更新增量索引: " + note.noteId)
      } else {
        // 添加新条目
        incrementalIndex.entries.push(entry)
        incrementalIndex.metadata.totalEntries++
        MNUtil.log("添加到增量索引: " + note.noteId)
      }

      // 更新时间戳
      incrementalIndex.metadata.updateTime = Math.floor(Date.now() / 1000)

      // 保存
      MNUtil.writeJSON(incrementalPath, incrementalIndex)

    } catch (error) {
      MNUtil.log("添加到增量索引失败: " + error)
    }
  }

  /**
   * 从增量索引删除文献
   * @param {string} noteId - 卡片 ID
   */
  static removeFromIndex(noteId) {
    try {
      const incrementalPath = MNUtil.dbFolder + "/data/lit-incremental-index.json"
      let incrementalIndex = MNUtil.readJSON(incrementalPath)

      if (!incrementalIndex || !incrementalIndex.entries) {
        return
      }

      // 过滤掉指定卡片
      const originalCount = incrementalIndex.entries.length
      incrementalIndex.entries = incrementalIndex.entries.filter(e => e.id !== noteId)

      if (incrementalIndex.entries.length < originalCount) {
        // 更新元数据
        incrementalIndex.metadata.totalEntries = incrementalIndex.entries.length
        incrementalIndex.metadata.updateTime = Math.floor(Date.now() / 1000)

        // 保存
        MNUtil.writeJSON(incrementalPath, incrementalIndex)

        MNUtil.log("从增量索引删除: " + noteId)
      }

    } catch (error) {
      MNUtil.log("从增量索引删除失败: " + error)
    }
  }

  /**
   * 清空增量索引
   */
  static clearIndex() {
    try {
      const incrementalPath = MNUtil.dbFolder + "/data/lit-incremental-index.json"

      const emptyIndex = {
        metadata: {
          version: "1.0",
          updateTime: Math.floor(Date.now() / 1000),
          totalEntries: 0
        },
        entries: []
      }

      MNUtil.writeJSON(incrementalPath, emptyIndex)

      MNUtil.log("增量索引已清空")

    } catch (error) {
      MNUtil.log("清空增量索引失败: " + error)
    }
  }
}

// ========================================
// 导出模块
// ========================================
if (typeof module !== 'undefined') {
  module.exports = {
    LiteratureIndexer,
    IncrementalIndexer
  }
}
