#!/bin/zsh

# MarginNote 插件批量打包工具
# 用法: ./batch_build_addons.sh

set -e  # 遇到错误时继续执行，但记录失败

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ============================================
# 📝 配置：要显示在选择列表中的插件
# ============================================
# 在这里列出你要打包的插件名称
# 注释掉的插件不会显示在选择列表中
ENABLED_PLUGINS=(
    # 你开发的插件
    # mntask
    mnknowledgebase
    mnliterature
    mnpinner
    mntoolbar
    # mnchatglm
    # GoToPage
    # mntexthandler
    # mnautostyle
    # mnexcalidraw
    # mnexcalidraw_official
    # mntimer
    # mnwebdav
    # monaco
    # mnbrowser
    mnutils
    # mnvideoplayer
    # mneditor
    mnocr
    # mnocr_official
    # mnsnipaste
    # mntoolbar_official
)

# 获取项目根目录
PROJECT_ROOT="$(cd "$(dirname "$0")" && pwd)"

# 定义插件目录映射（插件名 -> 相对路径）
typeset -A PLUGINS
PLUGINS=(
    # 一层目录插件
    GoToPage "GoToPage"
    mntexthandler "mntexthandler"
    mntask "mntask"
    mnknowledgebase "mnknowledgebase"
    mnliterature "mnliterature"
    mnpinner "mnpinner"

    # 二层目录插件
    mnautostyle "mnautostyle/mnautostyle"
    mnexcalidraw "mnexcalidraw/mnexcalidraw"
    mnexcalidraw_official "mnexcalidraw/mnexcalidraw_official"
    mntimer "mntimer/mntimer"
    mnwebdav "mnwebdav/mnwebdav"
    monaco "monaco/monaco"
    mnchatglm "mnai/mnchatglm"
    mnbrowser "mnbrowser/mnbrowser"
    mnutils "mnutils/mnutils"
    mnvideoplayer "mnvideoplayer/mnvideoplayer"
    mneditor "mneditor/mneditor"
    mnocr "mnocr/mnocr"
    mnocr_official "mnocr/mnocr_official"
    mnsnipaste "mnsnipaste/mnsnipaste"
    mntoolbar "mntoolbar/mntoolbar"
    mntoolbar_official "mntoolbar/mntoolbar_official"
)

# 获取当前日期 (MMDD格式)
DATE=$(date +%m%d)

# 打印标题
echo -e "${BLUE}📦 MarginNote 插件批量打包工具${NC}"
echo -e "${BLUE}📅 今天日期: ${DATE}${NC}"
echo ""

# 生成插件列表（只包含启用的插件，按字母排序）
PLUGIN_NAMES=()
for plugin in ${(o)ENABLED_PLUGINS}; do
    # 验证插件是否在映射表中
    if [[ -n "${PLUGINS[$plugin]}" ]]; then
        PLUGIN_NAMES+=($plugin)
    else
        echo -e "${RED}⚠️  警告：插件 '$plugin' 在 ENABLED_PLUGINS 中但不在 PLUGINS 映射表中${NC}"
    fi
done

# 检查是否有可用的插件
if [ ${#PLUGIN_NAMES[@]} -eq 0 ]; then
    echo -e "${RED}❌ 错误：ENABLED_PLUGINS 列表为空或没有有效插件${NC}"
    echo -e "${YELLOW}请编辑脚本顶部的 ENABLED_PLUGINS 配置${NC}"
    exit 1
fi

# 检测 gum 是否安装
if command -v gum &> /dev/null; then
    # 使用 gum 进行交互式多选
    echo "请选择要打包的插件（使用 ↑↓ 选择，空格多选，回车确认）："
    echo ""

    SELECTED=$(gum choose --no-limit "${PLUGIN_NAMES[@]}")

    if [ -z "$SELECTED" ]; then
        echo -e "${YELLOW}⚠️  未选择任何插件，退出${NC}"
        exit 0
    fi

    # 将选中的插件转为数组（zsh 语法）
    SELECTED_PLUGINS=("${(@f)SELECTED}")
else
    # 备选方案：使用数字序列输入
    echo "请选择要打包的插件："
    echo ""

    for i in {1..${#PLUGIN_NAMES[@]}}; do
        printf "${BLUE}%2d${NC}. %s\n" $i "${PLUGIN_NAMES[$i]}"
    done

    echo ""
    echo -e "${YELLOW}输入插件编号（用逗号分隔，如: 1,3,5）：${NC}"
    read -r INPUT

    if [ -z "$INPUT" ]; then
        echo -e "${YELLOW}⚠️  未选择任何插件，退出${NC}"
        exit 0
    fi

    # 解析输入的编号
    IFS=',' read -ra INDICES <<< "$INPUT"
    SELECTED_PLUGINS=()

    for idx in "${INDICES[@]}"; do
        # 去除空格
        idx=$(echo "$idx" | xargs)

        # 验证是否为数字
        if ! [[ "$idx" =~ ^[0-9]+$ ]]; then
            echo -e "${RED}❌ 无效的输入: $idx${NC}"
            continue
        fi

        # 验证范围
        if [ "$idx" -lt 1 ] || [ "$idx" -gt "${#PLUGIN_NAMES[@]}" ]; then
            echo -e "${RED}❌ 编号超出范围: $idx${NC}"
            continue
        fi

        # 添加到选中列表（zsh 数组索引从 1 开始）
        SELECTED_PLUGINS+=("${PLUGIN_NAMES[$idx]}")
    done

    if [ ${#SELECTED_PLUGINS[@]} -eq 0 ]; then
        echo -e "${YELLOW}⚠️  没有有效的选择，退出${NC}"
        exit 0
    fi
fi

echo ""
echo -e "${GREEN}✨ 已选择 ${#SELECTED_PLUGINS[@]} 个插件${NC}"
echo ""

# 开始打包
echo -e "${BLUE}🚀 开始打包...${NC}"
echo ""

# 记录成功和失败的插件
SUCCESS_PLUGINS=()
FAILED_PLUGINS=()

for plugin in "${SELECTED_PLUGINS[@]}"; do
    plugin_path="${PLUGINS[$plugin]}"

    if [ -z "$plugin_path" ]; then
        echo -e "${RED}❌ 找不到插件: $plugin${NC}"
        FAILED_PLUGINS+=("$plugin (找不到路径)")
        continue
    fi

    full_path="$PROJECT_ROOT/$plugin_path"

    if [ ! -d "$full_path" ]; then
        echo -e "${RED}❌ 目录不存在: $full_path${NC}"
        FAILED_PLUGINS+=("$plugin (目录不存在)")
        continue
    fi

    # 构建输出文件名
    output_name="${plugin}_${DATE}"

    echo -e "${YELLOW}📦 打包 $plugin...${NC}"

    # 切换到插件目录并执行打包
    if (cd "$full_path" && mnaddon4 build "$output_name" 2>&1); then
        echo -e "${GREEN}✅ $plugin (${output_name}.mnaddon)${NC}"
        SUCCESS_PLUGINS+=("$plugin")
    else
        echo -e "${RED}❌ $plugin (打包失败)${NC}"
        FAILED_PLUGINS+=("$plugin (mnaddon4 build 失败)")
    fi

    echo ""
done

# 打印总结报告
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}📊 打包完成！${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

if [ ${#SUCCESS_PLUGINS[@]} -gt 0 ]; then
    echo -e "${GREEN}✅ 成功: ${#SUCCESS_PLUGINS[@]} 个${NC}"
    for plugin in "${SUCCESS_PLUGINS[@]}"; do
        echo -e "   ${GREEN}•${NC} $plugin"
    done
    echo ""
fi

if [ ${#FAILED_PLUGINS[@]} -gt 0 ]; then
    echo -e "${RED}❌ 失败: ${#FAILED_PLUGINS[@]} 个${NC}"
    for plugin in "${FAILED_PLUGINS[@]}"; do
        echo -e "   ${RED}•${NC} $plugin"
    done
    echo ""
fi

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
