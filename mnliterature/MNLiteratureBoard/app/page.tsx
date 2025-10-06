"use client"

import { useState, useRef, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { BookOpen, Users, Building2, TrendingUp, Plus, Search, Edit2, Trash2, Eye, FileText, Calendar, Tag, ExternalLink, X } from "lucide-react"

// 数据类型定义
interface Reference {
  id: string
  literatureId: string
  citationKey: string
  citations: Citation[]
}

interface Citation {
  id: string
  content: string
  page?: number
  note?: string
  timestamp: string
}

interface Literature {
  id: string
  title: string
  authors: string[]
  year: number
  type: "paper" | "book" | "conference" | "thesis" | "report" | "misc"
  
  // 出版信息
  journal?: string
  publisher?: string
  conference?: string
  
  // 标识符
  doi?: string
  isbn?: string
  issn?: string
  pmid?: string
  arxivId?: string
  bibKey?: string
  
  // 页面和卷期信息
  pages?: string
  volume?: string
  issue?: string
  chapter?: string
  edition?: string
  
  // 详细信息
  abstract?: string
  keywords?: string[]
  language?: string
  url?: string
  address?: string
  institution?: string
  school?: string
  editor?: string[]
  series?: string
  citationCount?: number
  impactFactor?: number
  note?: string
  tags?: string[]
  addedDate?: string
  lastModified?: string
  
  // 文件信息
  pdfPath?: string
  fileSize?: number
  
  // 参考文献
  references?: Reference[]
}

interface Author {
  id: string
  name: string
  field: string
}

interface Journal {
  id: string
  name: string
  type: "journal" | "publisher" | "conference"
  issn?: string
}

interface Progress {
  id: string
  year: number
  description: string
  authors: string[]
  relatedPaper?: string
  type: "individual" | "collaborative"
}

interface ReadingNote {
  id: string
  paperId: string
  paperTitle: string
  content: string
  page?: number
  timestamp: string
  tags: string[]
}

export default function LiteratureManagement() {
  // 主要状态
  const [activeMainTab, setActiveMainTab] = useState("management")
  const [activeSubTab, setActiveSubTab] = useState("literature")
  const [selectedAuthor, setSelectedAuthor] = useState<string | null>(null)
  
  // 模态框状态
  const [isAddLiteratureOpen, setIsAddLiteratureOpen] = useState(false)
  const [isAddAuthorOpen, setIsAddAuthorOpen] = useState(false)
  const [isAddJournalOpen, setIsAddJournalOpen] = useState(false)
  const [isAddProgressOpen, setIsAddProgressOpen] = useState(false)
  const [isAddNoteOpen, setIsAddNoteOpen] = useState(false)
  const [isEditLiteratureOpen, setIsEditLiteratureOpen] = useState(false)
  const [editingLiterature, setEditingLiterature] = useState<Literature | null>(null)
  
  // 阅读界面状态
  const [selectedLiterature, setSelectedLiterature] = useState<Literature | null>(null)
  const [isLiteratureDetailOpen, setIsLiteratureDetailOpen] = useState(false)
  
  // 数据状态
  const [authors, setAuthors] = useState<Author[]>([
    { id: "1", name: "托马斯·库恩", field: "科学史，科学哲学" },
    { id: "2", name: "阿尔伯特·爱因斯坦", field: "理论物理学" },
    { id: "3", name: "詹姆斯·沃森", field: "分子生物学" },
    { id: "4", name: "弗朗西斯·克里克", field: "分子生物学" },
    { id: "5", name: "查尔斯·达尔文", field: "生物学，进化论" },
  ])
  
  const [journals, setJournals] = useState<Journal[]>([
    { id: "1", name: "Nature", type: "journal", issn: "0028-0836" },
    { id: "2", name: "Science", type: "journal", issn: "0036-8075" },
    { id: "3", name: "芝加哥大学出版社", type: "publisher" },
    { id: "4", name: "牛津大学出版社", type: "publisher" },
    { id: "5", name: "Physical Review Letters", type: "journal", issn: "0031-9007" },
  ])
  
  const [literatures, setLiteratures] = useState<Literature[]>([
    {
      id: "1",
      title: "科学革命的结构",
      authors: ["1"],
      year: 1962,
      type: "book",
      publisher: "芝加哥大学出版社",
      isbn: "978-0226458083",
      pages: "264",
      language: "en",
      abstract: "科学史和科学哲学的里程碑作品，介绍了科学进步中的范式转换概念。",
      keywords: ["科学哲学", "范式转换", "科学革命", "科学史"],
      tags: ["经典", "哲学"],
      addedDate: "2024-01-01",
      citationCount: 15420,
      references: []
    },
    {
      id: "2",
      title: "相对论：狭义和广义理论",
      authors: ["2"],
      year: 1916,
      type: "book",
      publisher: "牛津大学出版社",
      isbn: "978-0486600819",
      pages: "188",
      language: "en",
      abstract: "爱因斯坦本人对狭义和广义相对论的通俗阐述。",
      keywords: ["相对论", "物理学", "时空", "引力"],
      tags: ["物理学", "经典"],
      addedDate: "2024-01-02",
      citationCount: 8934,
      references: []
    },
    {
      id: "3",
      title: "核酸的分子结构：脱氧核糖核酸的一个结构",
      authors: ["3", "4"],
      year: 1953,
      type: "paper",
      journal: "Nature",
      volume: "171",
      issue: "4356",
      pages: "737-738",
      doi: "10.1038/171737a0",
      language: "en",
      abstract: "我们希望提出一个脱氧核糖核酸钠盐的结构。这个结构具有相当生物学意义的新特征。",
      keywords: ["DNA", "双螺旋", "分子生物学", "遗传学"],
      tags: ["突破性", "生物学"],
      addedDate: "2024-01-03",
      citationCount: 12567,
      impactFactor: 49.962,
      references: []
    }
  ])
  
  const [progress, setProgress] = useState<Progress[]>([
    {
      id: "1",
      year: 2024,
      description: "研究科学范式在现代AI发展中的应用",
      authors: ["1", "2"],
      type: "collaborative"
    },
    {
      id: "2", 
      year: 2023,
      description: "相对论在量子计算中的理论基础",
      authors: ["2"],
      type: "individual"
    }
  ])
  
  const [readingNotes, setReadingNotes] = useState<ReadingNote[]>([
    {
      id: "1",
      paperId: "1",
      paperTitle: "科学革命的结构",
      content: "范式转换是科学发展的关键机制，不是渐进式的改进，而是革命性的变化。",
      page: 23,
      timestamp: "2024-01-15 10:30",
      tags: ["范式", "革命", "重要"]
    },
    {
      id: "2",
      paperId: "3",
      paperTitle: "核酸的分子结构",
      content: "双螺旋结构的发现彻底改变了我们对遗传信息存储的理解。",
      page: 737,
      timestamp: "2024-01-16 14:20",
      tags: ["DNA", "结构", "突破"]
    }
  ])
  
  // 表单状态
  const [newLiterature, setNewLiterature] = useState({
    title: "",
    selectedAuthors: [] as string[],
    year: "",
    type: "paper" as Literature["type"],
    journal: "",
    publisher: "",
    conference: "",
    doi: "",
    isbn: "",
    pages: "",
    volume: "",
    issue: "",
    abstract: "",
    keywords: "",
    language: "zh-CN",
    tags: ""
  })
  
  const [newAuthor, setNewAuthor] = useState({
    name: "",
    field: ""
  })
  
  const [newJournal, setNewJournal] = useState({
    name: "",
    type: "journal" as Journal["type"],
    issn: ""
  })
  
  const [newProgress, setNewProgress] = useState({
    year: "",
    description: "",
    selectedAuthors: [] as string[],
    relatedPaper: "",
    type: "individual" as Progress["type"]
  })
  
  const [newNote, setNewNote] = useState({
    paperId: "",
    paperTitle: "",
    content: "",
    page: "",
    tags: ""
  })
  
  // 搜索和过滤状态
  const [searchTerm, setSearchTerm] = useState("")
  const [authorFilter, setAuthorFilter] = useState("")
  const [yearFilter, setYearFilter] = useState("")
  const [typeFilter, setTypeFilter] = useState("")
  
  // 事件处理函数
  const handleAddLiterature = () => {
    if (!newLiterature.title || !newLiterature.year || newLiterature.selectedAuthors.length === 0) return
    
    const literature: Literature = {
      id: Date.now().toString(),
      title: newLiterature.title,
      authors: newLiterature.selectedAuthors,
      year: parseInt(newLiterature.year),
      type: newLiterature.type,
      journal: newLiterature.journal,
      publisher: newLiterature.publisher,
      conference: newLiterature.conference,
      doi: newLiterature.doi,
      isbn: newLiterature.isbn,
      pages: newLiterature.pages,
      volume: newLiterature.volume,
      issue: newLiterature.issue,
      abstract: newLiterature.abstract,
      keywords: newLiterature.keywords.split(",").map(k => k.trim()).filter(k => k),
      language: newLiterature.language,
      tags: newLiterature.tags.split(",").map(t => t.trim()).filter(t => t),
      addedDate: new Date().toISOString().split("T")[0],
      references: []
    }
    
    setLiteratures([...literatures, literature])
    setNewLiterature({
      title: "",
      selectedAuthors: [],
      year: "",
      type: "paper",
      journal: "",
      publisher: "",
      conference: "",
      doi: "",
      isbn: "",
      pages: "",
      volume: "",
      issue: "",
      abstract: "",
      keywords: "",
      language: "zh-CN",
      tags: ""
    })
    setIsAddLiteratureOpen(false)
  }
  
  const handleAddAuthor = () => {
    if (!newAuthor.name || !newAuthor.field) return
    
    const author: Author = {
      id: Date.now().toString(),
      name: newAuthor.name,
      field: newAuthor.field
    }
    
    setAuthors([...authors, author])
    setNewAuthor({ name: "", field: "" })
    setIsAddAuthorOpen(false)
  }
  
  const handleAddJournal = () => {
    if (!newJournal.name) return
    
    const journal: Journal = {
      id: Date.now().toString(),
      name: newJournal.name,
      type: newJournal.type,
      issn: newJournal.issn
    }
    
    setJournals([...journals, journal])
    setNewJournal({ name: "", type: "journal", issn: "" })
    setIsAddJournalOpen(false)
  }
  
  const handleAddProgress = () => {
    if (!newProgress.year || !newProgress.description) return
    
    const progressItem: Progress = {
      id: Date.now().toString(),
      year: parseInt(newProgress.year),
      description: newProgress.description,
      authors: newProgress.selectedAuthors,
      relatedPaper: newProgress.relatedPaper,
      type: newProgress.type
    }
    
    setProgress([...progress, progressItem])
    setNewProgress({
      year: "",
      description: "",
      selectedAuthors: [],
      relatedPaper: "",
      type: "individual"
    })
    setIsAddProgressOpen(false)
  }
  
  const handleAddNote = () => {
    if (!newNote.content || !newNote.paperId) return
    
    const note: ReadingNote = {
      id: Date.now().toString(),
      paperId: newNote.paperId,
      paperTitle: newNote.paperTitle,
      content: newNote.content,
      page: newNote.page ? parseInt(newNote.page) : undefined,
      timestamp: new Date().toLocaleString("zh-CN"),
      tags: newNote.tags.split(",").map(t => t.trim()).filter(t => t)
    }
    
    setReadingNotes([...readingNotes, note])
    setNewNote({ paperId: "", paperTitle: "", content: "", page: "", tags: "" })
    setIsAddNoteOpen(false)
  }
  
  const handleEditLiterature = (literature: Literature) => {
    setEditingLiterature(literature)
    setNewLiterature({
      title: literature.title,
      selectedAuthors: literature.authors,
      year: literature.year.toString(),
      type: literature.type,
      journal: literature.journal || "",
      publisher: literature.publisher || "",
      conference: literature.conference || "",
      doi: literature.doi || "",
      isbn: literature.isbn || "",
      pages: literature.pages || "",
      volume: literature.volume || "",
      issue: literature.issue || "",
      abstract: literature.abstract || "",
      keywords: literature.keywords?.join(", ") || "",
      language: literature.language || "zh-CN",
      tags: literature.tags?.join(", ") || ""
    })
    setIsEditLiteratureOpen(true)
  }
  
  const handleUpdateLiterature = () => {
    if (!editingLiterature) return
    
    const updatedLiterature: Literature = {
      ...editingLiterature,
      title: newLiterature.title,
      authors: newLiterature.selectedAuthors,
      year: parseInt(newLiterature.year),
      type: newLiterature.type,
      journal: newLiterature.journal,
      publisher: newLiterature.publisher,
      conference: newLiterature.conference,
      doi: newLiterature.doi,
      isbn: newLiterature.isbn,
      pages: newLiterature.pages,
      volume: newLiterature.volume,
      issue: newLiterature.issue,
      abstract: newLiterature.abstract,
      keywords: newLiterature.keywords.split(",").map(k => k.trim()).filter(k => k),
      language: newLiterature.language,
      tags: newLiterature.tags.split(",").map(t => t.trim()).filter(t => t),
      lastModified: new Date().toISOString().split("T")[0]
    }
    
    setLiteratures(literatures.map(lit => lit.id === editingLiterature.id ? updatedLiterature : lit))
    setEditingLiterature(null)
    setIsEditLiteratureOpen(false)
  }
  
  const handleDeleteLiterature = (id: string) => {
    setLiteratures(literatures.filter(lit => lit.id !== id))
  }
  
  const handleDeleteAuthor = (id: string) => {
    setAuthors(authors.filter(auth => auth.id !== id))
  }
  
  const handleDeleteNote = (id: string) => {
    setReadingNotes(readingNotes.filter(note => note.id !== id))
  }
  
  // 阅读界面处理函数
  const handleSelectLiterature = (literature: Literature) => {
    setSelectedLiterature(literature)
    // 自动设置笔记表单的文献信息
    setNewNote({
      ...newNote,
      paperId: literature.id,
      paperTitle: literature.title
    })
  }
  
  const handleViewLiteratureDetail = (literature: Literature) => {
    setSelectedLiterature(literature)
    setIsLiteratureDetailOpen(true)
  }
  
  // 过滤和搜索逻辑
  const filteredLiteratures = literatures.filter(lit => {
    const matchesSearch = searchTerm === "" || 
      lit.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lit.abstract?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lit.keywords?.some(k => k.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesAuthor = authorFilter === "" || lit.authors.includes(authorFilter)
    const matchesYear = yearFilter === "" || lit.year.toString() === yearFilter
    const matchesType = typeFilter === "" || lit.type === typeFilter
    
    return matchesSearch && matchesAuthor && matchesYear && matchesType
  })
  
  const getAuthorNames = (authorIds: string[]) => {
    return authorIds.map(id => authors.find(author => author.id === id)?.name || "未知作者").join(", ")
  }
  
  const getTypeLabel = (type: Literature["type"]) => {
    const labels = {
      paper: "论文",
      book: "书籍", 
      conference: "会议论文",
      thesis: "学位论文",
      report: "报告",
      misc: "其他"
    }
    return labels[type]
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">文献管理系统</h1>
        <p className="text-muted-foreground">管理学术文献，追踪研究进展，记录阅读笔记</p>
      </div>
      
      <Tabs value={activeMainTab} onValueChange={setActiveMainTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="management" className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            文献管理
          </TabsTrigger>
          <TabsTrigger value="reading" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            文献阅读
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="management" className="space-y-6">
          <Tabs value={activeSubTab} onValueChange={setActiveSubTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="literature">文献库</TabsTrigger>
              <TabsTrigger value="authors">作者</TabsTrigger>
              <TabsTrigger value="journals">期刊</TabsTrigger>
              <TabsTrigger value="progress">研究进展</TabsTrigger>
            </TabsList>
            
            <TabsContent value="literature" className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                    <Input
                      placeholder="搜索文献..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                  <Select value={authorFilter} onValueChange={setAuthorFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="作者筛选" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">所有作者</SelectItem>
                      {authors.map(author => (
                        <SelectItem key={author.id} value={author.id}>{author.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="类型" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">所有类型</SelectItem>
                      <SelectItem value="paper">论文</SelectItem>
                      <SelectItem value="book">书籍</SelectItem>
                      <SelectItem value="conference">会议论文</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Dialog open={isAddLiteratureOpen} onOpenChange={setIsAddLiteratureOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      添加文献
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>添加新文献</DialogTitle>
                      <DialogDescription>填写文献的详细信息</DialogDescription>
                    </DialogHeader>
                    
                    <div className="grid gap-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="title">标题 *</Label>
                          <Input
                            id="title"
                            value={newLiterature.title}
                            onChange={(e) => setNewLiterature({...newLiterature, title: e.target.value})}
                            placeholder="文献标题"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="year">年份 *</Label>
                          <Input
                            id="year"
                            type="number"
                            value={newLiterature.year}
                            onChange={(e) => setNewLiterature({...newLiterature, year: e.target.value})}
                            placeholder="2024"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>作者 *</Label>
                        <div className="border rounded-lg p-3">
                          <div className="max-h-32 overflow-y-auto">
                            <div className="grid grid-cols-2 gap-2">
                              {authors.map(author => (
                                <div key={author.id} className="flex items-center space-x-2">
                                  <Checkbox
                                    id={`author-${author.id}`}
                                    checked={newLiterature.selectedAuthors.includes(author.id)}
                                    onCheckedChange={(checked) => {
                                      if (checked) {
                                        setNewLiterature({
                                          ...newLiterature,
                                          selectedAuthors: [...newLiterature.selectedAuthors, author.id]
                                        })
                                      } else {
                                        setNewLiterature({
                                          ...newLiterature,
                                          selectedAuthors: newLiterature.selectedAuthors.filter(id => id !== author.id)
                                        })
                                      }
                                    }}
                                  />
                                  <Label 
                                    htmlFor={`author-${author.id}`} 
                                    className="text-sm cursor-pointer"
                                  >
                                    {author.name}
                                  </Label>
                                </div>
                              ))}
                            </div>
                          </div>
                          {newLiterature.selectedAuthors.length > 0 && (
                            <div className="mt-2 pt-2 border-t">
                              <p className="text-sm text-muted-foreground mb-1">已选择的作者：</p>
                              <div className="flex flex-wrap gap-1">
                                {newLiterature.selectedAuthors.map(authorId => {
                                  const author = authors.find(a => a.id === authorId)
                                  return (
                                    <Badge key={authorId} variant="secondary" className="text-xs">
                                      {author?.name}
                                      <button
                                        type="button"
                                        onClick={() => setNewLiterature({
                                          ...newLiterature,
                                          selectedAuthors: newLiterature.selectedAuthors.filter(id => id !== authorId)
                                        })}
                                        className="ml-1 hover:text-destructive"
                                      >
                                        <X className="w-3 h-3" />
                                      </button>
                                    </Badge>
                                  )
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="type">类型</Label>
                          <Select value={newLiterature.type} onValueChange={(value: Literature["type"]) => setNewLiterature({...newLiterature, type: value})}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="paper">论文</SelectItem>
                              <SelectItem value="book">书籍</SelectItem>
                              <SelectItem value="conference">会议论文</SelectItem>
                              <SelectItem value="thesis">学位论文</SelectItem>
                              <SelectItem value="report">报告</SelectItem>
                              <SelectItem value="misc">其他</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="language">语言</Label>
                          <Select value={newLiterature.language} onValueChange={(value) => setNewLiterature({...newLiterature, language: value})}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="zh-CN">中文</SelectItem>
                              <SelectItem value="en">英文</SelectItem>
                              <SelectItem value="ja">日文</SelectItem>
                              <SelectItem value="other">其他</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      {newLiterature.type === "paper" && (
                        <div className="grid grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="journal">期刊</Label>
                            <Input
                              id="journal"
                              value={newLiterature.journal}
                              onChange={(e) => setNewLiterature({...newLiterature, journal: e.target.value})}
                              placeholder="期刊名称"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="volume">卷号</Label>
                            <Input
                              id="volume"
                              value={newLiterature.volume}
                              onChange={(e) => setNewLiterature({...newLiterature, volume: e.target.value})}
                              placeholder="卷号"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="issue">期号</Label>
                            <Input
                              id="issue"
                              value={newLiterature.issue}
                              onChange={(e) => setNewLiterature({...newLiterature, issue: e.target.value})}
                              placeholder="期号"
                            />
                          </div>
                        </div>
                      )}
                      
                      {newLiterature.type === "book" && (
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="publisher">出版社</Label>
                            <Input
                              id="publisher"
                              value={newLiterature.publisher}
                              onChange={(e) => setNewLiterature({...newLiterature, publisher: e.target.value})}
                              placeholder="出版社名称"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="isbn">ISBN</Label>
                            <Input
                              id="isbn"
                              value={newLiterature.isbn}
                              onChange={(e) => setNewLiterature({...newLiterature, isbn: e.target.value})}
                              placeholder="ISBN"
                            />
                          </div>
                        </div>
                      )}
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="pages">页码</Label>
                          <Input
                            id="pages"
                            value={newLiterature.pages}
                            onChange={(e) => setNewLiterature({...newLiterature, pages: e.target.value})}
                            placeholder="1-20 或 264"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="doi">DOI</Label>
                          <Input
                            id="doi"
                            value={newLiterature.doi}
                            onChange={(e) => setNewLiterature({...newLiterature, doi: e.target.value})}
                            placeholder="10.1000/xyz123"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="abstract">摘要</Label>
                        <Textarea
                          id="abstract"
                          value={newLiterature.abstract}
                          onChange={(e) => setNewLiterature({...newLiterature, abstract: e.target.value})}
                          placeholder="文献摘要"
                          rows={3}
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="keywords">关键词</Label>
                          <Input
                            id="keywords"
                            value={newLiterature.keywords}
                            onChange={(e) => setNewLiterature({...newLiterature, keywords: e.target.value})}
                            placeholder="用逗号分隔"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="tags">标签</Label>
                          <Input
                            id="tags"
                            value={newLiterature.tags}
                            onChange={(e) => setNewLiterature({...newLiterature, tags: e.target.value})}
                            placeholder="用逗号分隔"
                          />
                        </div>
                      </div>
                    </div>
                    
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsAddLiteratureOpen(false)}>
                        取消
                      </Button>
                      <Button onClick={handleAddLiterature}>添加文献</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
              
              <div className="grid gap-4">
                {filteredLiteratures.map(literature => (
                  <Card key={literature.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <CardTitle className="text-lg">{literature.title}</CardTitle>
                          <CardDescription>
                            {getAuthorNames(literature.authors)} • {literature.year} • {getTypeLabel(literature.type)}
                          </CardDescription>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="sm" onClick={() => handleEditLiterature(literature)}>
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>确认删除</AlertDialogTitle>
                                <AlertDialogDescription>
                                  确定要删除文献 "{literature.title}" 吗？此操作无法撤销。
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>取消</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteLiterature(literature.id)}>
                                  删除
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {literature.abstract && (
                        <p className="text-sm text-muted-foreground mb-3">
                          {literature.abstract.length > 200 
                            ? literature.abstract.substring(0, 200) + "..." 
                            : literature.abstract}
                        </p>
                      )}
                      
                      <div className="flex flex-wrap gap-2 mb-3">
                        {literature.keywords?.slice(0, 3).map(keyword => (
                          <Badge key={keyword} variant="secondary">{keyword}</Badge>
                        ))}
                        {(literature.keywords?.length ?? 0) > 3 && (
                          <Badge variant="outline">+{(literature.keywords?.length ?? 0) - 3}</Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center space-x-4">
                          {literature.journal && <span>{literature.journal}</span>}
                          {literature.publisher && <span>{literature.publisher}</span>}
                          {literature.citationCount && <span>被引 {literature.citationCount}</span>}
                        </div>
                        <div className="flex items-center space-x-2">
                          {literature.doi && (
                            <Button variant="ghost" size="sm" asChild>
                              <a href={`https://doi.org/${literature.doi}`} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="w-4 h-4 mr-1" />
                                DOI
                              </a>
                            </Button>
                          )}
                          <span>{literature.addedDate}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="authors" className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-semibold">作者管理</h2>
                <Dialog open={isAddAuthorOpen} onOpenChange={setIsAddAuthorOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      添加作者
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>添加新作者</DialogTitle>
                    </DialogHeader>
                    
                    <div className="grid gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="authorName">姓名</Label>
                        <Input
                          id="authorName"
                          value={newAuthor.name}
                          onChange={(e) => setNewAuthor({...newAuthor, name: e.target.value})}
                          placeholder="作者姓名"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="authorField">研究领域</Label>
                        <Input
                          id="authorField"
                          value={newAuthor.field}
                          onChange={(e) => setNewAuthor({...newAuthor, field: e.target.value})}
                          placeholder="研究领域"
                        />
                      </div>
                    </div>
                    
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsAddAuthorOpen(false)}>
                        取消
                      </Button>
                      <Button onClick={handleAddAuthor}>添加作者</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {authors.map(author => (
                  <Card key={author.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-base">{author.name}</CardTitle>
                          <CardDescription>{author.field}</CardDescription>
                        </div>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>确认删除</AlertDialogTitle>
                              <AlertDialogDescription>
                                确定要删除作者 "{author.name}" 吗？
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>取消</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteAuthor(author.id)}>
                                删除
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm text-muted-foreground">
                        文献数量: {literatures.filter(lit => lit.authors.includes(author.id)).length}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="journals" className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-semibold">期刊与出版社</h2>
                <Dialog open={isAddJournalOpen} onOpenChange={setIsAddJournalOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      添加期刊
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>添加期刊/出版社</DialogTitle>
                    </DialogHeader>
                    
                    <div className="grid gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="journalName">名称</Label>
                        <Input
                          id="journalName"
                          value={newJournal.name}
                          onChange={(e) => setNewJournal({...newJournal, name: e.target.value})}
                          placeholder="期刊或出版社名称"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="journalType">类型</Label>
                        <Select value={newJournal.type} onValueChange={(value: Journal["type"]) => setNewJournal({...newJournal, type: value})}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="journal">期刊</SelectItem>
                            <SelectItem value="publisher">出版社</SelectItem>
                            <SelectItem value="conference">会议</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="journalIssn">ISSN</Label>
                        <Input
                          id="journalIssn"
                          value={newJournal.issn}
                          onChange={(e) => setNewJournal({...newJournal, issn: e.target.value})}
                          placeholder="ISSN (可选)"
                        />
                      </div>
                    </div>
                    
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsAddJournalOpen(false)}>
                        取消
                      </Button>
                      <Button onClick={handleAddJournal}>添加</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
              
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>名称</TableHead>
                    <TableHead>类型</TableHead>
                    <TableHead>ISSN</TableHead>
                    <TableHead>文献数量</TableHead>
                    <TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {journals.map(journal => (
                    <TableRow key={journal.id}>
                      <TableCell className="font-medium">{journal.name}</TableCell>
                      <TableCell>
                        <Badge variant={journal.type === "journal" ? "default" : "secondary"}>
                          {journal.type === "journal" ? "期刊" : journal.type === "publisher" ? "出版社" : "会议"}
                        </Badge>
                      </TableCell>
                      <TableCell>{journal.issn || "-"}</TableCell>
                      <TableCell>
                        {literatures.filter(lit => 
                          lit.journal === journal.name || lit.publisher === journal.name
                        ).length}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>
            
            <TabsContent value="progress" className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-semibold">研究进展</h2>
                <Dialog open={isAddProgressOpen} onOpenChange={setIsAddProgressOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      添加进展
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>添加研究进展</DialogTitle>
                    </DialogHeader>
                    
                    <div className="grid gap-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="progressYear">年份</Label>
                          <Input
                            id="progressYear"
                            type="number"
                            value={newProgress.year}
                            onChange={(e) => setNewProgress({...newProgress, year: e.target.value})}
                            placeholder="2024"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="progressType">类型</Label>
                          <Select value={newProgress.type} onValueChange={(value: Progress["type"]) => setNewProgress({...newProgress, type: value})}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="individual">个人研究</SelectItem>
                              <SelectItem value="collaborative">合作研究</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="progressDescription">描述</Label>
                        <Textarea
                          id="progressDescription"
                          value={newProgress.description}
                          onChange={(e) => setNewProgress({...newProgress, description: e.target.value})}
                          placeholder="研究进展描述"
                          rows={3}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="progressPaper">相关文献</Label>
                        <Select value={newProgress.relatedPaper} onValueChange={(value) => setNewProgress({...newProgress, relatedPaper: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="选择相关文献" />
                          </SelectTrigger>
                          <SelectContent>
                            {literatures.map(literature => (
                              <SelectItem key={literature.id} value={literature.id}>
                                {literature.title}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsAddProgressOpen(false)}>
                        取消
                      </Button>
                      <Button onClick={handleAddProgress}>添加进展</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
              
              <div className="grid gap-4">
                {progress.map(item => (
                  <Card key={item.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-base flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            {item.year}
                          </CardTitle>
                          <Badge variant={item.type === "individual" ? "default" : "secondary"}>
                            {item.type === "individual" ? "个人研究" : "合作研究"}
                          </Badge>
                        </div>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm mb-3">{item.description}</p>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>参与者: {getAuthorNames(item.authors)}</span>
                        {item.relatedPaper && (
                          <span>相关文献: {literatures.find(lit => lit.id === item.relatedPaper)?.title}</span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </TabsContent>
        
        <TabsContent value="reading" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  文献列表
                </CardTitle>
                <CardDescription>选择要阅读的文献</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-2">
                    {literatures.map(literature => (
                      <div
                        key={literature.id}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          selectedLiterature?.id === literature.id 
                            ? "border-primary bg-primary/5" 
                            : "hover:bg-muted/50"
                        }`}
                        onClick={() => handleSelectLiterature(literature)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-sm">{literature.title}</h4>
                            <p className="text-xs text-muted-foreground mt-1">
                              {getAuthorNames(literature.authors)} • {literature.year}
                            </p>
                          </div>
                          {selectedLiterature?.id === literature.id && (
                            <div className="w-2 h-2 bg-primary rounded-full ml-2 mt-1" />
                          )}
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <Badge variant="outline" className="text-xs">
                            {getTypeLabel(literature.type)}
                          </Badge>
                          <div className="flex items-center gap-1">
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleViewLiteratureDetail(literature)
                              }}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      阅读笔记
                    </CardTitle>
                    <CardDescription>管理阅读过程中的笔记</CardDescription>
                  </div>
                  <Dialog open={isAddNoteOpen} onOpenChange={setIsAddNoteOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm">
                        <Plus className="w-4 h-4 mr-2" />
                        添加笔记
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>添加阅读笔记</DialogTitle>
                      </DialogHeader>
                      
                      <div className="grid gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="notePaper">关联文献</Label>
                          <Select 
                            value={newNote.paperId} 
                            onValueChange={(value) => {
                              const literature = literatures.find(lit => lit.id === value)
                              setNewNote({
                                ...newNote, 
                                paperId: value,
                                paperTitle: literature?.title || ""
                              })
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="选择文献" />
                            </SelectTrigger>
                            <SelectContent>
                              {literatures.map(literature => (
                                <SelectItem key={literature.id} value={literature.id}>
                                  {literature.title}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="notePage">页码</Label>
                            <Input
                              id="notePage"
                              type="number"
                              value={newNote.page}
                              onChange={(e) => setNewNote({...newNote, page: e.target.value})}
                              placeholder="页码 (可选)"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="noteTags">标签</Label>
                            <Input
                              id="noteTags"
                              value={newNote.tags}
                              onChange={(e) => setNewNote({...newNote, tags: e.target.value})}
                              placeholder="用逗号分隔"
                            />
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="noteContent">笔记内容</Label>
                          <Textarea
                            id="noteContent"
                            value={newNote.content}
                            onChange={(e) => setNewNote({...newNote, content: e.target.value})}
                            placeholder="记录你的想法和理解..."
                            rows={4}
                          />
                        </div>
                      </div>
                      
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddNoteOpen(false)}>
                          取消
                        </Button>
                        <Button onClick={handleAddNote}>添加笔记</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-3">
                    {readingNotes.map(note => (
                      <div key={note.id} className="p-3 border rounded-lg">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h5 className="font-medium text-sm">{note.paperTitle}</h5>
                            {note.page && (
                              <p className="text-xs text-muted-foreground">第 {note.page} 页</p>
                            )}
                          </div>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>确认删除</AlertDialogTitle>
                                <AlertDialogDescription>
                                  确定要删除这条笔记吗？
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>取消</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteNote(note.id)}>
                                  删除
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                        
                        <p className="text-sm mt-2 mb-2">{note.content}</p>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex flex-wrap gap-1">
                            {note.tags.map(tag => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                <Tag className="w-3 h-3 mr-1" />
                                {tag}
                              </Badge>
                            ))}
                          </div>
                          <span className="text-xs text-muted-foreground">{note.timestamp}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                PDF 阅读器
                <Badge variant="outline" className="text-xs">开发中</Badge>
              </CardTitle>
              <CardDescription>
                {selectedLiterature ? `正在准备阅读：${selectedLiterature.title}` : "选择文献后开始阅读"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-96 bg-muted/20 rounded-lg flex items-center justify-center border-2 border-dashed border-muted">
                <div className="text-center space-y-4 max-w-md">
                  <FileText className="w-16 h-16 mx-auto text-muted-foreground" />
                  <div>
                    <p className="text-muted-foreground font-medium mb-2">PDF阅读器功能规划</p>
                    <div className="text-sm text-muted-foreground space-y-1 text-left">
                      <p>• ✅ 文献选择和管理</p>
                      <p>• ✅ 阅读笔记记录</p>
                      <p>• ✅ 文献详细信息查看</p>
                      <p>• 🔄 PDF在线预览（开发中）</p>
                      <p>• 🔄 PDF标注和高亮</p>
                      <p>• 🔄 笔记与PDF页面关联</p>
                    </div>
                  </div>
                  {selectedLiterature && (
                    <div className="pt-2 border-t">
                      <p className="text-xs text-muted-foreground">
                        当前选中：{selectedLiterature.title}
                      </p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-2"
                        onClick={() => setIsAddNoteOpen(true)}
                      >
                        为此文献添加笔记
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* 编辑文献对话框 */}
      <Dialog open={isEditLiteratureOpen} onOpenChange={setIsEditLiteratureOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>编辑文献</DialogTitle>
            <DialogDescription>修改文献的详细信息</DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="editTitle">标题</Label>
                <Input
                  id="editTitle"
                  value={newLiterature.title}
                  onChange={(e) => setNewLiterature({...newLiterature, title: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editYear">年份</Label>
                <Input
                  id="editYear"
                  type="number"
                  value={newLiterature.year}
                  onChange={(e) => setNewLiterature({...newLiterature, year: e.target.value})}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>作者</Label>
              <div className="border rounded-lg p-3">
                <div className="max-h-32 overflow-y-auto">
                  <div className="grid grid-cols-2 gap-2">
                    {authors.map(author => (
                      <div key={author.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`edit-author-${author.id}`}
                          checked={newLiterature.selectedAuthors.includes(author.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setNewLiterature({
                                ...newLiterature,
                                selectedAuthors: [...newLiterature.selectedAuthors, author.id]
                              })
                            } else {
                              setNewLiterature({
                                ...newLiterature,
                                selectedAuthors: newLiterature.selectedAuthors.filter(id => id !== author.id)
                              })
                            }
                          }}
                        />
                        <Label 
                          htmlFor={`edit-author-${author.id}`} 
                          className="text-sm cursor-pointer"
                        >
                          {author.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
                {newLiterature.selectedAuthors.length > 0 && (
                  <div className="mt-2 pt-2 border-t">
                    <p className="text-sm text-muted-foreground mb-1">已选择的作者：</p>
                    <div className="flex flex-wrap gap-1">
                      {newLiterature.selectedAuthors.map(authorId => {
                        const author = authors.find(a => a.id === authorId)
                        return (
                          <Badge key={authorId} variant="secondary" className="text-xs">
                            {author?.name}
                            <button
                              type="button"
                              onClick={() => setNewLiterature({
                                ...newLiterature,
                                selectedAuthors: newLiterature.selectedAuthors.filter(id => id !== authorId)
                              })}
                              className="ml-1 hover:text-destructive"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </Badge>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="editAbstract">摘要</Label>
              <Textarea
                id="editAbstract"
                value={newLiterature.abstract}
                onChange={(e) => setNewLiterature({...newLiterature, abstract: e.target.value})}
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="editKeywords">关键词</Label>
                <Input
                  id="editKeywords"
                  value={newLiterature.keywords}
                  onChange={(e) => setNewLiterature({...newLiterature, keywords: e.target.value})}
                  placeholder="用逗号分隔"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editTags">标签</Label>
                <Input
                  id="editTags"
                  value={newLiterature.tags}
                  onChange={(e) => setNewLiterature({...newLiterature, tags: e.target.value})}
                  placeholder="用逗号分隔"
                />
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditLiteratureOpen(false)}>
              取消
            </Button>
            <Button onClick={handleUpdateLiterature}>更新文献</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* 文献详细信息对话框 */}
      <Dialog open={isLiteratureDetailOpen} onOpenChange={setIsLiteratureDetailOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>文献详细信息</DialogTitle>
            <DialogDescription>查看文献的完整信息</DialogDescription>
          </DialogHeader>
          
          {selectedLiterature && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">{selectedLiterature.title}</h3>
                <div className="flex flex-wrap gap-2 text-sm text-muted-foreground mb-4">
                  <span>{getAuthorNames(selectedLiterature.authors)}</span>
                  <span>•</span>
                  <span>{selectedLiterature.year}</span>
                  <span>•</span>
                  <span>{getTypeLabel(selectedLiterature.type)}</span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">出版信息</Label>
                    <div className="text-sm space-y-1 mt-1">
                      {selectedLiterature.journal && <p>期刊: {selectedLiterature.journal}</p>}
                      {selectedLiterature.publisher && <p>出版社: {selectedLiterature.publisher}</p>}
                      {selectedLiterature.volume && <p>卷号: {selectedLiterature.volume}</p>}
                      {selectedLiterature.issue && <p>期号: {selectedLiterature.issue}</p>}
                      {selectedLiterature.pages && <p>页码: {selectedLiterature.pages}</p>}
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium">标识符</Label>
                    <div className="text-sm space-y-1 mt-1">
                      {selectedLiterature.doi && (
                        <p>DOI: <a href={`https://doi.org/${selectedLiterature.doi}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{selectedLiterature.doi}</a></p>
                      )}
                      {selectedLiterature.isbn && <p>ISBN: {selectedLiterature.isbn}</p>}
                      {selectedLiterature.pmid && <p>PMID: {selectedLiterature.pmid}</p>}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">学术指标</Label>
                    <div className="text-sm space-y-1 mt-1">
                      {selectedLiterature.citationCount && <p>被引次数: {selectedLiterature.citationCount}</p>}
                      {selectedLiterature.impactFactor && <p>影响因子: {selectedLiterature.impactFactor}</p>}
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium">其他信息</Label>
                    <div className="text-sm space-y-1 mt-1">
                      {selectedLiterature.language && <p>语言: {selectedLiterature.language}</p>}
                      {selectedLiterature.addedDate && <p>添加日期: {selectedLiterature.addedDate}</p>}
                      {selectedLiterature.lastModified && <p>最后修改: {selectedLiterature.lastModified}</p>}
                    </div>
                  </div>
                </div>
              </div>
              
              {selectedLiterature.abstract && (
                <div>
                  <Label className="text-sm font-medium">摘要</Label>
                  <p className="text-sm mt-2 leading-relaxed">{selectedLiterature.abstract}</p>
                </div>
              )}
              
              {selectedLiterature.keywords && selectedLiterature.keywords.length > 0 && (
                <div>
                  <Label className="text-sm font-medium">关键词</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedLiterature.keywords.map(keyword => (
                      <Badge key={keyword} variant="secondary">{keyword}</Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {selectedLiterature.tags && selectedLiterature.tags.length > 0 && (
                <div>
                  <Label className="text-sm font-medium">标签</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedLiterature.tags.map(tag => (
                      <Badge key={tag} variant="outline">{tag}</Badge>
                    ))}
                  </div>
                </div>
              )}
              
              <div>
                <Label className="text-sm font-medium">相关笔记</Label>
                <div className="mt-2">
                  {readingNotes.filter(note => note.paperId === selectedLiterature.id).length > 0 ? (
                    <div className="space-y-2">
                      {readingNotes
                        .filter(note => note.paperId === selectedLiterature.id)
                        .map(note => (
                          <div key={note.id} className="p-2 bg-muted/50 rounded text-sm">
                            <p>{note.content}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {note.page && `第${note.page}页 • `}{note.timestamp}
                            </p>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">暂无相关笔记</p>
                  )}
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsLiteratureDetailOpen(false)}>
              关闭
            </Button>
            <Button 
              onClick={() => {
                if (selectedLiterature) {
                  handleEditLiterature(selectedLiterature)
                  setIsLiteratureDetailOpen(false)
                }
              }}
            >
              编辑文献
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}