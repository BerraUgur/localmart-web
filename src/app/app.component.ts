import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from './services/auth.service';
import { User } from './models/comment';
import { LoggerService } from './services/logger.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})

export class AppComponent implements OnInit {
  title = 'Localmart';
  isLogging = false;
  currentRole: 'User' | 'Seller' | 'Admin' | '' = '';
  currentRoleText = '';
  currentUserId?: number;
  currentUser?: User;
  isVisitor = false;

  private authService = inject(AuthService);
  private router = inject(Router);
  private logger = inject(LoggerService);

  ngOnInit(): void {
    this.isLogging = this.authService.loggedIn();
    this.currentRole = this.authService.getCurrentRoles() as 'User' | 'Seller' | 'Admin' | '';
    this.currentRoleText = this.getRoleText(this.currentRole);
    this.isVisitor = !['User', 'Seller', 'Admin'].includes(this.currentRole);

    if (this.isLogging) {
      this.currentUserId = this.authService.getCurrentUserId();
      this.authService.getUser(this.currentUserId).subscribe({
        next: user => {
          this.currentUser = user;
        },
        error: err => {
          this.logger.error('Kullanıcı bilgisi alınamadı:', err);
        }
      });
    }
  }

  getRoleText(role: string): string {
    switch (role) {
      case 'User': return 'Müşteri';
      case 'Seller': return 'Satıcı';
      case 'Admin': return 'Admin';
      default: return '';
    }
  }

  logOut(): void {
    this.authService.logout();
    this.router.navigate(['/']).then(() => window.location.reload());
  }
}
