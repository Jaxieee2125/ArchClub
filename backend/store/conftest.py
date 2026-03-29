import pytest
import xlsxwriter
from datetime import datetime

# Biến toàn cục để gom số liệu lúc chạy test
test_stats = {
    "test_coupons.py": {"name": "Quản lý Mã giảm giá", "pass": 0, "fail": 0},
    "test_products.py": {"name": "Tìm kiếm & Lọc", "pass": 0, "fail": 0},
    "test_orders.py": {"name": "Tồn kho & Đặt hàng", "pass": 0, "fail": 0},
    "test_checkout.py": {"name": "Xác thực Form Checkout", "pass": 0, "fail": 0},
    "test_vnpay.py": {"name": "Cổng thanh toán VNPay", "pass": 0, "fail": 0},
}

# Hàm này tự động bắt kết quả Pass/Fail của từng test case
def pytest_runtest_logreport(report):
    if report.when == "call":
        # Lấy tên file đang chạy
        filename = report.nodeid.split("::")[0].split("/")[-1].split("\\")[-1]
        if filename in test_stats:
            if report.outcome == "passed":
                test_stats[filename]["pass"] += 1
            elif report.outcome == "failed":
                test_stats[filename]["fail"] += 1

# Hàm này chạy khi test xong toàn bộ -> Bắt đầu vẽ Excel
def pytest_sessionfinish(session, exitstatus):
    workbook = xlsxwriter.Workbook('ArchClub_Test_Report.xlsx')
    worksheet = workbook.add_worksheet('Dashboard')

    # --- ĐỊNH DẠNG MÀU MÈ ---
    title_fmt = workbook.add_format({'bold': True, 'font_size': 14, 'bg_color': '#D9E1F2', 'align': 'center', 'border': 1})
    header_fmt = workbook.add_format({'bold': True, 'bg_color': '#4472C4', 'font_color': 'white', 'border': 1})
    cell_fmt = workbook.add_format({'border': 1})
    bold_cell_fmt = workbook.add_format({'bold': True, 'border': 1, 'bg_color': '#E2E2E2'})

    # --- KHUNG THÔNG TIN DỰ ÁN (Giống hình bạn gửi) ---
    worksheet.merge_range('A1:D1', 'TEST EXECUTION REPORT', title_fmt)
    worksheet.write('A2', 'Project Name:', bold_cell_fmt)
    worksheet.write('B2', 'ArchClub E-Commerce', cell_fmt)
    worksheet.write('C2', 'Date:', bold_cell_fmt)
    worksheet.write('D2', datetime.now().strftime("%Y-%m-%d"), cell_fmt)
    
    worksheet.write('A3', 'Module/Feature:', bold_cell_fmt)
    worksheet.write('B3', 'Backend API', cell_fmt)
    worksheet.write('C3', 'Tested By:', bold_cell_fmt)
    worksheet.write('D3', 'Sinh viên thực hiện', cell_fmt)

    # --- BẢNG THỐNG KÊ DATA ---
    headers = ['Function Name', 'Passed', 'Failed', 'Total Cases']
    for col_num, data in enumerate(headers):
        worksheet.write(5, col_num, data, header_fmt)

    row = 6
    total_pass = 0
    total_fail = 0

    for key, data in test_stats.items():
        t_pass = data['pass']
        t_fail = data['fail']
        t_total = t_pass + t_fail
        
        total_pass += t_pass
        total_fail += t_fail

        worksheet.write(row, 0, data['name'], cell_fmt)
        worksheet.write(row, 1, t_pass, cell_fmt)
        worksheet.write(row, 2, t_fail, cell_fmt)
        worksheet.write(row, 3, t_total, cell_fmt)
        row += 1

    # Dòng GRAND TOTAL
    worksheet.write(row, 0, 'GRAND TOTAL', bold_cell_fmt)
    worksheet.write(row, 1, total_pass, bold_cell_fmt)
    worksheet.write(row, 2, total_fail, bold_cell_fmt)
    worksheet.write(row, 3, total_pass + total_fail, bold_cell_fmt)

    # Kéo giãn cột cho đẹp
    worksheet.set_column('A:A', 25)
    worksheet.set_column('B:D', 12)

    # --- VẼ BIỂU ĐỒ TRÒN (PIE CHART) ---
    chart = workbook.add_chart({'type': 'pie'})
    
    # Nạp dữ liệu Pass/Fail tổng vào biểu đồ (Lấy từ dòng GRAND TOTAL)
    chart.add_series({
        'name': 'Test Status (Pass/Fail)',
        'categories': ['Dashboard', 5, 1, 5, 2], # Chữ 'Passed', 'Failed'
        'values':     ['Dashboard', row, 1, row, 2], # Số tổng Pass, số tổng Fail
        'data_labels': {'value': True, 'percentage': True}, # Hiện % trên bánh
        'points': [{'fill': {'color': '#1D70B8'}}, {'fill': {'color': '#D4351C'}}], # Màu Xanh - Đỏ
    })
    
    chart.set_title({'name': 'Test Status (Pass/Fail)'})
    chart.set_style(10)
    
    # Chèn biểu đồ vào ô F2 (Kế bên cái bảng)
    worksheet.insert_chart('F2', chart)

    workbook.close()