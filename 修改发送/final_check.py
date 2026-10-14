#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""最终变量名一致性检查 + 语法验证"""
import os, re, subprocess

DST = r'C:\Users\veken\Desktop\hc-lsy\修改发送\couple-space-template'
SRC = r'C:\Users\veken\Desktop\hc-lsy'

def read_file(path):
    with open(path, 'r', encoding='utf-8-sig') as f:
        return f.read()

src_app = read_file(os.path.join(SRC, 'js', 'app.js'))
dst_app = read_file(os.path.join(DST, 'js', 'app.js'))

print('=' * 60)
print('  最终变量名一致性检查')
print('=' * 60)
print()

# 1. 检查 sname 小写（应为 sName）
print('【1】sName 变量名检查')
sname_lower = re.findall(r'\bsname\b', dst_app)
sName_camel = re.findall(r'\bsName\b', dst_app)
print(f'  sname (小写): {len(sname_lower)} 处')
print(f'  sName (驼峰): {len(sName_camel)} 处')
if len(sname_lower) == 0:
    print('  [OK] 无小写 sname')
else:
    print('  [FAIL] 仍有小写 sname!')

print()

# 2. 检查其他 s 开头的变量名一致性
print('【2】s 开头变量名一致性（原文件 vs 模板）')
s_vars_src = set(re.findall(r'\b(s[A-Z][a-zA-Z]+)\b', src_app))
s_vars_dst = set(re.findall(r'\b(s[A-Z][a-zA-Z]+)\b', dst_app))
print(f'  原文件 s* 变量: {sorted(s_vars_src)}')
print(f'  模板 s* 变量: {sorted(s_vars_dst)}')
only_src = s_vars_src - s_vars_dst
only_dst = s_vars_dst - s_vars_src
if only_src:
    print(f'  [WARN] 原文件有但模板没有: {only_src}')
if only_dst:
    print(f'  [WARN] 模板有但原文件没有: {only_dst}')
if not only_src and not only_dst:
    print('  [OK] 完全一致')

print()

# 3. 检查 getElementById 返回值变量名
print('【3】关键变量名对比')
key_vars = ['sAvatar', 'sName', 'sHint', 'role1Btn', 'role2Btn', 'role1', 'role2',
            'role1Ans', 'role2Ans', 'hcBtn', 'lsyBtn', 'hcAns', 'lsyAns',
            'missYouHc', 'missYouLsy', 'missHcStatus', 'missLsyStatus']
for var in key_vars:
    src_count = len(re.findall(rf'\b{var}\b', src_app))
    dst_count = len(re.findall(rf'\b{var}\b', dst_app))
    if src_count > 0 or dst_count > 0:
        status = 'OK' if src_count == dst_count else 'DIFF'
        print(f'  [{status}] {var}: 原文件={src_count}, 模板={dst_count}')

print()

# 4. Node 语法检查
print('【4】Node 语法检查')
result = subprocess.run(['node', '--check', os.path.join(DST, 'js', 'app.js')],
                       capture_output=True, text=True)
if result.returncode == 0:
    print('  [PASS] app.js 语法正确')
else:
    print(f'  [FAIL] 语法错误: {result.stderr}')

print()

# 5. 最终个人标识扫描
print('【5】最终个人标识扫描（全文件）')
all_clean = True
for root, dirs, files in os.walk(DST):
    for f in files:
        if f.endswith('.py'):
            continue
        path = os.path.join(root, f)
        try:
            content = read_file(path)
            rel = os.path.relpath(path, DST)
            # 检查 HC/LSY 独立词
            for pat, name in [(r'\bHC\b', 'HC'), (r'\bLSY\b', 'LSY'),
                               (r'hc-lsy', 'hc-lsy'), (r'hc_lsy', 'hc_lsy'),
                               (r'2829186707', 'GitHub用户名'),
                               (r'github_pat_[a-zA-Z0-9_]{20,}', '真实Token')]:
                matches = re.findall(pat, content)
                if matches:
                    print(f'  [FOUND] {rel}: {name} x{len(matches)}')
                    all_clean = False
        except:
            pass
if all_clean:
    print('  [OK] 所有文件均无个人标识')

print()
print('=' * 60)
print('  检查完成')
print('=' * 60)
