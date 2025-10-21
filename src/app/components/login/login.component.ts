import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../services/auth.service';
import { LoginRequest } from '../../models/loginRequest';
import { LoggerService } from '../../services/logger.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})

export class LoginComponent {
  username: string = '';
  password: string = '';
  private toastr = inject(ToastrService);
  private logger = inject(LoggerService);
  constructor(private authService: AuthService, private router: Router) { }

  login() {
    const loginRequest: LoginRequest = { email: this.username, password: this.password };
    this.logger.info('Login attempt', loginRequest.email);
    this.authService.login(loginRequest).subscribe(
      data => {
        localStorage.setItem('token', data.accessToken ?? "");
        this.authService.setUserStats();
        this.logger.info('Login successful', loginRequest.email);
        this.router.navigate(['/']).then(() => window.location.reload());
      },
      error => {
        this.toastr.error('Invalid username or password');
        this.logger.error('Login failed', loginRequest.email, error);
      }
    );
  }
}