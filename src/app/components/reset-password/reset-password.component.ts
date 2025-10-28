import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { LoggerService } from '../../services/logger.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent {
  newPassword = '';
  confirmPassword = '';
  email = '';
  token = '';
  isSubmitting = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private logger: LoggerService,
    private toastr: ToastrService
  ) {
    this.route.queryParams.subscribe(params => {
      this.email = params['email'] || '';
      this.token = params['token'] || '';
    });
  }

  resetPassword() {
    if (this.newPassword !== this.confirmPassword) {
      this.toastr.error('Passwords do not match.');
      return;
    }
    this.isSubmitting = true;
    this.authService.resetPassword(this.email, this.token, this.newPassword).subscribe({
      next: () => {
        this.toastr.success('Your password has been reset. You can now log in with your new password.');
        this.isSubmitting = false;
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.logger.logError('Password reset failed', err);
        this.toastr.error('Password reset failed. Please try again or request a new link.');
        this.isSubmitting = false;
      }
    });
  }
}