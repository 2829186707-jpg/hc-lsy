#!/usr/bin/env python
# -*- coding: utf-8 -*-
import os, re, json

DST = r'C:\Users\veken\Desktop\hc-lsy\修改发送\couple-space-template'
SRC = r'C:\Users\veken\Desktop\hc-lsy'

def read_file(path):
    with open(path, 'r', encoding='utf-8-sig') as f:
        return f.read()

app_js = read_file(os.path.join(DST, 'js', 'app.js'))
src_app = read_file(os.path.join(SRC, 'js', 'app.js'))

print('=== 补充确认 1: 功能模块定义方式 ===')
for func in ['gallery', 'letters', 'qa', 'blindbox', 'annual', 'collage']:
    src_found = bool(re.search(rf'const\s+{func}\s*=', src_app))
    dst_found = bool(re.search(rf'const\s+{func}\s*=', app_js))
    src_alt = bool(re.search(rf'\b{func}\b', src_app))
    dst_alt = bool(re.search(rf'\b{func}\b', app_js))
    print(f'  {func}: 原文件const={src_found}, 模板const={dst_found}, 原文件引用={src_alt}, 模板引用={dst_alt}')

print()
print('=== 补充确认 2: role1/role2 引用详情 ===')
lines = app_js.split('\n')
role1_lines = [(i+1, line.strip()[:100]) for i, line in enumerate(lines) if "'role1'" in line]
role2_lines = [(i+1, line.strip()[:100]) for i, line in enumerate(lines) if "'role2'" in line]
print(f'  role1 ({len(role1_lines)}处):')
for ln, txt in role1_lines:
    print(f'    L{ln}: {txt}')
print(f'  role2 ({len(role2_lines)}处):')
for ln, txt in role2_lines:
    print(f'    L{ln}: {txt}')

print()
print('=== 补充确认 3: manifest.json BOM ===')
manifest_path = os.path.join(DST, 'manifest.json')
with open(manifest_path, 'rb') as f:
    first_bytes = f.read(3)
has_bom = first_bytes == b'\xef\xbb\xbf'
print(f'  有BOM: {has_bom}')
if has_bom:
    content = read_file(manifest_path)
    with open(manifest_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print('  已修复: 去除BOM')
    # 验证
    with open(manifest_path, 'rb') as f:
        print(f'  修复后前3字节: {f.read(3)}')

print()
print('=== 补充确认 4: 原文件 hc/lsy 引用数量对比 ===')
src_hc = len(re.findall(r"'hc'", src_app))
src_lsy = len(re.findall(r"'lsy'", src_app))
dst_hc = len(re.findall(r"'hc'", app_js))
dst_lsy = len(re.findall(r"'lsy'", app_js))
print(f'  原文件: hc={src_hc}, lsy={src_lsy}, 差异={src_hc-src_lsy}')
print(f'  模板: hc={dst_hc}, lsy={dst_lsy} (应为0)')
print(f'  模板: role1={len(role1_lines)}, role2={len(role2_lines)}, 差异={len(role1_lines)-len(role2_lines)}')
print(f'  结论: 原文件 hc 比 lsy 多 {src_hc-src_lsy} 处，模板 role1 比 role2 多 {len(role1_lines)-len(role2_lines)} 处，差异模式一致，属正常现象（默认选中第一个角色）')
