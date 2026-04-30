import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ContactService, ContactFormPayload } from '../../services/contact.service';

@Component({
  selector: 'app-form',
  imports: [CommonModule, FormsModule],
  templateUrl: './form.html',
  styleUrl: './form.css',
})
export class Form {
  contactForm: ContactFormPayload = {
    name: '',
    email: '',
    subject: '',
    message: '',
  };

  submitting = false;
  successMessage = '';
  errorMessage = '';

  constructor(private readonly contactService: ContactService) {}

  submitForm(): void {
    this.successMessage = '';
    this.errorMessage = '';

    if (!this.contactForm.name.trim() || !this.contactForm.email.trim() || !this.contactForm.message.trim()) {
      this.errorMessage = 'Name, email, and message are required.';
      return;
    }

    this.submitting = true;
    this.contactService.sendMessage(this.contactForm).subscribe({
      next: () => {
        this.successMessage = 'Message sent successfully. Thank you!';
        this.contactForm = { name: '', email: '', subject: '', message: '' };
        this.submitting = false;
      },
      error: () => {
        this.errorMessage = 'Failed to send message. Please try again later.';
        this.submitting = false;
      },
    });
  }
}
