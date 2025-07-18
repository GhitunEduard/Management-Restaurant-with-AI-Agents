import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-ai-assistant',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ai-assistant.component.html',
  styleUrls: ['./ai-assistant.component.css'],
})
export class AiAssistantComponent {
  isOpen = false;
  isMinimized = false;
  currentMessage = '';
  isTyping = false;

  messages = [
    {
      id: 1,
      type: 'assistant',
      content:
        "Hello! I'm your restaurant AI assistant. How can I help you today?",
      timestamp: new Date(),
    },
  ];

  quickActions = [
    { text: 'Generate daily report', icon: 'fas fa-chart-bar' },
    { text: 'Check low stock items', icon: 'fas fa-exclamation-triangle' },
    { text: "Show today's reservations", icon: 'fas fa-calendar' },
    { text: 'Create new booking', icon: 'fas fa-plus-circle' },
    { text: 'View sales summary', icon: 'fas fa-dollar-sign' },
    { text: 'Help with menu planning', icon: 'fas fa-utensils' },
  ];

  toggleChat() {
    this.isOpen = !this.isOpen;
    this.isMinimized = false;
  }

  minimizeChat() {
    this.isMinimized = true;
  }

  maximizeChat() {
    this.isMinimized = false;
  }

  closeChat() {
    this.isOpen = false;
    this.isMinimized = false;
  }

  sendMessage() {
    if (!this.currentMessage.trim()) return;

    // Add user message
    this.messages.push({
      id: this.messages.length + 1,
      type: 'user',
      content: this.currentMessage,
      timestamp: new Date(),
    });

    const userMessage = this.currentMessage;
    this.currentMessage = '';
    this.isTyping = true;

    // Simulate AI response
    setTimeout(() => {
      this.isTyping = false;
      this.messages.push({
        id: this.messages.length + 1,
        type: 'assistant',
        content: this.generateResponse(userMessage),
        timestamp: new Date(),
      });
    }, 1500);
  }

  sendQuickAction(action: string) {
    this.currentMessage = action;
    this.sendMessage();
  }

  generateResponse(message: string): string {
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('report')) {
      return 'I can help you generate various reports. Would you like a daily sales report, inventory report, or customer analytics? I can also schedule automatic reports for you.';
    } else if (
      lowerMessage.includes('reservation') ||
      lowerMessage.includes('booking')
    ) {
      return 'I can help you manage reservations. You currently have 5 reservations for today. Would you like me to show you the details or help you create a new booking?';
    } else if (
      lowerMessage.includes('stock') ||
      lowerMessage.includes('inventory')
    ) {
      return "I've checked your inventory. You have 3 items running low: Tomatoes (5 units), Mozzarella (2 units), and Olive Oil (1 bottle). Would you like me to help you create a purchase order?";
    } else if (lowerMessage.includes('sales')) {
      return "Today's sales are looking good! You've made $1,247 so far with 23 orders. Your best-selling item today is the Margherita Pizza. Would you like a detailed breakdown?";
    } else if (lowerMessage.includes('menu')) {
      return 'I can help you with menu planning! Based on your sales data, I recommend featuring seasonal items and considering customer favorites. Would you like suggestions for new dishes or help optimizing your current menu?';
    } else {
      return 'I understand you need help with restaurant management. I can assist with reports, reservations, inventory, sales analysis, and menu planning. What specific task would you like help with?';
    }
  }

  onKeyPress(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }
}
