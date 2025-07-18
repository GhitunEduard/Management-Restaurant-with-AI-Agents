import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css'],
})
export class ReportsComponent {
  selectedReportType = 'daily';
  selectedDateRange = 'last7days';
  customStartDate = '';
  customEndDate = '';
  isGenerating = false;

  reportTypes = [
    { value: 'daily', label: 'Daily Sales' },
    { value: 'weekly', label: 'Weekly Sales' },
    { value: 'monthly', label: 'Monthly Sales' },
    { value: 'inventory', label: 'Inventory Report' },
    { value: 'customer', label: 'Customer Report' },
  ];

  dateRanges = [
    { value: 'today', label: 'Today' },
    { value: 'yesterday', label: 'Yesterday' },
    { value: 'last7days', label: 'Last 7 Days' },
    { value: 'last30days', label: 'Last 30 Days' },
    { value: 'thismonth', label: 'This Month' },
    { value: 'lastmonth', label: 'Last Month' },
    { value: 'custom', label: 'Custom Range' },
  ];

  pastReports = [
    {
      id: 1,
      name: 'Daily Sales Report - Jan 14, 2024',
      type: 'Daily Sales',
      date: '2024-01-14',
      status: 'completed',
      size: '2.3 MB',
    },
    {
      id: 2,
      name: 'Weekly Sales Report - Week 2, 2024',
      type: 'Weekly Sales',
      date: '2024-01-13',
      status: 'completed',
      size: '1.8 MB',
    },
    {
      id: 3,
      name: 'Monthly Inventory Report - December 2023',
      type: 'Inventory',
      date: '2024-01-01',
      status: 'completed',
      size: '3.1 MB',
    },
    {
      id: 4,
      name: 'Customer Analytics - Q4 2023',
      type: 'Customer Report',
      date: '2023-12-31',
      status: 'completed',
      size: '4.2 MB',
    },
  ];

  generateReport() {
    this.isGenerating = true;
    console.log(
      'Generating report:',
      this.selectedReportType,
      this.selectedDateRange
    );

    // Simulate report generation
    setTimeout(() => {
      this.isGenerating = false;
      const newReport = {
        id: this.pastReports.length + 1,
        name: `${this.getReportTypeLabel()} - ${new Date().toLocaleDateString()}`,
        type: this.getReportTypeLabel(),
        date: new Date().toISOString().split('T')[0],
        status: 'completed',
        size: `${(Math.random() * 3 + 1).toFixed(1)} MB`,
      };
      this.pastReports.unshift(newReport);
      alert('Report generated successfully!');
    }, 2000);
  }

  getReportTypeLabel(): string {
    const reportType = this.reportTypes.find(
      (type) => type.value === this.selectedReportType
    );
    return reportType ? reportType.label : 'Unknown Report';
  }

  downloadReport(reportId: number, format: string) {
    console.log('Downloading report:', reportId, 'as', format);
    alert(`Downloading report as ${format.toUpperCase()}...`);
  }

  emailReport(reportId: number) {
    console.log('Emailing report:', reportId);
    alert('Report sent via email successfully!');
  }

  deleteReport(reportId: number) {
    if (confirm('Are you sure you want to delete this report?')) {
      this.pastReports = this.pastReports.filter(
        (report) => report.id !== reportId
      );
    }
  }

  exportAllData() {
    console.log('Exporting all data...');
    alert('All data export initiated. You will receive an email when ready.');
  }

  scheduleEmailReport() {
    console.log('Scheduling email report...');
    alert('Email report scheduling feature coming soon!');
  }

  openReportSettings() {
    console.log('Opening report settings...');
    alert('Report settings feature coming soon!');
  }
}
