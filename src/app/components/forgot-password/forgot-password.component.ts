import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MailService } from '../../services/mail.service';
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
    private mailService: MailService,
    private toastr: ToastrService,
    private logger: LoggerService
  ) {
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  sendResetLink() {
    if (this.forgotPasswordForm.invalid) {
      this.toastr.error('Please enter a valid email address.');
      return;
    }

    this.isSubmitting = true;

    const email = this.forgotPasswordForm.value.email;
    const mail = {
      to: email,
      subject: 'Password Reset Request',
      body: `Click the link below to reset your password:
             http://localhost:4200/reset-password?email=${email}`
    };

    this.mailService.sendMail(mail).subscribe(
      (response) => {
        this.toastr.success('Password reset link has been sent to your email.');
        setTimeout(() => {
          window.location.href = '/login';
        }, 1000);
      },
      (error: any) => {
        this.toastr.success('Password reset link has been sent to your email.');
        setTimeout(() => {
          window.location.href = '/login';
        }, 1000);
        this.logger.error('Error sending password reset email:', error);
      }
    );
  }
}