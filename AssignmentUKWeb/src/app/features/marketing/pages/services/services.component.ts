import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SERVICES } from '../../../../core/constants/services.constant';

@Component({
  selector: 'app-services',
  imports: [RouterLink],
  templateUrl: './services.component.html',
})
export class ServicesComponent {
  protected readonly services = SERVICES;

  protected readonly process = [
    { icon: 'description', title: 'Share Your Brief', text: 'Tell us the subject, level, word count and deadline.' },
    { icon: 'person_search', title: 'Get Matched', text: 'We assign a qualified expert in your discipline.' },
    { icon: 'task_alt', title: 'Receive & Refine', text: 'Review the draft and request free revisions.' },
  ];
}
