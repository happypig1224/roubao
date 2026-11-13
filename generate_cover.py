#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
闲鱼全栈接单 3:4 黄金五层封面生成脚本 (质感升级版)
- 修改 1: 身份改为“多年一线开发经验”
- 修改 2: 消除所有由于字体缺失造成的方块 □，换用程序级原生绘制的实心列表圆点
- 修改 3: 去掉“私信秒回”右边的特殊字符框
- 修改 4: 背景全面提亮，采用通透高级深邃科技蓝 + 科技微光扩散，告别死黑压抑
"""

import os
import sys
import math
from PIL import Image, ImageDraw, ImageFont, ImageFilter

OUTPUT_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "output")
os.makedirs(OUTPUT_DIR, exist_ok=True)

def create_pixel_perfect_cover(output_path="xianyu_cover_3x4.png"):
    width, height = 1200, 1600
    
    # =========================================================================
    # 1. 通透高级科技蓝渐变背景 (告别死黑，提升明度与层次)
    # =========================================================================
    img = Image.new("RGBA", (width, height), (0, 0, 0, 255))
    draw = ImageDraw.Draw(img)
    
    # 柔和三段式渐变：从顶部的典雅蓝青 (22, 45, 80) -> 中部的饱满科技蓝 (28, 64, 118) -> 底部的沉稳深蓝 (16, 34, 64)
    for y in range(height):
        r = y / height
        if r < 0.45:
            ratio = r / 0.45
            # 顶部到中部渐变
            red = int(24 + (32 - 24) * ratio)
            green = int(46 + (70 - 46) * ratio)
            blue = int(82 + (126 - 82) * ratio)
        else:
            ratio = (r - 0.45) / 0.55
            # 中部到底部渐变
            red = int(32 + (18 - 32) * ratio)
            green = int(70 + (36 - 70) * ratio)
            blue = int(126 + (72 - 126) * ratio)
        draw.line([(0, y), (width, y)], fill=(red, green, blue, 255))
        
    # 添加背景科技微点网格 (Subtle Tech Grid)，丰富空间细节
    grid_overlay = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    grid_draw = ImageDraw.Draw(grid_overlay)
    grid_step = 60
    for gx in range(40, width, grid_step):
        for gy in range(40, height, grid_step):
            grid_draw.point((gx, gy), fill=(147, 197, 253, 35))
            
    # 添加柔和的环境微光光晕 (双光晕：标题区 + 卡片区)
    glow_draw = ImageDraw.Draw(grid_overlay)
    
    # 顶部光晕 (天蓝)
    for rad in range(500, 0, -8):
        alpha = int(35 * (1 - rad / 500))
        glow_draw.ellipse([width//2 - rad, 280 - rad, width//2 + rad, 280 + rad], fill=(56, 189, 248, alpha))
        
    # 中下部微光 (微紫蓝)
    for rad in range(400, 0, -10):
        alpha = int(25 * (1 - rad / 400))
        glow_draw.ellipse([width//2 - rad, 980 - rad, width//2 + rad, 980 + rad], fill=(99, 102, 241, alpha))

    img = Image.alpha_composite(img, grid_overlay)
    draw = ImageDraw.Draw(img)

    # =========================================================================
    # 字体加载
    # =========================================================================
    font_bold = "C:/Windows/Fonts/msyhbd.ttc"
    font_reg = "C:/Windows/Fonts/msyh.ttc"
    
    try:
        f_top = ImageFont.truetype(font_reg, 32)
        f_title = ImageFont.truetype(font_bold, 86)
        f_subtitle = ImageFont.truetype(font_bold, 44)
        f_tag_title = ImageFont.truetype(font_bold, 33)
        f_tag_body = ImageFont.truetype(font_bold, 31)
        f_card_title = ImageFont.truetype(font_bold, 40)
        f_card_item = ImageFont.truetype(font_bold, 32)
        f_bottom = ImageFont.truetype(font_bold, 36)
    except Exception as e:
        print(f"Font load fallback: {e}")
        f_top = f_title = f_subtitle = f_tag_title = f_tag_body = f_card_title = f_card_item = f_bottom = ImageFont.load_default()

    # -------------------------------------------------------------------------
    # 第一层：顶部背书胶囊条 (修改为：多年一线开发经验)
    # -------------------------------------------------------------------------
    top_text = "多年一线开发经验 ｜ 架构设计把控 ｜ 1对1远程答疑"
    top_w = draw.textlength(top_text, font=f_top)
    pill_w = top_w + 60
    pill_h = 56
    pill_x = (width - pill_w) // 2
    pill_y = 60
    # 绘制高通透蓝灰胶囊框
    draw.rounded_rectangle([pill_x, pill_y, pill_x + pill_w, pill_y + pill_h], radius=28, fill=(15, 30, 58, 220), outline=(96, 165, 250, 160), width=2)
    draw.text(((width - top_w) // 2, pill_y + 10), top_text, fill=(241, 245, 249), font=f_top)

    # -------------------------------------------------------------------------
    # 第二层：核心主标题区
    # -------------------------------------------------------------------------
    title_text = "全栈项目设计与开发"
    title_w = draw.textlength(title_text, font=f_title)
    draw.text(((width - title_w) // 2, 155), title_text, fill=(255, 255, 255), font=f_title)

    sub_text = "【 远程调试 · 云原生部署 · 源码讲解 】"
    sub_w = draw.textlength(sub_text, font=f_subtitle)
    draw.text(((width - sub_w) // 2, 270), sub_text, fill=(186, 230, 253), font=f_subtitle)

    # 分隔流光线
    line_y = 345
    draw.line([(100, line_y), (width - 100, line_y)], fill=(71, 95, 138, 200), width=2)

    # -------------------------------------------------------------------------
    # 第三层：技术栈矩阵 (四色四行，实心圆点列表)
    # -------------------------------------------------------------------------
    tech_rows = [
        ("主力语言", "Java · Python · TypeScript · JavaScript · Node.js", (250, 204, 21)),   # 柠檬黄
        ("核心框架", "SpringBoot微服务 · React · Vue3 · FastAPI · uniapp", (251, 146, 60)), # 珊瑚橙
        ("中间存储", "MySQL · Redis · Kafka · ElasticSearch 全文检索", (255, 255, 255)),   # 亮白
        ("云原生AI", "Docker · K8S · RAG检索增强 · Prometheus监控运维", (56, 189, 248))      # 冰蓝
    ]

    start_y = 380
    row_gap = 100
    for i, (prefix, content, color) in enumerate(tech_rows):
        cur_y = start_y + i * row_gap
        # 绘制背景深色透光胶囊条 (适当扩宽，左右各留 60px 边距，总宽 1080px)
        bg_bar_x = 60
        bg_bar_w = width - 120
        draw.rounded_rectangle([bg_bar_x, cur_y - 12, bg_bar_x + bg_bar_w, cur_y + 64], radius=16, fill=(13, 27, 54, 210), outline=(71, 85, 125, 130), width=1)
        
        # 绘制实心列表圆点 (半径 7px，垂直居中对齐文字)
        dot_x = 92
        dot_y = cur_y + 20
        dot_r = 7
        draw.ellipse([dot_x - dot_r, dot_y - dot_r, dot_x + dot_r, dot_y + dot_r], fill=color)
        
        # 标签前缀 (无方框符号)
        p_text = f"{prefix}："
        draw.text((112, cur_y), p_text, fill=(203, 213, 225), font=f_tag_title)
        p_len = draw.textlength(p_text, font=f_tag_title)
        
        # 技术栈文本 (右侧安全留白充足，绝对不溢出)
        draw.text((112 + p_len + 8, cur_y + 2), content, fill=color, font=f_tag_body)

    # -------------------------------------------------------------------------
    # 第四层：左右悬浮双白卡 (极致信任转化点，实心圆点列表)
    # -------------------------------------------------------------------------
    card_y = 805
    card_w = 510
    card_h = 360
    card_r = 28
    
    # 左右双卡投影阴影
    card1_x = 70
    card2_x = width - card1_x - card_w
    shadow_overlay = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    s_draw = ImageDraw.Draw(shadow_overlay)
    s_draw.rounded_rectangle([card1_x + 8, card_y + 12, card1_x + card_w + 8, card_y + card_h + 12], radius=card_r, fill=(0, 0, 0, 120))
    s_draw.rounded_rectangle([card2_x + 8, card_y + 12, card2_x + card_w + 8, card_y + card_h + 12], radius=card_r, fill=(0, 0, 0, 120))
    shadow_overlay = shadow_overlay.filter(ImageFilter.GaussianBlur(16))
    img = Image.alpha_composite(img, shadow_overlay)
    draw = ImageDraw.Draw(img)

    # ---------------- 左白卡 ----------------
    draw.rounded_rectangle([card1_x, card_y, card1_x + card_w, card_y + card_h], radius=card_r, fill=(255, 255, 255, 255))
    # 顶部装饰高光红浅底条
    draw.rounded_rectangle([card1_x + 28, card_y + 24, card1_x + card_w - 28, card_y + 88], radius=14, fill=(254, 226, 226, 255))
    
    # 左卡标题：实心红圆点 + 文字
    tag1_txt = "全程陪跑 · 包跑通"
    t1_w = draw.textlength(tag1_txt, font=f_card_title)
    total_w1 = 18 + 10 + t1_w  # 圆点直径18 + 间距10 + 文字宽
    start_left1 = card1_x + (card_w - total_w1) // 2
    # 绘制实心红圆点
    draw.ellipse([start_left1, card_y + 44, start_left1 + 18, card_y + 62], fill=(220, 38, 38))
    draw.text((start_left1 + 28, card_y + 32), tag1_txt, fill=(220, 38, 38), font=f_card_title)
    
    # 分隔细线
    draw.line([(card1_x + 28, card_y + 110), (card1_x + card_w - 28, card_y + 110)], fill=(226, 232, 240), width=2)
    
    # 左卡三项实心圆点列表
    left_items = [
        "远程部署到可运行",
        "1对1源码架构答疑",
        "讲懂细节 · 顺利验收"
    ]
    for idx, item in enumerate(left_items):
        iy = card_y + 138 + idx * 68
        # 绘制实心蓝色圆点
        draw.ellipse([card1_x + 40, iy + 14, card1_x + 52, iy + 26], fill=(59, 130, 246))
        # 对应文字 (第三项稍淡体现细节)
        txt_color = (30, 41, 59) if idx < 2 else (71, 85, 105)
        draw.text((card1_x + 64, iy + 4), item, fill=txt_color, font=f_card_item)

    # ---------------- 右白卡 ----------------
    draw.rounded_rectangle([card2_x, card_y, card2_x + card_w, card_y + card_h], radius=card_r, fill=(255, 255, 255, 255))
    # 顶部装饰高光绿浅底条
    draw.rounded_rectangle([card2_x + 28, card_y + 24, card2_x + card_w - 28, card_y + 88], radius=14, fill=(220, 252, 231, 255))
    
    # 右卡标题：实心绿圆点 + 文字
    tag2_txt = "平台交易 · 阶段付"
    t2_w = draw.textlength(tag2_txt, font=f_card_title)
    total_w2 = 18 + 10 + t2_w
    start_left2 = card2_x + (card_w - total_w2) // 2
    # 绘制实心绿圆点
    draw.ellipse([start_left2, card_y + 44, start_left2 + 18, card_y + 62], fill=(22, 163, 74))
    draw.text((start_left2 + 28, card_y + 32), tag2_txt, fill=(22, 163, 74), font=f_card_title)
    
    # 分隔细线
    draw.line([(card2_x + 28, card_y + 110), (card2_x + card_w - 28, card_y + 110)], fill=(226, 232, 240), width=2)
    
    # 右卡三项实心圆点列表
    right_items = [
        "不解决问题不收尾款",
        "价格待议 · 学生党友好",
        "价格透明 · 诚信长久"
    ]
    for idx, item in enumerate(right_items):
        iy = card_y + 138 + idx * 68
        # 绘制实心绿色圆点
        draw.ellipse([card2_x + 40, iy + 14, card2_x + 52, iy + 26], fill=(34, 197, 94))
        txt_color = (30, 41, 59) if idx < 2 else (71, 85, 105)
        draw.text((card2_x + 64, iy + 4), item, fill=txt_color, font=f_card_item)

    # -------------------------------------------------------------------------
    # 第五层：底部行动转化条 (去除右侧箭头框，纯文字居中)
    # -------------------------------------------------------------------------
    bot_y = 1240
    bot_w = width - 140
    bot_h = 96
    bot_x = 70
    draw.rounded_rectangle([bot_x, bot_y, bot_x + bot_w, bot_y + bot_h], radius=24, fill=(34, 197, 94, 255))
    bot_text = "先看需求再报价 ｜ 交付源码+说明文档 ｜ 私信秒回"
    bw = draw.textlength(bot_text, font=f_bottom)
    draw.text(((width - bw) // 2, bot_y + 26), bot_text, fill=(255, 255, 255), font=f_bottom)

    # 底部平台合规免责小字
    note_text = "※ 本服务严格遵守平台规范，仅供个人学习、技术探讨与科研实训参考"
    f_note = ImageFont.truetype(font_reg, 24)
    nw = draw.textlength(note_text, font=f_note)
    draw.text(((width - nw) // 2, 1380), note_text, fill=(191, 219, 254, 200), font=f_note)

    # 导出保存
    full_output = os.path.join(OUTPUT_DIR, output_path)
    img.convert("RGB").save(full_output, quality=95)
    print(f"[SUCCESS] Cover generated at: {full_output}")
    return full_output

if __name__ == "__main__":
    create_pixel_perfect_cover("xianyu_fullstack_cover_3x4.png")
