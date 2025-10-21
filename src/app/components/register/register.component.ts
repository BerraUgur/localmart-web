import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../services/auth.service';
import { RegisterRequest } from '../../models/registerRequest';
import { LoggerService } from '../../services/logger.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})

export class RegisterComponent {
  username: string = '';
  email: string = '';
  password: string = '';
  firstName: string = '';
  lastName: string = '';
  phoneNumber: string = '';

  private toastr = inject(ToastrService);
  private logger = inject(LoggerService);
  constructor(private authService: AuthService, private router: Router) { }

  ngOnInit() {
  }

  // Register new user
  register() {
    if (
      this.username === '' ||
      this.email === '' ||
      this.password === '' ||
      this.firstName === '' ||
      this.lastName === '' ||
      this.phoneNumber === ''
    ) {
      this.toastr.error('Please fill in all fields');
      this.logger.warn('Registration attempt with missing fields');
      return;
    }
    const registerRequest: RegisterRequest = {
      email: this.email,
      password: this.password,
      firstName: this.firstName,
      lastName: this.lastName,
      phoneNumber: this.phoneNumber,
      username: this.username
    };
    this.logger.info('Registration attempt', registerRequest.email);
    this.authService.Register(registerRequest).subscribe(
      () => {
        this.logger.info('Registration successful', registerRequest.email);
        this.router.navigate(['/login']);
      },
      error => {
        this.toastr.error('Registration failed');
        this.logger.error('Registration failed', registerRequest.email, error);
      }
    );
  }
}
