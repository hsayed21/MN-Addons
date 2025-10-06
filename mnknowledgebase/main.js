/**
 * MarginNote 4 插件入口函数
 * 
 * 这是每个 MarginNote 插件都必须实现的核心函数。
 * JSB (JavaScript Bridge) 是 MarginNote 提供的桥接系统，
 * 用于 JavaScript 与 Objective-C/Swift 之间的通信。
 * 
 * @param {String} mainPath 插件的主目录路径，用于访问插件内的资源文件
 * @returns {Class} 返回定义的插件类
 */
JSB.newAddon = function(mainPath){
  JSB.require('utils');
  // 使用 JSB.defineClass 定义一个继承自 JSExtension 的插件类
  // 格式：'类名 : 父类名'
  var MNKnowledgeBaseClass = JSB.defineClass('MNKnowledgeBase : JSExtension', 
  
  /*=== 实例成员（Instance members）===
   * 这些方法对应每个窗口实例的生命周期
   * MarginNote 支持多窗口，每个窗口都有独立的插件实例
   */
  {
    /**
     * 窗口初始化方法 - 每当有新窗口打开时调用
     * 
     * 这是插件最重要的初始化时机，通常在这里：
     * - 初始化插件的 UI 组件
     * - 设置插件的基本配置
     * - 显示欢迎信息
     * 
     * 注意：此时可能还没有笔记本或文档打开
     */
    sceneWillConnect: function() {
      MNUtil.undoGrouping(()=>{
        try {
          KnowledgeBaseConfig.init(mainPath)
          self.toggled = false
          self.newExcerptWithOCRToTitle = false  // 新摘录 OCR 到标题
          self.preExcerptMode = false  // 预摘录模式
          // MNUtil.addObserver(self, 'onPopupMenuOnNote:', 'PopupMenuOnNote')
          MNUtil.addObserver(self, 'onProcessNewExcerpt:', 'ProcessNewExcerpt')
        } catch (error) {
          KnowledgeBaseUtils.addErrorLog(error, "sceneWillConnect")
        }
      })
    },
    
    /**
     * 窗口断开方法 - 窗口关闭时调用
     * 
     * 在这里进行清理工作：
     * - 移除添加的 UI 组件
     * - 取消定时器和事件监听
     * - 释放占用的资源
     */
    sceneDidDisconnect: function() {
      MNUtil.undoGrouping(()=>{
        try {
          MNUtil.removeObserver(self, 'ProcessNewExcerpt')
        } catch (error) {
          MNUtil.showHUD(error);
        }
      })
    },
    
    /**
     * 窗口失去焦点时调用
     * 
     * 适用场景：
     * - 暂停动画或定时任务
     * - 保存用户的临时操作状态
     * - 释放一些临时资源
     */
    sceneWillResignActive: function() {
      // 示例中为空实现
    },
    
    /**
     * 窗口获得焦点时调用
     * 
     * 适用场景：
     * - 恢复暂停的任务
     * - 刷新 UI 状态
     * - 重新获取最新数据
     */
    sceneDidBecomeActive: function() {
      // 示例中为空实现
    },
    
    /**
     * 笔记本即将打开时调用
     * 
     * 这是一个重要的时机，可以在这里：
     * - 初始化与笔记本相关的功能
     * - 读取笔记本的配置信息
     * - 准备插件的主要功能界面
     * 
     * @param {String} notebookid 笔记本的唯一标识符
     */
    notebookWillOpen: function(notebookid) {
      // JSB.log 用于调试输出，类似于 console.log
      // %@ 是 Objective-C 风格的字符串占位符
      JSB.log('MNLOG Open Notebook: %@',notebookid);
    },
    
    /**
     * 笔记本即将关闭时调用
     * 
     * 在这里进行笔记本相关的清理：
     * - 保存用户在该笔记本中的操作
     * - 清理笔记本相关的临时数据
     * - 隐藏相关的 UI 组件
     * 
     * @param {String} notebookid 笔记本的唯一标识符
     */
    notebookWillClose: function(notebookid) {
      JSB.log('MNLOG Close Notebook: %@',notebookid);
    },
    
    /**
     * 文档打开后调用
     * 
     * 文档包括 PDF、EPUB 等格式的文件。
     * 可以在这里：
     * - 分析文档内容
     * - 准备文档相关的功能
     * - 显示文档特定的工具
     * 
     * @param {String} docmd5 文档的 MD5 哈希值，用作唯一标识
     */
    documentDidOpen: function(docmd5) {
      // 示例中为空实现
    },
    
    /**
     * 文档即将关闭时调用
     * 
     * 进行文档相关的清理工作：
     * - 保存文档的阅读进度
     * - 清理文档相关的缓存
     * - 隐藏文档工具界面
     * 
     * @param {String} docmd5 文档的 MD5 哈希值
     */
    documentWillClose: function(docmd5) {
      // 示例中为空实现
    },

    /**
     * 
     * @param {{userInfo:{noteid:String}}} sender 
     * @returns 
     */
    onProcessNewExcerpt: async function (sender) {
      /**
       * 1. 自动移动到预备知识库
       * 2. 调用 MNOCR 插件进行 OCR 到标题，方便后续索引
       */
      if (typeof MNUtil === 'undefined') return
      if (self.window !== MNUtil.currentWindow) return; 
      try {
        const noteId = sender.userInfo.noteid
        const note = MNNote.new(noteId)
        if (!note) return
        if (self.preExcerptMode) {
          // 预摘录模式：自动移动到预备知识库
          const preExcerptRootNote = MNNote.new("marginnote4app://note/B48C92CF-A5FD-442A-BF8C-53E1E801F05D")
          if (preExcerptRootNote) {
            preExcerptRootNote.addChild(note)
          }
        }

        if (self.newExcerptWithOCRToTitle) {
          let imageData = ocrUtils.getImageFromNote(note)
          if (!imageData) {
            MNUtil.showHUD("No image found")
            return
          }
          let compressedImageData = UIImage.imageWithData(imageData).jpegData(0.1)
          let prompt = `
# OCR Prompt - Direct Unicode Output with Chinese Translation

## Role
Image Text Extraction Specialist with Unicode Priority and Mathematical Chinese Translation Expert

## Goal
Extract and output all text from the given image using direct Unicode characters whenever possible. Preserve the original formatting and layout structure. Provide professional Chinese translation for mathematical content.

If text is already in Chinese, retain it as is and do not translate.

For any formulas, do not use LaTeX form, i.e. enclose them with dollar signs "$...$" or "\(...\)".

## Output Format
Case1: If the text is in English or other languages, output as:
[Original extracted text with Unicode formatting] [Professional Chinese translation with mathematical terminology]
Case2: If the text is already in Chinese, output as:
[Original extracted Chinese text]

## Output Rules

### 1. Mathematical Symbols & Formulas
- **Primary**: Use direct Unicode characters when available
  - Examples: x², x³, √2, ∫, ∑, π, α, β, γ, ≤, ≥, ≠, ±, ×, ÷, ∞, ∂, ∆, ∇
- **Fallback**: Only use LaTeX notation (enclosed in $ signs) when no Unicode equivalent exists
  - Examples: Complex fractions, matrices, advanced operators

### 2. Text Formatting
- Use Unicode formatting characters when possible:
  - Superscript: ¹²³⁴⁵⁶⁷⁸⁹⁰ ᵃᵇᶜᵈᵉᶠᵍʰⁱʲᵏˡᵐⁿᵒᵖᵒʳˢᵗᵘᵛʷˣʸᶻ
  - Subscript: ₀₁₂₃₄₅₆₇₈₉ ₐₑₕᵢⱼₖₗₘₙₒₚᵣₛₜᵤᵥₓ
  - Bold/Italic: Use **bold** and *italic* markdown only if clearly indicated

### 3. Chinese Translation Rules
- **Mathematical Terminology**: Use standard Chinese mathematical terms from authoritative sources (e.g., 高等教育出版社数学词汇)
- **Professional Standards**: Follow conventions used in Chinese mathematical literature and textbooks
- **Context Sensitivity**: Adapt translation based on mathematical context (analysis, algebra, geometry, etc.)
- **Formula Preservation**: Keep mathematical formulas in original Unicode form, translate only the descriptive text
- **Theorem Names**: Use established Chinese names for well-known theorems, provide transliteration for less common ones

#### Common Mathematical Term Translations:
- Theorem → 定理
- Lemma → 引理  
- Corollary → 推论
- Proof → 证明
- Definition → 定义
- Proposition → 命题
- Example → 例子/例题
- Exercise → 练习
- Strong Law of Large Numbers → 强大数定律
- Limit → 极限
- Convergence → 收敛
- Derivative → 导数
- Integral → 积分
- Function → 函数
- Continuous → 连续
- Differentiable → 可微
- Measurable → 可测

## About spaces
### Handle the spaces and line breaks in the image, avoid unnecessary spaces and line breaks.
Example: 
- Results before handling ❌: |a + b| / (1 + |a + b|) ≤ |a| / (1 + |a|) + |b| / (1 + |b|)
- Results after handling ✅: |a+b|/(1+|a+b|)≤|a|/(1+|a|)+|b|/(1+|b|)

### Based on above rule, still keep the necessary spaces in the text, such as between words and after punctuations.
Example 1:
- Results before handling ❌: Theorem1.1(StrongLawofLargeNumbers).
- Results after handling ✅: Theorem 1.1 (Strong Law of Large Numbers).

Example 2:
- Results before handling ❌: 设a,b∈R,则有|a+b|/(1+|a+b|)≤|a|/(1+|a|)+|b|/(1+|b|).
- Results after handling ✅: 设 a, b∈R, 则有 |a+b|/(1+|a+b|)≤|a|/(1+|a|)+|b|/(1+|b|).

## Translation Quality Standards
- **Accuracy**: Ensure mathematical concepts are translated correctly
- **Consistency**: Use consistent terminology throughout the translation
- **Readability**: Maintain natural Chinese expression while preserving technical precision
- **Authority**: Prefer terminology used in standard Chinese mathematical textbooks
- **Context**: Consider the mathematical field (分析学、代数学、几何学、概率论、统计学 etc.)

## Constraints
- Output ONLY the text content visible in the image followed by Chinese translation
- No explanatory text, descriptions, or commentary beyond the translation
- No "I see..." or "The image contains..." prefixes
- Prioritize readability in non-Markdown environments
- When uncertain between Unicode and LaTeX, choose Unicode
- For Chinese translation, prioritize professional mathematical terminology over literal translation

## Priority Order
1. Direct Unicode characters
2. Simple markdown formatting (only for structure)
3. LaTeX notation (only when absolutely necessary)
4. Professional Chinese mathematical terminology over colloquial translation

---

## Unicode Reference
- Fractions: ½ ⅓ ⅔ ¼ ¾ ⅕ ⅖ ⅗ ⅘ ⅙ ⅚ ⅛ ⅜ ⅝ ⅞
- Operators: ± × ÷ ≈ ≠ ≤ ≥ ∝ ∝ ∴ ∵ ∈ ∉ ⊂ ⊃ ∪ ∩ ∧ ∨
- Greek: α β γ δ ε ζ η θ ι κ λ μ ν ξ ο π ρ σ τ υ φ χ ψ ω Α Β Γ Δ Ε Ζ Η Θ Ι Κ Λ Μ Ν Ξ Ο Π Ρ Σ Τ Υ Φ Χ Ψ Ω
- Calculus: ∫ ∬ ∭ ∮ ∂ ∇ ∞ ∑ ∏ lim
- Geometry: ° ∠ ⊥ ∥ △ ◯ □ ◇
带 Hat (^) 的组合字符 (Unicode U+0302 COMBINING CIRCUMFLEX ACCENT)

拉丁字母 (小写): â, b̂, ĉ, d̂, ê, f̂, ĝ, ĥ, î, ĵ, k̂, l̂, m̂, n̂, ô, p̂, q̂, r̂, ŝ, t̂, û, v̂, ŵ, x̂, ŷ, ẑ
拉丁字母 (大写): Â, B̂, Ĉ, D̂, Ê, F̂, Ĝ, Ĥ, Î, Ĵ, K̂, L̂, M̂, N̂, Ô, P̂, Q̂, R̂, Ŝ, T̂, Û, V̂, Ŵ, X̂, Ŷ, Ẑ
希腊字母 (小写): α̂, β̂, γ̂, δ̂, ε̂, ζ̂, η̂, θ̂, ι̂, κ̂, λ̂, μ̂, ν̂, ξ̂, ο̂, π̂, ρ̂, σ̂, τ̂, υ̂, φ̂, ϕ̂, χ̂, ψ̂, ω̂
希腊字母 (大写): Γ̂, Δ̂, Θ̂, Λ̂, Ξ̂, Π̂, Σ̂, Υ̂, Φ̂, Ψ̂, Ω̂
数字: 0̂, 1̂, 2̂, 3̂, 4̂, 5̂, 6̂, 7̂, 8̂, 9̂ (不太常用，但可能用于向量/基向量分量)
向量基: î (基于 ı, dotless i, U+0131), ĵ (基于 ȷ, dotless j, U+0237), k̂ (基于 k)

数学字母数字 (示例 - 需用字符检视器):
数学手写体 (Mathematical Script)
- 大写: 𝒜̂ ℬ̂ 𝒞̂ 𝒟̂ ℰ̂ ℱ̂ 𝒢̂ ℋ̂ ℐ̂ 𝒥̂ 𝒦̂ ℒ̂ ℳ̂ 𝒩̂ 𝒪̂ 𝒫̂ 𝒬̂ ℛ̂ 𝒮̂ 𝒯̂ 𝒰̂ 𝒱̂ 𝒲̂ 𝒳̂ 𝒴̂ 𝒵̂
- 小写: 𝒶̂ 𝒷̂ 𝒸̂ 𝒹̂ ℯ̂ 𝒻̂ ℊ̂ 𝒽̂ 𝒾̂ 𝒿̂ 𝓀̂ 𝓁̂ 𝓂̂ 𝓃̂ ℴ̂ 𝓅̂ 𝓆̂ 𝓇̂ 𝓈̂ 𝓉̂ 𝓊̂ 𝓋̂ 𝓌̂ 𝓍̂ 𝓎̂ 𝓏̂

数学哥特体 (Mathematical Fraktur)
- 大写: 𝔄̂ 𝔅̂ ℭ̂ 𝔇̂ 𝔈̂ 𝔉̂ 𝔊̂ ℌ̂ ℑ̂ 𝔍̂ 𝔎̂ 𝔏̂ 𝔐̂ 𝔑̂ 𝔒̂ 𝔓̂ 𝔔̂ ℜ̂ 𝔖̂ 𝔗̂ 𝔘̂ 𝔙̂ 𝔚̂ 𝔛̂ 𝔜̂ ℨ̂
- 小写: 𝔞̂ 𝔟̂ 𝔠̂ 𝔡̂ 𝔢̂ 𝔣̂ 𝔤̂ 𝔥̂ 𝔦̂ 𝔧̂ 𝔨̂ 𝔩̂ 𝔪̂ 𝔫̂ 𝔬̂ 𝔭̂ 𝔮̂ 𝔯̂ 𝔰̂ 𝔱̂ 𝔲̂ 𝔳̂ 𝔴̂ 𝔵̂ 𝔶̂ 𝔷̂

数学双线体/黑板粗体 (Mathematical Blackboard Bold)
- 大写: 𝔸̂ 𝔹̂ ℂ̂ 𝔻̂ 𝔼̂ 𝔽̂ 𝔾̂ ℍ̂ 𝕀̂ 𝕁̂ 𝕂̂ 𝕃̂ 𝕄̂ ℕ̂ 𝕆̂ ℙ̂ ℚ̂ ℝ̂ 𝕊̂ 𝕋̂ 𝕌̂ 𝕍̂ 𝕎̂ 𝕏̂ 𝕐̂ ℤ̂
- 小写: 𝕒̂ 𝕓̂ 𝕔̂ 𝕕̂ 𝕖̂ 𝕗̂ 𝕘̂ 𝕙̂ 𝕚̂ 𝕛̂ 𝕜̂ 𝕝̂ 𝕞̂ 𝕟̂ 𝕠̂ 𝕡̂ 𝕢̂ 𝕣̂ 𝕤̂ 𝕥̂ 𝕦̂ 𝕧̂ 𝕨̂ 𝕩̂ 𝕪̂ 𝕫̂

数学无衬线粗体 (Mathematical Sans-serif Bold)
- 大写: 𝗔̂ 𝗕̂ 𝗖̂ 𝗗̂ 𝗘̂ 𝗙̂ 𝗚̂ 𝗛̂ 𝗜̂ 𝗝̂ 𝗞̂ 𝗟̂ 𝗠̂ 𝗡̂ 𝗢̂ 𝗣̂ 𝗤̂ 𝗥̂ 𝗦̂ 𝗧̂ 𝗨̂ 𝗩̂ 𝗪̂ 𝗫̂ 𝗬̂ 𝗭̂
- 小写: 𝗮̂ 𝗯̂ 𝗰̂ 𝗱̂ 𝗲̂ 𝗳̂ 𝗴̂ 𝗵̂ 𝗶̂ 𝗷̂ 𝗸̂ 𝗹̂ 𝗺̂ 𝗻̂ 𝗼̂ 𝗽̂ 𝗾̂ 𝗿̂ 𝘀̂ 𝘁̂ 𝘂̂ 𝘃̂ 𝘄̂ 𝘅̂ 𝘆̂ 𝘇̂

∂̂ ∇̂ Δ̂ □̂ ⊗̂ ⊕̂



带 Bar (¯) 的组合字符 (Unicode U+0304 COMBINING MACRON)
拉丁字母 (小写): ā, b̄, c̄, d̄, ē, f̄, ḡ, h̄, ī, j̄, k̄, l̄, m̄, n̄, ō, p̄, q̄, r̄, s̄, t̄, ū, v̄, w̄, x̄, ȳ, z̄
拉丁字母 (大写): Ā, B̄, C̄, D̄, Ē, F̄, Ḡ, H̄, Ī, J̄, K̄, L̄, M̄, N̄, Ō, P̄, Q̄, R̄, S̄, T̄, Ū, V̄, W̄, X̄, Ȳ, Z̄
希腊字母 (小写): ᾱ, β̄, γ̄, δ̄, ε̄, ζ̄, η̄, θ̄, ῑ, κ̄, λ̄, μ̄, ν̄, ξ̄, ο̄, π̄, ρ̄, σ̄, τ̄, ῡ, φ̄, χ̄, ψ̄, ω̄
希腊字母 (大写): Γ̄, Δ̄, Θ̄, Λ̄, Ξ̄, Π̄, Σ̄, Ῡ, Φ̄, Ψ̄, Ω̄
数字: 0̄, 1̄, 2̄, 3̄, 4̄, 5̄, 6̄, 7̄, 8̄, 9̄ (非常少见)

数学字母数字 (示例 - 需用字符检视器):
数学手写体 (Mathematical Script)
- 大写: 𝒜̄ ℬ̄ 𝒞̄ 𝒟̄ ℰ̄ ℱ̄ 𝒢̄ ℋ̄ ℐ̄ 𝒥̄ 𝒦̄ ℒ̄ ℳ̄ 𝒩̄ 𝒪̄ 𝒫̄ 𝒬̄ ℛ̄ 𝒮̄ 𝒯̄ 𝒰̄ 𝒱̄ 𝒲̄ 𝒳̄ 𝒴̄ 𝒵̄
- 小写: 𝒶̄ 𝒷̄ 𝒸̄ 𝒹̄ ℯ̄ 𝒻̄ ℊ̄ 𝒽̄ 𝒾̄ 𝒿̄ 𝓀̄ 𝓁̄ 𝓂̄ 𝓃̄ ℴ̄ 𝓅̄ 𝓆̄ 𝓇̄ 𝓈̄ 𝓉̄ 𝓊̄ 𝓋̄ 𝓌̄ 𝓍̄ 𝓎̄ 𝓏̄

数学哥特体 (Mathematical Fraktur)
- 大写: 𝔄̂ 𝔅̂ ℭ̂ 𝔇̂ 𝔈̂ 𝔉̂ 𝔊̂ ℌ̂ ℑ̂ 𝔍̂ 𝔎̂ 𝔏̂ 𝔐̂ 𝔑̂ 𝔒̂ 𝔓̂ 𝔔̂ ℜ̂ 𝔖̂ 𝔗̂ 𝔘̂ 𝔙̂ 𝔚̂ 𝔛̂ 𝔜̂ ℨ̂
- 小写: 𝔞̂ 𝔟̂ 𝔠̂ 𝔡̂ 𝔢̂ 𝔣̂ 𝔤̂ 𝔥̂ 𝔦̂ 𝔧̂ 𝔨̂ 𝔩̂ 𝔪̂ 𝔫̂ 𝔬̂ 𝔭̂ 𝔮̂ 𝔯̂ 𝔰̂ 𝔱̂ 𝔲̂ 𝔳̂ 𝔴̂ 𝔵̂ 𝔶̂ 𝔷̂

数学双线体/黑板粗体 (Mathematical Blackboard Bold)
- 大写: 𝔸̄ 𝔹̄ ℂ̄ 𝔻̄ 𝔼̄ 𝔽̄ 𝔾̄ ℍ̄ 𝕀̄ 𝕁̄ 𝕂̄ 𝕃̄ 𝕄̄ ℕ̄ 𝕆̄ ℙ̄ ℚ̄ ℝ̄ 𝕊̄ 𝕋̄ 𝕌̄ 𝕍̄ 𝕎̄ 𝕏̄ 𝕐̄ ℤ̄
- 小写: 𝕒̄ 𝕓̄ 𝕔̄ 𝕕̄ 𝕖̄ 𝕗̄ 𝕘̄ 𝕙̄ 𝕚̄ 𝕛̄ 𝕜̄ 𝕝̄ 𝕞̄ 𝕟̄ 𝕠̄ 𝕡̄ 𝕢̄ 𝕣̄ 𝕤̄ 𝕥̄ 𝕦̄ 𝕧̄ 𝕨̄ 𝕩̄ 𝕪̄ 𝕫̄

数学无衬线粗体 (Mathematical Sans-serif Bold)
- 大写: 𝗔̄ 𝗕̄ 𝗖̄ 𝗗̄ 𝗘̄ 𝗙̄ 𝗚̄ 𝗛̄ 𝗜̄ 𝗝̄ 𝗞̄ 𝗟̄ 𝗠̄ 𝗡̄ 𝗢̄ 𝗣̄ 𝗤̄ 𝗥̄ 𝗦̄ 𝗧̄ 𝗨̄ 𝗩̄ 𝗪̄ 𝗫̄ 𝗬̄ 𝗭̄
- 小写: 𝗮̄ 𝗯̄ 𝗰̄ 𝗱̄ 𝗲̄ 𝗳̄ 𝗴̄ 𝗵̄ 𝗶̄ 𝗷̄ 𝗸̄ 𝗹̄ 𝗺̄ 𝗻̄ 𝗼̄ 𝗽̄ 𝗾̄ 𝗿̄ 𝘀̄ 𝘁̄ 𝘂̄ 𝘃̄ 𝘄̄ 𝘅̄ 𝘆̄ 𝘇̄

̄  ∂̄ ∇̄ Δ̄ □̄ ⊗̄ ⊕̄

带 Tilde (~) 的组合字符 (Unicode U+0303 COMBINING TILDE)

拉丁字母 (小写): ã, b̃, c̃, d̃, ẽ, f̃, g̃, h̃, ĩ, j̃, k̃, l̃, m̃, ñ, õ, p̃, q̃, r̃, s̃, t̃, ũ, ṽ, w̃, x̃, ỹ, z̃ (ñ 是西班牙语常用字母)
拉丁字母 (大写): Ã, B̃, C̃, D̃, Ẽ, F̃, G̃, H̃, Ĩ, J̃, K̃, L̃, M̃, Ñ, Õ, P̃, Q̃, R̃, S̃, T̃, Ũ, Ṽ, W̃, X̃, Ỹ, Z̃
希腊字母 (小写): α̃, β̃, γ̃, δ̃, ε̃, ζ̃, η̃, θ̃, ι̃, κ̃, λ̃, μ̃, ν̃, ξ̃, ο̃, π̃, ρ̃, σ̃, τ̃, υ̃, φ̃, χ̃, ψ̃, ω̃
希腊字母 (大写): Γ̃, Δ̃, Θ̃, Λ̃, Ξ̃, Π̃, Σ̃, Υ̃, Φ̃, Ψ̃, Ω̃
数字: 0̃, 1̃, 2̃, 3̃, 4̃, 5̃, 6̃, 7̃, 8̃, 9̃ (非常少见)

数学字母数字 (示例 - 需用字符检视器):
数学手写体 (Mathematical Script)
- 大写: 𝒜̃ ℬ̃ 𝒞̃ 𝒟̃ ℰ̃ ℱ̃ 𝒢̃ ℋ̃ ℐ̃ 𝒥̃ 𝒦̃ ℒ̃ ℳ̃ 𝒩̃ 𝒪̃ 𝒫̃ 𝒬̃ ℛ̃ 𝒮̃ 𝒯̃ 𝒰̃ 𝒱̃ 𝒲̃ 𝒳̃ 𝒴̃ 𝒵̃
- 小写: 𝒶̃ 𝒷̃ 𝒸̃ 𝒹̃ ℯ̃ 𝒻̃ ℊ̃ 𝒽̃ 𝒾̃ 𝒿̃ 𝓀̃ 𝓁̃ 𝓂̃ 𝓃̃ ℴ̃ 𝓅̃ 𝓆̃ 𝓇̃ 𝓈̃ 𝓉̃ 𝓊̃ 𝓋̃ 𝓌̃ 𝓍̃ 𝓎̃ 𝓏̃

数学哥特体 (Mathematical Fraktur)
- 大写: 𝔄̃ 𝔅̃ ℭ̃ 𝔇̃ 𝔈̃ 𝔉̃ 𝔊̃ ℌ̃ ℑ̃ 𝔍̃ 𝔎̃ 𝔏̃ 𝔐̃ 𝔑̃ 𝔒̃ 𝔓̃ 𝔔̃ ℜ̃ 𝔖̃ 𝔗̃ 𝔘̃ 𝔙̃ 𝔚̃ 𝔛̃ 𝔜̃ ℨ̃
- 小写: 𝔞̃ 𝔟̃ 𝔠̃ 𝔡̃ 𝔢̃ 𝔣̃ 𝔤̃ 𝔥̃ 𝔦̃ 𝔧̃ 𝔨̃ 𝔩̃ 𝔪̃ 𝔫̃ 𝔬̃ 𝔭̃ 𝔮̃ 𝔯̃ 𝔰̃ 𝔱̃ 𝔲̃ 𝔳̃ 𝔴̃ 𝔵̃ 𝔶̃ 𝔷̃

数学双线体/黑板粗体 (Mathematical Blackboard Bold)
- 大写: 𝔸̃ 𝔹̃ ℂ̃ 𝔻̃ 𝔼̃ 𝔽̃ 𝔾̃ ℍ̃ 𝕀̃ 𝕁̃ 𝕂̃ 𝕃̃ 𝕄̃ ℕ̃ 𝕆̃ ℙ̃ ℚ̃ ℝ̃ 𝕊̃ 𝕋̃ 𝕌̃ 𝕍̃ 𝕎̃ 𝕏̃ 𝕐̃ ℤ̃
- 小写: 𝕒̃ 𝕓̃ 𝕔̃ 𝕕̃ 𝕖̃ 𝕗̃ 𝕘̃ 𝕙̃ 𝕚̃ 𝕛̃ 𝕜̃ 𝕝̃ 𝕞̃ 𝕟̃ 𝕠̃ 𝕡̃ 𝕢̃ 𝕣̃ 𝕤̃ 𝕥̃ 𝕦̃ 𝕧̃ 𝕨̃ 𝕩̃ 𝕪̃ 𝕫̃

数学无衬线粗体 (Mathematical Sans-serif Bold)
- 大写: 𝗔̃ 𝗕̃ 𝗖̃ 𝗗̃ 𝗘̃ 𝗙̃ 𝗚̃ 𝗛̃ 𝗜̃ 𝗝̃ 𝗞̃ 𝗟̃ 𝗠̃ 𝗡̃ 𝗢̃ 𝗣̃ 𝗤̃ 𝗥̃ 𝗦̃ 𝗧̃ 𝗨̃ 𝗩̃ 𝗪̃ 𝗫̃ 𝗬̃ 𝗭̃
- 小写: 𝗮̃ 𝗯̃ 𝗰̃ 𝗱̃ 𝗲̃ 𝗳̃ 𝗴̃ 𝗵̃ 𝗶̃ 𝗷̃ 𝗸̃ 𝗹̃ 𝗺̃ 𝗻̃ 𝗼̃ 𝗽̃ 𝗾̃ 𝗿̃ 𝘀̃ 𝘁̃ 𝘂̃ 𝘃̃ 𝘄̃ 𝘅̃ 𝘆̃ 𝘇̃

∂̃ ∇̃ Δ̃ □̃ ⊗̃ ⊕̃

I. 数学手写体 (Mathematical Script)

𝒜 ℬ 𝒞 𝒟 ℰ ℱ 𝒢 ℋ ℐ 𝒥 𝒦 ℒ ℳ 𝒩 𝒪 𝒫 𝒬 ℛ 𝒮 𝒯 𝒰 𝒱 𝒲 𝒳 𝒴 𝒵
𝒶 𝒷 𝒸 𝒹 ℯ 𝒻 ℊ 𝒽 𝒾 𝒿 𝓀 𝓁 𝓂 𝓃 ℴ 𝓅 𝓆 𝓇 𝓈 𝓉 𝓊 𝓋 𝓌 𝓍 𝓎 𝓏

II. 数学哥特体 (Mathematical Fraktur)

𝔄 𝔅 ℭ 𝔇 𝔈 𝔉 𝔊 ℌ ℑ 𝔍 𝔎 𝔏 𝔐 𝔑 𝔒 𝔓 𝔔 ℜ 𝔖 𝔗 𝔘 𝔙 𝔚 𝔛 𝔜 ℨ
𝔞 𝔟 𝔠 𝔡 𝔢 𝔣 𝔤 𝔥 𝔦 𝔧 𝔨 𝔩 𝔪 𝔫 𝔬 𝔭 𝔮 𝔯 𝔰 𝔱 𝔲 𝔳 𝔴 𝔵 𝔶 𝔷

III. 数学双线体/黑板粗体 (Mathematical Blackboard Bold)

𝔸 𝔹 ℂ 𝔻 𝔼 𝔽 𝔾 ℍ 𝕀 𝕁 𝕂 𝕃 𝕄 ℕ 𝕆 ℙ ℚ ℝ 𝕊 𝕋 𝕌 𝕍 𝕎 𝕏 𝕐 ℤ
𝕒 𝕓 𝕔 𝕕 𝕖 𝕗 𝕘 𝕙 𝕚 𝕛 𝕜 𝕝 𝕞 𝕟 𝕠 𝕡 𝕢 𝕣 𝕤 𝕥 𝕦 𝕧 𝕨 𝕩 𝕪 𝕫

IV. 数学无衬线粗体 (Mathematical Sans-serif Bold)

𝗔 𝗕 𝗖 𝗗 𝗘 𝗙 𝗚 𝗛 𝗜 𝗝 𝗞 𝗟 𝗠 𝗡 𝗢 𝗣 𝗤 𝗥 𝗦 𝗧 𝗨 𝗩 𝗪 𝗫 𝗬 𝗭 
𝗮 𝗯 𝗰 𝗱 𝗲 𝗳 𝗴 𝗵 𝗶 𝗷 𝗸 𝗹 𝗺 𝗻 𝗼 𝗽 𝗾 𝗿 𝘀 𝘁 𝘂 𝘃 𝘄 𝘅 𝘆 𝘇

上标 (Superscripts)
* 数字 (Digits): ⁰ ¹ ² ³ ⁴ ⁵ ⁶ ⁷ ⁸ ⁹
* 字母 (Letters): ᵃ ᵇ ᶜ ᵈ ᵉ ᶠ ᵍ ʰ ⁱ ʲ ᵏ ˡ ᵐ ⁿ ᵒ ᵖ ʳ ˢ ᵗ ᵘ ᵛ ʷ ˣ ʸ ᶻ ᴬ ᴮ ᴰ ᴱ ᴳ ᴴ ᴵ ᴶ ᴷ ᴸ ᴹ ᴺ ᴼ ᴾ ᴿ ᵀ ᵁ ᵂ (大写字母上标较少有单一字符，ᵀ (U+1D40) 常用作转置)
* 符号 (Symbols): ⁺ ⁻ ⁼ ⁽ ⁾
下标 (Subscripts)
* 数字 (Digits): ₀ ₁ ₂ ₃ ₄ ₅ ₆ ₇ ₈ ₉
* 字母 (Letters): ₐ ₑ ₕ ᵢ ⱼ ₖ ₗ ₘ ₙ ₒ ₚ ᵣ ₛ ₜ ᵤ ᵥ ₓ (其他下标字母如 ♭ ꞔ ᑯ 𝘧 ɡ ħ ইত্যাদি 在特定领域外不常用作直接输入的下标)
* 符号 (Symbols): ₊ ₋ ₌ ₍ ₎

希腊字母
Α α
Β β
Γ γ
Δ δ
Ε ε
Ζ ζ
Η η
Θ θ
Ι ι
Κ κ
Λ λ
Μ μ
Ν ν
Ξ ξ
Ο ο
Π π
Ρ ρ
Σ σ/ς
Τ τ
Υ υ
Φ φ
Χ χ
Ψ ψ
Ω ω

## Mathematical Field Terminology Reference
- **Analysis**: 分析学、实分析、复分析、泛函分析
- **Algebra**: 代数学、线性代数、抽象代数、群论
- **Topology**: 拓扑学、一般拓扑、代数拓扑
- **Probability**: 概率论、随机过程、统计学
- **Geometry**: 几何学、微分几何、代数几何
- **Number Theory**: 数论、解析数论、代数数论
`
          let result = await KnowledgeBaseNetwork.OCR(compressedImageData, KnowledgeBaseConfig.config.excerptOCRModel, prompt)
          MNUtil.delay(1).then(()=>{
            MNUtil.stopHUD()
          })
          if (result) {
            MNUtil.undoGrouping(()=>{
              note.title = result.trim()
            })
            MNUtil.postNotification("OCRFinished", {action:"toTitle", noteId:note.noteId, result:result})
          }
        }
      } catch (error) {
        KnowledgeBaseUtils.addErrorLog(error, "onProcessNewExcerpt")
      }
    },

    queryAddonCommandStatus: function() {
      return MNUtil.studyMode !== 3
        ? {
            image: "logo.png",
            object: self,
            selector: "toggleAddon:",
            checked: self.toggled
          }
        : null
    },

    // 点击插件图标执行的方法。
    toggleAddon: async function(button) {
      try {
        self.toggled = !self.toggled
        MNUtil.refreshAddonCommands()

        let commandTable = [
          // === 索引管理 ===
          self.tableItem('🔄   索引知识库', 'updateSearchIndex:'),
          self.tableItem('📋   搜索知识库', 'searchForMarkdown:'),
          self.tableItem('-------------------------------',''),
          // === 中间知识库管理 ===
          self.tableItem('📝   索引中间知识库', 'updateIntermediateKnowledgeIndex:'),
          self.tableItem('🔎   搜索中间知识库', 'searchInIntermediateKB:'),
          self.tableItem('-------------------------------',''),
          // === 通用搜索（支持自定义类型）===
          self.tableItem('🔍   全部搜索(脑图定位)', 'searchInKB:', true),
          
          // === 快捷搜索 - 脑图定位 ===
          self.tableItem('    📚  知识卡片', 'searchWithPreset:', {preset: 'knowledge', mode: 'mindmap'}),
          self.tableItem('    📘  仅定义', 'searchWithPreset:', {preset: 'definitions', mode: 'mindmap'}),
          self.tableItem('    📁  仅归类', 'searchWithPreset:', {preset: 'classifications', mode: 'mindmap'}),
          self.tableItem('    📒  定义与归类', 'searchWithPreset:', {preset: 'definitionsAndClassifications', mode: 'mindmap'}),

          // // === 快捷搜索 - 浮窗定位 ===
          // self.tableItem('🔍   全部搜索(浮窗定位)', 'searchInKB:', false),
          // self.tableItem('    📚  知识卡片(浮窗)', 'searchWithPreset:', {preset: 'knowledge', mode: 'float'}),
          // self.tableItem('    📘  仅定义(浮窗)', 'searchWithPreset:', {preset: 'definitions', mode: 'float'}),
          // self.tableItem('    📁  仅归类(浮窗)', 'searchWithPreset:', {preset: 'classifications', mode: 'float'}),
          // self.tableItem('    📒  定义与归类(浮窗)', 'searchWithPreset:', {preset: 'definitionsAndClassifications', mode: 'float'}),
          self.tableItem('-------------------------------',''),
          // === 配置管理 ===
          self.tableItem('📜   搜索历史', 'showSearchHistory:'),
          self.tableItem('🔍   搜索模式设置', 'configureSearchMode:'),
          self.tableItem('🔤   同义词管理', 'manageSynonyms:'),
          // self.tableItem('🚫   排除词管理', 'manageExclusions:'),
          // self.tableItem('📤   分享索引文件', 'shareIndexFile:'),
          self.tableItem('-------------------------------',''),
          self.tableItem('⚙️   摘录 OCR 模型设置', 'excerptOCRModelSetting:', button),
          self.tableItem("🤖   摘录自动 OCR 到标题", 'newExcerptWithOCRToTitleToggled:', undefined, self.newExcerptWithOCRToTitle),
          self.tableItem('🤖   预摘录模式', 'preExcerptModeToggled:', undefined, self.preExcerptMode),
        ];

        // 显示菜单
        self.popoverController = MNUtil.getPopoverAndPresent(
          button,        // 触发按钮
          commandTable,  // 菜单项
          250,          // 宽度（增加到250以适应更长的菜单项）
          0             // 箭头方向（0=自动）
        );
      } catch (error) {
        MNUtil.showHUD(error);
        MNLog.error({
          message:error,
          source:"MNKnowledgeBase: toggleAddon",
        })
      }
    },

    excerptOCRModelSetting: function(button) {
      try {
        self.checkPopover()
        let commandTable = []
        for (let source of KnowledgeBaseConfig.excerptOCRSources) {
          commandTable.push(self.tableItem(source, 'setExcerptOCRModel:', source, KnowledgeBaseConfig.config.excerptOCRModelIndex === KnowledgeBaseConfig.excerptOCRSources.indexOf(source)))
        }
        self.popoverController = MNUtil.getPopoverAndPresent(
          button,        // 触发按钮
          commandTable,  // 菜单项
          250,          // 宽度（增加到250以适应更长的菜单项）
          0             // 箭头方向（0=自动）
        );
      } catch (error) {
        KnowledgeBaseUtils.addErrorLog(error, "excerptOCRModelSetting")
      }
    },

    setExcerptOCRModel: function(source) {
      try {
        self.checkPopover()
        MNUtil.showHUD("已设置摘录 OCR 模型为 " + source, 1)
        KnowledgeBaseConfig.config.excerptOCRModel = source
        KnowledgeBaseConfig.config.excerptOCRModelIndex = KnowledgeBaseConfig.excerptOCRSources.indexOf(source)
        KnowledgeBaseConfig.save()
      } catch (error) {
        KnowledgeBaseUtils.addErrorLog(error, "setExcerptOCRModel")
      }
    },

    newExcerptWithOCRToTitleToggled: function() {
      self.checkPopover()
      self.newExcerptWithOCRToTitle = !self.newExcerptWithOCRToTitle
      MNUtil.showHUD(self.newExcerptWithOCRToTitle ? "已开启摘录自动 OCR 到标题" : "已关闭摘录自动 OCR 到标题", 1)
    },

    preExcerptModeToggled: function() {
      self.checkPopover()
      self.preExcerptMode = !self.preExcerptMode
      MNUtil.showHUD(self.preExcerptMode ? "已开启预摘录模式" : "已关闭预摘录模式", 1)
    },
    openSetting: function() {
      MNUtil.showHUD("打开设置界面")
      // 关闭菜单
      if (self.popoverController) {
        self.popoverController.dismissPopoverAnimated(true);
      }
    },

    openKnowledgeBaseLibrary: function() {
      MNUtil.showHUD("打开文献数据库")
      // 关闭菜单
      if (self.popoverController) {
        self.popoverController.dismissPopoverAnimated(true);
      }
    },
    
    /**
     * 更新搜索索引（异步版本）
     */
    updateSearchIndex: async function() {
      try {
        // 关闭菜单
        if (self.popoverController) {
          self.popoverController.dismissPopoverAnimated(true);
        }
        
        let rootNote = MNNote.new("marginnote4app://note/B2A5D567-909C-44E8-BC08-B1532D3D0AA1")
        if (!rootNote) {
          MNUtil.showHUD("知识库不存在！");
          return;
        }
        
        // 显示开始提示
        MNUtil.showHUD("开始构建索引，请稍候...");
        
        // 延迟执行以确保 UI 更新
        await MNUtil.delay(0.1);
        
        // 异步构建索引（内部会显示进度）
        const manifest = await KnowledgeBaseIndexer.buildSearchIndex([rootNote]);
        
        // 检查结果
        if (manifest && manifest.metadata && manifest.metadata.totalCards > 0) {
          MNUtil.showHUD(`索引构建成功！共 ${manifest.metadata.totalCards} 张卡片，${manifest.metadata.totalParts} 个分片`);
        } else {
          MNUtil.showHUD("没有找到可索引的卡片");
        }
        
      } catch (error) {
        MNUtil.showHUD("更新索引失败: " + error.message);
        MNLog.error(error, "MNKnowledgeBase: updateSearchIndex");
      }
    },
    
    searchInKB: async function(focusInMindMap = true) {
      try {
        self.checkPopover()

        // 异步加载搜索器
        const searcher = await KnowledgeBaseSearcher.loadFromFile();
        if (!searcher) {
          MNUtil.showHUD("索引未找到，请先更新搜索索引");
          return;
        }

        // 注意：showSearchDialog 内部也需要支持异步搜索
        KnowledgeBaseSearcher.showSearchDialog(searcher, {}, focusInMindMap);

      } catch (error) {
        MNUtil.showHUD("快速搜索失败: " + error.message);
        MNLog.error(error, "MNKnowledgeBase: searchInKB");
      }
    },

    /**
     * 更新中间知识库索引
     */
    updateIntermediateKnowledgeIndex: async function() {
      try {
        // 关闭菜单
        if (self.popoverController) {
          self.popoverController.dismissPopoverAnimated(true);
        }

        // 中间知识库根卡片ID数组
        // TODO: 这里需要配置你的中间知识库根卡片ID
        const intermediateRootIds = [
          "marginnote4app://note/FC6181AF-1BAC-4D1D-9B86-7FAB3391F3EC",
          "marginnote4app://note/9D234BE6-9A7C-4BEC-8924-F18132FB6E64",
          "marginnote4app://note/74785805-661C-4836-AFA6-C85697056B0C",
          "marginnote4app://note/B48C92CF-A5FD-442A-BF8C-53E1E801F05D", // 预备知识库
        ];

        // 验证根卡片
        const rootNotes = [];
        for (const rootId of intermediateRootIds) {
          const note = MNNote.new(rootId);
          if (note) {
            rootNotes.push(note);
          }
        }

        if (rootNotes.length === 0) {
          MNUtil.showHUD("中间知识库根卡片未配置或不存在！");
          return;
        }

        // 显示开始提示
        MNUtil.showHUD("开始构建中间知识库索引，请稍候...");

        // 延迟执行以确保 UI 更新
        await MNUtil.delay(0.1);

        // 异步构建索引
        const manifest = await IntermediateKnowledgeIndexer.buildSearchIndex(rootNotes);

        // 检查结果
        if (manifest && manifest.metadata && manifest.metadata.totalCards > 0) {
          MNUtil.showHUD(`中间知识库索引构建成功！共 ${manifest.metadata.totalCards} 张卡片，${manifest.metadata.totalParts} 个分片`);
        } else {
          MNUtil.showHUD("没有找到可索引的卡片");
        }

      } catch (error) {
        MNUtil.showHUD("更新中间知识库索引失败: " + error.message);
        MNLog.error({
          message: "更新中间知识库索引失败",
          error: error.message,
          stack: error.stack,
          detail: JSON.stringify({
            intermediateRootIds: intermediateRootIds,
            errorType: error.name || "UnknownError"
          })
        }, "MNKnowledgeBase.updateIntermediateKnowledgeIndex");
      }
    },

    /**
     * 搜索中间知识库
     */
    searchInIntermediateKB: async function() {
      try {
        self.checkPopover()

        // 检查缓存
        if (!self.intermediateSearchCache || !self.intermediateSearchCache.data) {
          // 加载中间知识库索引
          const manifest = IntermediateKnowledgeIndexer.loadIndexManifest();
          if (!manifest) {
            MNUtil.showHUD("中间知识库索引未找到，请先更新索引");
            return;
          }

          // 加载索引数据
          const searchData = [];
          for (const partInfo of manifest.parts) {
            const part = IntermediateKnowledgeIndexer.loadIndexPart(partInfo.filename);
            if (part && part.data) {
              searchData.push(...part.data);
            }
          }

          if (searchData.length === 0) {
            MNUtil.showHUD("中间知识库索引为空");
            return;
          }

          // 缓存数据（有效期5分钟）
          self.intermediateSearchCache = {
            data: searchData,
            timestamp: Date.now(),
            expiry: 5 * 60 * 1000 // 5分钟
          };
        } else {
          // 检查缓存是否过期
          if (Date.now() - self.intermediateSearchCache.timestamp > self.intermediateSearchCache.expiry) {
            self.intermediateSearchCache = null;
            self.searchInIntermediateKB(); // 重新加载
            return;
          }
        }

        // 显示搜索对话框（使用缓存的数据）
        self.showIntermediateSearchDialog(self.intermediateSearchCache.data);

      } catch (error) {
        MNUtil.showHUD("搜索中间知识库失败: " + error.message);
        MNLog.error(error, "MNKnowledgeBase: searchInIntermediateKB");
      }
    },
    
    /**
     * 分享索引文件（支持新版分片索引）
     */
    shareIndexFile: async function() {
      try {
        // 关闭菜单
        if (self.popoverController) {
          self.popoverController.dismissPopoverAnimated(true);
        }
        
        // 生成时间戳
        const date = new Date();
        const timestamp = date.toISOString().replace(/[:.]/g, '-').slice(0, -5);
        
        // 首先尝试加载新版分片索引
        const manifest = KnowledgeBaseIndexer.loadIndexManifest();
        if (manifest && manifest.metadata) {
          // 新版分片索引：合并所有分片到一个文件（用于分享）
          const mergedIndex = {
            metadata: manifest.metadata,
            searchData: []
          };
          
          // 加载并合并所有分片
          for (const partInfo of manifest.parts) {
            const part = KnowledgeBaseIndexer.loadIndexPart(partInfo.filename);
            if (part && part.data) {
              mergedIndex.searchData = mergedIndex.searchData.concat(part.data);
            }
          }
          
          // 导出合并后的索引
          const filename = `kb-search-index-merged-${timestamp}.json`;
          const filepath = MNUtil.mainPath + "/" + filename;
          MNUtil.writeJSON(filepath, mergedIndex);
          MNUtil.saveFile(filepath, "public.json");
          
          MNUtil.showHUD(`索引文件已导出（${mergedIndex.searchData.length} 条记录）`);
          return;
        }
        
        // 向后兼容：尝试加载旧版单文件索引
        const index = KnowledgeBaseIndexer.loadIndex();
        if (index) {
          const filename = `kb-search-index-${timestamp}.json`;
          const filepath = MNUtil.mainPath + "/" + filename;
          MNUtil.writeJSON(filepath, index);
          MNUtil.saveFile(filepath, "public.json");
          
          MNUtil.showHUD("索引文件已导出");
          return;
        }
        
        // 没有找到任何索引
        MNUtil.showHUD("未找到索引，请先更新搜索索引");
        
      } catch (error) {
        MNUtil.showHUD("分享失败: " + error.message);
        MNLog.error(error, "MNKnowledgeBase: shareIndexFile");
      }
    },

    /**
     * 显示搜索历史
     */
    showSearchHistory: async function() {
      try {
        // 关闭菜单
        if (self.popoverController) {
          self.popoverController.dismissPopoverAnimated(true);
        }
        
        // 检查是否有搜索历史
        if (!KnowledgeBaseSearcher.searchHistory || KnowledgeBaseSearcher.searchHistory.length === 0) {
          MNUtil.showHUD("暂无搜索历史");
          return;
        }
        
        // 格式化时间显示
        const formatTime = (timestamp) => {
          const now = Date.now();
          const diff = now - timestamp;
          const seconds = Math.floor(diff / 1000);
          const minutes = Math.floor(seconds / 60);
          const hours = Math.floor(minutes / 60);
          const days = Math.floor(hours / 24);
          
          if (days > 0) return `${days}天前`;
          if (hours > 0) return `${hours}小时前`;
          if (minutes > 0) return `${minutes}分钟前`;
          return `刚刚`;
        };
        
        // 构建历史列表选项
        const options = KnowledgeBaseSearcher.searchHistory.map((entry, index) => {
          const typeInfo = entry.types ? `[${entry.types.join(",")}]` : "[全部]";
          const timeInfo = formatTime(entry.timestamp);
          return `${index + 1}. ${timeInfo} - "${entry.keyword}" ${typeInfo} (${entry.results.length}个结果)`;
        });
        
        // 添加清空历史选项
        options.push("🗑️ 清空搜索历史");
        
        // 显示历史列表
        const choice = await MNUtil.userSelect(
          `搜索历史 (最近${KnowledgeBaseSearcher.searchHistory.length}条)`,
          "选择要查看的历史记录：",
          options
        );
        
        if (choice === 0) {
          // 用户取消
          return;
        } else if (choice === options.length) {
          // 清空历史
          self.clearSearchHistory();
        } else {
          // 显示选中的历史记录结果
          const selectedHistory = KnowledgeBaseSearcher.searchHistory[choice - 1];

          // 尝试加载搜索器（用于返回搜索功能）
          const searcher = await KnowledgeBaseSearcher.loadFromFile();

          // 重用之前的搜索结果
          const searchOptions = {
            types: selectedHistory.types,
            searchModeConfig: selectedHistory.searchModeConfig,
            originalKeyword: selectedHistory.keyword,
            isFromHistory: true
          };

          // 显示历史搜索结果（不再使用保存的 mode，由用户在点击卡片时选择）
          KnowledgeBaseSearcher.showSearchResults(
            selectedHistory.results,
            searcher,
            searchOptions,
            true  // focusMode 参数在历史记录模式下不再使用
          );
        }
        
      } catch (error) {
        MNUtil.showHUD("显示搜索历史失败: " + error.message);
        MNLog.error(error, "MNKnowledgeBase: showSearchHistory");
      }
    },
    
    /**
     * 清空搜索历史
     */
    clearSearchHistory: async function() {
      self.clearSearchHistory()
    },

    /**
     * 配置搜索模式
     */
    configureSearchMode: async function() {
      try {
        // 关闭菜单
        if (self.popoverController) {
          self.popoverController.dismissPopoverAnimated(true);
        }
        
        // 调用搜索模式配置界面
        await KnowledgeBaseTemplate.configureSearchMode();
      } catch (error) {
        MNUtil.showHUD("配置搜索模式失败: " + error.message);
      }
    },

    /**
     * 管理同义词
     */
    manageSynonyms: async function() {
      try {
        // 关闭菜单
        if (self.popoverController) {
          self.popoverController.dismissPopoverAnimated(true);
        }
        
        // 调用同义词管理界面
        await KnowledgeBaseTemplate.manageSynonymGroups();
      } catch (error) {
        MNUtil.showHUD("管理同义词失败: " + error.message);
        MNLog.error(error, "MNKnowledgeBase: manageSynonyms");
      }
    },

    /**
     * 管理排除词
     */
    manageExclusions: async function() {
      try {
        // 关闭菜单
        if (self.popoverController) {
          self.popoverController.dismissPopoverAnimated(true);
        }
        
        // 调用排除词管理界面
        await KnowledgeBaseTemplate.manageExclusionGroups();
      } catch (error) {
        MNUtil.showHUD("管理排除词失败: " + error.message);
        MNLog.error(error, "MNKnowledgeBase: manageExclusions");
      }
    },

    /**
     * 使用预设类型进行快捷搜索
     * @param {Object} config - 配置对象 {preset: string, mode: string}
     */
    searchWithPreset: async function(config) {
      try {
        self.checkPopover();
        
        const { preset, mode } = config;
        
        // 异步加载搜索器
        const searcher = await KnowledgeBaseSearcher.loadFromFile();
        if (!searcher) {
          MNUtil.showHUD("索引未找到，请先更新搜索索引");
          return;
        }
        
        // 获取预设类型
        const types = SearchConfig.getTypesByPreset(preset);
        if (!types) {
          MNUtil.showHUD("无效的搜索预设");
          return;
        }
        
        // 根据 mode 确定定位方式
        const focusMode = mode === 'mindmap' ? true : false;
        
        // 显示搜索对话框，跳过类型选择
        const searchConfig = {
          enableTypeSelection: false,  // 禁用类型选择
          defaultTypes: types,         // 使用预设类型
          presetKey: preset            // 传递预设键用于显示
        };
        
        KnowledgeBaseSearcher.showSearchDialog(searcher, searchConfig, focusMode);
        
      } catch (error) {
        MNUtil.showHUD("快捷搜索失败: " + error.message);
        MNLog.error(error, "MNKnowledgeBase: searchWithPreset");
      }
    },

    /**
     * 搜索并复制 Markdown 链接
     */
    searchForMarkdown: async function() {
      try {
        self.checkPopover();
        
        // 异步加载搜索器
        const searcher = await KnowledgeBaseSearcher.loadFromFile();
        if (!searcher) {
          MNUtil.showHUD("索引未找到，请先更新搜索索引");
          return;
        }
        
        // 获取知识卡片类型
        const types = SearchConfig.getTypesByPreset('knowledge');
        
        // 显示搜索对话框，使用知识卡片类型
        // 传递 true 作为 focusMode，表示正常的搜索（将在选中后显示操作菜单）
        KnowledgeBaseSearcher.showSearchDialog(searcher, {
          enableTypeSelection: false,  // 禁用类型选择
          defaultTypes: types,         // 使用知识卡片类型
          presetKey: 'knowledge'       // 使用知识卡片预设
        }, true);
        
      } catch (error) {
        MNUtil.showHUD("搜索失败: " + error.message);
        MNLog.error(error, "MNKnowledgeBase: searchForMarkdown");
      }
    },


    // 生命周期测试

    // onPopupMenuOnNote: async function (sender) {
    //   MNUtil.undoGrouping(()=>{
    //     try {
    //     } catch (error) {
    //       MNUtil.showHUD(error);
    //     }
    //   })
    // }
  }, 
  
  /*=== 类成员（Class members）===
   * 这些方法对应整个插件的全局生命周期
   * 无论有多少个窗口，这些方法只会被调用一次
   */
  {
    /**
     * 插件连接时调用 - 插件首次加载时
     * 
     * 这是插件的全局初始化时机，适合：
     * - 注册全局事件监听器
     * - 初始化全局配置
     * - 设置插件的基础服务
     */
    addonDidConnect: function() {
      // 示例中为空实现
    },
    
    /**
     * 插件即将断开时调用 - 插件卸载前
     * 
     * 进行全局清理工作：
     * - 取消全局事件监听
     * - 保存插件配置
     * - 释放全局资源
     */
    addonWillDisconnect: function() {
      // 示例中为空实现
    },
    
    /**
     * 应用程序即将进入前台时调用
     * 
     * 适用于 iOS/iPadOS 平台，当用户从后台切换回 MarginNote 时触发
     */
    applicationWillEnterForeground: function() {
      // 示例中为空实现
    },
    
    /**
     * 应用程序进入后台时调用
     * 
     * 适用于 iOS/iPadOS 平台，当用户切换到其他应用时触发
     */
    applicationDidEnterBackground: function() {
      // 示例中为空实现
    },
    
    /**
     * 收到本地通知时调用
     * 
     * 处理系统通知或定时提醒
     * 
     * @param {Object} notify 通知对象
     */
    applicationDidReceiveLocalNotification: function(notify) {
      // 示例中为空实现
    },
  });

  MNKnowledgeBaseClass.prototype.checkPopover = function(){
    // 关闭菜单
    if (this.popoverController) {
      this.popoverController.dismissPopoverAnimated(true);
    }
  }

  MNKnowledgeBaseClass.prototype.tableItem = function (title, selector, param = "", checked = false) {
    return {
      title: title,        // 菜单项显示的文字
      object: this,        // 执行方法的对象（重要！）
      selector: selector,  // 点击后要调用的方法名
      param: param,        // 传递给方法的参数
      checked: checked     // 是否显示勾选状态
    }
  }

  /**
   * 显示中间知识库搜索对话框
   */
  MNKnowledgeBaseClass.prototype.showIntermediateSearchDialog = async function(searchData) {
    try {
      const searchModeConfig = KnowledgeBaseTemplate.getSearchConfig();

      const userInput = await MNUtil.userInput(
        `搜索中间知识库 (共 ${searchData.length} 张卡片)`,
        "请输入搜索关键词：",
        ["取消", "搜索"]
      );

      if (userInput.button !== 1) {
        return;
      }

      const rawKeyword = userInput.input.trim();
      if (!rawKeyword) {
        return;
      }

      // 根据配置扩展查询（同义词）
      let expandedKeyword = rawKeyword;
      if (searchModeConfig.useSynonyms) {
        expandedKeyword = KnowledgeBaseIndexer.expandSearchQuery(rawKeyword, true);
      }

      const parsedQuery = KnowledgeBaseSearcher.parseSearchQuery(expandedKeyword);
      const hasConditions = parsedQuery.andGroups.length > 0 ||
        parsedQuery.orGroups.length > 0 ||
        parsedQuery.exactPhrases.length > 0;

      if (!hasConditions) {
        MNUtil.showHUD("请输入有效的搜索条件");
        return;
      }

      const results = [];
      for (const entry of searchData) {
        if (!entry.searchText) continue;

        if (KnowledgeBaseSearcher.matchesQuery(entry.searchText, parsedQuery)) {
          const score = this.calculateIntermediateSearchScore(parsedQuery, entry);

          results.push({
            id: entry.id,
            title: entry.title || "(无标题)",
            isTemplated: entry.isTemplated,
            type: entry.type,
            searchText: entry.searchText,
            score: score
          });
        }
      }

      // 应用排除词过滤
      const filteredResults = KnowledgeBaseIndexer.filterSearchResults(
        results,
        searchModeConfig.useExclusion
      );

      if (!filteredResults || filteredResults.length === 0) {
        MNUtil.showHUD("未找到匹配的卡片");
        return;
      }

      filteredResults.sort((a, b) => (b.score || 0) - (a.score || 0));

      await this.showIntermediateSearchResults(filteredResults, rawKeyword);
    } catch (error) {
      MNUtil.showHUD("搜索失败: " + error.message);
      MNLog.error(error, "MNKnowledgeBase: showIntermediateSearchDialog");
    }
  }

  MNKnowledgeBaseClass.prototype.calculateIntermediateSearchScore = function(parsedQuery, entry) {
    let score = 0;

    if (parsedQuery.exactPhrases && parsedQuery.exactPhrases.length > 0) {
      for (const phrase of parsedQuery.exactPhrases) {
        if (entry.searchText.includes(phrase)) {
          score += 80;
        }
      }
    }

    if (parsedQuery.andGroups && parsedQuery.andGroups.length > 0) {
      for (const group of parsedQuery.andGroups) {
        if (entry.searchText.includes(group)) {
          score += 30;
        }
      }
    }

    if (parsedQuery.orGroups && parsedQuery.orGroups.length > 0) {
      const matched = parsedQuery.orGroups.filter(term => entry.searchText.includes(term));
      score += matched.length * 25;
    }

    if (score === 0 && entry.searchText) {
      score = 10;
    }

    return score;
  }

  /**
   * 显示中间知识库搜索结果
   */
  MNKnowledgeBaseClass.prototype.showIntermediateSearchResults = async function(results, keyword) {
    try {
      // 构建结果选项列表
      const options = ["🔙 返回搜索"];

      // 添加搜索结果（最多显示50个）
      const displayResults = results.slice(0, 50);
      displayResults.forEach((result, index) => {
        const typeInfo = result.isTemplated ? `[${result.type || "已制卡"}]` : "[未制卡]";
        const title = result.title || "(无标题)";
        options.push(`${index + 1}. ${typeInfo} ${title}`);
      });

      if (results.length > 50) {
        options.push(`... 还有 ${results.length - 50} 个结果未显示`);
      }

      // 显示结果列表
      const choice = await MNUtil.userSelect(
        `搜索结果：${keyword} (${results.length} 个)`,
        "选择要查看的卡片：",
        options
      );

      if (choice === 0) {
        // 用户取消
        return;
      } else if (choice === 1) {
        // 返回搜索（使用缓存的数据）
        if (self.intermediateSearchCache && self.intermediateSearchCache.data) {
          this.showIntermediateSearchDialog(self.intermediateSearchCache.data);
        } else {
          // 如果缓存不存在，重新触发搜索
          self.searchInIntermediateKB();
        }
      } else if (choice > 1 && choice <= displayResults.length + 1) {
        // 查看选中的卡片
        const selectedResult = displayResults[choice - 2];
        const note = MNNote.new(selectedResult.id);
        if (note) {
          if (MNUtil.mindmapView) {
            note.focusInMindMap();
          } else {
            MNUtil.showHUD("已选择卡片：" + selectedResult.title);
          }
        }
      }
    } catch (error) {
      MNUtil.showHUD("显示结果失败: " + error.message);
      MNLog.error(error, "MNKnowledgeBase: showIntermediateSearchResults");
    }
  }




  MNKnowledgeBaseClass.prototype.clearSearchHistory = async function() {
    try {
      const confirm = await MNUtil.userSelect(
        "确认清空",
        "确定要清空所有搜索历史吗？此操作不可恢复。",
        ["取消", "确认清空"]
      );
      
      if (confirm === 1) {
        this.searchHistory = [];
        MNUtil.showHUD("搜索历史已清空");
      }
    } catch (error) {
      MNUtil.showHUD("清空历史失败: " + error.message);
      MNLog.error(error, "MNKnowledgeBase: clearSearchHistory");
    }
  }
  
  // 返回定义的插件类，MarginNote 会自动实例化这个类
  return MNKnowledgeBaseClass;
};
