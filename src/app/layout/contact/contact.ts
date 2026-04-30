import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Form } from '../form/form';

@Component({
  selector: 'app-contact',
  imports: [CommonModule, Form],
  templateUrl: './contact.html',
  styleUrl: './contact.css',
})
export class Contact {
  contactInfo = {
    email: 'andrewwmichaell7@gmail.com',
    linkedin: 'https://www.linkedin.com/in/dev-andrew-michael',
    github: 'https://github.com/andrewwmichaell/andrewwmichaell',
  };
}
