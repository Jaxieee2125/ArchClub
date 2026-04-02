import matplotlib.pyplot as plt

# --- 1. BIỂU ĐỒ THEO MODULE (PIE CHART) ---
labels_module = ['Mã giảm giá', 'Đặt hàng', 'Tìm kiếm']
sizes_module = [3, 3, 2]
colors_module = ['#ff9999','#66b3ff','#99ff99']

fig1, ax1 = plt.subplots(figsize=(7, 5))
ax1.pie(sizes_module, labels=labels_module, colors=colors_module, autopct='%1.1f%%', startangle=90, textprops={'fontsize': 12})
ax1.axis('equal')  # Đảm bảo hình tròn
plt.title('Thống kê Bug theo Module', fontsize=16, fontweight='bold', pad=20)
plt.savefig('bug_by_module.png', bbox_inches='tight', dpi=300)
plt.close()

# --- 2. BIỂU ĐỒ THEO MỨC ĐỘ (BAR CHART) ---
labels_severity = ['Critical\n(Sập Server)', 'Major\n(Lỗi Logic)', 'Minor\n(Lỗi Validate)', 'Trivial\n(Lỗi Nhỏ)']
counts_severity = [1, 1, 5, 1]
colors_severity = ['#d62728', '#ff7f0e', '#1f77b4', '#2ca02c']

fig2, ax2 = plt.subplots(figsize=(8, 5))
bars = ax2.bar(labels_severity, counts_severity, color=colors_severity, width=0.6)

# Thêm số liệu trên đầu mỗi cột
for bar in bars:
    yval = bar.get_height()
    ax2.text(bar.get_x() + bar.get_width()/2, yval + 0.1, int(yval), ha='center', va='bottom', fontsize=12, fontweight='bold')

plt.ylim(0, 6) # Chỉnh trục Y cao hơn xíu cho đẹp
plt.title('Thống kê Bug theo Mức độ nghiêm trọng (Severity)', fontsize=16, fontweight='bold', pad=20)
plt.ylabel('Số lượng Bug', fontsize=12)
plt.grid(axis='y', linestyle='--', alpha=0.7)
plt.savefig('bug_by_severity.png', bbox_inches='tight', dpi=300)
plt.close()

print("Đã vẽ xong! Vui lòng kiểm tra 2 file: bug_by_module.png và bug_by_severity.png")