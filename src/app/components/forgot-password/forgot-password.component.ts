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
      this.toastr.success('A password reset link has been sent.');
      return;
    }

    this.isSubmitting = true;

    const email = this.forgotPasswordForm.value.email;

    const emailBody = `
      <h2>Password Reset Request</h2>
      <p>Hello,</p>
      <p>We received a request to reset your password for your Localmart account.</p>
      <p>If you did not request a password reset, please ignore this email.</p>
      <br/>
      <p>Thank you,</p>
      <p>Localmart Team</p>
    `;

    this.mailService.sendMail({ 
      to: email,
      subject: 'Localmart | Password Reset Request',
      body: emailBody
    }).subscribe(
      async () => {
        this.toastr.success('A password reset link has been sent.');
        setTimeout(() => {
          window.location.href = '/login';
        }, 1000);
      },
      async (error: any) => {
        this.toastr.success('A password reset link has been sent.');
        setTimeout(() => {
          window.location.href = '/login';
        }, 1000);
        this.logger.logError('Error sending password reset email:', error);
      }
    );
  }
}