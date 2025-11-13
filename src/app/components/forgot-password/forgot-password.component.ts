import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { LoggerService } from '../../services/logger.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent {
  forgotPasswordForm: FormGroup;
  isSubmitting: boolean = false;
  resendCountdown: number = 0;
  resendTimer: any;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private toastr: ToastrService,
    private logger: LoggerService
  ) {
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  sendResetLink() {
    if (this.forgotPasswordForm.invalid) {
      this.toastr.success('A password reset link has been sent.');
      return;
    }

    this.isSubmitting = true;

    const email = this.forgotPasswordForm.value.email;

    this.authService.requestPasswordReset(email).subscribe({
      next: async () => {
        this.toastr.success('A password reset link has been sent.');
        this.isSubmitting = false;
        setTimeout(() => {
          window.location.href = '/login';
        }, 1000);
      },
      error: async (err: any) => {
        this.toastr.success('A password reset link has been sent.');
        this.isSubmitting = false;
        setTimeout(() => {
          window.location.href = '/login';
        }, 1000);
        this.logger.logError('Error sending password reset email:', err);
      }
    });
  }
}