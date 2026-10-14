#!/usr/bin/env python
# -*- coding: utf-8 -*-
import os, re, json

DST = r'C:\Users\veken\Desktop\hc-lsy\修改发送\couple-space-template'
SRC = r'C:\Users\veken\Desktop\hc-lsy'

def read_file(path):
    with open(path, 'r', encoding='utf-8-sig') as f:
        return f.read()

src_app = read_file(os.path.join(SRC, 'js', 'app.js'))
dst_app = read_file(os.path.join(DST, 'js', 'app.js'))

print('=== 确认 sName/sname 变量名 ===')
src_lines = src_app.split('\n')
dst_lines = dst_app.split('\n')

print('原文件中 sName/sname 相关行:')
for i, line in enumerate(src_lines):
    if 'sName' in line or 'sname' in line:
        print(f'  L{i+1}: {line.strip()[:120]}')

print()
print('模板中 sName/sname 相关行:')
for i, line in enumerate(dst_lines):
    if 'sName' in line or 'sname' in line:
        print(f'  L{i+1}: {line.strip()[:120]}')

print()
print('=== 确认 manifest.json 内容 ===')
manifest = json.loads(read_file(os.path.join(DST, 'manifest.json')))
print(json.dumps(manifest, ensure_ascii=False, indent=2))

print()
print('=== 最终确认: 模板中无 hc/lsy 字符串字面量 ===')
hc_str = re.findall(r"'hc'", dst_app)
lsy_str = re.findall(r"'lsy'", dst_app)
print(f"  'hc' 出现: {len(hc_str)} 次")
print(f"  'lsy' 出现: {len(lsy_str)} 次")
if len(hc_str) == 0 and len(lsy_str) == 0:
    print('  结论: 完全清除')
else:
    print('  结论: 仍有残留!')
