import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-about',
  imports: [RouterLink],
  templateUrl: './about.component.html',
})
export class AboutComponent {
  protected readonly stats = [
    { value: '10+', label: 'Years of Excellence' },
    { value: '2M+', label: 'Assignments Delivered' },
    { value: '999+', label: 'Expert Writers' },
    { value: '98.6%', label: 'Satisfaction Rate' },
  ];

  protected readonly values = [
    { icon: 'verified', title: 'Academic Integrity', text: 'Every paper is original, referenced and backed by a Turnitin report.' },
    { icon: 'diversity_3', title: 'Student-First', text: 'Affordable pricing and 24/7 support built around student needs.' },
    { icon: 'workspace_premium', title: 'Expert Writers', text: 'UK-based Master\'s and PhD writers across every major discipline.' },
    { icon: 'lock', title: 'Confidentiality', text: 'End-to-end encryption; your details are never shared.' },
  ];

  protected readonly team = [
    { name: 'Dr. Sarah Thompson', role: 'Head of Academics', avatar: 'https://i.pravatar.cc/160?img=47' },
    { name: 'Prof. James Wilson', role: 'Quality Assurance Lead', avatar: 'https://i.pravatar.cc/160?img=12' },
    { name: 'Dr. Emily Carter', role: 'Writer Success Manager', avatar: 'https://i.pravatar.cc/160?img=45' },
  ];
}
