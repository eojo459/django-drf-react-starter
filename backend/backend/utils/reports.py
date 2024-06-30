from django.shortcuts import render
from reportlab.pdfgen import canvas
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter, landscape
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.graphics.shapes import (Drawing, Rect, String, Line, Group)

# create a timesheet report for a person
def create_timesheet_report(filename, headers, rows):
    doc = SimpleDocTemplate(filename, pagesize=letter)
    table_data = [headers]  # Using headers as the first row

    for row in rows:
        table_data.append(row)

    table_style = TableStyle([('BACKGROUND', (0, 0), (-1, 0), colors.grey),
                              ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                              ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                              ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                              ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                              ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
                              ('GRID', (0, 0), (-1, -1), 1, colors.black)])

    table = Table(table_data)
    table.setStyle(table_style)
    doc.build([table])

# create overall report for a whole business
def create_report(filename, headers, rows):
    c = canvas.Canvas(filename, pagesize=(landscape(letter)))
    #doc = SimpleDocTemplate(filename, pagesize=(landscape(letter)))
    doc_data = []

    doc_data.append(Paragraph("Business name", ParagraphStyle(name="BusinessName", 
                                                              alignment=TA_LEFT,
                                                              fontSize=18,)))
    doc_data.append(Spacer(1, 20))

    doc_data.append(Paragraph("Report", ParagraphStyle(name="Report", 
                                                        alignment=TA_LEFT,
                                                        fontSize=18,)))
    doc_data.append(Spacer(1, 20))

    doc_data.append(Paragraph("Period [start] to [end]", ParagraphStyle(name="Period", 
                                                                        alignment=TA_LEFT,
                                                                        fontSize=18,)))
    doc_data.append(Spacer(1, 20))

    two_col_table = []
    c.drawString(0, 0, "Home")
    c.drawString(50, 780, "Employee")
    c.drawString(75, 780, "Tom")
    # two_col_table.append(Paragraph("Employee", ParagraphStyle(name="EmployeeTitle", 
    #                                                     alignment=TA_LEFT,
    #                                                     fontSize=18,)))
    # two_col_table.append(Paragraph("Tom", ParagraphStyle(name="EmployeeTitle", 
    #                                                     alignment=TA_LEFT,
    #                                                     fontSize=18,)))
    #doc_data.append(Table(two_col_table))
    doc_data.append(Spacer(1, 20))

    # hours data table
    table_data = [headers]  # Using headers as the first row

    for row in rows:
        table_data.append(row)

    table_style = TableStyle([('BACKGROUND', (0, 0), (-1, 0), colors.grey),
                              ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                              ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                              ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                              ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                              ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
                              ('GRID', (0, 0), (-1, -1), 1, colors.black)])

    table = Table(table_data)
    table.setStyle(table_style)
    doc_data.append(table)
    #doc.build([table])
    c.showPage()
    c.save()
    #doc.build(doc_data)
