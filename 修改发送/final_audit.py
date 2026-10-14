#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""情侣空间模板最终源码审查"""

import os
import re
import json

DST = r'C:\Users\veken\Desktop\hc-lsy\修改发送\couple-space-template'
SRC = r'C:\Users\veken\Desktop\hc-lsy'

def read_file(path):
    with open(path, 'r', encoding='utf-8') as f:
        return f.read()

print('=' * 70)
print('  情侣空间模板 — 最终源码审查报告')
print('=' * 70)
print()

# ========== 1. 文件完整性 ==========
print('【1】文件完整性检查')
print('-' * 50)
expected_files = [
    'index.html', 'manifest.json', 'service-worker.js',
    'icon.svg', 'README.md', '.gitignore',
    'css/style.css', 'js/app.js'
]
all_ok = True
for f in expected_files:
    path = os.path.join(DST, f)
    if os.path.exists(path):
        size = os.path.getsize(path)
        print(f'  [OK] {f} ({size} bytes)')
    else:
        print(f'  [FAIL] {f} 缺失!')
        all_ok = False

# 检查不应存在的文件
bad_files = []
for root, dirs, files in os.walk(DST):
    for f in files:
        if f.endswith(('.png', '.jpg', '.jpeg', '.gif', '.mp3', '.wav', '.ogg', '.m4a', '.mp4', '.webm')):
            bad_files.append(os.path.join(root, f))
        if 'app-data' in f.lower() or f == 'data.json':
            bad_files.append(os.path.join(root, f))
if os.path.exists(os.path.join(DST, '.git')):
    bad_files.append('.git directory')

if bad_files:
    print(f'  [FAIL] 发现不应存在的文件: {bad_files}')
    all_ok = False
else:
    print('  [OK] 无媒体文件、无数据文件、无 .git 目录')

print()

# ========== 2. 个人标识扫描 ==========
print('【2】个人标识全量扫描')
print('-' * 50)
patterns = {
    'HC (大写独立词)': r'\bHC\b',
    'LSY (大写独立词)': r'\bLSY\b',
    'hc-lsy (连字符)': r'hc-lsy',
    'hc_lsy (下划线)': r'hc_lsy',
    'GitHub用户名': r'2829186707',
    '真实GitHub Token': r'github_pat_[a-zA-Z0-9_]{20,}',
}
personal_found = {}
for root, dirs, files in os.walk(DST):
    for f in files:
        if f.endswith(('.py', '.pyc')):
            continue
        path = os.path.join(root, f)
        try:
            content = read_file(path)
            rel_path = os.path.relpath(path, DST)
            for name, pat in patterns.items():
                matches = re.findall(pat, content)
                if matches:
                    # 找出具体行
                    for i, line in enumerate(content.split('\n'), 1):
                        if re.search(pat, line):
                            key = f'{rel_path}:{i}'
                            if key not in personal_found:
                                personal_found[key] = (name, line.strip()[:120])
        except:
            pass

if personal_found:
    print(f'  发现 {len(personal_found)} 处匹配:')
    for loc, (name, line) in sorted(personal_found.items()):
        print(f'    [{name}] {loc}')
        print(f'      -> {line}')
else:
    print('  [OK] 未发现任何个人标识')

print()

# ========== 3. 敏感配置检查 ==========
print('【3】敏感配置检查')
print('-' * 50)
app_js = read_file(os.path.join(DST, 'js', 'app.js'))

config_checks = [
    ('adminPasswordHash 为空', r"adminPasswordHash:\s*''", app_js),
    ('defaultGithub.owner 为空', r"owner:\s*''", app_js),
    ('defaultGithub.repo 为空', r"repo:\s*''", app_js),
    ('defaultGithub.token 为空', r"token:\s*''", app_js),
    ('defaultPasswords 为 role1/role2', r"defaultPasswords:\s*\{ role1: '123456', role2: '123456' \}", app_js),
    ('存储键前缀为 couple_', r"'couple_auth'", app_js),
    ('密码盐已更改(非hc_lsy)', r"couple_salt_\d+", app_js),
    ('不存在 hc_lsy_salt', r"hc_lsy_salt", app_js),  # 应该不匹配
]
for name, pat, content in config_checks:
    found = bool(re.search(pat, content))
    if name == '不存在 hc_lsy_salt':
        status = 'OK' if not found else 'FAIL'
        print(f'  [{status}] {name}')
    else:
        status = 'OK' if found else 'FAIL'
        print(f'  [{status}] {name}')

print()

# ========== 4. HTML / CSS / JS 一致性 ==========
print('【4】HTML / CSS / JS 一致性检查')
print('-' * 50)
index_html = read_file(os.path.join(DST, 'index.html'))
css = read_file(os.path.join(DST, 'css', 'style.css'))

# 4a. HTML 中的 id vs JS 中的 getElementById
html_ids = set(re.findall(r'id="([^"]+)"', index_html))
js_getelements = set(re.findall(r"getElementById\('([^']+)'\)", app_js))
js_getelements2 = set(re.findall(r'getElementById\("([^"]+)"\)', app_js))
js_getelements.update(js_getelements2)

missing_in_html = js_getelements - html_ids
if missing_in_html:
    print(f'  [FAIL] JS 引用了 HTML 中不存在的 id: {missing_in_html}')
else:
    print(f'  [OK] JS 中所有 getElementById ({len(js_getelements)}个) 在 HTML 中均存在')

# 4b. data-role 一致性
html_roles = set(re.findall(r'data-role="([^"]+)"', index_html))
js_role_checks = re.findall(r"=== '([^']+)'", app_js)
js_roles = set(r for r in js_role_checks if r in ('role1', 'role2', 'hc', 'lsy', 'admin'))
print(f'  [INFO] HTML data-role 值: {html_roles}')
print(f'  [INFO] JS 中角色比较值: {js_roles}')
if html_roles == {'role1', 'role2'} and js_roles.issubset({'role1', 'role2', 'admin'}):
    print('  [OK] data-role 前后端一致')
else:
    print('  [WARN] data-role 可能不一致')

# 4c. CSS class 选择器 vs HTML class
css_classes = set(re.findall(r'\.([a-zA-Z][a-zA-Z0-9_-]+)', css))
# 取一些关键 class 检查
key_classes = ['avatar-hc', 'avatar-lsy', 'role-btn', 'hero-name', 'miss-you-btn',
               'diary-author', 'message-author', 'qa-answer', 'couple-avatar']
class_ok = True
for cls in key_classes:
    if cls in css_classes:
        pass
    else:
        print(f'  [FAIL] CSS 缺少关键类: .{cls}')
        class_ok = False
if class_ok:
    print(f'  [OK] 所有关键 CSS 类选择器存在')

# 4d. HTML 中引用的 CSS/JS 文件是否存在
css_ref = re.findall(r'href="([^"]+\.css[^"]*)"', index_html)
js_ref = re.findall(r'src="([^"]+\.js[^"]*)"', index_html)
for ref in css_ref + js_ref:
    clean_ref = ref.split('?')[0].lstrip('./')
    path = os.path.join(DST, clean_ref)
    if os.path.exists(path):
        print(f'  [OK] 引用文件存在: {clean_ref}')
    else:
        print(f'  [FAIL] 引用文件缺失: {clean_ref}')

print()

# ========== 5. 功能完整性（对比原文件） ==========
print('【5】功能完整性检查（对比原文件）')
print('-' * 50)
src_app = read_file(os.path.join(SRC, 'js', 'app.js'))

# 检查关键功能函数是否存在
key_functions = [
    'auth', 'gallery', 'diary', 'wishes', 'messages', 'letters',
    'trips', 'qa', 'missYou', 'weather', 'period', 'music', 'cover',
    'github', 'storage', 'canvasUtil', 'blindbox', 'annual', 'collage'
]
func_ok = True
for func in key_functions:
    pattern = rf'const {func}\s*='
    if re.search(pattern, app_js):
        pass
    else:
        print(f'  [FAIL] 缺少功能模块: {func}')
        func_ok = False
if func_ok:
    print(f'  [OK] 所有 {len(key_functions)} 个功能模块完整存在')

# 检查原文件中的关键功能在模板中是否都有
src_functions = set(re.findall(r'const (\w+)\s*=\s*\{', src_app))
dst_functions = set(re.findall(r'const (\w+)\s*=\s*\{', app_js))
missing_funcs = src_functions - dst_functions
if missing_funcs:
    print(f'  [FAIL] 相比原文件缺少功能对象: {missing_funcs}')
else:
    print(f'  [OK] 相比原文件，所有功能对象均保留')

# 检查事件绑定数量
src_binds = len(re.findall(r"addEventListener\(", src_app))
dst_binds = len(re.findall(r"addEventListener\(", app_js))
print(f'  [INFO] 原文件事件绑定: {src_binds}, 模板事件绑定: {dst_binds}')
if abs(src_binds - dst_binds) <= 2:
    print('  [OK] 事件绑定数量一致')
else:
    print('  [WARN] 事件绑定数量差异较大')

print()

# ========== 6. JS 语法和逻辑检查 ==========
print('【6】JS 语法与逻辑检查')
print('-' * 50)

# 括号匹配
open_braces = app_js.count('{')
close_braces = app_js.count('}')
open_parens = app_js.count('(')
close_parens = app_js.count(')')
open_brackets = app_js.count('[')
close_brackets = app_js.count(']')

print(f'  花括号: {{={open_braces}, }}={close_braces}, 匹配={open_braces==close_braces}')
print(f'  圆括号: (={open_parens}, )={close_parens}, 匹配={open_parens==close_parens}')
print(f'  方括号: [={open_brackets}, ]={close_brackets}, 匹配={open_brackets==close_brackets}')

# 检查 role1/role2 使用是否对称
role1_count = len(re.findall(r"'role1'", app_js))
role2_count = len(re.findall(r"'role2'", app_js))
print(f'  role1 引用: {role1_count}, role2 引用: {role2_count}')
if abs(role1_count - role2_count) <= 3:
    print('  [OK] role1/role2 引用数量基本对称')
else:
    print('  [WARN] role1/role2 引用数量差异较大，可能有遗漏')

# 检查是否还有残留的 'hc' 或 'lsy' 字符串字面量（排除CSS类名）
hc_strings = re.findall(r"'([^']*hc[^']*)'", app_js)
lsy_strings = re.findall(r"'([^']*lsy[^']*)'", app_js)
hc_strings = [s for s in hc_strings if s not in ('qa-answer hc', 'qa-answer lsy') and 'missYou' not in s and 'miss' not in s.lower()]
lsy_strings = [s for s in lsy_strings if s not in ('qa-answer lsy',) and 'missYou' not in s and 'miss' not in s.lower()]
# 过滤掉 id 名（missYouHc, missHcStatus 等）
hc_strings = [s for s in hc_strings if not s[0].isupper() and 'miss' not in s]
lsy_strings = [s for s in lsy_strings if not s[0].isupper() and 'miss' not in s]

if hc_strings or lsy_strings:
    print(f'  [WARN] 可能残留的 hc/lsy 字符串: hc={hc_strings}, lsy={lsy_strings}')
else:
    print('  [OK] 无残留的 hc/lsy 字符串字面量（CSS类名和HTML id除外）')

print()

# ========== 7. manifest 和 service-worker ==========
print('【7】manifest.json & service-worker.js 检查')
print('-' * 50)
manifest = json.loads(read_file(os.path.join(DST, 'manifest.json')))
print(f'  name: {manifest.get("name")}')
print(f'  short_name: {manifest.get("short_name")}')
print(f'  description: {manifest.get("description")}')
if 'HC' not in manifest.get('name', '') and 'LSY' not in manifest.get('name', ''):
    print('  [OK] manifest 无个人标识')
else:
    print('  [FAIL] manifest 含个人标识')

sw = read_file(os.path.join(DST, 'service-worker.js'))
if 'hc-lsy' not in sw and 'HC & LSY' not in sw:
    print('  [OK] service-worker 无个人标识')
else:
    print('  [FAIL] service-worker 含个人标识')
if 'couple-space-cache' in sw:
    print('  [OK] service-worker 缓存名已更改')

print()
print('=' * 70)
print('  审查完成')
print('=' * 70)
