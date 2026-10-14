#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""生成情侣空间部署指南 Word 文档"""

from docx import Document
from docx.shared import Pt, RGBColor, Inches, Cm
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.style import WD_STYLE_TYPE
from docx.oxml.ns import qn
import os

doc = Document()

# ========== 全局样式设置 ==========
# 设置默认字体
style = doc.styles['Normal']
font = style.font
font.name = '微软雅黑'
font.size = Pt(11)
font.color.rgb = RGBColor(0x33, 0x33, 0x33)
# 设置中文字体
style.element.rPr.rFonts.set(qn('w:eastAsia'), '微软雅黑')

# 设置页边距
for section in doc.sections:
    section.top_margin = Cm(2.5)
    section.bottom_margin = Cm(2.5)
    section.left_margin = Cm(2.8)
    section.right_margin = Cm(2.8)

# ========== 辅助函数 ==========
def add_heading(text, level=1):
    """添加标题"""
    h = doc.add_heading(text, level=level)
    for run in h.runs:
        run.font.name = '微软雅黑'
        run.element.rPr.rFonts.set(qn('w:eastAsia'), '微软雅黑')
        if level == 0:
            run.font.size = Pt(22)
            run.font.color.rgb = RGBColor(0xB8, 0x9A, 0x97)
        elif level == 1:
            run.font.size = Pt(16)
            run.font.color.rgb = RGBColor(0xB8, 0x9A, 0x97)
        elif level == 2:
            run.font.size = Pt(14)
            run.font.color.rgb = RGBColor(0x66, 0x66, 0x66)
        elif level == 3:
            run.font.size = Pt(12)
            run.font.color.rgb = RGBColor(0x88, 0x88, 0x88)
    return h

def add_para(text, bold=False, color=None, size=None, indent=False):
    """添加段落"""
    p = doc.add_paragraph()
    if indent:
        p.paragraph_format.left_indent = Cm(0.8)
    run = p.add_run(text)
    run.font.name = '微软雅黑'
    run.element.rPr.rFonts.set(qn('w:eastAsia'), '微软雅黑')
    if bold:
        run.bold = True
    if color:
        run.font.color.rgb = color
    if size:
        run.font.size = Pt(size)
    return p

def add_step(num, title):
    """添加步骤标题"""
    p = doc.add_paragraph()
    run_num = p.add_run(f'第 {num} 步：')
    run_num.bold = True
    run_num.font.size = Pt(13)
    run_num.font.color.rgb = RGBColor(0xB8, 0x9A, 0x97)
    run_num.font.name = '微软雅黑'
    run_num.element.rPr.rFonts.set(qn('w:eastAsia'), '微软雅黑')
    run_title = p.add_run(title)
    run_title.bold = True
    run_title.font.size = Pt(13)
    run_title.font.color.rgb = RGBColor(0x33, 0x33, 0x33)
    run_title.font.name = '微软雅黑'
    run_title.element.rPr.rFonts.set(qn('w:eastAsia'), '微软雅黑')
    return p

def add_numbered_item(num, text, sub_items=None):
    """添加编号条目"""
    p = doc.add_paragraph()
    p.paragraph_format.left_indent = Cm(0.8)
    run = p.add_run(f'{num}. ')
    run.bold = True
    run.font.name = '微软雅黑'
    run.element.rPr.rFonts.set(qn('w:eastAsia'), '微软雅黑')
    run2 = p.add_run(text)
    run2.font.name = '微软雅黑'
    run2.element.rPr.rFonts.set(qn('w:eastAsia'), '微软雅黑')
    if sub_items:
        for item in sub_items:
            sp = doc.add_paragraph()
            sp.paragraph_format.left_indent = Cm(1.6)
            sr = sp.add_run(f'  - {item}')
            sr.font.size = Pt(10)
            sr.font.color.rgb = RGBColor(0x66, 0x66, 0x66)
            sr.font.name = '微软雅黑'
            sr.element.rPr.rFonts.set(qn('w:eastAsia'), '微软雅黑')

def add_bullet(text, indent_level=0):
    """添加项目符号"""
    p = doc.add_paragraph(style='List Bullet')
    p.paragraph_format.left_indent = Cm(0.8 + indent_level * 0.8)
    run = p.add_run(text)
    run.font.name = '微软雅黑'
    run.element.rPr.rFonts.set(qn('w:eastAsia'), '微软雅黑')
    return p

def add_tip(text):
    """添加提示框"""
    p = doc.add_paragraph()
    p.paragraph_format.left_indent = Cm(0.5)
    p.paragraph_format.space_before = Pt(6)
    p.paragraph_format.space_after = Pt(6)
    run = p.add_run(f'💡 {text}')
    run.font.size = Pt(10)
    run.font.color.rgb = RGBColor(0xC9, 0xA8, 0x7C)
    run.font.name = '微软雅黑'
    run.element.rPr.rFonts.set(qn('w:eastAsia'), '微软雅黑')
    return p

def add_warning(text):
    """添加警告"""
    p = doc.add_paragraph()
    p.paragraph_format.left_indent = Cm(0.5)
    p.paragraph_format.space_before = Pt(6)
    p.paragraph_format.space_after = Pt(6)
    run = p.add_run(f'⚠️ {text}')
    run.font.size = Pt(10)
    run.font.color.rgb = RGBColor(0xD4, 0x6A, 0x6A)
    run.font.name = '微软雅黑'
    run.element.rPr.rFonts.set(qn('w:eastAsia'), '微软雅黑')
    return p

def add_code(text):
    """添加代码/命令行样式"""
    p = doc.add_paragraph()
    p.paragraph_format.left_indent = Cm(1.0)
    p.paragraph_format.space_before = Pt(3)
    p.paragraph_format.space_after = Pt(3)
    run = p.add_run(text)
    run.font.name = 'Consolas'
    run.font.size = Pt(10)
    run.font.color.rgb = RGBColor(0x55, 0x55, 0x55)
    # 灰色底纹
    pPr = p._p.get_or_add_pPr()
    shd = pPr.makeelement(qn('w:shd'), {
        qn('w:val'): 'clear',
        qn('w:color'): 'auto',
        qn('w:fill'): 'F5F0EB'
    })
    pPr.append(shd)
    return p

def add_qa(question, answer):
    """添加问答"""
    pq = doc.add_paragraph()
    pq.paragraph_format.left_indent = Cm(0.5)
    rq = pq.add_run(f'Q: {question}')
    rq.bold = True
    rq.font.size = Pt(11)
    rq.font.color.rgb = RGBColor(0xB8, 0x9A, 0x97)
    rq.font.name = '微软雅黑'
    rq.element.rPr.rFonts.set(qn('w:eastAsia'), '微软雅黑')

    pa = doc.add_paragraph()
    pa.paragraph_format.left_indent = Cm(0.5)
    ra = pa.add_run(f'A: {answer}')
    ra.font.size = Pt(10.5)
    ra.font.color.rgb = RGBColor(0x55, 0x55, 0x55)
    ra.font.name = '微软雅黑'
    ra.element.rPr.rFonts.set(qn('w:eastAsia'), '微软雅黑')

# ========== 文档内容 ==========

# 封面标题
title_p = doc.add_paragraph()
title_p.alignment = WD_ALIGN_PARAGRAPH.CENTER
title_p.paragraph_format.space_before = Pt(60)
title_run = title_p.add_run('情侣空间部署指南')
title_run.font.size = Pt(28)
title_run.bold = True
title_run.font.color.rgb = RGBColor(0xB8, 0x9A, 0x97)
title_run.font.name = '微软雅黑'
title_run.element.rPr.rFonts.set(qn('w:eastAsia'), '微软雅黑')

subtitle_p = doc.add_paragraph()
subtitle_p.alignment = WD_ALIGN_PARAGRAPH.CENTER
subtitle_run = subtitle_p.add_run('从零开始，10 分钟搭建你们的专属私密空间')
subtitle_run.font.size = Pt(13)
subtitle_run.font.color.rgb = RGBColor(0x99, 0x99, 0x99)
subtitle_run.font.name = '微软雅黑'
subtitle_run.element.rPr.rFonts.set(qn('w:eastAsia'), '微软雅黑')

heart_p = doc.add_paragraph()
heart_p.alignment = WD_ALIGN_PARAGRAPH.CENTER
heart_p.paragraph_format.space_before = Pt(20)
heart_run = heart_p.add_run('♥')
heart_run.font.size = Pt(24)
heart_run.font.color.rgb = RGBColor(0xD4, 0xA5, 0xA5)

doc.add_page_break()

# ===== 一、前言 =====
add_heading('一、你收到了什么', level=1)
add_para('你收到的是一个完整的情侣空间网站模板，包含以下文件和文件夹：')
add_bullet('index.html — 网站主页面')
add_bullet('css/ 文件夹 — 样式文件')
add_bullet('js/ 文件夹 — 功能逻辑')
add_bullet('manifest.json — 手机桌面图标配置')
add_bullet('service-worker.js — 离线支持')
add_bullet('icon.svg — 网站图标')
add_bullet('README.md — 项目说明')
add_bullet('.gitignore — Git 忽略配置')

add_para('')
add_para('这是一个纯静态网站，不需要买服务器、不需要写代码，部署到 GitHub Pages 就能免费使用。', bold=True)
add_para('功能包括：照片墙、生活日记、心愿清单、留言板、定时信件、旅行计划、情侣问答书、约会盲盒、年度回顾、照片拼贴、分享卡片、异地天气、生理期提醒、想你了打卡等。')

doc.add_page_break()

# ===== 二、部署步骤 =====
add_heading('二、部署步骤（约 10 分钟）', level=1)
add_para('请按顺序操作，每一步完成后再进入下一步。', color=RGBColor(0x99, 0x99, 0x99))

# 第1步
add_step(1, '注册 / 登录 GitHub')
add_para('GitHub 是一个免费的代码托管平台，我们用它来存放网站文件和提供免费的网页托管服务。')
add_numbered_item(1, '打开浏览器，访问 https://github.com')
add_numbered_item(2, '如果已有账号，直接登录；如果没有，点击 Sign up 注册（需要邮箱验证）')
add_tip('注册时用户名可以随便取，后续网站地址会包含这个用户名。')

# 第2步
add_step(2, '创建私有仓库')
add_para('仓库就是存放网站文件的地方。设为私有可以保证只有你们能看到。')
add_numbered_item(1, '登录后，点击页面右上角的 + 号，选择 New repository')
add_numbered_item(2, 'Repository name（仓库名）随便填，比如 our-space、love-space 等')
add_numbered_item(3, 'Description（描述）可以不填')
add_numbered_item(4, '选择 Private（私有）—— 这一步很重要！')
add_numbered_item(5, '不要勾选任何选项（包括 Add a README file），保持空白')
add_numbered_item(6, '点击底部绿色的 Create repository 按钮')
add_warning('不要勾选 "Add a README file"，否则后续上传文件时会冲突。')

# 第3步
add_step(3, '上传网站文件')
add_para('创建仓库后，你会看到一个快速设置页面。按以下步骤上传文件：')
add_numbered_item(1, '在页面中找到 "uploading an existing file" 链接，点击它')
add_numbered_item(2, '打开你收到的 couple-space-template 文件夹，把里面的所有文件和文件夹全部拖到网页的上传区域')
add_numbered_item(3, '等待上传完成，你会看到文件列表出现在页面上')
add_numbered_item(4, '滚动到页面底部，点击绿色的 Commit changes 按钮')
add_tip('上传时需要把 css/ 和 js/ 文件夹也一起拖进去，不能只传单个文件。')
add_warning('.gitignore 文件在 Windows 中是隐藏文件。如果看不到，请在文件资源管理器中开启"显示隐藏文件"选项（查看 → 勾选"隐藏的项目"）。')

# 第4步
add_step(4, '开启 GitHub Pages（网站托管）')
add_para('上传文件后，需要开启 GitHub Pages 功能，网站才能被访问。')
add_numbered_item(1, '在仓库页面，点击顶部的 Settings（设置）')
add_numbered_item(2, '在左侧菜单中找到 Pages（在 Code and automation 分类下）')
add_numbered_item(3, '在 Source 下方，选择 Deploy from a branch')
add_numbered_item(4, 'Branch 选择 main，旁边的文件夹选择 / (root)')
add_numbered_item(5, '点击 Save 保存')
add_numbered_item(6, '等待 1-2 分钟，刷新页面，顶部会出现一个绿色的网址，格式为：')
add_code('https://你的用户名.github.io/仓库名/')
add_tip('如果顶部没有出现网址，多等几分钟再刷新。GitHub Pages 首次部署需要一点时间。')

# 第5步
add_step(5, '打开网站并完成初始配置')
add_para('访问上一步得到的网址，你会看到登录页面。')
add_numbered_item(1, '默认密码是 123456，先选任意一个身份（他/她），输入密码登录')
add_numbered_item(2, '登录后，点击右上角的 ⚙️ 设置图标，依次配置以下内容：')
add_bullet('在一起的日期 — 设置你们在一起的纪念日，首页会自动计算天数', indent_level=1)
add_bullet('纪念日管理 — 添加双方生日、各种纪念日，首页会显示倒计时', indent_level=1)
add_bullet('异地天气 — 填写两人所在城市，首页会显示两地天气', indent_level=1)
add_bullet('生理期提醒 — 填写上次生理期日期和周期（可选）', indent_level=1)
add_bullet('密码管理 — 两人分别登录后，各自修改自己的密码', indent_level=1)
add_numbered_item(3, '配置完成后，就可以开始上传照片、写日记、添加心愿了')
add_warning('两个人的密码是独立的，各自登录后修改自己的密码。修改后请记住新密码。')

doc.add_page_break()

# 第6步
add_step(6, '配置数据同步（强烈推荐）')
add_para('如果不配置数据同步，所有数据只存在当前浏览器里。换手机、清缓存、换浏览器都会导致数据丢失。配置后数据自动同步到 GitHub 仓库，多设备通用。')
add_para('')
add_para('生成 GitHub Token（访问令牌）：', bold=True)
add_numbered_item(1, '打开 GitHub，点击右上角头像 → Settings')
add_numbered_item(2, '滚动到页面最底部，左侧菜单找到 Developer settings')
add_numbered_item(3, '点击 Personal access tokens → Fine-grained tokens')
add_numbered_item(4, '点击 Generate new token')
add_numbered_item(5, 'Token name 随便填，比如 couple-space')
add_numbered_item(6, 'Expiration（过期时间）选 No expiration（永不过期），或自定义一个较长的时间')
add_numbered_item(7, 'Repository access（仓库访问权限）选择 Only select repositories，然后在下拉框中选中你们刚才创建的仓库')
add_numbered_item(8, 'Permissions（权限）区域，找到 Repository permissions → Contents，选择 Read and write')
add_numbered_item(9, '其他权限保持默认，滚动到底部点击 Generate token')
add_numbered_item(10, '生成后会显示一串以 github_pat_ 开头的字符，点击复制按钮复制它')
add_warning('Token 只显示这一次！关闭页面后就再也看不到了。请立即复制并保存好。如果丢失，需要重新生成一个新的。')

add_para('')
add_para('在网站中填写 Token：', bold=True)
add_numbered_item(1, '回到情侣空间网站 → 设置 → 找到 GitHub 数据同步区域')
add_numbered_item(2, '仓库所有者：填写你的 GitHub 用户名')
add_numbered_item(3, '仓库名称：填写你创建的仓库名')
add_numbered_item(4, 'Token：粘贴刚才复制的那串字符')
add_numbered_item(5, '点击保存配置')
add_numbered_item(6, '保存成功后，数据会自动同步。以后在任何设备上登录，数据都会自动拉取')
add_tip('配置成功后，可以在设置 → 数据管理 → 导出数据，下载一份 JSON 备份文件，双重保险。')

doc.add_page_break()

# ===== 三、手机桌面使用 =====
add_heading('三、把网站添加到手机桌面（像 App 一样使用）', level=1)
add_para('这个网站支持 PWA 技术，可以添加到手机桌面，像普通 App 一样打开，支持离线使用。')

add_heading('iPhone（Safari 浏览器）', level=2)
add_numbered_item(1, '用 Safari 打开你们的网站地址')
add_numbered_item(2, '点击底部中间的分享按钮（方形带向上箭头）')
add_numbered_item(3, '向下滑动，找到"添加到主屏幕"，点击')
add_numbered_item(4, '名称可以改成"我们的空间"或你们喜欢的名字，点击添加')
add_numbered_item(5, '回到桌面，就能看到图标了，点击即可打开')

add_heading('Android（Chrome 浏览器）', level=2)
add_numbered_item(1, '用 Chrome 打开你们的网站地址')
add_numbered_item(2, '点击右上角三个点的菜单按钮')
add_numbered_item(3, '找到"添加到主屏幕"或"安装应用"，点击')
add_numbered_item(4, '确认名称，点击添加/安装')
add_numbered_item(5, '回到桌面即可看到图标')

doc.add_page_break()

# ===== 四、如何修改显示名字 =====
add_heading('四、如何把"他/她"改成你们的真实名字', level=1)
add_para('当前模板中默认显示"他"和"她"。如果想改成真实名字或昵称，需要修改两个文件中的文字。操作很简单：')

add_numbered_item(1, '在 GitHub 仓库页面，点击 index.html 文件')
add_numbered_item(2, '点击右上角的铅笔图标（Edit this file）进入编辑模式')
add_numbered_item(3, '按 Ctrl+F（Mac 按 Cmd+F）搜索"他"，把所有表示人物的"他"替换成第一个人的名字或昵称')
add_numbered_item(4, '同样搜索"她"，替换成第二个人的名字或昵称')
add_tip('注意不要改错地方！只替换显示名字的地方，不要修改代码中的 class 名称（如 avatar-hc、miss-you-btn hc 等）。如果不确定，可以先看上下文，显示在界面上的文字才需要改。')
add_numbered_item(5, '修改完 index.html 后，滚动到底部点击 Commit changes 保存')
add_numbered_item(6, '同样的方法，打开 js/app.js 文件，搜索"他"和"她"并替换')
add_numbered_item(7, '保存后等待 1-2 分钟，刷新网站即可看到新名字')

add_warning('修改代码时请只改文字，不要动任何符号、引号、括号等代码结构。改错了网站可能打不开。如果不确定，可以先备份原文件。')

doc.add_page_break()

# ===== 五、注意事项 =====
add_heading('五、注意事项', level=1)

add_heading('隐私安全', level=2)
add_bullet('仓库一定要设为 Private，否则任何人都能访问你们的网站')
add_bullet('GitHub Token 不要告诉任何人，它有仓库的读写权限')
add_bullet('登录后立即修改默认密码，两人各自修改')
add_bullet('数据存储在你们自己的 GitHub 仓库中，不会经过第三方服务器')

add_heading('数据安全', level=2)
add_bullet('务必配置 GitHub 数据同步（第 6 步），否则换设备会丢失数据')
add_bullet('定期在设置 → 数据管理 → 导出数据，下载 JSON 备份')
add_bullet('删除的内容会进入回收站，保留 7 天，可恢复')
add_bullet('照片会自动压缩到最大宽度 1280px，节省空间')

add_heading('使用限制', level=2)
add_bullet('GitHub 仓库总容量建议不超过 1GB，照片总数建议不超过 500 张')
add_bullet('GitHub Pages 每月有 100GB 流量限制，正常情侣使用完全足够')
add_bullet('支持两人同时使用，数据每 60 秒自动同步一次')
add_bullet('单张照片上传后会自动压缩，视频文件也支持上传但占用空间较大')

doc.add_page_break()

# ===== 六、常见问题 =====
add_heading('六、常见问题', level=1)

add_qa('网站打不开，显示 404？',
    'GitHub Pages 首次部署需要 1-2 分钟。请耐心等待后刷新。另外确认 Settings → Pages 中的网址是绿色的，且 Branch 选择的是 main 分支。')

add_qa('换了手机后数据都没了？',
    '这是因为没有配置 GitHub 数据同步。请按照第 6 步配置 Token。配置后在新设备登录，数据会自动从云端拉取。如果之前的数据只存在旧手机的浏览器里且未同步，那就无法恢复了，请尽快配置同步。')

add_qa('照片上传失败？',
    '请检查：1) GitHub Token 是否有 Contents 读写权限；2) 仓库是否还有存储空间；3) 网络是否正常。单张照片会自动压缩到 1280px 宽度，如果原图特别大可能需要多等几秒。')

add_qa('两个人可以同时编辑吗？会不会冲突？',
    '可以同时使用。数据每 60 秒自动同步一次，系统有版本冲突检测机制。但建议两人不要在同一秒编辑同一条内容，以免覆盖。')

add_qa('密码忘了怎么办？',
    '如果其中一人忘了密码，另一人登录后可以在设置 → 密码管理中修改对方的密码。如果两人都忘了，需要在 GitHub 仓库中删除数据文件（data/app-data.json），然后重新配置，但这样会丢失所有数据。所以请务必记住密码或定期导出备份。')

add_qa('想换个仓库名或用户名怎么办？',
    '可以在 GitHub 仓库 Settings → General 中修改仓库名，修改后网站地址会变，需要重新在设置中更新 GitHub 数据同步配置。用户名修改同理。')

add_qa('可以自定义网站的颜色和样式吗？',
    '可以。颜色定义在 css/style.css 文件中，主要颜色变量在文件开头的 :root 部分。修改颜色值后保存即可生效。但不建议没有代码基础的人随意修改。')

add_qa('网站在微信里打开功能不正常？',
    '微信内置浏览器对部分功能支持有限。建议用手机自带浏览器（Safari/Chrome）打开，或添加到桌面后从桌面图标打开。')

doc.add_page_break()

# ===== 七、功能一览 =====
add_heading('七、功能一览', level=1)
add_para('部署完成后，你们将拥有以下功能：')

features = [
    ('🏠 首页', '浪漫封面、在一起天数、情话语录轮播、重要日子倒计时、数据统计、最近动态、想你了双向打卡、异地天气'),
    ('📖 时光轴', '照片和日记按时间自动串联，形成专属故事线'),
    ('📷 照片墙', '拖拽上传、自动压缩、按月份/相册分组、灯箱查看、幻灯片播放、照片描述和拍摄日期'),
    ('📝 生活日记', '图文时间线、8种心情表情、6种日记模板、多图插入、作者区分、编辑删除、生成分享卡片'),
    ('⭐ 心愿清单', '分类管理（旅行/美食/生活/礼物/其他）、完成打勾、进度条、未完成自动排前'),
    ('💌 留言板', '悄悄话留言、5种便签颜色、卡片式展示、悬停微旋转效果'),
    ('✉️ 定时信件', '写给未来的信、指定解锁日期、封存后不可查看、到期自动开放'),
    ('✈️ 旅行计划', '旅行名称/目的地/日期/预算、行程清单、备注管理'),
    ('💑 问答书', '30个情侣问答、5大主题分类、两人分别回答、进度统计'),
    ('🎁 约会盲盒', '20+约会灵感随机抽取、解决选择困难'),
    ('📊 年度回顾', '按年份统计照片/日记/心愿等数据、生成专属年度总结'),
    ('🖼️ 照片拼贴', '选择2-9张照片生成拼贴图、可下载保存'),
    ('🎵 背景音乐', '上传专属歌曲、右上角悬浮播放控件'),
    ('⚙️ 设置', '纪念日管理、异地天气、生理期提醒、封面图、密码修改、数据导出/导入/清空、相册管理、回收站、深色模式'),
]

for icon_name, desc in features:
    p = doc.add_paragraph()
    p.paragraph_format.left_indent = Cm(0.5)
    p.paragraph_format.space_after = Pt(4)
    run1 = p.add_run(f'{icon_name}：')
    run1.bold = True
    run1.font.size = Pt(11)
    run1.font.color.rgb = RGBColor(0xB8, 0x9A, 0x97)
    run1.font.name = '微软雅黑'
    run1.element.rPr.rFonts.set(qn('w:eastAsia'), '微软雅黑')
    run2 = p.add_run(desc)
    run2.font.size = Pt(10.5)
    run2.font.color.rgb = RGBColor(0x55, 0x55, 0x55)
    run2.font.name = '微软雅黑'
    run2.element.rPr.rFonts.set(qn('w:eastAsia'), '微软雅黑')

# 结尾
doc.add_paragraph()
end_p = doc.add_paragraph()
end_p.alignment = WD_ALIGN_PARAGRAPH.CENTER
end_p.paragraph_format.space_before = Pt(30)
end_run = end_p.add_run('祝你们使用愉快，记录每一个心动瞬间 ♥')
end_run.font.size = Pt(13)
end_run.font.color.rgb = RGBColor(0xB8, 0x9A, 0x97)
end_run.font.name = '微软雅黑'
end_run.element.rPr.rFonts.set(qn('w:eastAsia'), '微软雅黑')

# ========== 保存文件 ==========
output_path = r'C:\Users\veken\Desktop\hc-lsy\修改发送\情侣空间部署指南.docx'
doc.save(output_path)
print(f'Word 文档已生成: {output_path}')
print(f'文件大小: {os.path.getsize(output_path)} bytes')
